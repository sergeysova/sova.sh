import * as z from 'zod';

export const ArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  language: z.enum(['ru', 'en']),
  titleLanguage: z.enum(['ru', 'en']).optional(),
});

export type ArticleData = z.infer<typeof ArticleSchema>;

export interface ArticleSummary {
  title: string;
  description: string;
  cover_image: string | null;
  language: 'ru' | 'en';
  titleLanguage: 'ru' | 'en';
  url: string;
  published_at: string;
}
