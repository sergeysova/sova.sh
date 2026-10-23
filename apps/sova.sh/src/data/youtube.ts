import {getYoutubeVideos, type YoutubeVideo} from '@sova-web/content';

export type {YoutubeVideo};

export function getVideos(): Promise<YoutubeVideo[]> {
  return getYoutubeVideos(import.meta.env.YOUTUBE_API_KEY);
}
