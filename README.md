# Makhafola & Associates Inc. website

Marketing site for a Pretoria law firm. Astro 7 (static pages), Tailwind CSS v4, GSAP (ScrollTrigger, ScrollSmoother, SplitText) and Barba.js, hosted on **Cloudflare Workers with static assets**. Only the contact form Action runs on the Worker.

Design rules live in [DESIGN.md](DESIGN.md), brand context in [PRODUCT.md](PRODUCT.md), and everything still to supply or confirm in [TODO.md](TODO.md).

## Requirements

- Node.js 22.12 or newer
- pnpm (the version is pinned in `package.json` → `packageManager`). Do not use npm or yarn.

## Commands

| Command           | What it does                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| `pnpm install`    | Install dependencies                                                                |
| `pnpm dev`        | Astro dev server at http://localhost:4321                                           |
| `pnpm build`      | Production build into `dist/` (`dist/client` static files, `dist/server` Worker)    |
| `pnpm preview`    | Build, then run the real Worker locally with `wrangler dev` (http://localhost:8787) |
| `pnpm deploy`     | Build and deploy with `wrangler deploy`                                             |
| `pnpm check`      | `astro check` (must report 0 errors)                                                |
| `pnpm format`     | Prettier, with Astro and Tailwind class sorting                                     |
| `pnpm cf-typegen` | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` or secrets   |

pnpm only runs the build scripts of `esbuild`, `sharp` and `workerd` (allowed in `package.json` → `pnpm.onlyBuiltDependencies`).

> **Dev-mode fonts:** under `pnpm dev`, the Cloudflare Vite plugin currently answers `/_astro/fonts/*` before Astro's font middleware does, so dev shows the fallback fonts (Georgia and system sans). Builds and `pnpm preview` serve the real fonts. Check `pnpm preview` for typography.

## Local secrets

Copy `.dev.vars.example` to `.dev.vars` (git-ignored). The example uses Cloudflare's Turnstile test keys and `RESEND_API_KEY=dry-run`, which makes the form succeed without sending email (the Worker logs only that a message would have been sent, never its content). The form works end to end under `pnpm preview`.

| Variable                    | Kind           | Purpose                                                        |
| --------------------------- | -------------- | -------------------------------------------------------------- |
| `RESEND_API_KEY`            | secret         | Resend API key                                                 |
| `TURNSTILE_SECRET_KEY`      | secret         | Turnstile server-side secret                                   |
| `CONTACT_TO_EMAIL`          | secret         | Where enquiries go (falls back to the firm email)              |
| `PUBLIC_TURNSTILE_SITE_KEY` | build variable | Turnstile site key, inlined at build time (see `.env.example`) |

## Deploying to Cloudflare

Do not deploy from a laptop for production: connect the repository instead.

1. **Workers Builds.** In the Cloudflare dashboard, go to Workers & Pages → Create → Import a repository, and pick this GitHub repo. Build command `pnpm build`, deploy command `pnpm wrangler deploy`. pnpm is detected from `packageManager`.
2. **Build variable.** In the Worker's Settings → Build → Variables, add `PUBLIC_TURNSTILE_SITE_KEY` with the real site key.
3. **Secrets.** Set the three runtime secrets, either in Settings → Variables and Secrets or from the CLI:
   ```sh
   pnpm wrangler secret put RESEND_API_KEY
   pnpm wrangler secret put TURNSTILE_SECRET_KEY
   pnpm wrangler secret put CONTACT_TO_EMAIL
   ```
4. **Turnstile.** Dashboard → Turnstile → Add widget, mode "Managed", hostname = the confirmed domain. Copy the site key (step 2) and secret (step 3).
5. **Custom domain.** Worker → Settings → Domains & Routes → Add custom domain. **TODO: confirm domain** (`makhafola-associates.co.za` or `makhafolaassociates.co.za`), then set it in `src/data/site.ts` and `public/robots.txt`.
6. **Email.** Verify the sending domain in Resend (DNS records) so `website@<domain>` can send.

`wrangler.jsonc` holds the Worker config: `not_found_handling: "404-page"` serves `404.html` for unknown routes. Security headers and the Content Security Policy are in `public/_headers`. The CSP allows only Turnstile and the click-to-load OpenStreetMap embed. It also allows one inline script by hash (the header state set before first paint in `src/layouts/BaseLayout.astro`). If you edit that script, recompute its hash and update `_headers`.

## Changing content

- **Firm details** (phone, email, address, hours, portal, PAIA, domain): `src/data/site.ts`. Every page and component reads from here.
- **Practice areas**: `src/data/practice-areas.ts` (groups, slugs, copy, typical matters). The home page, practice areas page, contact form select and structured data all update from it.
- **About, values, steps, question answers**: `src/data/firm.ts`. **Degrees**: `src/data/degrees.ts`.

### Adding an article

Create `src/content/insights/<slug>.md`:

```md
---
title: "Article title"
description: "One sentence for search results and sharing."
date: 2026-10-01
readTime: 4
draft: false
---

Body in Markdown. Use ## and ### for headings.
```

The slug in the file name becomes the URL (`/insights/<slug>/`). `draft: true` hides the article from listings, routes and the sitemap.

### Swapping the logo, video or images

Files live in `src/assets/` and are imported, never referenced by path, so Astro optimises them at build time.

- **Logo:** the original is `src/assets/images/logo.svg`. The header mark, reversed versions and favicons are generated from it (see `TODO.md`); replace those files with designer exports when available. The header lockup is `src/components/Logo.astro`.
- **Hero video:** put `hero.mp4` (and ideally `hero.webm`) in `src/assets/videos/` and a first-frame poster in `src/assets/images/`, then update the imports in `src/components/HeroVideo.astro`. The video loads only on screens wider than 768px, without Save-Data and without reduced motion; everyone else sees the poster.
- **Director portrait:** `src/components/Director.astro`.

**Video size.** Keep the hero loop at 5 MB or less. Cloudflare static assets have a **25 MiB per-file limit**, and a larger file will fail the deploy. For a longer or heavier video, host it on Cloudflare Stream or R2 instead of bundling it, and point `HeroVideo.astro` at that URL (add the host to `media-src` in the CSP).

## How the front end fits together

- `src/layouts/BaseLayout.astro` holds the single header, footer, mobile menu, WhatsApp button, page-transition curtain and reading-progress bar, plus the one client script.
- `src/scripts/app.ts` is the only client entry. It creates ScrollSmoother, runs Barba, and calls `init(container)` / `destroy()` from `src/scripts/pages/<namespace>.ts` around every page transition. Never put a `<script>` in a page: it will not re-run after a Barba transition.
- All styling is Tailwind utilities plus `src/styles/global.css` (tokens in `@theme`). There are no `<style>` blocks, because Barba keeps the first page's `<head>`.
- Motion values come only from `src/scripts/motion.ts`. Content is visible by default; hidden start states are set from JavaScript at the moment of animating.
- In dev, the console logs `[motion] … ScrollTriggers` after every transition to catch leaks.
