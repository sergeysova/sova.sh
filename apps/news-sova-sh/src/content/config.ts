import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { NewsletterIssueSchema } from "@sova-web/content";

const newsletter = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: new URL("../../../../content/news/", import.meta.url),
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: NewsletterIssueSchema,
});

export const collections = { newsletter };
