+++
title = "Application structure"
description = "Where to look for files and where to put new"
date = 2019-08-20
rss = true
+++

[![](https://img.shields.io/badge/feature/slices-0.1-orange)](https://featureslices.dev/v0.1)

> Translated by [Murgut]

I split my source code on `features/`, `ui/` and `pages/`.<br/>
**Logic** can be only in the `pages/` and `features/`.

Example:

> ▸ — the icon of collapse directory tree

    src/
      api/▸
      features/▸
      lib/▸
      pages/▸
      ui/▸

## 1. [Feature] structure:

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

[Feature] — it is useful functionality for user or suite of entities which are united by one idea. For instance: users, text-editor, account, articles.

[Feature] cannot be grouped by type, too much abstract entity. Examples **how not to do**: roles, forms, validate.

1. Every feature must have the same structure.
2. `users`, `account`, ... — arbitary name of the feature in cebab-case.
3. The feature's content may be recieved only from `index.js`.
4. Every section can only be created if it has content inside.

- `lib/` it is [inner library] of feature. It must have tests and documentation.
- `index.js` for re-export necessary elements outside.
- `models/` — [effector models].

### 1.1 [Atomic] in [Feature]

`atoms`, `molecules`, `organisms`, `templates` — [atomic design], [feature]'s components.

If every component asumes many files in such case you should create (`.test`, `.story`, `.md`, ...):

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

No need of directories if you don't have many files. Important, that in range of feature all look the same.

    feature/
      settings/
        atoms/▸
        molecules/▸
        organisms/
          monitoring-editor.js
          monitoring-editor.test.js
          marketplace.js
          marketplace.test.js

## 2. Page's structure:

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

1. Page's nesting must map routing of true url.
2. There is source code of component in `page.js`
3. There is uniq logic of the page in `model.js`
4. There is any common logic in [library code] `src/lib/lib-name/`

Examples:

```
src/
  pages/
    post/
      page.js
      model.js
    repo/
      view/
        pulls/▸
        issues/
          view/
            page.js
            model.js
        page.js
        model.js
    index.js
```

- Page of blog post
  - file: `src/pages/post/page.js`
  - route: `/post/:postSlug` (or `/:postSlug`)
  - example: `/post/effector-model`
- Viewer of repository issue
  - file: `src/pages/repo/view/issues/view/page.js`
  - route: `/repo/:repoSlug/issues/:issueId`
  - example: `/repo/effector/issues/5`

## 3. UI structure:

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
2. All UI are building blocks which allow to create any feature.
3. UI must be disconnected from any global stores.
4. Components must be maximally reusable and independent on context _(not React Context API)_.

[atomic design]: http://atomicdesign.bradfrost.com
[atomic]: http://atomicdesign.bradfrost.com
[feature]: https://t.me/feature_slices
[feature]: https://t.me/feature_slices
[feature]: https://t.me/feature_slices
[library code]: @/2018-10-07-why-utils-and-helpers-is-a-dump.ru.md
[inner library]: @/2018-10-07-why-utils-and-helpers-is-a-dump.ru.md
[effector models]: @/2019-08-21-effector-model-structure.ru.md
[murgut]: https://t.me/murgut
