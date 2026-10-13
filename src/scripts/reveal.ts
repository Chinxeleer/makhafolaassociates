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
