# Sova Web — план монорепо и решения

Этот документ фиксирует архитектурные решения по объединению сайтов
Сергея в одну кодовую базу и отражает реальное состояние кода (а не
идеализированную картинку). Дополняет и заменяет черновой план из issue —
здесь то, что реально решено и сделано.

## Хост монорепо

Монорепо `sova-web` живёт **в этом репозитории** (`sergeysova/sova.sh`),
а не в новом отдельном репозитории. Причина: у этого репозитория уже
самая долгая история и он был центральным узлом (именно отсюда сегодня
собирается и sova.sh, и sergeysova.com).

- `sergeysova/news.sova.sh` и `sergeysova/podcast.sova.sh` со временем
  переносятся сюда как `apps/*` с сохранением истории (`git subtree`/
  `git filter-repo`) и архивируются.
- `sergeysova/sergeysova.com` — не исходный код, а чистый deploy-target
  (артефакты `gh-pages`, автокоммиты). Остаётся как есть до перехода на
  Cloudflare Workers, затем не нужен.
- `sergeysova/go.sova.dev` — вне скоупа, не трогаем (см. «Что сознательно
  не делаем» ниже).

## Роли доменов (решено: без изменений к исходному плану)

- **sova.sh** — индекс проектов, интересов, статей, статуса. Это решено:
  да, sova.sh становится индексом, а не общей ru/en версией текущей
  лендинг-страницы.
- **sergeysova.com / ru.sergeysova.com** — профессиональный бренд
  (About/Work/Writing/Talks/Consulting/Contact), два locale-билда одного
  Astro-приложения.
- **news.sova.sh**, **podcast.sova.sh** — самостоятельные тематические
  приложения.

### Текущее состояние vs. целевое

Сегодня `index.astro` в этом репозитории — это ОДНА страница с
`IfLang`/`switchLang`-переключением, которая одновременно и есть sova.sh
(ru), и есть sergeysova.com (en). Разделение на «индекс» и «бренд» с
разными content-моделями (About/Work/Talks vs. карточки проектов) — это
**контентный редизайн, а не рефакторинг структуры**, и он не сделан в
этом PR. Здесь заложен только каркас монорепо и заготовка подкаста;
контентное разделение — Phase 2 (см. ниже).

## Структура репозитория (текущий срез)

```text
sova-web/ (= этот репозиторий)
├── apps/
│   ├── sova-sh/              # sova.sh — самостоятельное приложение
│   ├── sergeysova-brand/     # sergeysova.com + ru.sergeysova.com
│   └── podcast-sova-sh/      # заготовка (scaffold), новый Astro-проект
├── packages/
│   └── content/              # общий cachedFetch + Simplecast-загрузчик
├── docs/
│   └── sova-web-monorepo-plan.md
├── pnpm-workspace.yaml
├── turbo.json
└── package.json               # workspace root
```

Ещё не созданы (осознанно, чтобы не плодить пустые заглушки без
потребителей): `apps/news-sova-sh`, `packages/ui`, `packages/seo`,
`packages/site-config`, `content/` (content collections). Появятся по
мере продвижения фаз ниже.

## 1. sova.sh как отдельное приложение

Сделано: `apps/sergeysova-brand` — новое приложение, механический клон
`apps/sova-sh` на момент разделения (тот же код, тот же контент). Цель
этого шага — перестать собирать sergeysova.com из `apps/sova-sh`, чтобы
`sova.sh` перестал быть общим источником для двух разных доменов.

Важная оговорка: **контент двух приложений сейчас идентичен**. Оба всё
ещё рендерят одну и ту же лендинг-страницу с `IfLang`/`switchLang`.
Настоящее разделение — sova.sh как индекс проектов/интересов
(`content/projects`, `content/interests`, см. пункт 4) и
sergeysova-brand как About/Work/Talks/Consulting — не сделано, потому
что требует реального контента, которого пока не существует нигде в
коде. Это авторская работа, не техническая, и она не блокирует
инфраструктурное разделение приложений, сделанное здесь.

## 2. Заготовка podcast.sova.sh

