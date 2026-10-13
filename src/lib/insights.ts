import { getCollection } from "astro:content";

/** Published insights, newest first. Drafts are excluded from every listing, route and the sitemap. */
export async function getPublishedInsights() {
  const entries = await getCollection("insights", ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
