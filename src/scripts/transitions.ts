import { gsap } from "./gsap";
import { DUR, EASE, REDUCED } from "./motion";

const curtain = () => document.querySelector<HTMLElement>("[data-curtain]");

/** Curtain rises to cover the page: inset(100% 0 0 0) to inset(0). */
export function curtainIn(): gsap.core.Timeline {
  const el = curtain();
  const tl = gsap.timeline();
  if (!el) return tl;
  tl.set(el, { display: "flex", clipPath: "inset(100% 0% 0% 0%)" })
    .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.base, ease: EASE.inOut })
    .from(el.firstElementChild, { opacity: 0, duration: DUR.fast, ease: EASE.out }, "-=0.3");
  return tl;
}

/** Curtain clips away off the top: inset(0) to inset(0 0 100% 0). */
export function curtainOut(): gsap.core.Timeline {
  const el = curtain();
  const tl = gsap.timeline();
  if (!el) return tl;
  tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: DUR.base, ease: EASE.inOut }).set(el, {
    display: "none",
    clearProps: "clipPath",
  });
  return tl;
}

/** Reduced motion: a 0.2s crossfade of the container. */
export function fadeOut(container: HTMLElement): gsap.core.Tween {
  return gsap.to(container, { opacity: 0, duration: REDUCED.crossfade, ease: EASE.linear });
}

export function fadeIn(container: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    container,
    { opacity: 0 },
    { opacity: 1, duration: REDUCED.crossfade, ease: EASE.linear, clearProps: "opacity" },
  );
}
