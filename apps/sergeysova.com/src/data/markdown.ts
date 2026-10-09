import {getCollection} from 'astro:content';
import type {ArticleSummary} from '@sova-web/content';

export async function getPages(): Promise<ArticleSummary[]> {
  const articles = await getCollection('articles');
  return articles
    .map(({id, data}) => ({
      title: data.title,
      description: data.description,
      cover_image: null,
      language: data.language,
      titleLanguage: data.titleLanguage ?? data.language,
      url: `/${id}`,
      published_at: data.date.toISOString(),
    }))
    .sort((a, b) => new Date(b.published_at).valueOf() - new Date(a.published_at).valueOf());
}
