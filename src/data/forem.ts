const foremServices = {
  'dev.to': {
    url: 'https://dev.to',
    apiKey: '8EjZL9kV7AJAHdWbMnr6Ag7E',
  },
  'community.effector': {
    url: 'https://community.effector.dev',
    apiKey: 'QqQQHfKgt3tAdonrJJpy7UiF',
  },
};

export interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  created_at: string;
}

async function getArticlesOf(serviceName: keyof typeof foremServices): Promise<Array<Article>> {
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