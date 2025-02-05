import * as z from 'zod';
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
  const {collection} = SimplecastResponse.parse(response);
  return collection.map((episode) => ({
    imageURL: episode.image_url,
    link: `https://podcast.sova.sh/episodes/${episode.slug}`,
    episode: episode.number,
    season: episode.season.number,
    title: episode.title,
    description: episode.description,
    pubDate: episode.published_at,
  }));
}

const SimplecastEpisode = z.object({
  description: z.string(),
  duration: z.number(),
  enclosure_url: z.string(),
  id: z.string(),
  image_url: z.string(),
  number: z.number(),
  published_at: z.string(),
  season: z.object({number: z.number()}),
  slug: z.string(),
  title: z.string(),
});

const SimplecastResponse = z.object({
  collection: z.array(SimplecastEpisode),
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
