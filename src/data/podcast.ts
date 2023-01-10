import * as t from 'runtypes';
// @ts-ignore
import {getPodcastFromFeed} from '@sergeysova/podcast-feed-parser';
import {convertIntoText} from './lib/text';
import {cachedFetch} from './server-request';

const apiKey = import.meta.env.SIMPLECAST_API_KEY;
const podcastId = '83c02746-44ff-4368-b201-619095d32750';
// https://help.simplecast.com/en/articles/2724796-simplecast-2-0-api
// curl https://api.simplecast.com/episodes/7a1e9192-2997-4f2a-a9b1-40687e8b2d4b/player

async function request(path: string) {
  const url = `https://api.simplecast.com${path}`;
  const response = await cachedFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (response.ok) return await response.json();
}

export async function getEpisodes(): Promise<Episode[]> {
  console.log('fetching podcast');
  const rss = 'https://anchor.fm/s/4c5764fc/podcast/rss';
  const response = await cachedFetch(rss);
  if (!response.ok) {
    // || !response.headers.get('content-type')?.includes('xml')) {
    throw new Error('Failed to get podcast');
  }
  const textXml = await response.text();
  const answer = Podcast.check(getPodcastFromFeed(textXml));
  return answer.episodes
    .sort((a, b) => b.episode - a.episode)
    .map((episode) => {
      if (episode.description.includes('<p')) {
        const parsed = convertIntoText(episode.description);
        episode.description = parsed;
      }
      return episode;
    });
}

const Episode = t.Record({
  title: t.String,
  description: t.String,
  duration: t.Number,
  enclosure: t.Record({
    length: t.String,
    type: t.String,
    url: t.String,
  }),
  explicit: t.Boolean,
  season: t.Number,
  episode: t.Number,
  guid: t.String,
  imageURL: t.String,
  link: t.String,
  pubDate: t.String,
  summary: t.String,
});

export type Episode = t.Static<typeof Episode>;

const Meta = t.Record({
  title: t.String,
  author: t.Array(t.String),
  categories: t.Array(t.String),
  description: t.String,
  explicit: t.Boolean,
  imageURL: t.String,
  language: t.String,
  lastBuildDate: t.String,
  link: t.String,
  owner: t.Record({
    name: t.String,
    email: t.String,
  }),
  subtitle: t.String.optional(),
  summary: t.String,
  type: t.Union(t.Literal('episodic')),
});

const Podcast = t.Record({
  meta: Meta,
  episodes: t.Array(Episode),
});
