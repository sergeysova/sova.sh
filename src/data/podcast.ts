import * as t from 'runtypes';
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
  else {
    throw new Error(await response.text());
  }
}

export async function getEpisodes(): Promise<Episode[]> {
  console.log('fetching podcast');
  const response = await request(`/podcasts/${podcastId}/episodes`);
  const {collection} = SimplecastResponse.check(response);
  return collection.map((episode) => ({
    imageURL: episode.image_url,
    link: `https://podcast.sova.dev/episodes/${episode.slug}`,
    episode: episode.number,
    season: episode.season.number,
    title: episode.title,
    description: episode.description,
    pubDate: episode.published_at,
  }));
}

const SimplecastEpisode = t.Record({
  description: t.String,
  duration: t.Number,
  enclosure_url: t.String,
  id: t.String,
  image_url: t.String,
  number: t.Number,
  published_at: t.String,
  season: t.Record({number: t.Number}),
  slug: t.String,
  title: t.String,
});

const SimplecastResponse = t.Record({
  collection: t.Array(SimplecastEpisode),
});

export interface Episode {
  imageURL: string;
  link: string;
  episode: number;
  season: number;
  title: string;
  description: string;
  pubDate: string;
}
