+++
title = "Структура приложения"
description = "Где искать файлики в проекте и куда класть новые"
date = 2019-08-20
+++

Исходный код приложения я разделяю на `features/`, `ui/` и `pages/`.<br/>
**Логика** может лежать только в `pages/` и в `features/`.

Пример:

> ▸ — значок свёрнутой директории в дереве

    src/
      api/▸
      features/▸
      lib/▸
      pages/▸
      ui/▸

## 1. Структура [feature]:

    src/
      features/
        account/▸
        editor/▸
        settings/▸
        users/
          atoms/
            index.js
            avatar.js
          lib/
            lib-name/
              index.js
              test.js
              readme.md
          models/▸
          molecules/▸
          organisms/▸
          templates/▸
          index.js

[Фича] — полезная функциональность для пользователя, или набор сущностей объединенных одной идеей. Например: пользователи, текстовый-редактор, аккаунт, статьи.

[Фича] не может быть группировкой по типу, слишком абстрактной сущностью. Примеры **как не надо**: роли, формы, валидации.

1. Каждая фича имеет одинаковую структуру.
2. `users`, `account`, ... — произвольное название фичи в param-case
3. Содержимое фичи можно получать только через `index.js`
4. Каждый раздел создается, только если в нем есть содержимое.

- `lib/` это внутренняя библиотека фичи. Должна иметь тесты и документацию.
- `index.js` ре-экспортит необходимые элементы наружу.
- `models/`

### 1.1 [Atomic] in [Feature]

`atoms`, `molecules`, `organisms`, `templates` — [atomic design], компоненты [фичи].

Если предполагается много файлов на каждый компонент (`.test`, `.story`, `.md`, ...):

    feature/
      users/
        atoms/▸
        molecules/
          personal-apply/▸
          user-card/
            index.js
            story.js
            test.js
            readme.md
        organisms/▸
        templates/▸

Если файлов мало, можно не создавать директорию. Главное, чтобы в пределах фичи выглядело одинаково.

    feature/
      settings/
        atoms/▸
        molecules/▸
        organisms/
          monitoring-editor.js
          monitoring-editor.test.js
          marketplace.js
          marketplace.test.js

## 2. Структура pages:

    src/
      pages/
        post/
          model.js
          page.js
        posts/
          create/▸
          edit/▸
        auth/
          login/▸
          register/
            model.js
            page.js

1. Вложенность страниц должна отображать роутинг реального урла
2. Исходник компонента лежит в `page.js`
3. Уникальная логика страницы лежит в `model.js`
4. Любая обобщенная логика выносится в `src/lib/lib-name/`

Примеры:

- Страница поста в блоге
  - file: `src/pages/post/page.js`
  - route: `/post/:postSlug` (или `/:postSlug`)
  - example: `/post/effector-model`
- Просмотр issue репозитория
  - file: `src/pages/repo/view/issues/view.js`
  - route: `/repo/:repoSlug/issues/:issueId`
  - example: `/repo/effector/issues/5`

## 3. Структура UI:

    src/
      ui/
        atoms/
          index.js
          component-name/
            index.js
            readme.js
            story.js
            test.js
        molecules/▸
        organisms/▸
        templates/▸
        index.js

1. [Atomic Design]
2. Весь UI это базовые блоки из которых можно собрать любую фичу.
3. UI должен быть оторван от фич и любых глобальных сторов
4. Компоненты должны быть максимально переиспользуемыми, независимыми от контекста _(не React Context API)_

[atomic design]: http://atomicdesign.bradfrost.com
[atomic]: http://atomicdesign.bradfrost.com
[feature]: https://t.me/feature_slices
[фича]: https://t.me/feature_slices
[фичи]: https://t.me/feature_slices
