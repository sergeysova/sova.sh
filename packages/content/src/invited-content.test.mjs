import assert from 'node:assert/strict';
import test from 'node:test';

import {getFeaturedTalks, invitedContent} from './invited-content.ts';

test('validates invited content and limits featured talks to titles in the requested language', () => {
  assert.ok(invitedContent.length > 0);
  assert.ok(invitedContent.every((item) => item.url.startsWith('https://')));

  for (const language of ['en', 'ru']) {
    const talks = getFeaturedTalks(language);
    assert.equal(talks.length, 6);
    assert.ok(talks.every((talk) => talk.titleLanguage === language));
    assert.ok(talks.every((talk) => talk.type !== 'article'));
  }
});
