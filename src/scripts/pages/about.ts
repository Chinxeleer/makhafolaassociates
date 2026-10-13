import { revealPortrait } from "../components/portrait";
import { animateTimeline } from "../components/timeline";
import { gsap } from "../gsap";
import { prefersReducedMotion } from "../motion";

let ctx: gsap.Context | null = null;

export function init(container: HTMLElement): void {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    revealPortrait(container);
    animateTimeline(container);
  }, container);
}

export function destroy(): void {
  ctx?.revert();
  ctx = null;
}
