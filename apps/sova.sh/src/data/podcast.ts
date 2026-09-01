import {getSimplecastEpisodes} from '@sova-web/content';

const apiKey = import.meta.env.SIMPLECAST_API_KEY;
const podcastId = '83c02746-44ff-4368-b201-619095d32750';

export async function getEpisodes(): Promise<Episode[]> {
  console.log('fetching podcast');
  const collection = await getSimplecastEpisodes({apiKey, podcastId});
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

export interface Episode {
  imageURL: string;
  link: string;
  episode: number;
  season: number;
  title: string;
  description: string;
  pubDate: string;
}
