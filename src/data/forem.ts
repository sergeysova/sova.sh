import * as t from 'runtypes';
import {cachedFetch} from './server-request';
const foremServices = {
  'dev.to': {
    url: 'https://dev.to',
    apiKey: import.meta.env.DEVTO_API_KEY,
  },
};

export function getUniqueArticles(): Promise<Article[]> {
  const uniqueNamesArticlesMap = new Map<string, Article>();
  return Promise.all([getArticlesOf('dev.to')])
    .catch((error) => {
      console.error('failed to get articles', error);
      throw error;
    })
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
}

const Article = t.Record({
  id: t.Number,
  title: t.String,
  description: t.String,
  cover_image: t.String.nullable(),
  tag_list: t.Array(t.String),
  slug: t.String,
  url: t.String,
  created_at: t.String,
  published_at: t.String,
});

export type Article = t.Static<typeof Article>;

const Response = t.Array(Article);

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
    return Response.check(await response.json());
  } catch (error) {
    console.error('Failed to check articles of', serviceName);
    throw error;
  }
}
