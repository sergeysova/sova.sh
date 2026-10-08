import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';

import {ArticleSchema} from '@sova-web/content';

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: new URL('../../../content/articles/', import.meta.url),
    generateId: ({entry}) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: ArticleSchema,
});

export const collections = {articles};
