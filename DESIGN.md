# Design system

All tokens live in `src/styles/global.css` (`@theme`) and `src/scripts/motion.ts`. Nothing outside these definitions is allowed: no arbitrary Tailwind values (except token references such as `z-(--z-header)`), no `<style>` blocks, no default Tailwind palette (reset with `--color-*: initial`).

## Colour: Committed strategy

Navy carries 35 to 50% of each page (hero, question section, contact band, footer). Light surfaces are cool off-white tinted to the navy hue, never cream. Gold is under 5% of any screen.

| Token                | Value                      | Use                                              |
| -------------------- | -------------------------- | ------------------------------------------------ |
| `navy-900`           | `oklch(0.226 0.043 259)`   | Footer, transition curtain                       |
| `navy-800`           | `oklch(0.300 0.059 259)`   | Primary brand navy, dark sections                |
| `navy-600`           | `oklch(0.407 0.076 257)`   | Hover on dark                                    |
| `gold-500`           | `oklch(0.731 0.115 85)`    | Accent on dark only: rules, focus rings, borders |
| `gold-300`           | `oklch(0.848 0.082 89)`    | Gold text on navy                                |
| `gold-700`           | `oklch(0.530 0.105 75)`    | Gold text and icons on light                     |
| `surface`            | `oklch(0.975 0.005 255)`   | Page background                                  |
| `surface-2`          | `oklch(0.945 0.008 255)`   | Alternate section background                     |
| `ink`                | `oklch(0.208 0.015 262)`   | Body text on light                               |
| `ink-muted`          | `oklch(0.480 0.020 255)`   | Secondary text on light                          |
| `on-dark`            | `oklch(0.975 0.005 255)`   | Text on navy                                     |
| `on-dark-muted`      | `oklch(0.820 0.020 255)`   | Secondary text on navy                           |
| `rule` / `rule-dark` | ink / on-dark at 12% / 16% | 1px rules                                        |

Rules: `gold-500` is never text or a meaningful icon on light (2.2:1). Body text at least 4.5:1, large text at least 3:1. No pure black or white.

## Typography

Fonts load through Astro's Fonts API (Fontsource provider), self-hosted with metric-matched fallbacks.

- **Headings:** Bricolage Grotesque 600 (`font-heading`) for h1 to h3, value names and article subheadings; 500 for the large practice-area and menu link lists. Client choice, replacing the serif headings.
- **Hero statement:** Bricolage Grotesque 700 at `text-hero` (up to 8.5rem, line height 0.95, tracking -0.04em), with the emphasis word in `gold-300` (Bricolage has no italic, so no faux italic). The hero's supporting line and buttons use Bricolage too (`font-hero`).
- **Serif display:** Newsreader 300/400 (`font-display`), kept only for the firm statement paragraph, the vision quote, article blockquotes and the logo lockup text.
- **Body:** IBM Plex Sans 400/500 (`font-sans`).
- **Mono:** IBM Plex Mono 400 (`font-mono`), data only: phone numbers, dates, read times, degree institutions, step numbers. Never section labels.

| Token          | Size                                       | Line height |
| -------------- | ------------------------------------------ | ----------- |
| `text-display` | `clamp(2.75rem, 1.6rem + 4.6vw, 5.5rem)`   | 1.05        |
| `text-h1`      | `clamp(2.25rem, 1.5rem + 3vw, 4rem)`       | 1.05        |
| `text-h2`      | `clamp(1.75rem, 1.3rem + 1.9vw, 2.875rem)` | 1.15        |
| `text-h3`      | `clamp(1.25rem, 1.1rem + .6vw, 1.5rem)`    | 1.15        |
| `text-body`    | `clamp(1rem, .96rem + .2vw, 1.125rem)`     | 1.6         |
| `text-small`   | `.875rem`                                  |             |
| `text-meta`    | `.8125rem`                                 |             |

Headings use `text-balance`, prose `text-pretty`. Prose measure is capped at 65ch (`max-w-prose`). Tracking: hero -0.04em, display and h1 -0.03em, h2 -0.02em (tight, as suits a bold grotesk; client direction). Uppercase only for labels of 4 words or fewer.

## Layout

- 12-column grid in a `max-w-site` (1320px) container with `px-(--gutter)`.
- Spacing: Tailwind's default 4px scale.
- `<Section size>`: `statement` (`py-40`), `content` (`py-24`), `band` (`py-32`), scaled down on mobile.
- No section eyebrows, no "01 / 02" section numbering. Numbers appear only in the degree timeline and the four-step process.

## Shape and elevation

- `rounded-none` on surfaces and buttons; `rounded-input` (2px) on form fields.
- 1px rules only. No shadows. No side-stripe borders.
- Z-index only via `--z-*` variables.

## Components

- **Button:** `primary | secondary`, `tone="light|dark"`. Plex Sans 500, 15px, 16px 28px padding, 44px minimum height, arrow slides 4px on hover. Labels are verb + object.
- **Body link:** underline, `underline-offset-4`; hover underline `gold-700` on light, `gold-300` on dark.
- **Focus:** 2px outline, `gold-500` on dark, `navy-800` on light, offset 3px, `focus-visible` only.

## Icons

Font Awesome 7, Solid set (the bold style) plus Brands for WhatsApp and LinkedIn, rendered as inline SVG at build time by `src/components/Icon.astro` (no Font Awesome CSS or JS ships). Icons sit beside text, never alone without a label: arrows in buttons and rows, contact details, menu toggles, map and share links. Colour: `gold-300` on navy, `gold-700` on light, or `currentColor` inside buttons.

## Motion

```ts
EASE = { out: "power4.out", inOut: "power3.inOut", expo: "expo.out" };
DUR = { fast: 0.35, base: 0.7, slow: 1.1 };
STAGGER = 0.07;
```

CSS transitions use `--ease-out-quart`. No bounce, elastic or back easing. Each section's reveal fits its content (see the brief's section table). Content is visible by default; hidden start states are set only from JavaScript. Reduced motion removes smoothing, splits, clip-paths, scrubs and parallax, and uses a 0.2s crossfade between pages.
