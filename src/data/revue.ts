// @ts-ignore
import {parseStringPromise} from 'xml2js';
import {JSDOM} from 'jsdom';
import {convertIntoText, firstWords} from './lib/text';
import {cachedFetch} from './server-request';

export async function getNews(): Promise<NewsIssue[]> {
  console.log('fetching news');
  const rss = 'https://news.sova.dev/?format=rss';
  const response = await cachedFetch(rss);
  if (!response.ok) {
    // || !response.headers.get('content-type')?.includes('xml')) {
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

export async function fetchIssueImage(issue: NewsIssue) {
  const response = await fetch(issue.url);
  if (!response.ok) {
    return null;
  }
  const html = await response.text();
  const dom = new JSDOM(html);
  const meta = dom.window.document.querySelector('[property="twitter:issue:image:src"]');
  return meta?.attributes.getNamedItem('content')?.textContent ?? null;
}
