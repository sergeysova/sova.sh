# `podcast.sova.sh`

Static Astro app with an episode index and `/episodes/[slug]` pages
generated from the Simplecast API. It uses `getSimplecastEpisodes` from
`@sova-web/content` and embeds the Simplecast player in an iframe.

## Commands

```bash
pnpm --filter @sova-web/podcast-sova-sh dev
pnpm --filter @sova-web/podcast-sova-sh build
```

The build needs `SIMPLECAST_API_KEY`; see [`.env.example`](./.env.example).
The existing Simplecast RSS feed is
[`https://feeds.simplecast.com/sZjtmMOM`](https://feeds.simplecast.com/sZjtmMOM);
the app should link to that feed rather than generate a duplicate one.

Before replacing the current site, compare the complete API archive with
the feed and existing episode URLs, then verify playback and metadata.
The Cloudflare workflow deploys on relevant changes and refreshes the
episode archive daily. See
[`docs/sova-web-monorepo-plan.md`](../../docs/sova-web-monorepo-plan.md)
for the remaining checks and production status.
