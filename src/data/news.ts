import {cachedFetch} from './server-request';
import * as z from 'zod';

export async function getNews(): Promise<NewsIssue[]> {
  console.log('fetching news');
  const rss = 'https://news.sova.sh/issues.json';
  const response = await cachedFetch(rss);
  if (!response.ok) {
    throw new Error('Failed to get news');
  }
  const {issues} = Response.parse(await response.json());

  return issues.map((issue) => ({
    id: issue.number,
    url: issue.url,
    image: issue.image,
    description: issue.description,
    publishedAt: new Date(issue.date),
  }));
}
const Issue = z.object({
  number: z.number(),
  slug: z.string(),
  url: z.string(),
  image: z.string(),
  date: z.string(),
  description: z.string(),
});

const Response = z.object({
  issues: z.array(Issue),
});

export interface NewsIssue {
  id: number;
  url: string;
  image: string;
  description: any;
  publishedAt: Date;
}
