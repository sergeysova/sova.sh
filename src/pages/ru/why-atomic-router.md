---
title: Atomic-Router Chains
description: Есть много роутеров для frontend-проектов, но все они опираются на рендеры. Давайте это исправим
date: 2024-04-01
language: ru
layout: ../../layouts/MarkdownLayout.astro
---

# Table of contents

## Отделение роутов от URL

```ts
// src/shared/routing/routes.ts
export const routes = {
  home: createRoute(),
  users: {
    list: createRoute(),
    view: createRoute<{userId: string}>(),
    tickets: createRoute<{userId: string}>(),
  },
  posts: {
    list: createRoute(),
    view: createRoute<{postId: string}>(),
  },
};

export const routesMap = [
  {
    path: '/',
    route: routes.home,
  },
  {
    path: '/users',
    route: routes.users.list,
  },
  {
    path: '/users/:userId',
    route: routes.users.view,
  },
  {
    path: '/users/:userId/tickets',
    route: routes.users.tickets,
  },
  {
    path: '/explore',
    route: routes.posts.list,
  },
  {
    path: '/posts/:postId',
    route: routes.posts.view,
  },
];
```

### Это позволяет прицепить к одному пути несколько роутов

```ts
// src/shared/routing/routes.ts
export const sections = {
  users: createRoute(),
  posts: createRoute(),
};

export const routesMap = [
  {
    path: '/',
    route: routes.home,
  },
  {
    path: '/users',
    route: [routes.users.list, sections.users],
  },
  {
    path: '/users/:userId',
    route: [routes.users.view, sections.users],
  },
  {
    path: '/users/:userId/tickets',
    route: [routes.users.tickets, sections.users],
  },
  {
    path: '/explore',
    route: [routes.posts.list, sections.posts],
  },
  {
    path: '/posts/:postId',
    route: [routes.posts.view, sections.posts],
  },
];
```

Так мы можем не завязывать на конкретные урлы

```tsx
// src/layouts/navigation/index.tsx
const $links = createStore<Link[]>([
  {
    label: "Users",
    route: routes.users.list,
    active: sections.users,
    icon: IconUsers,
  },
  {
    label: "Posts",
    route: routes.posts.list,
    active: sections.participants,
    icon: IconUserCheck,
  },
]);

export function LayoutNavigate({ children }: { children: ReactNode }) {
  const links = useList($links, {
    getKey: (link) => link.label,
    fn(link) {
      const isActive = useUnit(link.active?.$isOpened ?? link.route.$isOpened);
      const classNames = isActive ? classes.linkActive : "";

      return (
        <Link
          key={link.label}
          to={link.route}
          className={clsx(classes.link, classNames)}
          activeClassName={classes.linkActive}
        >
          <link.icon className={classes.linkIcon} stroke={1.5} />
          <span>{link.label}</span>
        </Link>
      );
    },
  });

  return (/* ... */)
}
```

## теперь можно реагировать на изменение роутов, а не рендер компонентов

```ts
// src/pages/posts-list/model.ts
export const currentRoute = routes.posts.list;

sample({
  // Когда текущий роут откроется
  clock: currentRoute.opened,
  // Начать загружать список постов
  target: postsLoadFx,
});
```

Также можно реагировать на изменение параметров роута. То есть можем отличить первый заход на страницу от обновления только параметра.

```ts
// src/pages/posts-view/model.ts
export const currentRoute = routes.posts.view;
//

sample({
  // Когда текущий роут обновился
  clock: currentRoute.updated,
  // Взять параметры из урла
  source: currentRoute.$params,
  // Извлекаем только параметры. В наличии еще query
  fn: ({params}) => ({postId: params.postId}),
  // Начать загружать пост с новым postId
  target: postGetFx,
});
```

На самом деле, можно добавить в выражение выше и `.opened`, чтобы загружать пост и при первом открытии страницы тоже:

```ts
// Когда текущий роут открылся или обновился
sample({
  clock: [currentRoute.opened, currentRoute.updated],
  source: currentRoute.$params,
  fn: ({params}) => params,
  target: postGetFx,
});
```

## chainRoute создает последовательные цепочки для получения данных

далеко не всегда можно начать загружать инфу для отображения страницы параллельно.
ну а если можно, то цепочки будут короче.

```ts
// src/pages/posts-view/model.ts
export const currentRoute = routes.posts.view;

// Эффект postGetFx будет выполняться когда currentRoute откроется
// или обновится с новым postId
export const postRoute = chainRoute({
  route: currentRoute,
  beforeOpen: postGetFx,
});
// Когда postGetFx завершится с любым результатом, postRoute будет открыт

// postCommentsGetFx будет вызван ПОСЛЕ загрузки postGetFx
// то есть, когда откроется postRoute
export const commentsRoute = chainRoute({
  route: postRoute,
  beforeOpen: postCommentsGetFx,
});
```

можно реагировать на события каждого роута по отдельности, у каждого из них есть свои `.opened` и `.$isOpened`:

```ts
sample({
  clock: postRoute.opened,
  fn: ({params}) => ({postId: params.postId, active: true}),
  target: analytics.reportFx,
});
```

## все чейнеры выполняют последовательные задачи, к ним можно привязывать свой view

```ts
// src/pages/posts-view/index.ts
import {LayoutNavigation} from '~/layouts/navigation';
import {currentRoute, postRoute} from './model';
import {LoaderFullPage, PostViewPage} from './view';

const PostView = createRouteView({
  route: postRoute,
  view: PostViewPage,
  otherwise: LoaderFullPage,
});

export default {
  route: currentRoute,
  view: PostView,
  layout: LayoutNavigation,
};
```

Для каждого роута будет отрендерен свой компонент.
Компоненты можно вкладывать друг в друга: например, после загрузки поста отображать комменты в виде skeleton-загрузки.
При этом в компонентах не будет кучи условий и опциональных рендеров.

## добавление редиректов, но с сохранением ссылок

Есть случаи, когда пользователи могут добавить ссылки на страницы в нашем приложении в закладки. Это значит, что если мы поменяем урлы, то такие закладки сломаются.
Поэтому хорошо было бы или не ломать урлы, или выполнять плавную миграцию.

Есть два пути:

1. открывать страницу по двум урлам сразу, но в интерфейсе ссылки давать только на новый урл

для этого можно назначить одному роуту несколько урлов

```ts
// src/shared/routing/routes.ts
export const routesMap = [
  // ...
  {
    path: '/explore',
    route: routes.posts.list,
  },
  {
    path: '/posts',
    route: routes.posts.list,
  },
];
```

Путь с роутом расположенный выше будет использоваться для ссылок.

2. добавить редирект, чтобы старые ссылки всегда редиректили на новые урлы

заводим список легаси роутов, назначаем им свои урлы и добавляем редиректы прям тут

```ts
// src/shared/routing/routes.ts
const legacyRoutes = {
  posts: {list: createRoute()},
};

export const routesMap = [
  // ...
  {
    path: '/explore',
    route: routes.posts.list,
  },
  {
    path: '/posts',
    route: legacyRoutes.posts.list,
  },
];

redirect({
  clock: legacyRoutes.posts.list.opened,
  route: routes.posts.list,
});
```

Таким образом роуты не будут смешиваться, `legacyRoutes` всегда видны, если их кто-то будет использовать.

3. всегда можно смешивать два подхода, чтобы дать пользователям лучший ux
