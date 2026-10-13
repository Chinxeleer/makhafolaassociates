import { gsap, ScrollTrigger } from "../gsap";

// Reading progress: a thin gold bar at the top of the viewport. The bar lives in BaseLayout, outside the
// smooth-scroll wrapper, so position: fixed works; this module only shows it and maps progress to scaleX.
let ctx: gsap.Context | null = null;

const bar = () => document.querySelector<HTMLElement>("[data-reading-progress]");

export function init(container: HTMLElement): void {
  const el = bar();
  const body = container.querySelector<HTMLElement>("[data-article-body]");
  if (!el || !body) return;
  el.hidden = false;
  ctx = gsap.context(() => {
    gsap.set(el, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: body,
      start: "top 30%",
      end: "bottom bottom",
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    });
  });
}

export function destroy(): void {
  ctx?.revert();
  ctx = null;
  const el = bar();
  if (el) el.hidden = true;
}
