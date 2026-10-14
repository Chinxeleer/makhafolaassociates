# Makhafola & Associates Inc. website

Marketing website for **Makhafola & Associates Inc.**, a firm of attorneys at Tudor Chambers, Pretoria. Positioning: _a law firm that thinks like an engineer_.

Every page is prerendered as static HTML and served from **Cloudflare Workers static assets**. The only code that runs on the Worker is the contact form (an Astro Action protected by Cloudflare Turnstile). Page transitions, smooth scrolling and scroll animations run in the browser with Barba.js and GSAP, and the site works fully with JavaScript turned off.

> **Status: pre-launch.** Several facts and assets are still placeholders (domain, director portrait, office hours, client portal, article copy, privacy review). They are all listed in [TODO.md](TODO.md).

| Document                 | What it covers                                                                |
| ------------------------ | ----------------------------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md) | Audience, brand voice, regulatory limits (Legal Practice Council), copy rules |
| [DESIGN.md](DESIGN.md)   | Colour, type, spacing, icon and motion tokens, and the rules for using them   |
| [TODO.md](TODO.md)       | Every placeholder and unconfirmed fact still to resolve before launch         |

## Contents

- [Stack](#stack)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Project structure](#project-structure)
- [Editing content](#editing-content)
- [Design system](#design-system)
- [How the front end works](#how-the-front-end-works)
- [Contact form](#contact-form)
- [Deploying to Cloudflare](#deploying-to-cloudflare)
- [Performance](#performance)
- [Security headers and CSP](#security-headers-and-csp)
- [Before you merge](#before-you-merge)
- [Troubleshooting](#troubleshooting)

## Stack

| Area             | Choice                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework        | [Astro 7](https://docs.astro.build), TypeScript strict, static output                                        |
| Hosting          | Cloudflare Workers with static assets via `@astrojs/cloudflare` (images optimised at build time)             |
| Styling          | Tailwind CSS v4 through `@tailwindcss/vite`; all tokens in `src/styles/global.css`                           |
| Fonts            | Astro Fonts API (self-hosted from Fontsource): Bricolage Grotesque, Newsreader, IBM Plex Sans, IBM Plex Mono |
| Icons            | Font Awesome 7 Solid and Brands, rendered to inline SVG at build time                                        |
| Motion           | GSAP 3 with ScrollTrigger, ScrollSmoother and SplitText                                                      |
| Page transitions | Barba.js v2 (`@barba/core`)                                                                                  |
| Content          | Markdown content collection for insights; typed data files for everything else                               |
| Contact form     | Astro Action, Cloudflare Turnstile, email via Resend                                                         |
| Package manager  | **pnpm only** (version pinned in `package.json` → `packageManager`)                                          |

## Getting started

Requirements: **Node.js 22.12+** and **pnpm**. Never use npm or yarn; `pnpm-lock.yaml` is the lockfile.

```sh
pnpm install
cp .dev.vars.example .dev.vars   # local secrets for the Worker (git-ignored)
pnpm dev                         # http://localhost:4321
```

To see the site exactly as it will run in production, with the real fonts and a working contact form:

```sh
pnpm preview                     # builds, then runs the Worker at http://localhost:8787
```

> Use `pnpm preview`, not `pnpm dev`, to judge typography, page speed and transitions. See [Troubleshooting](#troubleshooting).

## Commands

| Command           | What it does                                                                           |
| ----------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`        | Astro dev server at <http://localhost:4321>                                            |
| `pnpm build`      | Production build into `dist/client` (static files) and `dist/server` (Worker)          |
| `pnpm preview`    | Build, then run the real Worker locally with `wrangler dev`                            |
| `pnpm deploy`     | Build and deploy with `wrangler deploy` (prefer Workers Builds, below)                 |
| `pnpm check`      | `astro check`; must report 0 errors                                                    |
| `pnpm format`     | Prettier, with Astro support and Tailwind class sorting                                |
| `pnpm cf-typegen` | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` or secret names |

pnpm runs dependency build scripts only for `esbuild`, `sharp` and `workerd` (`package.json` → `pnpm.onlyBuiltDependencies`).

## Project structure

```text
├─ astro.config.mjs        Site URL, adapter, fonts, image and env config
├─ wrangler.jsonc          Worker name, compatibility, static assets, 404 handling
├─ public/
│  ├─ _headers             Security headers, CSP, long-cache rules
│  ├─ robots.txt
│  └─ favicon-32.png, apple-touch-icon.png
└─ src/
   ├─ actions/index.ts     The contact form Action (validation, Turnstile, email)
   ├─ assets/
   │  ├─ images/           Logo and generated variants, hero poster, portrait, OG image
   │  └─ videos/           hero.mp4 (master, not shipped) and the web encodes
   ├─ components/          One component per pattern (Button, Section, Icon, Logo, …)
   ├─ content/insights/    Articles, one Markdown file each
   ├─ content.config.ts    Insights collection schema
   ├─ data/                site.ts, firm.ts, practice-areas.ts, degrees.ts
   ├─ layouts/             BaseLayout (shell for every page), ArticleLayout
   ├─ lib/                 email.ts, turnstile.ts, insights.ts (server and build helpers)
   ├─ pages/               index, about, practice-areas, insights/, contact, privacy, 404
   ├─ scripts/
   │  ├─ app.ts            The single client entry: smoother, Barba, page registry
   │  ├─ motion.ts         EASE, DUR, STAGGER: the only motion values
   │  ├─ pages/            init/destroy per page namespace
   │  └─ components/       header, menu, hero video, form, timeline, …
   └─ styles/global.css    Tailwind import, @theme tokens, base layer
```

## Editing content

Copy and data live in `src/data/` and `src/content/`. Components only read from there, so a fact is never typed twice.

| To change                                                                             | Edit                         |
| ------------------------------------------------------------------------------------- | ---------------------------- |
| Name, phone, email, address, WhatsApp, domain, office hours, client portal, PAIA link | `src/data/site.ts`           |
| Practice areas: groups, names, slugs, summaries, typical matters                      | `src/data/practice-areas.ts` |
| About text, vision, values, director bio, home question answers, the four steps       | `src/data/firm.ts`           |
| Director's degrees (timeline order)                                                   | `src/data/degrees.ts`        |
| Privacy notice                                                                        | `src/pages/privacy.astro`    |

Office hours, the client portal link and the PAIA manual link are hidden until they are set in `site.ts`. Practice areas feed the home page, the practice areas page, the contact form's dropdown and the structured data, so one edit updates all of them.

**Copy rules** (from [PRODUCT.md](PRODUCT.md)): no em dashes, no superlatives, no testimonials, case results or statistics, button labels as verb + object ("Book a consultation", never "Learn more").

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

The file name becomes the URL (`/insights/<slug>/`). Articles are listed newest first. `draft: true` hides an article from listings, routes and the sitemap.

### Images, logo and video

Everything in `src/assets/` is **imported**, never linked by path, so Astro optimises it at build time (AVIF/WebP, responsive `srcset`). Only files that need a fixed URL live in `public/`.

- **Logo.** The company logo is `src/assets/images/logo.svg`. It is a PNG wrapped in an SVG, so these files were generated from it: `logo-mark.png` (header mark), `logo-mark-on-dark.png` and `logo-on-dark.png` (light versions for navy backgrounds), `logo-raster.png` (About page), and the favicons in `public/`. The header lockup (mark plus typeset name) is `src/components/Logo.astro`. When vector logos are available, replace the generated files; see [TODO.md](TODO.md).
- **Director portrait.** Replace `placeholder-director.jpg` with a 4:5 photo at least 1200×1500 and update the import in `src/components/Director.astro`.
- **Hero video.** `videos/hero.mp4` is the untouched master and is **not shipped**. The site serves `hero-web.webm` and `hero-web.mp4`: greyscale, muted encodes under 1.5 MB. The navy colour treatment is applied in CSS in `src/components/HeroVideo.astro`. After replacing the master, regenerate the web files and poster:

  ```sh
  ffmpeg -i src/assets/videos/hero.mp4 -an -vf "scale=1920:-2,format=gray,format=yuv420p" \
    -c:v libx264 -crf 30 -preset slow -tune film -movflags +faststart src/assets/videos/hero-web.mp4
  ffmpeg -i src/assets/videos/hero.mp4 -an -vf "scale=1920:-2,format=gray,format=yuv420p" \
    -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 src/assets/videos/hero-web.webm
  ffmpeg -ss 0 -i src/assets/videos/hero.mp4 -frames:v 1 -vf format=gray -q:v 3 src/assets/images/hero-poster.jpg
  ```

  The video only loads on screens wider than 768px, without Save-Data and without reduced motion; everyone else sees the poster. Cloudflare static assets have a **25 MiB per-file limit**. For a longer or heavier video, host it on Cloudflare Stream or R2, point `HeroVideo.astro` at that URL and add the host to `media-src` in the CSP.

## Design system

The full system is in [DESIGN.md](DESIGN.md). The short version:

- **Tokens only.** Every colour, type size, z-index, duration and ease comes from `@theme` / `:root` in `global.css` or from `motion.ts`. Tailwind's default palette is reset, so classes like `bg-blue-500` do not exist.
- **No arbitrary values** (`text-[37px]`, `bg-[#123456]`). The only exception is a token reference such as `z-(--z-header)` or `min-h-(--hero-min-h)`.
- **No `<style>` blocks** anywhere. Styling is Tailwind utilities plus `global.css`. This is required for Barba (see below).
- **Colour:** navy (`navy-800`, `navy-900`) carries the brand moments; light surfaces are a cool off-white; gold is a rare accent. Use `gold-300` for gold text on navy and `gold-700` on light. Never use `gold-500` for text on light backgrounds (2.2:1 contrast).
- **Type:** Bricolage Grotesque for headings and the hero (`font-heading`, `font-hero`); Newsreader serif for the firm statement, the vision quote and the logo lockup (`font-display`); IBM Plex Sans for body text; IBM Plex Mono for data only (phone numbers, dates, read times, step numbers).
- **Icons:** use `src/components/Icon.astro` with a Font Awesome Solid icon (Brands for WhatsApp and LinkedIn). It renders inline SVG at build time, so no Font Awesome CSS or JavaScript reaches the browser.

  ```astro
  ---
  import { faPhone } from "@fortawesome/free-solid-svg-icons";
  import Icon from "../components/Icon.astro";
  ---

  <Icon icon={faPhone} class="size-4 text-gold-700" />
  ```

- **Shared components:** `Button` (`variant="primary|secondary"`, `tone="light|dark"`), `Section` (`size="statement|content|band"`), `Container`, `Icon`, `EmailLink`. Reuse these instead of repeating class clusters.

## How the front end works

Barba swaps the `<main>` container between pages instead of doing full page loads. That is why a few rules matter.

### The rules

1. **One client entry.** `BaseLayout.astro` loads `src/scripts/app.ts` once. Scripts placed inside a page do **not** re-run after a Barba transition, so never add a `<script>` to a page or component.
2. **Page behaviour lives in `src/scripts/pages/<namespace>.ts`**, which exports `init(container)` and `destroy()`. `app.ts` keeps a registry keyed by namespace and calls them around every transition. `destroy()` must undo everything `init()` created (use a `gsap.context` and revert it).
3. **No per-page CSS.** Barba keeps the first page's `<head>`, so all styles must be in the single global stylesheet.
4. **Content is visible by default.** Hidden start states are set from JavaScript at the moment of animating (`gsap.from`), never in CSS. With JavaScript off, every section renders fully visible.
5. **Motion values come from `motion.ts` only.** There is no bounce or elastic easing anywhere.

### A page transition, step by step

1. A link is clicked. Barba ignores external links, `mailto:`, `tel:`, WhatsApp links, same-page anchors, `target="_blank"`, `data-barba-prevent` and `/404`.
2. The current page's `destroy()` runs, and the navy curtain rises.
3. The new page's HTML arrives (usually instantly: the main pages are prefetched when the browser is idle and on link hover).
4. The old container is hidden and the page scrolls to the top. `<title>`, meta, canonical, Open Graph and JSON-LD tags are copied into `<head>`.
5. **The curtain stays down until the new page is ready**: its fonts are loaded and its first-screen images decoded (capped at 1.2s).
6. The new page's `init()` runs, ScrollTrigger refreshes, the active nav item updates, the curtain lifts and the heading reveal plays.
7. Focus moves to the new `<h1>` and the page title is announced to screen readers.

With reduced motion, the curtain becomes a 0.2s crossfade and there is no smooth scrolling, splitting, parallax or scrubbing. In dev, the console logs `[motion] … ScrollTriggers` after every transition; the count for a given page should never grow.

### Adding a page

1. Create `src/pages/<name>.astro` using `BaseLayout` with a unique `title`, `description` and `namespace`. Give it exactly one `<h1>` (add `data-reveal-heading` for the heading reveal).
2. If it needs behaviour, add `src/scripts/pages/<namespace>.ts` exporting `init` and `destroy`, and register it in `app.ts`. Add the namespace to the `Namespace` type in `BaseLayout.astro`.
3. To put it in the navigation, add it to `nav` in `src/data/site.ts`; the header, mobile menu and footer all read from there.

## Contact form

The form posts to the `contact` Action in `src/actions/index.ts`, which:

1. validates the input with zod (the same messages are shown on the client);
2. silently discards submissions with the honeypot field filled;
3. verifies the Turnstile token server-side;
4. sends the enquiry by email through `sendEmail()` in `src/lib/email.ts`;
5. returns a typed success or error. Message bodies are never logged (POPIA).

Email goes through **Resend** by default. To switch provider, change only `sendEmail()` in `src/lib/email.ts`.

| Variable                    | Kind           | Purpose                                                                                     |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`            | secret         | Resend API key. Locally, `dry-run` skips sending and logs only that a message would be sent |
| `TURNSTILE_SECRET_KEY`      | secret         | Turnstile server-side secret                                                                |
| `CONTACT_TO_EMAIL`          | secret         | Where enquiries are delivered (falls back to the firm email)                                |
| `PUBLIC_TURNSTILE_SITE_KEY` | build variable | Turnstile site key, inlined at build time (see `.env.example`)                              |

Locally, secrets come from `.dev.vars` (copy `.dev.vars.example`, which uses Cloudflare's always-pass Turnstile test keys and `dry-run`). Never commit `.dev.vars`.

## Deploying to Cloudflare

The site deploys through **Workers Builds**, Cloudflare's GitHub integration: push to GitHub and Cloudflare builds and deploys. Nothing is deployed from a laptop.

### What the repository already provides

| File                                                   | Why it matters for Workers Builds                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `package.json` → `packageManager` and `pnpm-lock.yaml` | Cloudflare installs with pnpm, from the lockfile                             |
| `package.json` → `pnpm.onlyBuiltDependencies`          | Lets `esbuild`, `sharp` and `workerd` run their install scripts in CI        |
| `.node-version`                                        | Pins Node.js 22 (the build image defaults to 24), matching local development |
| `wrangler.jsonc` → `name`                              | `makhafola-associates`: must equal the Worker's name in the dashboard        |
| `wrangler.jsonc` → `assets`                            | Serves `dist/client`, with `404.html` for unknown routes                     |

The build needs no secrets: only the contact form uses them, at runtime. A clean checkout (no `node_modules`, no `.dev.vars`) installs, builds and passes `wrangler deploy --dry-run`.

### One-time setup

1. **Push the repository to GitHub.** The production branch is `main`: merge your work there to deploy.
2. **Create the Worker from the repository.** Cloudflare dashboard → Workers & Pages → Create → Import a repository → select the repo. Use these settings:

   | Setting               | Value                                                |
   | --------------------- | ---------------------------------------------------- |
   | Project / Worker name | `makhafola-associates` (must match `wrangler.jsonc`) |
   | Production branch     | `main`                                               |
   | Build command         | `pnpm build`                                         |
   | Deploy command        | `npx wrangler deploy` (the default)                  |
   | Root directory        | `/` (leave empty)                                    |

3. **Build variable.** Worker → Settings → Build → Variables and secrets: add `PUBLIC_TURNSTILE_SITE_KEY` with the real Turnstile site key. It is inlined at build time, so it must be a _build_ variable. Without it, the build uses Cloudflare's test key, which accepts everyone.
4. **Runtime secrets.** Worker → Settings → Variables and Secrets (this is separate from build variables). Add, as type **Secret**:

   | Secret                 | Value                           |
   | ---------------------- | ------------------------------- |
   | `RESEND_API_KEY`       | Resend API key                  |
   | `TURNSTILE_SECRET_KEY` | Turnstile secret key            |
   | `CONTACT_TO_EMAIL`     | Address that receives enquiries |

   Or from a terminal logged in with `pnpm wrangler login`: `pnpm wrangler secret put RESEND_API_KEY` (and the same for the others).

5. **Turnstile widget.** Dashboard → Turnstile → Add widget, mode "Managed". Add the live domain as a hostname (and the `*.workers.dev` hostname if you want the form to work there before the domain is connected). Its site key goes in step 3 and its secret in step 4.
6. **Custom domain.** Worker → Settings → Domains & Routes → Add → Custom domain. The domain is **still to be confirmed** (`makhafola-associates.co.za` or `makhafolaassociates.co.za`); once chosen, set it as `url` in `src/data/site.ts` and in `public/robots.txt`, then push.
7. **Email sending.** In Resend, add and verify the domain (DNS records) so mail from `website@<domain>` is delivered.

### Day to day

- **Deploy:** merge or push to `main`. Cloudflare runs `pnpm build`, then `npx wrangler deploy`. Build logs are under Worker → Deployments.
- **Preview a branch:** turn on Worker → Settings → Build → Branch control → **Enable Preview Builds**. Every push to another branch then gets its own preview URL (and a comment on its pull request), without touching production.
- **Roll back:** Worker → Deployments → pick an earlier version → Deploy.
- **After changing a secret:** it applies on the next request; no rebuild is needed. After changing the build variable, retry the latest build.

### If a build fails

| Error in the build log                                                              | Fix                                                                                     |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `The name in your Wrangler configuration file … must match the name of your Worker` | Rename the Worker in the dashboard, or change `name` in `wrangler.jsonc`, so they match |
| `ERR_PNPM_OUTDATED_LOCKFILE`                                                        | Run `pnpm install` locally and commit the updated `pnpm-lock.yaml`                      |
| Errors mentioning `sharp`, `esbuild` or `workerd` binaries                          | Make sure `pnpm.onlyBuiltDependencies` in `package.json` still lists all three          |
| Unsupported engine / Node version                                                   | Check `.node-version` (22) is committed                                                 |

Optional: enable Cloudflare Web Analytics (cookieless) once the domain is live.

## Performance

Current Lighthouse (mobile, production build): **94–95 performance, 100 accessibility, 100 best practices, 100 SEO**, with no layout shift.

What keeps it there:

- **Static HTML** everywhere; the Worker only handles the form.
- **Images** are optimised at build time (AVIF/WebP, responsive sizes). Only the hero poster is loaded with priority; everything below the fold is lazy.
- **Hero video** is a greyscale web encode (0.85 MB WebM / 1.3 MB MP4) attached after first paint, on wide screens only.
- **Fonts** are self-hosted with metric-matched fallbacks. Each page preloads only the weights it uses above the fold.
- **Icons** add no JavaScript; the client bundle is one script of about 69 KB gzipped.
- **Navigation** prefetches the main pages when idle, and the transition curtain waits for the new page's fonts and first-screen images, so pages never pop in after the curtain lifts.
- **Caching:** hashed files under `/_astro/` are served `immutable` for a year.

## Security headers and CSP

`public/_headers` sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, HSTS and a Content Security Policy. The only third parties allowed are Cloudflare Turnstile (contact form) and the click-to-load OpenStreetMap embed (contact page).

The CSP allows exactly **one inline script, by hash**: the line in `src/layouts/BaseLayout.astro` that sets the transparent header state before first paint. If that script changes, recompute its hash after building and update `_headers`:

```sh
pnpm build
node -e 'const s=require("fs").readFileSync("dist/client/index.html","utf8");const m=s.match(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/);console.log("sha256-"+require("crypto").createHash("sha256").update(m[1]).digest("base64"))'
```

Symptom of a stale hash: on the home page the header starts solid instead of transparent, and the console shows a CSP violation.

## Before you merge

- [ ] `pnpm check` reports 0 errors and `pnpm build` succeeds.
- [ ] `pnpm preview`: click between every page, including browser back and forward; the curtain lifts onto a finished page every time.
- [ ] No horizontal scroll at 320, 375, 768, 1024 and 1440px.
- [ ] The site still works with JavaScript disabled and with reduced motion on.
- [ ] No banned patterns. These should all return nothing (`<Icon>`, Font Awesome and token references are fine):

  ```sh
  grep -rn "<style" src
  grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(" src --include=*.astro --include=*.css
  grep -rn "—" src
  ```

- [ ] Any new placeholder or unconfirmed fact is added to [TODO.md](TODO.md).

## Troubleshooting

**Fonts look wrong (Georgia or system sans) in `pnpm dev`.** Under the dev server, the Cloudflare Vite plugin answers `/_astro/fonts/*` before Astro's font middleware does, so dev shows the fallback fonts. Production and `pnpm preview` serve the real fonts.

**Dev feels slow or pages pop in after transitions.** The dev server renders pages and processes images on demand. Judge speed and transitions with `pnpm preview`.

**`pnpm preview` serves 404s after rebuilding.** `wrangler dev` does not survive `dist/` being rebuilt underneath it. Stop it and run `pnpm preview` again.

**The header is solid over the home hero.** The inline script hash in `public/_headers` is stale. See [Security headers and CSP](#security-headers-and-csp).

**Type errors about `Element` or `append` after running `wrangler types`.** Generate Worker types without runtime types (`pnpm cf-typegen` already does): the full runtime types clash with the DOM types used by client scripts. `src/env.d.ts` declares the one `cloudflare:workers` export the Action needs.

**Type error importing `@barba/core`.** Barba 2.10.3 ships a broken `types` path; `src/env.d.ts` re-exports its real declarations.

**The contact form fails locally.** Check that `.dev.vars` exists (copy `.dev.vars.example`) and that you are using `pnpm preview`, which runs the Worker. The form needs JavaScript; without it, visitors see a note with the phone number and email instead.
