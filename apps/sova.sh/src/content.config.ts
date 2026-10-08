import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';

import {ArticleSchema, InterestSchema, ProjectSchema} from '@sova-web/content';

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('../../../content/articles/', import.meta.url),
    generateId: ({entry}) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: ArticleSchema,
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: new URL('../../../content/projects/', import.meta.url),
  }),
  schema: ProjectSchema,
});

const interests = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: new URL('../../../content/interests/', import.meta.url),
  }),
  schema: InterestSchema,
});

export const collections = {articles, projects, interests};
