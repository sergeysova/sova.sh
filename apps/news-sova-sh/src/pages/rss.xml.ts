import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { getPublishedNewsletterIssues } from "@sova-web/content";

export async function GET(context: APIContext) {
  const entries = await getCollection("newsletter");
  const issues = getPublishedNewsletterIssues(
    entries,
    context.site ?? "https://news.sova.sh",
  );
  return rss({
    title: "Сова рассылает новости",
    description:
      "Email-рассылка с подборками статей, новостей и инструментов для web-разработчиков",
    site: (context.site ?? new URL("https://news.sova.sh")).toString(),
    items: issues.map((issue) => {
      const pubDate = new Date(issue.date);
      pubDate.setHours(11, 0, 0, 0);
      return {
        title: `Сова рассылает выпуск #${issue.number}`,
        pubDate,
        description: issue.description,
        link: `/issues/${issue.slug}`,
      };
    }),
  });
}
