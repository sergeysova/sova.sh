# Sova Web: план завершения монорепо

Цель: собрать сайты Сергея в одном репозитории, разделить их по назначению
и независимо публиковать статические Astro-приложения. При переносе
сохранить контент, историю доступных исходников и опубликованные ссылки.

Срез отслеживаемого кода: коммит `2dfbd26` от 10 октября 2026 года.
Текущая рабочая ветка дополнительно содержит незакоммиченные изменения
общих загрузчиков данных и CI/deploy workflow. Состояние production,
DNS, прав Cloudflare и GitHub Actions описано ниже отдельно.

Обозначения:

- **Решено**: решение из предыдущего плана или прямое указание Сергея.
- **Есть в коде**: подтверждено файлами текущего checkout; не означает,
  что функциональность проверена в production.
- **Рекомендация**: предлагаемый способ реализации, ещё не утверждённый
  владельцем.
- **Нужно решение**: спорный вопрос, который нельзя закрыть ресерчем.
- **Нужно проверить**: нужны доступы, исходники или проверка на реальных
  данных.

## 1. Границы и принятые решения

### Репозиторий

**Решено:** развивать монорепо в существующем репозитории с его историей,
без создания нового хоста.

В текущем checkout `origin` указывает на
[`sergeysova/sova.dev`](https://github.com/sergeysova/sova.dev).
Это прежний адрес того же репозитория: GitHub перенаправляет его на
[`sergeysova/sova.sh`](https://github.com/sergeysova/sova.sh), а API
возвращает каноническое имя `sergeysova/sova.sh`. Для новых инструкций
использовать канонический адрес. Менять remote для завершения плана
не требуется.

`sova-web` в этом документе означает проект, а не запланированное
переименование GitHub-репозитория. Сейчас корневой пакет называется
`@sova/online`, workspace-пакеты используют префикс `@sova-web/`.
Переименовывать их ради единообразия для завершения плана не требуется.

### Сайты

- **`sova.sh`**: индекс проектов, интересов, статей и текущего статуса.
- **`sergeysova.com`**: профессиональный бренд на английском.
- **`ru.sergeysova.com`**: русский вариант того же бренда.
- **`news.sova.sh`**: самостоятельное приложение рассылки.
- **`podcast.sova.sh`**: самостоятельное приложение подкаста.

**Решено:** бренд имеет одно Astro-приложение и две статические
locale-сборки. Все перечисленные сайты публикуют статику; перенос на SSR
не входит в план.

### Данные и зависимости

- **Решено:** авторский контент переводим в Astro Content Collections.
- **Решено Сергеем:** источником данных подкаста остаётся Simplecast API,
  общий для приложений индекса, бренда и подкаста.
- **Решено:** используем существующий RSS
  [`https://feeds.simplecast.com/sZjtmMOM`](https://feeds.simplecast.com/sZjtmMOM)
  для подписки. Не заменяем API чтением RSS и не создаём собственный
  дублирующий `/rss.xml`.
- **Решено и есть в коде:** Cloudflare Workers Static Assets, отдельный
  Worker на production-таргет. Пришедшие коммиты заменили первоначальные
  Pages-workflows; создавать Pages-проекты больше не требуется.
- **Ограничение Сергея:** не обновлять TypeScript `6.0.3` в существующих
  приложениях. Импортированный Astro 5 news-app добавляет peer-resolved
  TypeScript `5.9.3` в lockfile; это отдельная legacy peer dependency,
  не замена root TypeScript `6.0.3`, и её нужно учитывать при согласовании
  следующего обновления Astro news-app.
- Остальные зависимости обновлять при конкретной необходимости, с
  проверкой совместимости и без массового обновления ради новых версий.

### За пределами работы

`go.sova.dev` и его redirect-инфраструктуру не переносим.
`packages/ui` уже содержит общий Astro UI и дизайн-токены. Не создаём
заранее `packages/seo` и `packages/site-config`: выделяем пакет только
при реальном повторном использовании. Поиск, транскрипты и собственный
аудиоплеер подкаста не считаем обязательными условиями миграции без
отдельного решения.

## 2. Подтверждённое состояние

### Каркас

В репозитории уже есть:

```text
apps/
├── sova.sh/              # текущий RU-сайт, будущий индекс
├── sergeysova.com/       # один исходник, EN/RU-бренд
├── news-sova-sh/         # импортированная Astro-рассылка
└── podcast-sova-sh/      # статическая заготовка подкаста
packages/
├── content/             # схемы, источники данных и Simplecast API
└── ui/                  # общий Astro UI и дизайн-токены
content/
├── articles/
├── interests/
├── news/
└── projects/
docs/
└── sova-web-monorepo-plan.md
pnpm-workspace.yaml
turbo.json
package.json
```

Workspace настроен на `apps/*` и `packages/*`. Корневые команды
запускают Turborepo. Зафиксированные версии: Astro `7.2.9`,
Turborepo `2.10.12`, pnpm `11.25.0`; `.nvmrc` указывает Node `24.20`.
Это версии проекта, не заявление о последних доступных релизах.

`.puppeteerrc.cjs` отключает загрузку Chrome при установке зависимостей.
Браузер нужен отдельно для генерации PDF-резюме, не для обычной сборки.

### `sova.sh` и бренд

Приложения уже разделены инфраструктурно:

- `apps/sova.sh`: `PUBLIC_LANGUAGE=ru`, `PUBLIC_SITE=https://sova.sh`;
- `apps/sergeysova.com`: EN и RU-сборки с адресами
  `https://sergeysova.com` и `https://ru.sergeysova.com`.

Главные страницы теперь выполняют разные роли: `sova.sh` показывает
индекс проектов, интересов и публикаций; `sergeysova.com` — профиль
с About/Work/Writing/Talks/Consulting/Contact. Оба приложения читают
одни и те же статьи, проекты и интересы из корневого `content/`.
Markdown-страницы статически маршрутизируются через catch-all route,
сохраняя прежние URL.

Схемы статей, проектов и интересов находятся в `packages/content`;
`src/content.config.ts` каждого Astro-приложения подключает корневые
коллекции. `src/data/markdown.ts` строит карточки и историю из коллекции.
Общий пакет `packages/content` получает, проверяет и нормализует данные
Forem, YouTube и Simplecast. Индекс и бренд используют эти источники;
подкаст также читает Simplecast через общий загрузчик. Каждый источник
загружается во время сборки, поэтому без scheduled refresh статический
сайт сам не обновится.

Материалы для бренда уже частично существуют: биография на главной,
выступления и гостевые выпуски в `src/data/invited-content.ts`,
страница `/history` и PDF-резюме в `public/`. Сергей должен проверить
их актуальность и подготовить недостающие тексты Work/Consulting.
Утверждение старого плана «контента нет нигде» было неверным.

**Решение Сергея:** в брендовой локали показывать перевод заголовка,
если он существует; если перевода нет — не показывать этот материал.
Не переводить автоматически и не подставлять оригинал. Текущие
формулировки разделов приняты как рабочие и могут быть изменены позже.

### Подкаст

`apps/podcast-sova-sh` уже собирает список и
`/episodes/[slug]` из Simplecast API. Плеер использует iframe Simplecast.
Индекс, бренд и подкаст импортируют общий `getSimplecastEpisodes`.

Общий загрузчик проходит страницы Simplecast через `limit` и `offset`,
проверяет схему, непустые страницы, уникальность ID/slug и прогресс
пагинации. Существующие тесты охватывают штатные страницы и пустой
ответ с признаком продолжения; отдельные тесты источников Сергей пока
не запрашивал. Локальная сборка подкаста сформировала 19 страниц эпизодов.

Предыдущие README описывают старый сайт как Razzle/React/Express.
Публичный `sergeysova/podcast.sova.sh` при ресерче возвращает 404,
поэтому стек и доступность его истории не подтверждены.
404 не доказывает, что репозиторий удалён: он может быть приватным.

### Рассылка

Исходник `sergeysova/news.sova.sh` импортирован как `apps/news-sova-sh`
вместе с историей. 21 Markdown-выпуск и их filename-based slug лежат
в `content/news/`; изображения сохранены в `apps/news-sova-sh/public/`.
Build-time endpoints `issues.json` и `rss.xml` формируются из этой
коллекции [N1–N3].

`apps/news-sova-sh`, индекс и бренд читают одну корневую коллекцию при
сборке; потребители больше не запрашивают `news.sova.sh/issues.json`.
Выпуск № 21 остаётся черновиком; JSON, RSS, список главной и статические
страницы показывают 20 опубликованных выпусков.

### CI и деплой

`.github/workflows/deploy.yml` использует один selector для выбора целей
сборки и публикации. Каталог целей и их build/deploy/smoke metadata
сосредоточены в `scripts/target-manifest.mjs`; workflow потребляет
результат selector и не дублирует сведения о Workers. Матрица учитывает реальные потребители корневых
коллекций; неизвестная база, опасный diff или неизвестный путь выбирают
все цели. Изменения только в документации не запускают production deploy.
Перед публикацией workflow сравнивает HEAD с последним успешным GitHub
Deployment отдельно для каждого target, поэтому следующий запуск
повторяет цель после ошибки и учитывает multi-commit push.

На push в `main` workflow собирает выбранную цель, публикует Worker,
проверяет репрезентативные production routes и записывает commit/version
в GitHub Deployments только после успешных smoke checks. Ежедневный
schedule пересобирает Sova, обе локали бренда и подкаст; рассылка не
зависит от внешних API. GitHub Actions cache сохраняет `.cache` Forem,
YouTube и Simplecast отдельно для каждого app target. `cachedFetch`
обновляет кэш при обычной сборке, предупреждает при stale fallback
и завершает сборку ошибкой, если снимку больше 24 часов.

Podcast публикуется автоматически при затрагивающих его изменениях
и по расписанию. EN бренд пока остаётся `workers.dev` preview на
отдельном Worker `sergeysova-com-preview`; после DNS-подготовки
`BRAND_EN_CUSTOM_DOMAIN_READY=true` переключит workflow на production
Worker и домен. Автоматического rollback нет: неуспешный smoke-check
записывает failed deployment и оставляет ручной откат оператору.

`test.yml` запускает семь существующих тестов `packages/content`;
новые тесты не добавлялись по просьбе Сергея. Smoke-check helper проверен
локально на HTTP fixtures для пяти targets. `actionlint` не установлен.

Текущие локальные сборки news и подкаста проходят (22 и 19 страниц).
Сборки Sova и бренда останавливаются на YouTube HTTP 403 без успешного
свежего ответа; публикация неполного контента блокируется. Production
GitHub Actions workflow пока не запускался. `sova.sh`, `news.sova.sh`,
`podcast.sova.sh` и `ru.sergeysova.com` уже отвечают с Workers;
`sergeysova.com` всё ещё указывает на GitHub Pages.

## 3. Целевая структура и правила данных

```text
apps/
├── sova.sh/
├── sergeysova.com/       # один исходник, EN и RU build-таргеты
├── news-sova-sh/
└── podcast-sova-sh/
packages/
└── content/             # серверные загрузчики, схемы и адаптеры
content/
├── projects/
├── interests/
├── articles/
├── brand/
│   ├── about/
│   ├── work/
│   ├── writing/
│   ├── talks/
│   ├── consulting/
│   └── contact/
└── news/
```

Сейчас созданы `content/articles/`, `content/projects/` и
`content/interests/`. `content/brand/` и `content/news/` пока не созданы.
Разделы бренда являются секциями одной страницы; отдельные URL
для каждого раздела не вводились.

### Авторский контент

Используем Markdown; MDX оставляем там, где нужны компоненты.
Не конвертируем существующие `.md` в `.mdx` без причины.
Сохраняем идентификаторы, slug, язык, даты и ссылки на изображения.
У статьи должен быть один канонический адрес даже при показе её
карточки на нескольких сайтах.

Astro `glob()` поддерживает источники вне каталога приложения [A1].
Каждое приложение всё равно описывает свои коллекции в
`src/content.config.ts`; `packages/content` не становится общим
реестром коллекций автоматически. Разрешение пути к корневому
`content/` проверяем при сборке каждого приложения и в dev-режиме.
Для `.mdx` приложение-потребитель должно иметь MDX integration [A2].

Приложения не импортируют `src` друг друга. Общие схемы и функции
чтения принадлежат `packages/content`, страницы и представление —
своему Astro-приложению.

### Новости

**Рекомендация:** сделать `content/news/` единственным источником
выпусков после переноса. Во время импорта можно оставить исходную
структуру под `apps/news-sova-sh`, затем отдельным коммитом перенести
контент и изменить загрузчики.

Сохранить текущие `number`, filename-based slug, дату, `draft`,
introduction и пути изображений. Публичные страницы, RSS и
`issues.json` должны показывать только опубликованные выпуски.
Потребители читают исходный контент при сборке, без HTTP к
`news.sova.sh` и без зависимости от порядка деплоя приложений.

### Внешние источники

dev.to, YouTube и Simplecast остаются сетевыми источниками **во время
сборки**. Статический сайт не обновится от изменения API сам по себе.

**Решено:** ежедневно пересобирать Sova, обе локали бренда и подкаст
для обновления внешних источников. Публикация API-зависимого сайта
останавливается, если источник не возвращает валидные данные и нет
кэшированного снимка в пределах разрешённого возраста.

HTTP-кэш `cachedFetch` имеет TTL `1h`; Turbo-кэш артефактов — другой
механизм. Turbo не отслеживает изменения ответов API [T3].
Refresh должен выбирать потребителей внешних источников даже без
изменений Git, обходить кэш их build-задач и получать свежие данные.
Истечение HTTP TTL не должно выдавать восстановленный Turbo-артефакт
за свежую сборку.

Eleventy Fetch может вернуть кэш при ошибке сети [E1]. **Решено:**
принимать такой снимок только до 24 часов от последнего успешного fetch
и выдавать предупреждение в CI. Более старый или отсутствующий снимок
завершает сборку ошибкой; прежний production Worker остаётся опубликован.

## 4. Спорные места и неизвестные

### Production на Workers

Выбор Workers Static Assets закрыт пришедшими коммитами и соответствует
рекомендации Cloudflare [C1]. Pages больше не является альтернативой
в этом плане. Осталось проверить реальные публикации, привязать домены
и подготовить откат; workflows сами по себе этого не доказывают.

**Нужно проверить:** текущие Worker/version ID, доступность Cloudflare
zones для обоих основных доменов, права токена и сохранность прежнего
хостинга. Для Custom Domains требуется активная Cloudflare zone,
включая поддомены; Pages-инструкция с внешним CNAME здесь неприменима [C3].

### Локали бренда

Сохраняем принятое решение о двух статических сборках одного app.
Astro поддерживает i18n, но его `i18n.domains` документирован для
server-rendered проектов [A3]; он не заменяет выбранную схему
статической публикации.

EN и RU должны иметь отдельные задачи/артефакты и выходные каталоги.
Сейчас CI уже изолирует их отдельными job и checkout; при переходе на
общие Turbo-задачи нельзя параллельно писать обе сборки в один `dist`.
`PUBLIC_SITE` и `PUBLIC_LANGUAGE` уже входят в Turbo hash;
учесть также остальные значения, влияющие на HTML, например
`PUBLIC_GTAG`. Серверные API-ключи не помещать в `PUBLIC_*`.

### Статьи, языки и адреса

**Решено Сергеем:** индекс `sova.sh` русскоязычный; полные тексты статей
остаются на `sova.sh`, а Writing бренда служит каталогом ссылок. В EN/RU
бренде показывать заголовок только при наличии перевода на язык сборки;
не переводить и не подставлять оригинал автоматически.

**Ещё нужно согласовать:** факты и состав материалов первого релиза бренда,
актуальность биографии/резюме, а также нужны ли отдельные URL разделам
бренда. Существующие URL статей сохраняются; перенос текста на новый домен
требует отдельной карты постоянных редиректов.

### Подкаст

Источник API и адрес RSS уже определены, это не открытые вопросы.
Остаются:

- доступ к старому исходному репозиторию и возможность сохранить историю;
- соответствие старых URL текущему API `slug`;
- необходимость навигации по сезонам;
- оставить iframe или сделать собственный плеер.

Рекомендация: оставить iframe в первом релизе, сохранив воспроизведение
и старые ссылки. Навигацию по сезонам делать после проверки данных API.
Поиск и транскрипты требуют отдельного объёма работ и источника данных.
Не генерировать новые slug из заголовков вместо существующих.

### Доступы и production

**Нужно проверить с владельцем:** боевые ветки и права доступа,
доступность старых исходников, Workers и их привязки к доменам,
GitHub secrets, управление DNS, действующие production-деплои.
Публичный ресерч не даёт доступа к этим настройкам.

Строка с YouTube API key была удалена из обоих текущих source modules;
в Git history она уже присутствует. Если ключ ещё активен, Сергей должен
отозвать его в Google Cloud и заменить GitHub Actions/local
`YOUTUBE_API_KEY`. Текущие source файлы больше не содержат ключ.

## 5. План реализации и критерии этапов

### Этап 0. Зафиксировать исходное состояние и доступы

- [x] Проверить связь имён хоста: `sova.dev` перенаправляет на `sova.sh`.
- [ ] Подтвердить production-ветки, доступы и список source/deploy-репозиториев.
- [ ] Снять список опубликованных URL, PDF и assets всех сайтов,
      сохранить текущие deployment ID и способ отката каждого домена.
- [ ] Проверить доступы к Simplecast, внешним API, Cloudflare и GitHub.
      Секреты хранить в локальных `.env` и GitHub Actions secrets,
      не в плане или коммитах.
- [ ] Подтвердить frozen-lockfile установку и сборки индекса, EN/RU-бренда
      и подкаста на версиях из проекта; зафиксировать существующие ошибки.
- [x] Сборки news (22 pages) и подкаста (19 pages) прошли локально.
- [ ] Sova и EN/RU-бренд остановились на YouTube HTTP 403; проверить
      действие `YOUTUBE_API_KEY`/квоты и повторить сборки. Полный
      `pnpm install --frozen-lockfile` на Node `24.20` ещё не проверен.
- [x] Исправить выявленные препятствия отдельно от контентного редизайна:
      YouTube-плейлист теперь загружается по `pageToken` с `maxResults=50`
      [Y1], а Astro-приложения напрямую подключают Sharp для сборки изображений.
- [ ] Согласовать открытые продуктовые решения из раздела 4.

**Готово, когда:** известны источники, доступы и базовые результаты
сборок; можно проверить потерю маршрутов и вернуть текущие сайты.

### Этап 1. Коллекции и перенос существующих материалов

- [ ] Описать схемы projects/interests/articles/brand и правила
      языка, slug, draft, дат и canonical URL.
- [x] Перенести текущие Markdown/MDX-статьи и связанные изображения,
      сохранив проверенные маршруты без редиректов.
- [ ] Перенести отобранные биографию, выступления и резюме; Сергей
      проверяет факты, актуальность и тексты Work/Consulting.
- [x] Убрать раздельные копии списка выступлений из приложений: общий
      источник валидируется схемой и показывает в EN/RU-бренде только
      заголовки с явно указанным языком. Сам список пока не перенесён
      в редактируемые Markdown-коллекции.
- [x] Подключить Astro-коллекции статей, проектов и интересов к корневому контенту.
- [x] Заменить ручной обход Markdown в `src/pages` на чтение коллекции
      в индексных списках и истории.
- [ ] Добавить проверки схем, уникальности идентификаторов и URL,
      отсутствия черновиков в публичном выводе.

**Готово, когда:** контент читается из нового источника, старые ссылки
и изображения работают, согласованный контент проходит валидацию.

### Этап 2. Разделить индекс и бренд

- [x] Разделить приложения и EN/RU deploy-job: `apps/sova.sh` и
      `apps/sergeysova.com` больше не один build-источник.
- [x] Переделать `apps/sova.sh` в русскоязычный индекс со списками
      проектов и интересов, статьями и текущим статусом.
- [x] Переделать существующее `apps/sergeysova.com` из копии лендинга
      в бренд с согласованными разделами
      About/Work/Writing/Talks/Consulting/Contact.
- [ ] Сохранить изоляцию EN/RU артефактов при переходе на Turbo.
- [x] Исправить навигацию: `sova.sh` больше не русский перевод бренда;
      языковая пара — `sergeysova.com` и `ru.sergeysova.com`.
- [ ] Проверить HTML `lang`, canonical, hreflang для существующих
      переводов, sitemap, Open Graph и аналитику каждого таргета.
      В текущем layout canonical оформлен через `meta`; заменить
      его корректным `link rel="canonical"` при переносе.
- [ ] Проверить мобильную версию, клавиатурную навигацию и
      сохранность `/history`, статей и ссылок на PDF.

**Готово, когда:** индекс и бренд выполняют разные роли; обе версии
бренда собираются независимо и одобрены Сергеем в preview.

### Этап 3. Перенести рассылку с историей

- [x] Импортировать `news.sova.sh` в `apps/news-sova-sh`, включая
      Markdown, изображения, RSS и JSON endpoint, через `git subtree`
      без squash. Source commit `a2ad58366bd6c3e82185ba85e062560de99f30c2`;
      история upstream сохранена.
- [x] Сергей подтвердил, что рассылка принадлежит ему; содержимое
      импортировано с его разрешения. В upstream нет файла LICENSE, поэтому
      это подтверждение владельца, а не лицензия на повторное использование
      материалов третьими лицами.
- [x] Добиться совместимости с текущим workspace; imported news-app
      собирается на Astro 5.18.2. Прямую версию TypeScript `6.0.3` в root
      приложениях не менял; peer stack Astro 5 разрешает TypeScript `5.9.3`.
- [x] Перевести выпуск и метаданные в единый источник коллекции,
      убрать HTTP-зависимость индекса и бренда от `issues.json`.
- [x] Сохранить `/issues.json`, RSS, опубликованные slug и assets
      для существующих клиентов и ссылок.
- [x] Проверить, что черновики не попадают ни в индекс, ни в RSS,
      ни в JSON; опубликованы 20 выпусков, а выпуск № 21 остаётся черновиком.
      **Готово, когда:** рассылка собирается из монорепо, а индекс и бренд читают
      те же исходные выпуски. Публичное переключение допустимо только после
      проверки CI из этапа 5: новый выпуск должен обновить всех потребителей.

### Этап 4. Довести подкаст до замены текущего сайта

- [x] Реализовать обход страниц Simplecast с проверкой схемы,
      уникальности ID/slug и обработкой пустой страницы при наличии
      следующей. Статус публикации и полноту архива ещё нужно подтвердить
      на свежем API-ответе.
- [ ] Сравнить список API с текущим сайтом и контрольным RSS
      (при ресерче в нём 18 эпизодов); выяснить расхождения, а не
      зафиксировать 18 как постоянный лимит.
- [ ] Сохранить старые страницы эпизодов и их адреса; добавить
      редиректы при подтверждённом изменении slug.
- [ ] Проверить iframe-плеер, обложки, даты, описания и сезоны.
      HTML из API проверять перед публикацией; description для
      метатегов формировать как обычный текст.
- [ ] Добавить подписку на существующий Simplecast RSS и
      согласованную навигацию по сезонам, если она нужна.
- [ ] Уточнить способ сохранения старой истории: импорт доступных
      исходников или зафиксированная замена без их импорта.
- [x] Обновить README подкаста: использовать существующий Simplecast RSS,
      не создавать дублирующий фид; описать оставшуюся проверку старых URL.

**Готово, когда:** опубликованный архив полный, старые ссылки и
воспроизведение работают, подписка использует прежний фид,
новый выпуск можно опубликовать без ручного редактирования страниц.

### Этап 5. Общий CI: выбор приложений, кэш и деплой

В коде появился единый `.github/workflows/deploy.yml`; выполнение
GitHub Actions для него пока не подтверждено.

- [x] Выбирать targets одним selector для сборки и публикации.
      Матрица тестируется в `scripts/ci-targets.test.mjs`.
- [x] Сопоставлять `content/news/**` с news, Sova и обеими локалями
      бренда; articles/projects/interests — с Sova и брендом;
      `packages/content/**`, `packages/ui/**` и build-конфигурацию —
      со всеми targets.
- [x] Не запускать production deploy при изменениях только в docs/README.
- [x] При неизвестной базе, недоступном commit или неизвестном кодовом
      пути выбирать все targets. Сравнивать каждый target с последним
      успешным GitHub Deployment, а не только с предыдущим push.
- [x] Использовать выбранный список и для build, и для deploy.
      Сборки вызывают прямые package build-команды; Turbo cache не может
      заменить обязательную публикацию.
- [x] Записывать commit и Worker version отдельно для каждого target;
      сохранять успешный deployment status только после smoke checks.
      Следующий запуск повторно выбирает targets с неуспешной публикацией.
- [x] Сериализовать workflow на ветке; не отменять новый target build
      из-за другого приложения.
- [x] Выполнять ежедневное обновление Sova, бренда EN/RU и подкаста.
      Внешний кэш сохраняется в GitHub Actions cache отдельно по app target.
- [x] Собирать без production-секретов только `test.yml` checks.
      Deploy workflow запускается на `main`, schedule и `workflow_dispatch`.
- [x] Проверять главную и историю Sova/бренда, JSON/RSS/опубликованный
      выпуск news, главную/эпизод подкаста и canonical/hreflang бренда.
      Smoke helper проверен локально на HTTP fixtures.
- [ ] Получить успешный production run в GitHub Actions и проверить
      последовательность selection → build → deploy → smoke → ledger.
- [ ] Решить, нужен ли build app на PR: внешний API секреты на fork PR
      не передаются, а сейчас PR workflow проверяет helpers, не собирая сайты.

**Обязательные проверки pipeline:**

1. [x] News changes select news, Sova and brand.
2. [x] Draft issue № 21 remains absent from JSON/RSS smoke checks.
3. [x] Shared package changes select every consumer.
4. [x] Pushes compare from each target's last successful commit.
5. [x] EN/RU builds have separate Worker configs and output targets.
6. [x] Daily builds refresh external sources without Git changes.
7. [x] Invalid data or expired cache fails the build before deploy.
8. [x] Documentation-only changes select no deployment target.
9. [x] Failed deployments remain eligible on the next run.
10. [x] Workflow concurrency serializes release runs.

**Готово, когда:** перечисленные local selector/smoke checks проходят,
а GitHub Actions подтверждает тот же build/deploy target set.

### Этап 6. Cloudflare и последовательное переключение доменов

Подготовить инфраструктуру можно параллельно с этапами 1–4.
Переключать production — после проверки соответствующего сайта и CI.

- [x] Перевести приложения на Workers Static Assets и создать
      `wrangler.jsonc` для индекса, бренда, подкаста и рассылки.
- [x] Проверить локально `wrangler deploy --dry-run` для всех четырёх
      приложений. Это проверка конфигурации и собранных assets, не
      подтверждение Cloudflare account или production deploy.
- [x] Сверить публичные DNS и HTTP origin без изменения DNS (2026-10-09):
      `sova.sh` и `sergeysova.com` отвечают GitHub Pages, `news.sova.sh`
      указывает на `sergeysova.github.io`, `podcast.sova.sh` сейчас
      обслуживается старым Caddy/nginx origin, `ru.sergeysova.com`
      не разрешается. Apex-зоны используют Cloudflare nameservers, но
      веб-запросы сейчас идут к прежним origin.
- [x] Выбрать production account `SergeySova`; ID закреплён в Wrangler-конфигах
      и deploy-workflows. ID не является секретом. GitHub secret
      `CLOUDFLARE_API_TOKEN` существует, его значение и доступы не считывались.
- [x] Обойти ошибку `10001` Wrangler 4.148.0 обновлением до 4.149.0.
      Создать `news-sova-sh`, `sova-sh`, `sergeysova-com`,
      `ru-sergeysova-com` и `podcast-sova-sh` и проверить их `workers.dev`
      endpoints. Последние проверенные version IDs: `news-sova-sh`
      `1c4bbd26-ee56-4fc5-b04d-6ca4ecf52228`, `sova-sh`
      `4d1e2c8c-02ba-4d0d-b819-78653f1aa416`, `sergeysova-com`
      `d65eba9b-7b58-451b-9854-ffb97439a076`, `ru-sergeysova-com`
      `ff6943b9-12f2-4352-9177-cc4e1516afde`, `podcast-sova-sh`
      `2cb88232-b727-4af5-aa9f-80632ae21df7`.
- [ ] Проверить deploy из GitHub Actions и account/token scopes.
      Secret `CLOUDFLARE_API_TOKEN` существует, но его значение и
      permissions не считывались.
- [x] Привязать `ru.sergeysova.com`, `sova.sh`, `news.sova.sh` и
      `podcast.sova.sh`. HTTPS и контент проверены на доменах. Старая
      DNS-запись RU отсутствовала; после привязки Cloudflare создал её.
- [ ] Завершить EN `sergeysova.com`: NS уже делегированы на Cloudflare
      (`alla.ns.cloudflare.com`, `albert.ns.cloudflare.com`), но четыре
      A-записи ещё ведут на GitHub Pages (`185.199.108.153`,
      `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).
      По подтверждению Сергея нужно удалить эти A-записи, не меняя NS
      или MX/TXT, затем выставить GitHub Actions variable
      `BRAND_EN_CUSTOM_DOMAIN_READY=true` и запустить `workflow_dispatch`.
      Wrangler OAuth не имеет `Zone DNS Edit`; GitHub token permissions
      пока не проверены. Cloudflare Custom Domain создаёт DNS/certificate
      после удаления конфликтующих records [C3].
- [x] Зафиксировать DNS старых origins для rollback:
      `sova.sh` — A `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
      и AAAA `2606:50c0:8000::153`, `2606:50c0:8001::153`,
      `2606:50c0:8002::153`, `2606:50c0:8003::153`;
      `news.sova.sh` — CNAME `sergeysova.github.io`;
      `podcast.sova.sh` — A `34.239.225.42`, `3.209.36.65`,
      `54.158.235.112`. Старые записи уже заменены Custom Domains.
- [ ] Проверить доступ DNS для будущего rollback: локальный Wrangler OAuth
      имеет `Zone Read`, но не `Zone DNS Edit`. Изменения зоны требуют
      прав `Zone DNS Edit` [C8].
- [ ] После EN-привязки проверить все production-домены: HTTPS, HTML,
      canonical, assets, RSS/JSON, маршрут эпизода и локали.
- [ ] Подготовить активные Cloudflare zones для `sova.sh` и
      `sergeysova.com`. При переносе nameservers сначала сохранить
      прежний хостинг через старые DNS-записи, включая MX/TXT,
      проверить делегирование, DNSSEC, CAA и сертификаты.
- [ ] Привязать Custom Domains к нужным Workers через dashboard
      или Wrangler `routes` с `custom_domain: true` [C3].
      Для RU-бренда не наследовать EN-домен: locale-таргеты должны
      иметь отдельные привязки и Worker names. RU уже привязан отдельным
      конфигом; EN route definition готов, но DNS A-записи ещё существуют.
- [ ] Переключать домены по одному, проверяя HTML, редиректы,
      assets, RSS/JSON, canonical, языки и реальный контент.
- [ ] Проверить, что старый GitHub Pages deploy больше не запускается;
      отозвать PAT, если его больше никто не использует.
- [x] Включить автоматический деплой подкаста при изменениях и в
      scheduled refresh; GitHub Actions run ещё не подтверждён.
- [ ] Сохранить прежние хостинги на согласованный период наблюдения.
      Затем архивировать news и доступный старый podcast source;
      deploy-репозиторий `sergeysova.com` больше не нужен для сборки.

Сборки выполняются в GitHub Actions, Workers получают готовые
статические assets. Pages build quota здесь неприменима; отдельно
учитывать GitHub Actions compute и Workers Static Assets limits [C5].

**Откат:** до переключения должны быть известны baseline version ID
и проверенный возврат к нему через Workers rollback [C6].
Этот откат не возвращает DNS/nameservers: для инфраструктурного сбоя
нужна отдельная инструкция восстановления старого хостинга с точными
записями, TTL, доступами и ожидаемым временем восстановления.
Не обещать мгновенный DNS-откат после смены делегирования.
У приложений отдельные релизы; атомарного отката всего монорепо нет.

**Готово, когда:** пять доменов публикуются из монорепо на выбранной
платформе, старый PAT-deploy выключен, известен и проверен путь отката.

## 6. Порядок работы и завершение

Сначала этап 0. Затем этапы 1–2 формируют контент и brand-app.
Перенос news и доведение podcast можно вести независимо, после
согласования источников и маршрутов. Pipeline и инфраструктуру
готовить параллельно; не ждать их до дня переключения DNS.

Для news единовременный перенос чтения данных и зависимой публикации
обязателен: без этого монорепо сохранит проблему устаревшего индекса.
Для бренда оба locale-таргета должны пройти проверку до замены
нынешнего контента. Инфраструктурное разделение приложений и переключение
workflows на Workers уже есть в коде.

План завершён, когда:

- [ ] Индекс и бренд разделены; утверждённый контент доступен
      на своих доменах и корректных языках.
- [ ] Авторские материалы и news используют согласованные коллекции.
- [ ] Podcast использует общий Simplecast API; подписка идёт
      на существующий RSS.
- [ ] История доступных source-репозиториев сохранена; ограничения
      по недоступному podcast source зафиксированы с владельцем.
- [ ] Старые URL/assets сохранены либо имеют проверенные редиректы.
- [ ] Изменение общего контента и refresh API обновляют нужные сайты.
- [ ] Все production-таргеты публикуются из монорепо, проверки CI
      исполняются, секреты не входят в клиентский код и артефакты.
- [ ] Старые deploy-пути выключены после проверки миграции и отката.
- [ ] README и этот документ соответствуют реализованному состоянию;
      обязательные открытые решения закрыты Сергеем.

Выделение новых shared packages и дополнительные функции подкаста
не блокируют завершение, пока не стали отдельными утверждёнными задачами.

## 7. Источники ресерча

### Код и исходные данные

- Локальный каркас: [workspace](../pnpm-workspace.yaml#L1),
  [Turbo](../turbo.json#L1), [root manifest](../package.json#L1)
  и [lockfile](../pnpm-lock.yaml#L1).
- Текущая публикация: [индекс](../.github/workflows/sova.yml#L1),
  [EN/RU-бренд](../.github/workflows/sergeysova.yml#L1)
  и [подкаст](../.github/workflows/podcast.yml#L1).
- Данные: [новости](../apps/sova.sh/src/data/news.ts#L4),
  [Simplecast](../packages/content/src/simplecast.ts#L29),
  [HTTP-кэш](../packages/content/src/cached-fetch.ts#L17)
  и [материалы выступлений](../apps/sova.sh/src/data/invited-content.ts#L1).
  Пути относятся к текущему checkout; целевые каталоги описаны отдельно.
- [GitHub API хоста](https://api.github.com/repos/sergeysova/sova.dev)
  возвращает `full_name: sergeysova/sova.sh`; прежний адрес перенаправляет
  на этот же репозиторий.
- [N1: news source](https://github.com/sergeysova/news.sova.sh),
  [коллекция](https://github.com/sergeysova/news.sova.sh/tree/main/src/content/issues)
  и [конфигурация](https://github.com/sergeysova/news.sova.sh/blob/main/src/content/config.ts).
- [N2: генератор issues.json](https://github.com/sergeysova/news.sova.sh/blob/main/src/pages/issues.json.ts)
  и [N3: публичный JSON](https://news.sova.sh/issues.json).
- [Deploy-репозиторий бренда](https://github.com/sergeysova/sergeysova.com):
  README default-ветки сообщает, что контент генерируется `sova.dev`;
  `gh-pages` содержит артефакты.
- [Подкаст RSS](https://feeds.simplecast.com/sZjtmMOM): при проверке
  18 эпизодов с GUID, audio enclosure, описанием, обложкой и номером.
  `itunes:season` отсутствует, item links ведут на главную.
  Фид служит подписке, а не новым источником данных приложения.

### Официальная документация

- [A1: Astro Content Loader и glob](https://docs.astro.build/en/reference/content-loader-reference/)
  и [Content Collections](https://docs.astro.build/en/guides/content-collections/).
- [A2: Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/).
- [A3: Astro internationalization](https://docs.astro.build/en/guides/internationalization/).
- [T1: Turbo run, affected и SCM base/head](https://turborepo.dev/docs/reference/run).
- [T2: Turbo configuration, inputs и globalDependencies](https://turborepo.dev/docs/reference/configuration).
- [T3: Turbo caching](https://turborepo.dev/docs/crafting-your-repository/caching)
  и [environment variables](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables).
- [C1: Cloudflare Pages getting started и рекомендация Workers](https://developers.cloudflare.com/pages/get-started/).
- [C2: Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
- [C3: Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
- [C4: Workers Version URLs](https://developers.cloudflare.com/workers/configuration/previews/).
- [C5: Workers Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
- [C6: Workers rollbacks](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/).
- [C7: Workers roles and permissions](https://developers.cloudflare.com/workers/authorization/workers/).
- [C8: API token creation](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
  and [token permission groups](https://developers.cloudflare.com/fundamentals/api/reference/permissions/).
- [S1: Simplecast API, authentication и pagination](https://help.simplecast.com/hc/en-us/articles/21953603587613-Simplecast-API).
- [E1: Eleventy Fetch, TTL и поведение при сетевых ошибках](https://www.11ty.dev/docs/plugins/fetch/).
- [Y1: YouTube playlistItems.list](https://developers.google.com/youtube/v3/docs/playlistItems/list).
