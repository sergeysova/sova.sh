const url =
  'https://www.googleapis.com/youtube/v3/search?key={your_key_here}&channelId={channel_id_here}&part=snippet,id&order=date&maxResults=20';

const secrets = {
  apiKey: 'AIzaSyAzAPfwbYwAtIWlD34BBIlWZzDRfDfk3EQ',
  channelId: 'UCQJ7pUY5jX8CQFDUAP-yjcw',
};

function createUrl() {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', secrets.apiKey);
  url.searchParams.set('channelId', secrets.channelId);
  url.searchParams.set('part', 'snippet,id');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '6');
  return url.toString();
}

interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: Record<'default' | 'medium' | 'high', Thumbnail>;
  url: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

function mapVideo(input: any): YoutubeVideo {
  return {
    id: input.id.videoId,
    title: input.snippet.title,
    description: input.snippet.description,
    thumbnails: input.snippet.thumbnails,
    url: linkToVideo(input.id.videoId),
  };
}

function linkToVideo(id: string) {
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', id);
  return url.toString();
}

export function getVideos(): Promise<YoutubeVideo[]> {
  const url = createUrl();
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    })
    .then((response) => response.json())
    .then((answer) => answer.items.map(mapVideo))
    .catch(() => []);
}
