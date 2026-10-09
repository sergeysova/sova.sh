# sova-web

Монорепозиторий статических Astro-сайтов. Актуальные архитектура,
решения, незавершённая работа и статус production — в
[`docs/sova-web-monorepo-plan.md`](./docs/sova-web-monorepo-plan.md).

## Приложения

| Сайт                                  | Путь                   | Назначение                                     |
| ------------------------------------- | ---------------------- | ---------------------------------------------- |
| `sova.sh`                             | `apps/sova.sh`         | Русскоязычный индекс                           |
| `sergeysova.com`, `ru.sergeysova.com` | `apps/sergeysova.com`  | Профессиональный бренд, отдельные EN/RU-сборки |
| `news.sova.sh`                        | `apps/news-sova-sh`    | Архив рассылки, JSON- и RSS-эндпоинты          |
| `podcast.sova.sh`                     | `apps/podcast-sova-sh` | Список эпизодов и страницы Simplecast          |

`packages/content` содержит общий контентный код и загрузчики API.
Авторские материалы и выпуски рассылки находятся в корневом `content/`.

## Работа локально

```bash
pnpm install
pnpm --filter @sova-web/sova.sh dev
pnpm --filter @sova-web/sergeysova.com dev
pnpm --filter @sergeysova/news.sova.sh dev
pnpm --filter @sova-web/podcast-sova-sh dev
```

`pnpm build` собирает приложения через Turborepo; `pnpm test` запускает
тесты пакетов. Приложениям, которые загружают внешние данные при сборке,
нужны переменные из их `apps/*/.env.example`. Не выводите и не коммитьте
значения секретов.

CV собирается из Typst-исходников:

```bash
pnpm --filter @sova-web/sova.sh cv
pnpm --filter @sova-web/sergeysova.com cv
```

## Деплой

Приложения настроены на Cloudflare Workers Static Assets. Наличие
конфигурации и workflow не означает, что production Workers созданы или
сайты переключены: текущий статус и незавершённые действия описаны в
плане монорепозитория.
