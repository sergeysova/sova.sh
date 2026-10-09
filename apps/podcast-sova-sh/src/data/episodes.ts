import {getSimplecastEpisodes, type SimplecastEpisode} from '@sova-web/content';

const podcastId = '83c02746-44ff-4368-b201-619095d32750';

export interface EpisodeSummary {
  id: string;
  slug: string;
  number: number;
  season: number;
  title: string;
  description: string;
  imageURL: string;
  publishedAt: string;
}

function toSummary(episode: SimplecastEpisode): EpisodeSummary {
  return {
    id: episode.id,
    slug: episode.slug,
    number: episode.number,
    season: episode.season.number,
    title: episode.title,
    description: episode.description,
    imageURL: episode.image_url,
    publishedAt: episode.published_at,
  };
}

export async function getAllEpisodes(): Promise<EpisodeSummary[]> {
  const apiKey = import.meta.env.SIMPLECAST_API_KEY;
  const collection = await getSimplecastEpisodes({apiKey, podcastId});
  return collection
    .map(toSummary)
    .sort((a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf());
}

export async function getEpisodeBySlug(slug: string): Promise<EpisodeSummary | undefined> {
  const episodes = await getAllEpisodes();
  return episodes.find((episode) => episode.slug === slug);
}
