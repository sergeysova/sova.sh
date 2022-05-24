+++
title = "Структура приложения 2022"
description = "Где искать файлики в проекте и куда класть новые"
date = 2022-05-24
rss = true
draft = true
+++

[![](https://img.shields.io/badge/feature--sliced-1.0-green)](https://feature-sliced.design/)


Исходный код приложения я разделяю на `features/`, `entities/`, `shared/` и `pages/`.<br/>
Основная **логика** может лежать только в `pages/`.
Переиспользуемая **логика**, компоненты и другой код располагается в `widgets/`, `features/`, `entities/`.

Пример:

> ▸ — значок свёрнутой директории в дереве

```
src/
  app/▸
  pages/▸
  widgets/▸
  features/▸
  entities/▸
  shared/
    app/▸
    config/▸
    lib/▸
    ui/▸
```

## Общая структура

Чтобы сократить повествование, я развернул в каждом слое все директории лишь одного слайса.

```
src/
  app/
    application.tsx
    application.css
    client.tsx
    server.tsx
  pages/
    home/
      index.ts
      page.tsx
      model.ts
    login/▸
    register/▸
    product-view/▸
    cart/▸
    profile/▸
    error401/▸
    error404/▸
    error500/▸
  widgets/
    header/
      index.ts
      ui/
        panel.tsx
        search.tsx
      model.ts
    products-recommendations/▸
    products-recent/▸
  features/
    add-to-cart/
      index.ts
      ui/
        add-button.tsx
        modal-review-card.tsx
        modal-confirmation.tsx
      model/
        add-to-cart.ts
        review-and-confirm.ts
      lib/
        pricing/
          index.ts
          pricing.test.ts
          readme.md
    add-to-comparison/▸
    stories-list/▸
    price-comparison/▸
    category-list/▸
    onboarding/▸
  entities/
    product/
      index.ts
      ui/
        card.tsx
        expanded.tsx
        modal.tsx
        rate.tsx
      lib/
        dates/
          index.ts
          dates.test.ts
        delivery/
          index.ts
          delivery.test.ts
          readme.md
        preview/▸
        rate/▸
      model/
        preview.ts
        rating.ts
        comments.ts
    filters/▸
    delivery/▸
    favourite/▸
    comments/▸
  shared/
    api/
      index.ts
      generated.ts
      request.ts
    config/
      index.ts
    lib/
      breadcrumbs/
        index.ts
        breadcrumbs.test.ts
        readme.md
      text-fit/▸
      zoom-over/▸
      properties-comparison/▸
      comments-tree-calc/▸
    ui/
      atoms/
        avatar/
          index.tsx
          avatar.test.tsx
          avatar.stories.tsx
          readme.md
        badge/▸
        button/▸
        checkbox/▸
        icon/▸
        input/▸
        image/▸
        paper/▸
      molecules/
        button-group/▸
        breadcrumbs/▸
        calendar/▸
        image-responsive/▸
        logo/▸
        range/▸
        backdrop/▸
      organisms/
        content-viewer/▸
        date-picker/▸
        drawer/▸
        modal/▸
```
