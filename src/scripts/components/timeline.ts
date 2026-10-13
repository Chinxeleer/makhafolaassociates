import { gsap } from "../gsap";
import { DUR, EASE } from "../motion";

// Degree timeline: the line draws with the scroll (scrub) and each dot fills as the line reaches it.
// Call inside the page's gsap.context so everything is reverted on destroy.
export function animateTimeline(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>("[data-timeline]").forEach((list) => {
    const line = list.querySelector<HTMLElement>("[data-timeline-line]");
    const start = "top 70%";
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: EASE.linear,
          scrollTrigger: { trigger: list, start, end: "bottom 70%", scrub: true },
        },
      );
    }
    list.querySelectorAll<HTMLElement>("[data-timeline-dot]").forEach((dot) => {
      gsap.from(dot, {
        scale: 0,
        duration: DUR.fast,
        ease: EASE.out,
        scrollTrigger: { trigger: dot, start: "center 70%", toggleActions: "play none none reverse" },
      });
    });
  });
}
