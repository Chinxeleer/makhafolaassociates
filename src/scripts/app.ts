// Single client entry. Astro bundles this once; Barba swaps <main> containers and this file
// calls each page module's init/destroy around every transition.
import barba from "@barba/core";
import { initHeader, updateHeader } from "./components/header";
import { closeMenu, initMenu } from "./components/menu";
import { gsap, ScrollSmoother, ScrollTrigger } from "./gsap";
import { syncHead } from "./head-sync";
import { prefersReducedMotion } from "./motion";
import { killHeading, revealHeading } from "./reveal";
import { curtainIn, curtainOut, fadeIn, fadeOut } from "./transitions";
import type { PageModule } from "./types";
import * as about from "./pages/about";
import * as article from "./pages/article";
import * as contact from "./pages/contact";
import * as home from "./pages/home";
import * as practice from "./pages/practice";
import * as raf from "./pages/raf";

const registry: Record<string, PageModule> = {
  home,
  about,
  practice,
  raf,
  article,
  contact,
};

const reduced = prefersReducedMotion();
const HEADER_OFFSET = "top 96px";

let smoother: ScrollSmoother | null = null;
let currentModule: PageModule | null = null;

function container(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-barba="container"]');
}

function initPage(el: HTMLElement) {
  const ns = el.dataset.barbaNamespace ?? "";
  currentModule = registry[ns] ?? null;
  currentModule?.init(el);
  // ScrollSmoother only scans [data-speed] at creation; apply effects to each incoming container.
  if (smoother) smoother.effects(el.querySelectorAll("[data-speed], [data-lag]"));
}

function destroyPage(el: HTMLElement) {
  currentModule?.destroy();
  currentModule = null;
  killHeading();
  if (smoother) {
    smoother.effects().forEach((st) => {
      const trigger = st.trigger as Element | undefined;
      if (trigger && el.contains(trigger)) st.kill();
    });
  }
}

function scrollTop() {
  if (smoother) smoother.scrollTo(0, false);
  else window.scrollTo(0, 0);
}

function focusHeading(el: HTMLElement) {
  const h1 = el.querySelector<HTMLElement>("h1");
  const target = h1 ?? el;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  const announcer = document.querySelector("[data-route-announcer]");
  if (announcer) announcer.textContent = document.title;
}

function logTriggers(label: string) {
  if (import.meta.env.DEV) {
    console.info(`[motion] ${label}: ${ScrollTrigger.getAll().length} ScrollTriggers`);
    // Dev-only handle for leak checks in automated navigation tests.
    (window as Window & { __motion?: unknown }).__motion = { triggers: () => ScrollTrigger.getAll().length };
  }
}

// Same-page anchors scroll through the smoother.
function onAnchorClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link) return;
  const url = new URL(link.href);
  if (url.pathname !== window.location.pathname || !url.hash || url.hash === "#") return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  if (smoother) smoother.scrollTo(target, true, HEADER_OFFSET);
  else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  history.replaceState(null, "", url.hash);
  if (target.id === "main") {
    target.focus({ preventScroll: true });
  } else {
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

function shouldPrevent({ el, href }: { el: Element; href: string }): boolean {
  const link = el as HTMLAnchorElement;
  if (link.target === "_blank" || link.hasAttribute("data-barba-prevent") || link.hasAttribute("download"))
    return true;
  if (/^(mailto:|tel:)/i.test(href) || href.includes("wa.me")) return true;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return true;
  if (url.pathname.replace(/\/$/, "") === "/404") return true;
  // Same page with a hash: handled by onAnchorClick.
  if (url.pathname === window.location.pathname && url.hash) return true;
  return false;
}

/** Resolves when the container's fonts and above-the-fold images are ready, or after a cap. */
const READY_CAP_MS = 1200;
function pageReady(el: HTMLElement): Promise<void> {
  const fold = window.innerHeight * 1.2;
  const images = Array.from(el.querySelectorAll<HTMLImageElement>("img")).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.top < fold;
  });
  // Lazy images under the curtain would otherwise start loading only once they are "seen".
  images.forEach((img) => (img.loading = "eager"));
  const decoded = images.map((img) => img.decode().catch(() => undefined));
  const ready = Promise.all([document.fonts.ready, ...decoded]).then(() => undefined);
  const cap = new Promise<void>((resolve) => window.setTimeout(resolve, READY_CAP_MS));
  return Promise.race([ready, cap]);
}

/** Warm Barba's cache with the main pages once the browser is idle, so navigation never waits on HTML. */
function prefetchMainPages() {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
  idle(() => {
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link], [data-nav-home]").forEach((a) => {
      if (a.href !== window.location.href) barba.prefetch(a.href);
    });
  });
}

function boot() {
  const first = container();
  if (!first) return;

  if (!reduced) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      effects: true,
      smoothTouch: 0.1,
    });
    // effects:true already applied [data-speed] in the first container; avoid applying twice.
  }

  initHeader();
  initMenu();
  updateHeader(first);
  currentModule = registry[first.dataset.barbaNamespace ?? ""] ?? null;
  currentModule?.init(first);
  revealHeading(first);
  document.addEventListener("click", onAnchorClick);

  // Honour a hash on first load (e.g. /practice-areas/#family-law).
  if (window.location.hash && smoother) {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) requestAnimationFrame(() => smoother?.scrollTo(target, false, HEADER_OFFSET));
  }

  logTriggers("first load");

  barba.init({
    preventRunning: true,
    prevent: shouldPrevent,
    timeout: 8000,
    transitions: [
      {
        name: reduced ? "fade" : "curtain",
        sync: false,
        async leave({ current }) {
          closeMenu();
          await (reduced ? fadeOut(current.container) : curtainIn());
        },
        async beforeEnter({ current, next }) {
          const el = next.container;
          // Barba keeps the old container in the DOM until the transition ends. Hide it now, so the new
          // page lays out at the top (no jump when the curtain lifts) and ScrollTriggers measure correctly.
          current.container.style.display = "none";
          scrollTop();
          await syncHead(next.html);
          // Keep the curtain down until the new page's fonts and first-screen images are ready.
          await pageReady(el);
          initPage(el);
          ScrollTrigger.refresh();
          updateHeader(el);
        },
        async enter({ next }) {
          if (reduced) {
            await fadeIn(next.container);
            return;
          }
          const tl = curtainOut();
          revealHeading(next.container, 0.25);
          await tl;
        },
        after({ next }) {
          // A cross-page link with a hash scrolls to the target after the swap.
          const hash = window.location.hash;
          const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
          if (target) {
            if (smoother) smoother.scrollTo(target, false, HEADER_OFFSET);
            else target.scrollIntoView();
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
            document.querySelector("[data-route-announcer]")!.textContent = document.title;
          } else {
            focusHeading(next.container);
          }
          logTriggers(`after → ${next.namespace}`);
        },
      },
    ],
  });

  prefetchMainPages();

  barba.hooks.beforeLeave((data) => {
    if (data && "current" in data) destroyPage(data.current.container);
  });

  // Browser back/forward with a scroll restore would fight the smoother.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
}

gsap.config({ nullTargetWarn: false });
boot();
