import { gsap, SplitText } from "./gsap";
import { DUR, EASE, prefersReducedMotion } from "./motion";

// Heading reveal: lines inside masks slide up from 100%. Used for each page's <h1> (the hero statement on home).
// Content is visible by default; the hidden start state is only set here, at the moment of revealing.
let ctx: gsap.Context | null = null;

export function revealHeading(container: HTMLElement, delay = 0): void {
  killHeading();
  if (prefersReducedMotion()) return;
  const heading = container.querySelector<HTMLElement>("[data-reveal-heading]");
  if (!heading) return;

  ctx = gsap.context(() => {
    SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      aria: "auto",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: DUR.slow,
          ease: EASE.expo,
          stagger: 0.1,
          delay,
        });
      },
    });
  });
}

export function killHeading(): void {
  ctx?.revert();
  ctx = null;
}

/**
 * The same masked line reveal, played when the element scrolls into view (for section headings such as
 * the home RAF heading). Call inside the page's gsap.context so it is reverted on destroy.
 */
export function revealLinesOnScroll(scope: ParentNode, selector = "[data-reveal-lines]"): void {
  if (prefersReducedMotion()) return;
  scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      aria: "auto",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: DUR.slow,
          ease: EASE.expo,
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
      },
    });
  });
}
