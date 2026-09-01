import * as z from 'zod';
import {cachedFetch} from './cached-fetch';

// https://help.simplecast.com/en/articles/2724796-simplecast-2-0-api

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
export type SimplecastEpisode = z.infer<typeof SimplecastEpisode>;

const SimplecastResponse = z.object({
  collection: z.array(SimplecastEpisode),
});

export interface GetSimplecastEpisodesOptions {
  apiKey: string;
  podcastId: string;
}

export async function getSimplecastEpisodes({
  apiKey,
  podcastId,
}: GetSimplecastEpisodesOptions): Promise<SimplecastEpisode[]> {
  const response = await cachedFetch(`https://api.simplecast.com/podcasts/${podcastId}/episodes`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const {collection} = SimplecastResponse.parse(await response.json());

  return collection;
}
