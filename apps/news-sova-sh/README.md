# `news.sova.sh`

Astro app for the newsletter archive. The shared issues live in the
root `content/news/` collection; the app serves the archive, individual
issue pages, `/issues.json`, and `/rss.xml`. The subscribe form and its
thank-you page are part of the app.

Run it from the monorepo root:

```bash
pnpm --filter @sergeysova/news.sova.sh dev
pnpm --filter @sergeysova/news.sova.sh build
```

`deploy.yml` builds and deploys the app on pushes to `main`. Successful
Workers deployment and production domain status are tracked in
[`docs/sova-web-monorepo-plan.md`](../../docs/sova-web-monorepo-plan.md).
