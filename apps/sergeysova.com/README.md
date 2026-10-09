# `sergeysova.com` / `ru.sergeysova.com`

One Astro app builds the professional profile in English and Russian.
The English and Russian builds use separate `PUBLIC_SITE` and
`PUBLIC_LANGUAGE` values:

```bash
PUBLIC_SITE=https://sergeysova.com PUBLIC_LANGUAGE=en \
  pnpm --filter @sova-web/sergeysova.com build

PUBLIC_SITE=https://ru.sergeysova.com PUBLIC_LANGUAGE=ru \
  pnpm --filter @sova-web/sergeysova.com build
```

The homepage has About, Work, Writing, Talks, Consulting, and Contact
sections. It shares articles, projects, interests, and Simplecast data
with the other apps through root `content/` and `packages/content`.

For a selected locale, the app shows translated titles when available
and omits entries without a translation. It does not translate
automatically or fall back to the source-language title.

Content still needs owner review. See
[`docs/sova-web-monorepo-plan.md`](../../docs/sova-web-monorepo-plan.md)
for migration status, open decisions, and deployment status.
