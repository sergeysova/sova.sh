import {cachedFetch} from './server-request';
import * as t from 'runtypes';

export async function getNews(): Promise<NewsIssue[]> {
  console.log('fetching news');
  const rss = 'https://news.sova.dev/issues.json';
  const response = await cachedFetch(rss);
  if (!response.ok) {
    throw new Error('Failed to get news');
  }
  const {issues} = Response.check(await response.json());

  return issues.map((issue) => ({
    id: issue.number,
    url: issue.url,
    image: issue.image,
    description: issue.description,
    publishedAt: new Date(issue.date),
  }));
}

const Issue = t.Record({
  number: t.Number,
  slug: t.String,
  url: t.String,
  image: t.String,
  date: t.String,
  description: t.String,
});

const Response = t.Record({
  issues: t.Array(Issue),
});

export interface NewsIssue {
  id: number;
  url: string;
  image: string;
  description: any;
  publishedAt: Date;
}
