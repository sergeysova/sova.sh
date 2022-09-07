const foremServices = {
  'dev.to': {
    url: 'https://dev.to',
    apiKey: import.meta.env.DEVTO_API_KEY,
  },
  'community.effector': {
    url: 'https://community.effector.dev',
    apiKey: import.meta.env.EFFECTOR_COMMUNITY_API_KEY,
  },
};

export interface Article {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  tag_list: string[];
  slug: string;
  url: string;
  created_at: string;
}

async function getArticlesOf(serviceName: keyof typeof foremServices): Promise<Array<Article>> {
  console.log('fetching articles of', serviceName);
  const service = foremServices[serviceName];
  const url = new URL(service.url);
  url.pathname = '/api/articles';
  url.searchParams.set('username', 'sergeysova');
  url.searchParams.set('per_page', '1000');
  const response = await fetch(url.toString(), {
    headers: {Accept: 'application/vnd.forem.api-v1+json', 'api-key': service.apiKey},
  });
  return (await response.json()) as Array<Article>;
}

export const getUniqueArticles = () => {
  const uniqueNamesArticlesMap = new Map<string, Article>();
  return Promise.all([getArticlesOf('dev.to'), getArticlesOf('community.effector')])
    .catch((error) => {
      console.error('failed to get articles', error);
      throw error;
    })
    .then(([dev, effector]) => [...effector, ...dev])
    .then((articles) => articles.filter((article) => !article.tag_list.includes('video')))
    .then((articles) =>
      articles.filter((article) => {
        if (!uniqueNamesArticlesMap.has(article.title)) {
          uniqueNamesArticlesMap.set(article.title, article);
          return true;
        }
        return false;
      }),
    );
};
