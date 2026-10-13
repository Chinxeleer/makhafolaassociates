// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { site } from "./src/data/site.ts";

// https://astro.build/config
export default defineConfig({
  site: site.url,
  trailingSlash: "always",
  // Pages are prerendered. Only the Astro Action (contact form) runs on the Worker.
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  // No sessions are used; this stops the adapter provisioning a KV namespace.
  session: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  image: {
    layout: "constrained",
    responsiveStyles: false,
  },
  prefetch: false,
  env: {
    schema: {
      // Public Turnstile site key, inlined at build time. Default is Cloudflare's "always passes" test key.
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        default: "1x00000000000000000000AA",
      }),
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      weights: [300, 400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Sans",
      cssVariable: "--font-plex-sans",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      // Headings sitewide and the home hero.
      provider: fontProviders.fontsource(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
