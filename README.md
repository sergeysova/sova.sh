# sova-web

Монорепо сайтов Сергея Совы. Архитектура и статус — в
[`docs/sova-web-monorepo-plan.md`](./docs/sova-web-monorepo-plan.md).

## Структура

```text
apps/
├── sova.sh/               # sova.sh
├── sergeysova.com/        # sergeysova.com + ru.sergeysova.com (пока клон sova.sh, см. план)
└── podcast-sova-sh/       # заготовка нового Astro-приложения для podcast.sova.sh
packages/
└── content/              # общие серверные загрузчики (cachedFetch, Simplecast API)
```

## Команды

```bash
pnpm install

pnpm --filter @sova-web/sova.sh dev
pnpm --filter @sova-web/sergeysova.com dev
pnpm --filter @sova-web/podcast-sova-sh dev

pnpm build   # turbo run build — собирает все apps
```

Переменные окружения — в `.env.example` каждого приложения
(`apps/*/.env.example`).

CV собирается из Typst-исходника (`src/frontend.cv.typ`) через
`pnpm cv` в `apps/sova.sh` / `apps/sergeysova.com` — компилятор
(`typst` npm-пакет) ставится вместе с `pnpm install`, браузер/puppeteer
для этого не нужны.

## Деплой

Cloudflare Workers (Static Assets), отдельный Worker на каждый домен.
Детали и то, что пока не переехало (news.sova.sh) — см. план.
