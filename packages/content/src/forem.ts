import * as z from 'zod';
import {cachedFetch} from './cached-fetch';

const ForemArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cover_image: z.string().nullable(),
  tag_list: z.array(z.string()),
  slug: z.string(),
  url: z.string(),
  created_at: z.string(),
  published_at: z.string(),
});

export type ForemArticle = z.infer<typeof ForemArticleSchema>;

const ForemResponseSchema = z.array(ForemArticleSchema);

export async function getForemArticles({
  apiKey,
  username,
}: {
  apiKey?: string;
  username: string;
}): Promise<ForemArticle[]> {
  const url = new URL('https://dev.to/api/articles');
  url.searchParams.set('username', username);
  url.searchParams.set('per_page', '1000');

  const response = await cachedFetch(url, {
    headers: {Accept: 'application/vnd.forem.api-v1+json', 'api-key': apiKey},
  });
  if (!response.ok) {
    throw new Error(`Forem request failed (${response.status}): ${response.statusText}`);
  }

  const articles = ForemResponseSchema.parse(await response.json());
  if (articles.length === 0) {
    throw new Error(`Forem returned no articles for ${username}`);
  }
  return articles;
}
