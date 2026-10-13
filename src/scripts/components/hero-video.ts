import { gsap } from "../gsap";
import { DUR, EASE, prefersReducedMotion } from "../motion";

// The hero <video> ships with no <source> children. Sources are attached after first paint,
// only on wide screens without save-data and without reduced motion. Otherwise the poster stays.
type NetworkInformation = { saveData?: boolean };

let video: HTMLVideoElement | null = null;
let overlay: HTMLElement | null = null;
let raf = 0;

function shouldLoad(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return window.innerWidth > 768 && !conn?.saveData && !prefersReducedMotion();
}

function attachSources(el: HTMLVideoElement) {
  const { srcWebm, srcMp4 } = el.dataset;
  const sources: [string | undefined, string][] = [
    [srcWebm, "video/webm"],
    [srcMp4, "video/mp4"],
  ];
  for (const [src, type] of sources) {
    if (!src) continue;
    const source = document.createElement("source");
    source.src = src;
    source.type = type;
    el.append(source);
  }
  el.load();
}

function onPlaying() {
  if (!video || !overlay) return;
  gsap.to(video, { opacity: 1, duration: DUR.base, ease: EASE.out });
  gsap.fromTo(overlay, { opacity: 0.85 }, { opacity: 0.65, duration: DUR.slow, ease: EASE.out });
}

export function attachHeroVideo(container: HTMLElement): void {
  video = container.querySelector<HTMLVideoElement>("[data-hero-video]");
  overlay = container.querySelector<HTMLElement>("[data-hero-overlay]");
  if (!video || !shouldLoad()) return;

  const el = video;
  gsap.set(el, { opacity: 0 });
  el.addEventListener("playing", onPlaying, { once: true });
  // Two frames: the first paint (poster, text) happens before any video request.
  raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => {
      attachSources(el);
      el.play().catch(() => {
        /* Autoplay refused: the poster remains, which is the intended fallback. */
      });
    });
  });
}

export function detachHeroVideo(): void {
  cancelAnimationFrame(raf);
  if (!video) return;
  video.pause();
  video.removeEventListener("playing", onPlaying);
  video.querySelectorAll("source").forEach((s) => s.remove());
  video.removeAttribute("src");
  video.load();
  gsap.killTweensOf([video, overlay]);
  video = null;
  overlay = null;
}
