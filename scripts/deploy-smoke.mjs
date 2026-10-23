import {getTarget} from './target-manifest.mjs';

const [targetName, baseUrl] = process.argv.slice(2);
if (!targetName || !baseUrl) {
  console.error('Usage: node scripts/deploy-smoke.mjs <target> <base-url>');
  process.exit(2);
}
const target = getTarget(targetName);
const pages = new Map();

async function fetchRoute(route) {
  const url = new URL(route, baseUrl);
  const response = await fetch(url, {redirect: 'follow', signal: AbortSignal.timeout(20_000)});
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const page = {url, body: await response.text()};
  pages.set(route, page);
  console.log(`OK ${response.status} ${url}`);
  return page;
}

function requireExternalContent(route, {source, marker}) {
  if (!pages.get(route)?.body.includes(marker)) {
    throw new Error(`Smoke check found no rendered ${source} content on ${route}`);
  }
}

for (const route of target.smoke.routes) await fetchRoute(route);

if (target.smoke.language) {
  const home = pages.get('/');
  if (!new RegExp(`<html[^>]*\\blang="${target.smoke.language}"`).test(home.body)) {
    throw new Error(`${targetName} homepage has the wrong document language`);
  }
  if (!home.body.includes(`<link rel="canonical" href="${target.smoke.canonical}"`)) {
    throw new Error(`${targetName} homepage has the wrong canonical URL`);
  }
  for (const alternate of target.smoke.alternateLanguages) {
    if (!home.body.includes(`hreflang="${alternate}"`)) {
      throw new Error(`${targetName} homepage is missing hreflang="${alternate}"`);
    }
  }
}

for (const requirement of target.smoke.externalContent ?? []) {
  requireExternalContent(requirement.route, requirement);
}

if (target.smoke.news) {
  const {issues} = JSON.parse(pages.get(target.smoke.news.issuesPath).body);
  if (!Array.isArray(issues) || issues.length === 0) {
    throw new Error('News issues JSON is empty or malformed');
  }
  if (issues.some(({number}) => number === target.smoke.news.draftNumber)) {
    throw new Error(`Draft issue ${target.smoke.news.draftNumber} is present in public JSON`);
  }
  const firstIssue = issues[0];
  if (!firstIssue?.slug) throw new Error('News issues JSON has no published issue slug');
  await fetchRoute(`/issues/${encodeURIComponent(firstIssue.slug)}/`);
  const rss = pages.get(target.smoke.news.rssPath).body;
  if (rss.includes(`Сова рассылает выпуск #${target.smoke.news.draftNumber}`)) {
    throw new Error(`Draft issue ${target.smoke.news.draftNumber} is present in public RSS`);
  }
}

if (target.smoke.podcast) {
  const episodePath = pages.get('/').body.match(/href="(\/episodes\/[^"#?]+)"/)?.[1];
  if (!episodePath) throw new Error('Podcast homepage has no episode link');
  await fetchRoute(episodePath);
}
