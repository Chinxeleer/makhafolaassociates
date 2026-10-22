import { actions, isInputError } from "astro:actions";
import { PUBLIC_TURNSTILE_SITE_KEY } from "astro:env/client";

// Contact form: client-side validation with an accessible error summary, Turnstile rendered explicitly
// (script loaded once, on demand), and submission through the `contact` Astro Action.

interface Turnstile {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
  reset(id: string): void;
}
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileLoading: Promise<Turnstile> | null = null;
let widgetId: string | null = null;
let form: HTMLFormElement | null = null;
let onSubmit: ((e: SubmitEvent) => void) | null = null;
let onAreaChange: (() => void) | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile")));
    script.onerror = () => {
      turnstileLoading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.append(script);
  });
  return turnstileLoading;
}

type FieldName =
  "name" | "email" | "phone" | "accidentDate" | "policeCase" | "message" | "consent" | "turnstile";

const MESSAGES = {
  name: "Enter your name.",
  email: "Enter an email address in the format name@example.com.",
  phone: "Enter a phone number using digits, spaces and +.",
  accidentDate: "Enter a date that is not in the future.",
  policeCase: "Enter a police case number of up to 60 characters.",
  message: "Tell us a little more about your matter (at least 10 characters).",
  consent: "Confirm that we may use your details to respond.",
  turnstile: "Complete the security check.",
} satisfies Record<FieldName, string>;

function validate(f: HTMLFormElement): Partial<Record<FieldName, string>> {
  const data = new FormData(f);
  const errors: Partial<Record<FieldName, string>> = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const phone = String(data.get("phone") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();
  if (name.length < 2) errors.name = MESSAGES.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = MESSAGES.email;
  if (phone && !/^[0-9+()\s-]*$/.test(phone)) errors.phone = MESSAGES.phone;
  // Optional RAF details: only submitted (enabled) while the RAF option is selected.
  const accidentDate = String(data.get("accidentDate") ?? "");
  if (accidentDate && accidentDate > new Date().toISOString().slice(0, 10))
    errors.accidentDate = MESSAGES.accidentDate;
  if (String(data.get("policeCase") ?? "").trim().length > 60) errors.policeCase = MESSAGES.policeCase;
  if (message.length < 10) errors.message = MESSAGES.message;
  if (!data.get("consent")) errors.consent = MESSAGES.consent;
  if (!String(data.get("cf-turnstile-response") ?? "")) errors.turnstile = MESSAGES.turnstile;
  return errors;
}

const FIELD_IDS: Partial<Record<FieldName, string>> = {
  turnstile: "contact-turnstile",
  accidentDate: "contact-accident-date",
  policeCase: "contact-police-case",
};

function fieldId(name: FieldName) {
  return FIELD_IDS[name] ?? `contact-${name}`;
}

function showErrors(f: HTMLFormElement, errors: Partial<Record<FieldName, string>>) {
  clearErrors(f);
  const entries = Object.entries(errors) as [FieldName, string][];
  if (!entries.length) return;

  for (const [name, message] of entries) {
    const error = f.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    const input = f.querySelector<HTMLElement>(`#${fieldId(name)}`);
    input?.setAttribute("aria-invalid", "true");
  }

  const summary = f.querySelector<HTMLElement>("[data-error-summary]");
  const list = summary?.querySelector("ul");
  if (summary && list) {
    list.replaceChildren(
      ...entries.map(([name, message]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${fieldId(name)}`;
        a.className = "link";
        a.textContent = message;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          f.querySelector<HTMLElement>(`#${fieldId(name)}`)?.focus();
        });
        li.append(a);
        return li;
      }),
    );
    summary.hidden = false;
    summary.focus();
  }
}

function clearErrors(f: HTMLFormElement) {
  f.querySelectorAll<HTMLElement>("[data-error-for]").forEach((el) => {
    el.hidden = true;
    el.textContent = "";
  });
  f.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  const summary = f.querySelector<HTMLElement>("[data-error-summary]");
  if (summary) summary.hidden = true;
}

