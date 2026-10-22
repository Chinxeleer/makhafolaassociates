import { initAccordions } from "../components/accordion";
import { staggerLists } from "../components/lists";
import { revealSteps } from "../components/steps";
import { gsap } from "../gsap";
import { prefersReducedMotion } from "../motion";

// Road Accident Fund guide: list staggers, the process steps reveal, and the FAQ accordion.
let ctx: gsap.Context | null = null;
let cleanupAccordions: (() => void) | null = null;

export function init(container: HTMLElement): void {
  cleanupAccordions = initAccordions(container);
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    staggerLists(container);
    revealSteps(container);
  }, container);
}

export function destroy(): void {
  cleanupAccordions?.();
  cleanupAccordions = null;
  ctx?.revert();
  ctx = null;
}
