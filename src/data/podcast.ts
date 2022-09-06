// @ts-ignore
import {getPodcastFromFeed} from '@podverse/podcast-feed-parser';
// @ts-ignore
import {parseStringPromise} from 'xml2js';

export async function getPodcast(): Promise<Episode[]> {
  const rss = 'https://anchor.fm/s/4c5764fc/podcast/rss';
  const response = await fetch(rss);
  if (!response.ok || !response.headers.get('content-type')?.includes('xml')) {
    throw new Error('Failed to get podcast');
  }
  const textXml = await response.text();
  return Promise.all(
    getPodcastFromFeed(textXml)
      .episodes.slice(0, 6)
      .map(async (episode: Episode) => {
        if (episode.description.includes('<p')) {
          const parsed = await parseStringPromise(episode.description);
          episode.description = parsed.p;
        }
        return episode;
      }),
  );
}

interface Podcast {
  meta: {};
  episodes: Episode[];
}

interface Episode {
  title: string;
  description: string;
  imageURL: string;
  link: string;
}
