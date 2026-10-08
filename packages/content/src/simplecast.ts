import * as z from 'zod';
import {cachedFetch} from './cached-fetch';
import {collectPages} from './simplecast-pagination';

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
  pages: z
    .object({
      total: z.number().int().nonnegative().optional(),
      limit: z.number().int().positive().optional(),
      offset: z.number().int().nonnegative().optional(),
      current: z.number().int().positive().optional(),
    })
    .passthrough()
    .nullish(),
});

const DEFAULT_PAGE_SIZE = 100;

export interface GetSimplecastEpisodesOptions {
  apiKey: string;
  podcastId: string;
}

export async function getSimplecastEpisodes({
  apiKey,
  podcastId,
}: GetSimplecastEpisodesOptions): Promise<SimplecastEpisode[]> {
  const endpoint = new URL(`https://api.simplecast.com/podcasts/${podcastId}/episodes`);
  const fetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };
  const episodes = await collectPages(async (pagination) => {
    const url = new URL(endpoint);
    if (pagination) {
      url.searchParams.set('limit', String(pagination.limit));
      url.searchParams.set('offset', String(pagination.offset));
    }

    const response = await cachedFetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return SimplecastResponse.parse(await response.json());
  }, DEFAULT_PAGE_SIZE);

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const episode of episodes) {
    if (seenIds.has(episode.id)) {
      throw new Error(`Simplecast returned a duplicate episode id: ${episode.id}`);
    }
    if (seenSlugs.has(episode.slug)) {
      throw new Error(`Simplecast returned a duplicate episode slug: ${episode.slug}`);
    }
    seenIds.add(episode.id);
    seenSlugs.add(episode.slug);
  }

  return episodes;
}
