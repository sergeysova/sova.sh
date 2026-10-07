# sergeysova.com / ru.sergeysova.com

Отдельное Astro-приложение для англо- и русскоязычной версии
профессионального бренда Сергея, два locale-билда:

```bash
PUBLIC_SITE=https://sergeysova.com    PUBLIC_LANGUAGE=en pnpm build
PUBLIC_SITE=https://ru.sergeysova.com PUBLIC_LANGUAGE=ru pnpm build
```

## Статус

Это механический клон `apps/sova.sh` на момент разделения — контент
пока полностью идентичен (та же лендинг-страница, статьи, CV). Цель
этого шага — перестать собирать sergeysova.com из `apps/sova.sh`, чтобы
`sova.sh` мог стать самостоятельным индексом со своим контентом, не
трогая sergeysova.com при каждом изменении.

Настоящее разделение контента (About/Work/Writing/Talks/Consulting/Contact
вместо копии лендинга sova.sh) — отдельная работа с текстами, требует
реального авторского контента, см. `docs/sova-web-monorepo-plan.md`.
