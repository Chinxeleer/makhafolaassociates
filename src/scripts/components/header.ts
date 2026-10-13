import { gsap, ScrollTrigger } from "../gsap";
import { DUR, EASE, prefersReducedMotion } from "../motion";

// Global header behaviour. Lives for the whole session; `update()` is called after each page swap.
const SOLID_AFTER = 80;

let header: HTMLElement | null = null;
let heroDark = false;
let hidden = false;

function setOverHero(on: boolean) {
  if (!header) return;
  if (on) {
    header.dataset.overHero = "true";
    header.dataset.tone = "dark";
  } else {
    delete header.dataset.overHero;
    delete header.dataset.tone;
  }
}

function setHidden(hide: boolean) {
  if (!header || hide === hidden) return;
  // Never hide while keyboard focus is inside the header.
  if (hide && header.contains(document.activeElement)) return;
  hidden = hide;
  gsap.to(header, { yPercent: hide ? -100 : 0, duration: DUR.fast, ease: EASE.out, overwrite: true });
}

export function initHeader(): void {
  header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return;

  header.addEventListener("focusin", () => setHidden(false));

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const y = self.scroll();
      setOverHero(heroDark && y < SOLID_AFTER);
      if (prefersReducedMotion()) return;
      if (y < SOLID_AFTER) setHidden(false);
      else setHidden(self.direction === 1);
    },
  });
}

export function updateHeader(container: HTMLElement): void {
  heroDark = container.dataset.heroDark === "true";
  setOverHero(heroDark);
  setHidden(false);

  // Active nav item.
  const path = window.location.pathname;
  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (path.startsWith(href)) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
