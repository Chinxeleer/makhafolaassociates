import { gsap } from "../gsap";
import { DUR, EASE, STAGGER, prefersReducedMotion } from "../motion";

// Full-screen mobile menu on the native <dialog>: focus is trapped by showModal(),
// Escape closes it (native "cancel"), and focus returns to the trigger.
let dialog: HTMLDialogElement | null = null;
let trigger: HTMLButtonElement | null = null;

function open() {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  trigger?.setAttribute("aria-expanded", "true");
  document.documentElement.style.overflow = "hidden";
  if (!prefersReducedMotion()) {
    gsap.from(dialog.querySelectorAll("[data-menu-item]"), {
      yPercent: 40,
      opacity: 0,
      duration: DUR.base,
      ease: EASE.out,
      stagger: STAGGER,
      clearProps: "all",
    });
  }
}

export function closeMenu(): void {
  if (dialog?.open) dialog.close();
}

export function initMenu(): void {
  dialog = document.querySelector<HTMLDialogElement>("[data-mobile-menu]");
  trigger = document.querySelector<HTMLButtonElement>("[data-menu-open]");
  if (!dialog || !trigger) return;

  trigger.addEventListener("click", open);
  dialog.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
  dialog.addEventListener("close", () => {
    trigger?.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    trigger?.focus();
  });
  // Navigating from the menu: close first; Barba (or a normal load) handles the link.
  dialog.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });
}
