import * as z from 'zod';

export const ArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  language: z.enum(['ru', 'en']),
  titleLanguage: z.enum(['ru', 'en']).optional(),
});

export type ArticleData = z.infer<typeof ArticleSchema>;

export const LocalizedTextSchema = z.object({
  en: z.string(),
  ru: z.string(),
});

export const ProjectSchema = z.object({
  title: z.string(),
  description: LocalizedTextSchema,
  url: z.string().url(),
  order: z.number().int().nonnegative(),
});

export type ProjectData = z.infer<typeof ProjectSchema>;

export const InterestSchema = z.object({
  title: LocalizedTextSchema,
  order: z.number().int().nonnegative(),
});

export type InterestData = z.infer<typeof InterestSchema>;

export interface ArticleSummary {
  title: string;
  description: string;
  cover_image: string | null;
  language: 'ru' | 'en';
  titleLanguage: 'ru' | 'en';
  url: string;
  published_at: string;
}
