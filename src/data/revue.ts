// @ts-ignore
import {parseStringPromise} from 'xml2js';
import {convertIntoText, firstWords} from './lib/text';

export async function getNews(): Promise<NewsIssue[]> {
  console.log('fetching news');
  const rss = 'https://news.sova.dev/?format=rss';
  const response = await fetch(rss);
  if (!response.ok || !response.headers.get('content-type')?.includes('xml')) {
    throw new Error('Failed to get podcast');
  }
  const textXml = await response.text();
  const parsed = await parseStringPromise(textXml);

  return parsed.rss.channel[0].item
    .map(
      (item: any) =>
        ({
          id: item.link[0].match(/issues\/(\d+)/)[1],
          title: item.title[0],
          url: item.link[0].replace('www.getrevue.co/profile/_sergeysova', 'news.sova.dev'),
          description: firstWords(
            25,
            convertIntoText(item.description[0]['_'].replace(/></gm, '>&nbsp;<')),
          ),
        } as NewsIssue),
    )
    .slice(0, 6);
}

export interface NewsIssue {
  id: string;
  title: string;
  url: string;
  description: any;
}
