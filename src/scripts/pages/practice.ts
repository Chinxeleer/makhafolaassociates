import { gsap, ScrollSmoother, ScrollTrigger } from "../gsap";
import { prefersReducedMotion } from "../motion";

// Practice areas: the index (sticky column on desktop, chip row on mobile) highlights the area in view.
// Under ScrollSmoother, CSS sticky cannot work (the content is transformed), so the index is pinned instead.
let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;

function setActive(container: HTMLElement, slug: string) {
  container.querySelectorAll<HTMLAnchorElement>("[data-area-link]").forEach((link) => {
    const on = link.dataset.areaLink === slug;
    if (on) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
    // Keep the active chip visible in the horizontal row.
    if (on && link.closest("[data-area-chips]")) {
      const row = link.closest<HTMLElement>("[data-area-chips]")!;
      const left = link.offsetLeft - row.clientWidth / 2 + link.clientWidth / 2;
      row.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  });
}

export function init(container: HTMLElement): void {
  ctx = gsap.context(() => {
    container.querySelectorAll<HTMLElement>("[data-area]").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 40%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) setActive(container, section.id);
        },
      });
    });
  }, container);

  if (!ScrollSmoother.get()) return;
  const layout = container.querySelector<HTMLElement>("[data-area-layout]");
  if (!layout) return;

  mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    const index = container.querySelector<HTMLElement>("[data-area-index]");
    if (!index) return;
    // CSS sticky is the no-smoother fallback; it must not add its offset to the pin.
    gsap.set(index, { position: "relative", top: "auto" });
    ScrollTrigger.create({
      trigger: index,
      pin: true,
      pinSpacing: false,
      start: "top top+=120",
      endTrigger: layout,
      end: () => `bottom ${index.offsetHeight + 120}px`,
    });
  });
  mm.add("(max-width: 1023px)", () => {
    const chips = container.querySelector<HTMLElement>("[data-area-chips-bar]");
    if (!chips) return;
    ScrollTrigger.create({
      trigger: chips,
      pin: true,
      pinSpacing: false,
      start: "top top+=72",
      endTrigger: layout,
      end: "bottom top+=200",
    });
  });
}

export function destroy(): void {
  mm?.revert();
  mm = null;
  ctx?.revert();
  ctx = null;
}
