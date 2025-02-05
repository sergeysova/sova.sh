import * as z from 'zod';
import {cachedFetch} from './server-request';
const foremServices = {
  'dev.to': {
    url: 'https://dev.to',
    apiKey: import.meta.env.DEVTO_API_KEY,
  },
};

export function getUniqueArticles(): Promise<Article[]> {
  const uniqueNamesArticlesMap = new Map<string, Article>();
  const articles = getArticlesOf('dev.to')
    .then((articles) => articles.filter((article) => !article.tag_list.includes('video')))
    .then((articles) =>
      articles.filter((article) => {
        if (!uniqueNamesArticlesMap.has(article.title)) {
          uniqueNamesArticlesMap.set(article.title, article);
          return true;
        }
        return false;
      }),
    );
  return articles;
}

const Article = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cover_image: z.string().nullable(),
  tag_list: z.array(z.string()),
  slug: z.string(),
  url: z.string(),
  created_at: z.string(),
  published_at: z.string(),
});

export type Article = z.TypeOf<typeof Article>;

const Response = z.array(Article);

async function getArticlesOf(serviceName: keyof typeof foremServices): Promise<Array<Article>> {
  console.log('fetching articles of', serviceName);
  const service = foremServices[serviceName];
  const url = new URL(service.url);
  url.pathname = '/api/articles';
  url.searchParams.set('username', 'sergeysova');
  url.searchParams.set('per_page', '1000');
  const response = await cachedFetch(url, {
    headers: {Accept: 'application/vnd.forem.api-v1+json', 'api-key': service.apiKey},
  });
  try {
    return Response.parse(await response.json()) satisfies Array<Article>;
  } catch (error) {
    console.error('Failed to check articles of', serviceName, JSON.stringify(error, null, 2));
    throw error;
  }
}
