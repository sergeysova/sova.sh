// @ts-ignore
import {parseStringPromise} from 'xml2js';

export async function getNews(): Promise<NewsIssue[]> {
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
          title: item.title[0],
          url: item.link[0].replace('www.getrevue.co/profile/_sergeysova', 'news.sova.dev'),
          description:
            item.description[0]['_']
              .replace(/\<\/?\w+\>/gm, ' ')
              .split(' ')
              .slice(0, 20)
              .join(' ') + '…',
        } as NewsIssue),
    )
    .slice(0, 6);
}

interface NewsIssue {
  title: string;
  url: string;
  description: any;
}
