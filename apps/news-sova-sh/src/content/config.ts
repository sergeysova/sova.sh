import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const issues = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/issues" }),
  schema: z.object({
    draft: z.boolean().optional(),
    number: z.number(),
    introduction: z.string(),
    date: z.date(),
    image: z.string().optional(),
  }),
});

export const collections = {
  issues,
};
