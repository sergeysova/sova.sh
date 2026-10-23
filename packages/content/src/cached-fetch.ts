// Copied from https://github.com/withastro/docs/blob/main/src/util-server.ts
/*
	This file contains server-side utilities using features that don't work in a browser.
	Do not import this file from a hydrated client-side component.
*/

// @ts-ignore
import EleventyFetch from '@11ty/eleventy-fetch';

export type CachedFetchOptions = {
  duration?: string;
  verbose?: boolean;
};

const MAX_STALE_AGE_MS = 24 * 60 * 60 * 1000;

function redactUrlQueries(message: string) {
  return message.replace(/https?:\/\/[^\s)]+/g, (value) => {
    try {
      const url = new URL(value);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch {
      return value;
    }
  });
}

export async function cachedFetch(
  url: string | URL,
  fetchOptions = {},
  {duration = '1h', verbose = false}: CachedFetchOptions = {},
) {
  const displayUrl = new URL(url.toString());
  displayUrl.search = '';
  let status = 200;
  let statusText = 'OK';
  let buffer: Uint8Array | undefined;

  try {
    const cache = EleventyFetch.Fetch(url.toString(), {
      duration,
      verbose,
      type: 'buffer',
      fetchOptions,
    });
    buffer = await cache.queue();

    const cachedAt = cache.getCachedTimestamp();
    const cachedAtMs = cachedAt ? new Date(cachedAt).getTime() : Number.NaN;
    const now = Date.now();
    if (!Number.isFinite(cachedAtMs) || cachedAtMs > now) {
      throw new Error(`Could not establish cache age for ${displayUrl}`);
    }
    const age = now - cachedAtMs;
    if (age > MAX_STALE_AGE_MS) {
      throw new Error(`Cached response for ${displayUrl} is older than 24 hours`);
    }
    if (age > 0 && age > cache.getDurationMs(duration)) {
      console.warn(
        `Using stale cached response for ${displayUrl} (${Math.floor(age / 1000)}s old)`,
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const safeMsg = redactUrlQueries(msg);
    const matches = safeMsg.match(/^Bad response for .*? \((\d+)\): (.*)$/s);
    status = matches ? Number(matches[1]) : 502;
    statusText = matches?.[2] ?? safeMsg;
    if (msg.includes('older than 24 hours')) throw error;
  }

  const readText = () => (buffer ? new TextDecoder().decode(buffer) : undefined);
  return {
    ok: status >= 200 && status <= 299,
    status,
    statusText,
    body: buffer,
    json: () => {
      const text = readText();
      return text === undefined ? undefined : JSON.parse(text);
    },
    text: readText,
  };
}
