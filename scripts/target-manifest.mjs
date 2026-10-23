export const TARGETS = Object.freeze({
  sova: {
    appGroup: 'sova',
    appPath: 'apps/sova.sh',
    cachePath: 'apps/sova.sh/.cache',
    wranglerConfig: 'apps/sova.sh/wrangler.jsonc',
    productionUrl: 'https://sova.sh',
    environments: {production: 'sova'},
    refreshExternalData: true,
    smoke: {
      routes: ['/', '/history'],
      externalContent: [
        {route: '/', source: 'Forem article', marker: 'href="https://dev.to/'},
        {route: '/', source: 'YouTube video', marker: 'href="https://www.youtube.com/watch?v='},
        {
          route: '/history',
          source: 'Simplecast episode',
          marker: 'href="https://podcast.sova.sh/episodes/',
        },
      ],
    },
  },
  'brand-en': {
    appGroup: 'brand',
    appPath: 'apps/sergeysova.com',
    cachePath: 'apps/sergeysova.com/.cache',
    wranglerConfig: 'apps/sergeysova.com/wrangler.jsonc',
    previewConfig: 'apps/sergeysova.com/wrangler.preview.jsonc',
    workerName: 'sergeysova-com',
    previewWorkerName: 'sergeysova-com-preview',
    productionUrl: 'https://sergeysova.com',
    environments: {preview: 'brand-en-preview', production: 'brand-en'},
    refreshExternalData: true,
    smoke: {
      routes: ['/', '/history'],
      language: 'en',
      canonical: 'https://sergeysova.com/',
      alternateLanguages: ['en', 'ru', 'x-default'],
      externalContent: [
        {route: '/history', source: 'Forem article', marker: 'href="https://dev.to/'},
        {
          route: '/history',
          source: 'YouTube video',
          marker: 'href="https://www.youtube.com/watch?v=',
        },
      ],
    },
  },
  'brand-ru': {
    appGroup: 'brand',
    appPath: 'apps/sergeysova.com',
    cachePath: 'apps/sergeysova.com/.cache',
    wranglerConfig: 'apps/sergeysova.com/wrangler.ru.jsonc',
    productionUrl: 'https://ru.sergeysova.com',
    environments: {production: 'brand-ru'},
    refreshExternalData: true,
    smoke: {
      routes: ['/', '/history'],
      language: 'ru',
      canonical: 'https://ru.sergeysova.com/',
      alternateLanguages: ['en', 'ru', 'x-default'],
      externalContent: [
        {route: '/history', source: 'Forem article', marker: 'href="https://dev.to/'},
        {
          route: '/history',
          source: 'YouTube video',
          marker: 'href="https://www.youtube.com/watch?v=',
        },
      ],
    },
  },
  news: {
    appGroup: 'news',
    appPath: 'apps/news-sova-sh',
    wranglerConfig: 'apps/news-sova-sh/wrangler.jsonc',
    productionUrl: 'https://news.sova.sh',
    environments: {production: 'news'},
    refreshExternalData: false,
    smoke: {
      routes: ['/', '/issues.json', '/rss.xml'],
      news: {issuesPath: '/issues.json', rssPath: '/rss.xml', draftNumber: 21},
    },
  },
  podcast: {
    appGroup: 'podcast',
    appPath: 'apps/podcast-sova-sh',
    cachePath: 'apps/podcast-sova-sh/.cache',
    wranglerConfig: 'apps/podcast-sova-sh/wrangler.jsonc',
    productionUrl: 'https://podcast.sova.sh',
    environments: {production: 'podcast'},
    refreshExternalData: true,
    smoke: {routes: ['/'], podcast: true},
  },
});

export const TARGET_NAMES = Object.keys(TARGETS);

export function getTarget(name) {
  const target = TARGETS[name];
  if (!target) throw new Error(`Unknown deployment target: ${name}`);
  return target;
}

export function getDeploymentTarget(name, brandEnDomainReady = false) {
  const target = getTarget(name);
  if (name === 'brand-en' && !brandEnDomainReady) {
    return {
      ...target,
      environment: target.environments.preview,
      production: false,
      wranglerConfig: target.previewConfig,
      url: undefined,
      preview: true,
    };
  }
  return {
    ...target,
    environment: target.environments.production,
    production: true,
    url: target.productionUrl,
    preview: false,
  };
}
