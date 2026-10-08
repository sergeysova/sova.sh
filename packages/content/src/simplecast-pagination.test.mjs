import assert from 'node:assert/strict';
import test from 'node:test';

import {collectPages} from './simplecast-pagination.ts';

test('collects every offset page and preserves the page order', async () => {
  const calls = [];
  const pages = [
    {
      collection: ['episode-1', 'episode-2'],
      pages: {total: 2, limit: 2, offset: 0, current: 1, next: '/episodes?limit=2&offset=2'},
    },
    {
      collection: ['episode-3'],
      pages: {total: 2, limit: 2, offset: 2, current: 2, next: null},
    },
  ];

  const episodes = await collectPages(async (pagination) => {
    calls.push(pagination);
    return pages[calls.length - 1];
  }, 2);

  assert.deepEqual(episodes, ['episode-1', 'episode-2', 'episode-3']);
  assert.deepEqual(calls, [undefined, {limit: 2, offset: 2}]);
});

test('does not request another page when Simplecast marks the page terminal', async () => {
  let calls = 0;
  const episodes = await collectPages(async () => {
    calls += 1;
    return {
      collection: ['episode-1'],
      pages: {total: 1, limit: 100, offset: 0, current: 1, next: null},
    };
  }, 100);

  assert.deepEqual(episodes, ['episode-1']);
  assert.equal(calls, 1);
});

test('fails instead of silently returning an incomplete archive', async () => {
  await assert.rejects(
    collectPages(
      async () => ({
        collection: [],
        pages: {total: 2, limit: 100, offset: 0, current: 1, next: '/episodes?offset=100'},
      }),
      100,
    ),
    /reported another page but returned no items/,
  );
});
