import assert from 'node:assert/strict';
import test from 'node:test';

import {getPublishedNewsletterIssues} from './newsletter.ts';

test('filters drafts and preserves the public issue contract', () => {
  const issues = getPublishedNewsletterIssues(
    [
      {
        id: '19-1263486',
        data: {
          number: 19,
          introduction: 'Issue 19',
          date: new Date('2022-11-11'),
          image: '/19-1263486/cover.jpg',
        },
      },
      {
        id: '20',
        data: {
          number: 20,
          introduction: 'Issue 20',
          date: new Date('2023-02-27'),
          image: '/20/cover.jpg',
        },
      },
      {
        id: '21',
        data: {
          number: 21,
          introduction: '',
          date: new Date('2023-03-06'),
          image: '',
          draft: true,
        },
      },
    ],
    'https://news.sova.sh',
  );

  assert.deepEqual(
    issues.map(({number, slug, url, image}) => ({number, slug, url, image})),
    [
      {
        number: 20,
        slug: '20',
        url: 'https://news.sova.sh/issues/20',
        image: 'https://news.sova.sh/20/cover.jpg',
      },
      {
        number: 19,
        slug: '19-1263486',
        url: 'https://news.sova.sh/issues/19-1263486',
        image: 'https://news.sova.sh/19-1263486/cover.jpg',
      },
    ],
  );
});

test('rejects duplicate issue numbers before publishing', () => {
  assert.throws(
    () =>
      getPublishedNewsletterIssues(
        [
          {
            id: '20',
            data: {
              number: 20,
              introduction: 'Issue 20',
              date: new Date('2023-02-27'),
            },
          },
          {
            id: '20-copy',
            data: {
              number: 20,
              introduction: 'Duplicate',
              date: new Date('2023-02-28'),
              draft: true,
            },
          },
        ],
        'https://news.sova.sh',
      ),
    /duplicate issue number: 20/,
  );
});

test('uses the canonical image host for relative images and keeps remote images', () => {
  const issues = getPublishedNewsletterIssues(
    [
      {
        id: '18-1201069',
        data: {
          number: 18,
          introduction: 'Issue 18',
          date: new Date('2022-08-04'),
          image: 'https://cdn.example.test/cover.jpg',
        },
      },
      {
        id: '19-1263486',
        data: {
          number: 19,
          introduction: 'Issue 19',
          date: new Date('2022-11-11'),
          image: '/19-1263486/cover.jpg',
        },
      },
    ],
    'https://news.sova.sh',
  );

  assert.deepEqual(
    issues.map(({number, image}) => ({number, image})),
    [
      {number: 19, image: 'https://news.sova.sh/19-1263486/cover.jpg'},
      {number: 18, image: 'https://cdn.example.test/cover.jpg'},
    ],
  );
});
