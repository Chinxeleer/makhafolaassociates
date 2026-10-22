import { gsap } from "../gsap";
import { DUR, EASE, STAGGER } from "../motion";

// List stagger: the items (li, or div groups in a dl) of each matching list rise in, one after another, as the list enters.
// Call inside the page's gsap.context so it is reverted on destroy. Skip under reduced motion.
export function staggerLists(scope: ParentNode, selector = "[data-stagger-list]"): void {
  scope.querySelectorAll<HTMLElement>(selector).forEach((list) => {
    gsap.from(list.querySelectorAll(":scope > li, :scope > div"), {
      opacity: 0,
      y: 16,
      duration: DUR.base,
      ease: EASE.out,
      stagger: STAGGER,
      scrollTrigger: { trigger: list, start: "top 85%" },
    });
  });
}
