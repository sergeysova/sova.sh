import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
  const issues = await getCollection("issues", (issue) => !issue.data.draft);

  return new Response(
    JSON.stringify({
      issues: issues
        .sort((a, b) => b.data.number - a.data.number)
        .map((issue) => ({
          number: issue.data.number,
          slug: issue.id,
          url: new URL(`/issues/${issue.id}`, context.site),
          image: issue.data.image?.startsWith("/")
            ? new URL(issue.data.image, context.site)
            : issue.data.image,
          date: issue.data.date,
          description: issue.data.introduction,
        })),
    }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}
