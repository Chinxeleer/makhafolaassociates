# TODO before launch

Everything here is a placeholder or an unconfirmed fact. Nothing on the site was invented beyond what is listed.

## Assets (`src/assets/`)

- [ ] **Vector logo.** The company logo is `src/assets/images/logo.svg`: a Figma export wrapping a 594×594 PNG (raster only). It is used as is on the About page and for the OG image. These files were **generated from it** (the original is untouched) and can be replaced by proper exports once a vector logo exists:
  - `images/logo-mark.png`: the scales and monogram, cropped (header on light).
  - `images/logo-mark-on-dark.png`: the same with the navy recoloured to off-white, gold kept (header over the hero, mobile menu, transition curtain).
  - `images/logo-on-dark.png`: the full stacked logo, reversed (footer).
  - `images/logo-raster.png`: the logo's PNG extracted from the SVG, so the About page can serve an optimised WebP instead of the 230 KB SVG.
  - `public/favicon-32.png` and `public/apple-touch-icon.png`: the mark on the light surface.
  - The header's "Makhafola & Associates Inc." beside the mark is typeset in Newsreader, not taken from the logo. A designed horizontal lockup would replace `src/components/Logo.astro`.
  - Ask the designer for SVG exports (ideally with the navy as `currentColor`) plus a reversed version, and for a favicon.
- [x] **Hero video size.** The supplied `videos/hero.mp4` (11.5 MB, with audio) is kept untouched as the master but is no longer shipped. The site serves greyscale, muted re-encodes made from it: `hero-web.webm` (0.8 MB) and `hero-web.mp4` (1.3 MB). Greyscale costs nothing visually because the CSS treatment desaturates the video anyway. If the master changes, regenerate both:
  ```sh
  ffmpeg -i src/assets/videos/hero.mp4 -an -vf "scale=1920:-2,format=gray,format=yuv420p" -c:v libx264 -crf 30 -preset slow -tune film -movflags +faststart src/assets/videos/hero-web.mp4
  ffmpeg -i src/assets/videos/hero.mp4 -an -vf "scale=1920:-2,format=gray,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 src/assets/videos/hero-web.webm
  ```
- [ ] **Hero poster.** `images/hero-poster.jpg` is the video's first frame, exported in greyscale. To pick a different frame (time in seconds):
  ```sh
  ffmpeg -ss 4 -i src/assets/videos/hero.mp4 -frames:v 1 -vf format=gray -q:v 3 src/assets/images/hero-poster.jpg
  ```
- [ ] **Director portrait.** `images/placeholder-director.jpg` (a neutral silhouette). Supply a 4:5 portrait, at least 1200×1500, and update the import in `src/components/Director.astro`.
- [ ] **OG image.** `images/og-default.png` was composed from the supplied logo on the light surface colour. Replace with a designed 1200×630 image if wanted.

## Firm details (`src/data/site.ts`)

- [x] **Domain.** Confirmed as `makhafolaassociates.co.za` (`site.url` and `public/robots.txt`). Emails: `info@` (general enquiries, form recipient) and `meshack@` (director).
- [ ] **Office hours** (`site.hours`). Hidden on the site until set.
- [ ] **Client portal URL** (`site.portalUrl`). The footer "Client Portal" link and the "Go to the client portal" link are hidden until set.
- [ ] **PAIA manual URL** (`site.paiaUrl`). Hidden until set.
- [ ] **Map pin** (`site.geo`). Approximate position of Tudor Chambers; confirm.

## Copy for client review

- [ ] **Practice area copy** in `src/data/practice-areas.ts` (summaries and typical matters, written conservatively).
- [ ] **Home and How we work copy** in `src/data/firm.ts`: the three answers to the question section and the four process steps.
- [ ] **Insight articles.** The three articles in `src/content/insights/` are placeholders. Rewrite, approve or set `draft: true`.
- [ ] **Privacy notice** (`src/pages/privacy.astro`): POPIA template, needs **legal review by the firm**, including the retention periods and the name of the Information Officer.

## Road Accident Fund (core practice) and Wills & Estates: attorney review before launch

- [ ] **Confirm the "core practice" wording.** TODO: confirm with the firm whether "speciality" wording is acceptable under the LPC Code of Conduct. The site describes RAF claims as the firm's "core practice" and never as a "specialist" or "expert" service; `speciality` is only an internal field name.
- [ ] **Review all RAF and estates copy.** Marked `TODO: attorney to review RAF and estates copy before launch`:
  - `src/data/practice-areas.ts`: the `speciality` summary, the Wills & Estates entry, and the Family Law changes (parental rights, link to Wills & Estates).
  - `src/data/raf.ts`: who can claim, what a claim can cover, the four process steps, what to bring, "Why the firm", and the six FAQ answers (also published as FAQPage structured data).
  - `src/pages/index.astro`: the hero supporting line and the home RAF section ("Road Accident Fund claims are the core of our practice." and its two sentences).
  - `src/pages/practice-areas.astro`: the RAF block at the top ("Our core practice: Road Accident Fund claims").
- [ ] **Verify the RAF time limits** in `src/data/raf.ts` (`timeLimits.items`: 3 years identified vehicle, 2 years hit-and-run, 5 years to serve summons) against the current RAF Act and regulations, then set `timeLimits.verified: true`. Until then the page shows a neutral sentence instead of the numbers.
- [ ] **Confirm fee offers** in `src/data/site.ts`. Both default to `false`, and no fee offer appears anywhere until set:
  - `freeConsultation`: adds "The first consultation is free." to the RAF FAQ answer on cost.
  - `offersContingency`: adds that outcome-based fees are governed by the Contingency Fees Act.
- [ ] **Placeholder articles** (both `draft: true`, not published): `src/content/insights/how-a-road-accident-fund-claim-works.md` and `src/content/insights/what-to-do-after-a-road-accident.md`. Write them, then set `draft: false`.
- [ ] **Contact form RAF fields.** "Date of the accident" and "Police case number" are collected only when the RAF option is chosen, and are included in the enquiry email. Confirm the privacy notice covers them.

## Services

- [ ] Create the **Turnstile** widget for the confirmed domain and set `PUBLIC_TURNSTILE_SITE_KEY` (build variable) and `TURNSTILE_SECRET_KEY` (secret). The defaults are Cloudflare's test keys.
- [ ] Create a **Resend** account, verify the sending domain, set `RESEND_API_KEY`. The sender is `website@makhafolaassociates.co.za` (see `src/actions/index.ts`).
- [ ] Set `CONTACT_TO_EMAIL`.
- [ ] Optional: enable **Cloudflare Web Analytics** (cookieless) in the Cloudflare dashboard once the domain is live. If it injects a script, add its host to the CSP in `public/_headers`.
