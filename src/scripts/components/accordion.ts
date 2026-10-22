import { gsap, ScrollTrigger } from "../gsap";
import { DUR, EASE, prefersReducedMotion } from "../motion";

// FAQ accordion on native <details>/<summary>. Without JS, or with reduced motion, the browser opens and
// closes it instantly. Otherwise the panel's height animates with DUR.fast.
// Markup: <details data-accordion><summary>…</summary><div data-accordion-panel>…</div></details>

export function initAccordions(scope: ParentNode): () => void {
  const cleanups: (() => void)[] = [];

  scope.querySelectorAll<HTMLDetailsElement>("details[data-accordion]").forEach((details) => {
    const summary = details.querySelector("summary");
    const panel = details.querySelector<HTMLElement>("[data-accordion-panel]");
    if (!summary || !panel) return;

    const onClick = (event: MouseEvent) => {
      if (prefersReducedMotion()) return;
      event.preventDefault();
      gsap.killTweensOf(panel);
      const done = () => {
        gsap.set(panel, { clearProps: "height,overflow" });
        // Content below moved: keep scroll-driven animations aligned.
        ScrollTrigger.refresh();
      };
      if (details.open) {
        gsap.to(panel, {
          height: 0,
          overflow: "hidden",
          duration: DUR.fast,
          ease: EASE.out,
          onComplete: () => {
            details.open = false;
            done();
          },
        });
      } else {
        details.open = true;
        gsap.fromTo(
          panel,
          { height: 0, overflow: "hidden" },
          { height: "auto", duration: DUR.fast, ease: EASE.out, onComplete: done },
        );
      }
    };

    summary.addEventListener("click", onClick);
    cleanups.push(() => {
      summary.removeEventListener("click", onClick);
      gsap.killTweensOf(panel);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