Создан `apps/podcast-sova-sh` — новый Astro-проект (не перенос
легаси-кода из `sergeysova/podcast.sova.sh`, который на Razzle + React 16
+ Express, 2019–2020, и не соответствует требованию «весь фронтенд на
Astro»). Заготовка:

- список эпизодов и страница эпизода собираются статически из Simplecast
  API через общий `@sova-web/content` (`getSimplecastEpisodes`);
- проигрывание — временно через встроенный iframe-плеер Simplecast
  (`player.simplecast.com/{episode_id}`), без кастомного UI;
- нет RSS, поиска, транскриптов, сезонных фильтров — TODO в
  `apps/podcast-sova-sh/README.md`.

Это первый реальный потребитель `packages/content` наравне с
`apps/sova-sh` — оба используют один и тот же `getSimplecastEpisodes` и
`cachedFetch` вместо двух копий одного и того же кода
(`src/data/server-request.ts` было дублировано, теперь один источник).

## 3. Деплой на Cloudflare Workers (Static Assets)

Решено: Cloudflare, бесплатно, статика, несколько независимых таргетов.
Изначально это было сделано на Cloudflare Pages (`wrangler pages deploy`),
но актуальная документация Cloudflare прямо говорит, что для новых
проектов Pages больше не рекомендуется:

> Use Workers Static Assets for new projects. If you are starting a new
> project, use Workers instead of Pages. Pages continues to work, but new
> features and optimizations are focused on Workers.

Pages ничего ещё не было задеплоено (ни одного прогона нового workflow не
было на момент проверки), поэтому переключились на Workers Static Assets
сразу, не разворачивая и не мигрируя потом Pages-проекты. Модель осталась
той же: любое число независимых Workers создаётся из одного монорепо,
каждому привязывается свой custom domain — просто `wrangler deploy` +
`wrangler.jsonc` с `assets.directory` вместо `wrangler pages deploy`.

