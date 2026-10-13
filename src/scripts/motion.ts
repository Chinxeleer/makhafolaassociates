// The only motion values in the project. Never hard-code another duration or ease.
export const EASE = {
  out: "power4.out",
  inOut: "power3.inOut",
  expo: "expo.out",
  /** Scroll-scrubbed tweens only: progress maps 1:1 to scroll position. */
  linear: "none",
} as const;
export const DUR = { fast: 0.35, base: 0.7, slow: 1.1 } as const;
export const STAGGER = 0.07;

/** Reduced-motion page transition: a short opacity crossfade. */
export const REDUCED = { crossfade: 0.2 } as const;

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
