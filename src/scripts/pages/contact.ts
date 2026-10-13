import { destroyContactForm, initContactForm } from "../components/form";

// Contact: the form (with Turnstile) and the click-to-load map.
let cleanupMap: (() => void) | null = null;

function initMap(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>("[data-map-load]");
  const frame = container.querySelector<HTMLElement>("[data-map-frame]");
  if (!button || !frame) return;
  const onClick = () => {
    const iframe = document.createElement("iframe");
    iframe.src = frame.dataset.mapSrc ?? "";
    iframe.title = frame.dataset.mapTitle ?? "Map";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.className = "absolute inset-0 size-full border-0";
    frame.replaceChildren(iframe);
    iframe.focus();
  };
  button.addEventListener("click", onClick);
  cleanupMap = () => button.removeEventListener("click", onClick);
}

export function init(container: HTMLElement): void {
  initMap(container);
  initContactForm(container);
}

export function destroy(): void {
  cleanupMap?.();
  cleanupMap = null;
  destroyContactForm();
}
