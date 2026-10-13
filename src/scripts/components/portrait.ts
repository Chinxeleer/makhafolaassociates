import { gsap } from "../gsap";
import { DUR, EASE } from "../motion";

// Director portrait: clip-path opens vertically from the centre. Parallax comes from data-speed (ScrollSmoother).
export function revealPortrait(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>("[data-portrait]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(50% 0% 50% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: DUR.slow,
        ease: EASE.expo,
        clearProps: "clipPath",
        scrollTrigger: { trigger: el, start: "top 80%" },
      },
    );
  });
}
