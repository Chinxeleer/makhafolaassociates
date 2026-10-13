import { gsap } from "../gsap";
import { DUR, EASE } from "../motion";

// How we work: each step's number and title reveal as the step enters.
export function revealSteps(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
    const number = step.querySelector("[data-step-number]");
    const title = step.querySelector("[data-step-title]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 82%" } });
    if (number) tl.from(number, { yPercent: 100, duration: DUR.base, ease: EASE.expo });
    if (title) tl.from(title, { opacity: 0, y: 12, duration: DUR.base, ease: EASE.out }, "<0.1");
  });
}
