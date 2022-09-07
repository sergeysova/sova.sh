import * as t from 'runtypes';

import {firstThreeLines, firstWords, removeCredits, removeExtraFromSeparator} from './lib/text';
import {cachedFetch} from './server-request';

// https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials?authuser=3&project=lateral-apex-361806&supportedpurview=project
const secrets = {
  apiKey: import.meta.env.YOUTUBE_API_KEY,
  channelId: 'UCQJ7pUY5jX8CQFDUAP-yjcw',
  playListId: 'UUQJ7pUY5jX8CQFDUAP-yjcw',
};

// https://developers.google.com/youtube/v3/docs/playlists#resource
// get channel list:
// https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=UCQJ7pUY5jX8CQFDUAP-yjcw&key=
// get videos for playlist:
// https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUQJ7pUY5jX8CQFDUAP-yjcw&key=AIzaSyCbm_LeywVkvB7qGYswrziuS4Er84-tm1A
function createUrl() {
  const url = new URL('https://youtube.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('key', secrets.apiKey);
  url.searchParams.set('playlistId', secrets.playListId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '6');
  return url.toString();
}

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: Record<'default' | 'medium' | 'high' | 'standard' | 'maxres', Thumbnail>;
  url: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

function linkToVideo(id: string) {
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', id);
  return url.toString();
}

const Thumbnail = t.Record({
  url: t.String,
  width: t.Number,
  height: t.Number,
});

const PlaylistItem = t.Record({
  publishedAt: t.String,
  channelId: t.String,
  title: t.String,
  description: t.String,
  channelTitle: t.String,
  playlistId: t.String,
  position: t.Number,
  resourceId: t.Record({
    videoId: t.String,
  }),
  thumbnails: t.Record({
    default: Thumbnail,
    medium: Thumbnail,
    high: Thumbnail,
    standard: Thumbnail,
    maxres: Thumbnail,
  }),
});

const ResponseItem = t.Record({
  etag: t.String,
  id: t.String,
  snippet: PlaylistItem,
});

const Response = t.Record({
  etag: t.String,
  nextPageToken: t.String,
  items: t.Array(ResponseItem),
});

export function getVideos(): Promise<YoutubeVideo[]> {
  console.log('fetching youtube videos');
  const url = createUrl();
  return cachedFetch(url)
    .then((response) => {
      if (!response.ok) {
        console.info('failed to fetch videos', response.status, response.text());
        throw new Error(response.statusText);
      }
      return response;
    })
    .then((response) => response.json())
    .then((answer) => Response.check(answer))
    .then((answer) =>
      answer.items
        .sort((a, b) => a.snippet.position - b.snippet.position)
        .map((item) => ({
          id: item.snippet.resourceId.videoId,
          title: removeExtraFromSeparator(' | ', item.snippet.title),
          description: firstWords(20, firstThreeLines(removeCredits(item.snippet.description))),
          thumbnails: item.snippet.thumbnails,
          url: linkToVideo(item.snippet.resourceId.videoId),
        })),
    );
}
