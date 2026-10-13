// After a Barba swap, copy per-page <head> tags from the fetched page into the live document.
const SYNC_SELECTORS = [
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property^="og:"]',
  'meta[property^="article:"]',
  'meta[name^="twitter:"]',
  "script[data-jsonld]",
];

export function syncHead(html: string): Promise<void> {
  const next = new DOMParser().parseFromString(html, "text/html");
  document.title = next.title;

  for (const selector of SYNC_SELECTORS) {
    document.head.querySelectorAll(selector).forEach((el) => el.remove());
    next.head.querySelectorAll(selector).forEach((el) => {
      document.head.append(cloneNode(el));
    });
  }

  return syncStylesheets(next);
}

// Scripts parsed by DOMParser are inert; recreate them so the JSON-LD block is a live element.
function cloneNode(el: Element): Element {
  if (el.tagName !== "SCRIPT") return el.cloneNode(true) as Element;
  const script = document.createElement("script");
  for (const attr of Array.from(el.attributes)) script.setAttribute(attr.name, attr.value);
  script.textContent = el.textContent;
  return script;
}

// Safety net: all CSS is one stylesheet, but append any stylesheet the incoming page has that we lack.
function syncStylesheets(next: Document): Promise<void> {
  const have = new Set(
    Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((l) => l.href),
  );
  const loads: Promise<void>[] = [];
  next.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
    const href = new URL(link.getAttribute("href") ?? "", window.location.href).href;
    if (have.has(href)) return;
    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = href;
    loads.push(
      new Promise((resolve) => {
        el.addEventListener("load", () => resolve(), { once: true });
        el.addEventListener("error", () => resolve(), { once: true });
      }),
    );
    document.head.append(el);
  });
  return Promise.all(loads).then(() => undefined);
}
