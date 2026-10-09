import {getCollection} from 'astro:content';
import {getPublishedNewsletterIssues} from '@sova-web/content';

export async function getNews(): Promise<NewsIssue[]> {
  const issues = await getCollection('newsletter');
  return getPublishedNewsletterIssues(issues, 'https://news.sova.sh').map((issue) => ({
    id: issue.number,
    url: issue.url,
    image: issue.image ?? '',
    description: issue.description,
    publishedAt: issue.date,
  }));
}

export interface NewsIssue {
  id: number;
  url: string;
  image: string;
  description: string;
  publishedAt: Date;
}
