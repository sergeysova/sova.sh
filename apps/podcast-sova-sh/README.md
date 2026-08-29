# podcast.sova.sh (заготовка)

Статический Astro-сайт подкаста «Под куполом», задуманный как замена
устаревшего SSR-приложения [`sergeysova/podcast.sova.sh`](https://github.com/sergeysova/podcast.sova.sh)
(Razzle + React 16 + Express, 2019–2020, не поддерживается).

## Статус

Это заготовка (scaffold), а не полноценный перенос старого приложения:

- список выпусков и страница эпизода собираются из Simplecast API через
  общий пакет `@sova-web/content` (`getSimplecastEpisodes`);
- проигрывание эпизода — временно через встроенный iframe-плеер Simplecast,
  без кастомного UI;
- нет RSS, поиска, сезонов-фильтров, транскриптов — это следующие шаги.

## Команды

```bash
pnpm --filter @sova-web/podcast-sova-sh dev
pnpm --filter @sova-web/podcast-sova-sh build
```

Требуется `SIMPLECAST_API_KEY` в `.env` (см. `.env.example`).

## TODO перед заменой боевого сайта

- [ ] Собственный UI плеера вместо iframe (или осознанно оставить iframe)
- [ ] RSS-фид эпизодов (`/rss.xml`)
- [ ] Список по сезонам
- [ ] Перенос актуального контента/метаданных, если они отличаются от Simplecast API
- [ ] Деплой на Cloudflare Pages + переключение DNS `podcast.sova.sh`