sergeysova.com (EN) и ru.sergeysova.com (RU) тоже на Cloudflare —
кросс-репо пуш с PAT в `sergeysova/sergeysova.com` больше не нужен
вообще, никакого GitHub Pages не осталось. `apps/sergeysova-brand`
собирается дважды (два job'а в одном workflow, как в исходном плане) и
деплоится в два разных Worker'а: EN — `wrangler deploy
--name=sergeysova-com`, RU — `wrangler deploy --name=ru-sergeysova-com`.
`--name` переопределяет `name` в `wrangler.jsonc` (там по умолчанию
`sergeysova-com`) — без этого оба job'а писали бы в один Worker и
затирали друг друга через раз.

Реализовано в этом PR:

- `apps/sova-sh/wrangler.jsonc`, `apps/sergeysova-brand/wrangler.jsonc` и
  `apps/podcast-sova-sh/wrangler.jsonc` — `assets.directory: "./dist"`,
  без биндингов. Конфиг проверен через `wrangler deploy --dry-run`
  (валиден для всех трёх и для обоих `--name` overrides; сама сборка в
  песочнице CI-агента не имеет реальных API-ключей/сети, так что
  содержимое `dist` при этой проверке — не полноценный прод-билд, только
  подтверждение синтаксиса).

Один workflow-файл на домен/группу доменов, а не общий `deploy.yml` на всё:

- `.github/workflows/sova.yml` — деплой `apps/sova-sh` на Cloudflare
  Workers (`cloudflare/wrangler-action`, `command: deploy`,
  `workingDirectory: apps/sova-sh`). Триггерится по `paths` только на
  изменения `apps/sova-sh/**` и `packages/**`.
- `.github/workflows/sergeysova.yml` — деплой `apps/sergeysova-brand` на
  Cloudflare Workers, два job'а: `en` (`PUBLIC_LANGUAGE=en`,
  `--name=sergeysova-com`) и `ru` (`PUBLIC_LANGUAGE=ru`,
  `--name=ru-sergeysova-com`). Триггерится по `paths` на
  `apps/sergeysova-brand/**`.
- `.github/workflows/podcast.yml` — деплой `podcast-sova-sh` на
  Cloudflare Workers тем же способом. **Автозапуск по push выключен**
  (закомментирован), запускается вручную (`workflow_dispatch`) — не
  из-за секретов (они уже добавлены), а потому что сама заготовка ещё не
  готова представлять боевой podcast.sova.sh (см. TODO в
  `apps/podcast-sova-sh/README.md`).
- `news.yml` пока не заведён — `news.sova.sh` всё ещё отдельный
  репозиторий, а не `apps/news-sova-sh` в этой монорепе (см. Phase 2).

**Что нужно от владельца репозитория, чтобы включить Cloudflare:**

1. Завести Cloudflare-аккаунт (если ещё нет) и получить `Account ID`.
2. Создать API-токен с правами на Workers (Edit).
3. Добавить `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID` в GitHub
   Actions secrets репозитория.
4. Worker'ы `sova-sh`, `sergeysova-com`, `ru-sergeysova-com` и
   `podcast-sova-sh` создаются автоматически первым же `wrangler deploy`
   — отдельно ничего заводить не нужно.
5. В Cloudflare Dashboard → Workers & Pages → выбрать Worker → Custom
   domains добавить `sova.sh`, `sergeysova.com`, `ru.sergeysova.com` (и
   позже `podcast.sova.sh`), обновить DNS записи на Cloudflare (если
   домены ещё не там — `ru.sergeysova.com` наверняка новая запись).
6. Секрет `ACCESS_TOKEN` (PAT для `sergeysova/sergeysova.com`) и сам
   этот репозиторий больше не используются деплоем — можно оставить как
   архив или удалить, когда будет удобно.

Бесплатный тариф Workers: запросы к статическим ассетам бесплатны и не
лимитированы; лимит 100 000 запросов/день действует только на вызовы
самого Worker-скрипта (у нас его нет — только `assets`), до 20 000
файлов на версию и 25 MiB на файл, до 100 Worker'ов на аккаунт. При
3–5 статических сайтах это не проблема.

## 4. Content collections

Решено: да, содержимое переходит на Astro Content Collections. Пока не
реализовано в этом PR (требует Phase 2 по контентной модели, см. пункт 1)
— зафиксирована целевая схема:

```text
content/
├── projects/*.mdx       # sova.sh — карточки проектов
├── interests/*.mdx      # sova.sh — интересы
├── articles/*.mdx       # sova.sh — авторские статьи (сейчас src/pages/ru/*.md)
└── brand/
    ├── about/{en,ru}.mdx
    ├── work/{en,ru}.mdx
    └── contact/{en,ru}.mdx
```

Технически это будет Astro Content Layer API (доступен с Astro 5+, есть
в используемой Astro 7) с `glob`-загрузчиком, указывающим на `/content` в
корне монорепо — то есть коллекции не обязаны жить внутри `src/content`
конкретного приложения, что и позволяет `packages/content` (или сам
`content/`) быть общим для нескольких `apps/*`.

Живой контент, который остаётся live-fetch (не переходит в content
collections, потому что это внешние ленты, а не авторский контент
Сергея): статьи dev.to (`forem.ts`), видео YouTube (`youtube.ts`),
выпуски подкаста Simplecast (`podcast.ts` / `@sova-web/content`).

## 5. news.sova.sh: build-time вместо HTTP, без устаревания данных

Сегодня `apps/sova-sh/src/data/news.ts` делает **рантайм HTTP-запрос**
к `https://news.sova.sh/issues.json` — то есть к уже собранному и
задеплоенному сайту news.sova.sh. У этого есть реальный баг устаревания
уже сейчас: `sova.sh` подхватывает новый выпуск рассылки только тогда,
когда **у него самого** запустится CI/билд — а его CI сегодня триггерится
только пушем в этот же репозиторий, не в news.sova.sh. Опубликовали новый
выпуск в news.sova.sh — sova.sh узнает об этом только на следующий свой
деплой, возможно через недели.

Решение (после переноса `news.sova.sh` в монорепо как `apps/news-sova-sh`,
Phase 2):

- `news.ts` перестаёт делать HTTP-запрос и вместо этого читает контент
  выпусков напрямую (через `packages/content`, аналогично
  `getSimplecastEpisodes`) — из content collection самого
  `apps/news-sova-sh` (или из общего `content/news/`), в build-time, без
  сети.
- Свежесть решается не механизмом чтения, а тем, что и `apps/news-sova-sh`,
  и `apps/sova-sh` (и позже `apps/sergeysova-brand`) — теперь один
  репозиторий: публикация нового выпуска — это коммит в `content/news/`
  **в этом же репозитории**, и CI на пуш в `main` должен пересобирать
  и передеплоивать **все apps, зависящие от изменённого контента**, а не
  только `apps/news-sova-sh`.
- Технически: Turborepo знает граф зависимостей воркспейсов (`apps/sova-sh`
  зависит от `packages/content`/`content/news`) и при
  `turbo run build --filter=...[HEAD^1]` пересоберёт только затронутые
  апы. В GitHub Actions это означает: единый workflow (или несколько
  job'ов, управляемых `turbo`) на пуш в `main`, который сам определяет,
  какие `apps/*` нужно пересобрать и передеплоить, вместо раздельных
  workflow с ручными `paths:` фильтрами на каждый app (то, что сделано
  в этом PR для `sova-sh`/`podcast-sova-sh` — временное решение до этого
  шага).

Это фиксируется здесь как обязательное требование к Phase 2 деплой-пайплайна,
чтобб при переносе news.sova.sh в монорепо сразу не воспроизвести тот же
баг устаревания, просто заменив HTTP на воркспейс-импорт.

## 6. go.sova.dev — вне скоупа

`sergeysova/go.sova.dev` (Netlify redirect-сервис, не Astro, не
затрагивает фронтенд-стек) сознательно не включается в `sova-web`
монорепо и не упоминается в структуре `apps/*`. Домен и его инфраструктура
живут отдельно.

## Что сделано в этом PR

- [x] `pnpm-workspace.yaml` + `turbo.json` + workspace root `package.json`.
- [x] `apps/sova-sh` — перенос текущего кода `sova.sh`/`sergeysova.com`
      без изменения логики (`git mv`, история сохранена).
- [x] `packages/content` — общий `cachedFetch` + `getSimplecastEpisodes`,
      убрано дублирование `server-request.ts`/Simplecast-схемы.
- [x] `apps/podcast-sova-sh` — заготовка нового Astro-приложения.
- [x] Деплой `apps/sova-sh` переведён на Cloudflare Workers (`wrangler deploy`).
- [x] Деплой-заготовка для `apps/podcast-sova-sh` (ручной запуск).
- [x] `apps/sergeysova-brand` — отдельное приложение (клон `apps/sova-sh`
      на момент разделения), `sova-sh` больше не источник для
      sergeysova.com. Контент пока идентичен — см. пункт 1.
- [x] `sergeysova.com` (EN) и `ru.sergeysova.com` (RU) деплоятся на
      Cloudflare Workers из `apps/sergeysova-brand` (job'ы `en`/`ru` в
      `sergeysova.yml`), GitHub Pages/PAT больше не используется.

## Дальше (Phase 2, отдельная работа)

1. Контентный редизайн sova.sh (index) vs. sergeysova-brand
   (About/Work/Talks/Consulting) — сейчас оба приложения рендерят
   идентичный контент, реальное разделение смысла ещё предстоит.
   `ru.sergeysova.com` как домен (DNS) тоже ещё нужно завести у
   регистратора/в Cloudflare.
2. `content/` + Astro Content Collections для projects/interests/articles/brand.
3. Перенос `news.sova.sh` в монорепо (`git subtree`, сохранение истории),
   замена HTTP-фетча на build-time импорт + Turborepo affected-based CI
   (пункт 5 выше).
4. Перенос `podcast.sova.sh` на Cloudflare (после того как заготовка
   обрастёт нужным функционалом) и архивация легаси Razzle-репозитория.
5. `packages/ui`, `packages/seo`, `packages/site-config` — по мере того,
   как реально появится второй-третий потребитель общего кода (не раньше).
