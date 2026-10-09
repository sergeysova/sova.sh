import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { getPublishedNewsletterIssues } from "@sova-web/content";

export async function GET(context: APIContext) {
  const entries = await getCollection("newsletter");
  const issues = getPublishedNewsletterIssues(
    entries,
    context.site ?? "https://news.sova.sh",
  );

  return new Response(JSON.stringify({ issues }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
