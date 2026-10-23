import {getForemArticles, type ForemArticle} from '@sova-web/content';

export type Article = ForemArticle;

export async function getUniqueArticles(): Promise<Article[]> {
  const articles = await getForemArticles({
    apiKey: import.meta.env.DEVTO_API_KEY,
    username: 'sergeysova',
  });
  const seenTitles = new Set<string>();
  return articles.filter((article) => {
    if (article.tag_list.includes('video') || seenTitles.has(article.title)) return false;
    seenTitles.add(article.title);
    return true;
  });
}