function setStatus(root: HTMLElement, state: "idle" | "sending" | "error") {
  const button = root.querySelector<HTMLButtonElement>("[data-submit]");
  const failure = root.querySelector<HTMLElement>("[data-form-failure]");
  if (button) {
    button.disabled = state === "sending";
    button.setAttribute("aria-busy", String(state === "sending"));
    const label = button.querySelector("span");
    if (label) label.textContent = state === "sending" ? "Sending your message" : "Send your message";
  }
  if (failure) {
    failure.hidden = state !== "error";
    if (state === "error") failure.focus();
  }
}

export function initContactForm(container: HTMLElement): void {
  form = container.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return;
  const f = form;
  const root = f.closest<HTMLElement>("[data-form-root]") ?? f;

  // Preselect the practice area when arriving with ?area=<slug> (e.g. from "Discuss your matter").
  // Older links that pass the area's name still match.
  const area = new URLSearchParams(window.location.search).get("area");
  const select = f.querySelector<HTMLSelectElement>("#contact-area");
  const match = area && select && Array.from(select.options).find((o) => o.value === area || o.text === area);
  if (select && match) select.value = match.value;

  // RAF details appear only while the RAF option is selected. Hidden fields are disabled, so they are not
  // submitted; screen readers hear when they appear.
  const rafFields = f.querySelector<HTMLElement>("[data-raf-fields]");
  const announcer = f.querySelector<HTMLElement>("[data-raf-announce]");
  if (select && rafFields) {
    const syncRafFields = (announce: boolean) => {
      const on = select.value === rafFields.dataset.rafSlug;
      rafFields.hidden = !on;
      rafFields.querySelectorAll("input").forEach((input) => (input.disabled = !on));
      if (announcer)
        announcer.textContent =
          on && announce ? "Two optional fields added: date of the accident and police case number." : "";
    };
    syncRafFields(false);
    onAreaChange = () => syncRafFields(true);
    select.addEventListener("change", onAreaChange);
  }

  const slot = f.querySelector<HTMLElement>("[data-turnstile]");
  if (slot) {
    loadTurnstile()
      .then((ts) => {
        if (!form || !slot.isConnected) return;
        widgetId = ts.render(slot, {
          sitekey: PUBLIC_TURNSTILE_SITE_KEY,
          theme: "light",
          "response-field-name": "cf-turnstile-response",
          callback: () => {
            const err = f.querySelector<HTMLElement>('[data-error-for="turnstile"]');
            if (err) err.hidden = true;
          },
        });
      })
      .catch(() => {
        const err = f.querySelector<HTMLElement>('[data-error-for="turnstile"]');
        if (err) {
          err.textContent =
            "The security check could not load. Check your connection, or contact us by phone or email instead.";
          err.hidden = false;
        }
      });
  }

  onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const errors = validate(f);
    if (Object.keys(errors).length) {
      showErrors(f, errors);
      return;
    }
    clearErrors(f);
    setStatus(root, "sending");

    const { data, error } = await actions.contact(new FormData(f));

    if (error) {
      if (isInputError(error)) {
        const serverErrors: Partial<Record<FieldName, string>> = {};
        for (const [key, messages] of Object.entries(error.fields)) {
          if (key in MESSAGES && messages?.[0]) serverErrors[key as FieldName] = messages[0];
        }
        setStatus(root, "idle");
        showErrors(f, serverErrors);
      } else {
        setStatus(root, "error");
      }
      if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
      return;
    }

    if (data?.ok) {
      const success = root.querySelector<HTMLElement>("[data-form-success]");
      const name = String(new FormData(f).get("name") ?? "")
        .trim()
        .split(/\s+/)[0];
      const greeting = success?.querySelector("[data-success-name]");
      if (greeting && name) greeting.textContent = `, ${name}`;
      f.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    }
  };
  f.addEventListener("submit", onSubmit);
}

export function destroyContactForm(): void {
  if (form && onSubmit) form.removeEventListener("submit", onSubmit);
  if (form && onAreaChange) form.querySelector("#contact-area")?.removeEventListener("change", onAreaChange);
  onAreaChange = null;
  if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
  widgetId = null;
  onSubmit = null;
  form = null;
}
