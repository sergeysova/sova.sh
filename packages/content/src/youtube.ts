import * as z from 'zod';
import {cachedFetch} from './cached-fetch';

const ThumbnailSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const PlaylistItemSchema = z.object({
  publishedAt: z.string(),
  channelId: z.string(),
  title: z.string(),
  description: z.string(),
  channelTitle: z.string(),
  playlistId: z.string(),
  position: z.number(),
  resourceId: z.object({videoId: z.string()}),
  thumbnails: z.object({
    default: ThumbnailSchema,
    medium: ThumbnailSchema,
    high: ThumbnailSchema,
    standard: ThumbnailSchema,
    maxres: ThumbnailSchema,
  }),
});

const ResponseItemSchema = z.object({
  etag: z.string(),
  id: z.string(),
  snippet: PlaylistItemSchema,
});

const ResponseSchema = z.object({
  etag: z.string(),
  nextPageToken: z.string().optional(),
  items: z.array(ResponseItemSchema),
});

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: Record<
    'default' | 'medium' | 'high' | 'standard' | 'maxres',
    z.infer<typeof ThumbnailSchema>
  >;
  url: string;
  publishedAt: string;
}

function createUrl(apiKey: string | undefined, pageToken?: string) {
  const url = new URL('https://youtube.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('key', apiKey ?? '');
  url.searchParams.set('playlistId', 'UUQJ7pUY5jX8CQFDUAP-yjcw');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '50');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  return url;
}

function cleanDescription(description: string): string {
  const withoutCredits = description.split('———\n', 2)[0];
  const firstThreeLines = withoutCredits.split('\n').slice(0, 3).join('\n').trim();
  const words = firstThreeLines.split(' ');
  const shortened = words.slice(0, 20).join(' ').trim();
  return words.length > 20 ? `${shortened}…` : shortened;
}

export async function getYoutubeVideos(apiKey?: string): Promise<YoutubeVideo[]> {
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is required to load the playlist');

  const items: z.infer<typeof ResponseItemSchema>[] = [];
  const seenPageTokens = new Set<string>();
  let pageToken: string | undefined;

  do {
    const response = await cachedFetch(createUrl(apiKey, pageToken));
    if (!response.ok) {
      throw new Error(`YouTube request failed (${response.status}): ${response.statusText}`);
    }

    const page = ResponseSchema.parse(await response.json());
    items.push(...page.items);
    pageToken = page.nextPageToken;
    if (pageToken && seenPageTokens.has(pageToken)) {
      throw new Error(`YouTube returned a repeated page token: ${pageToken}`);
    }
    if (pageToken) seenPageTokens.add(pageToken);
  } while (pageToken);

  if (items.length === 0) throw new Error('YouTube returned no playlist items');

  return items
    .sort((a, b) => a.snippet.position - b.snippet.position)
    .map((item) => {
      const id = item.snippet.resourceId.videoId;
      const url = new URL('https://www.youtube.com/watch');
      url.searchParams.set('v', id);
      return {
        id,
        title: item.snippet.title.split(' | ', 2)[0],
        description: cleanDescription(item.snippet.description),
        thumbnails: item.snippet.thumbnails,
        url: url.toString(),
        publishedAt: item.snippet.publishedAt,
      };
    });
}
