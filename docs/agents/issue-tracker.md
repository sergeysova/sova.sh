# Трекер задач: GitHub

Задачи и спеки этого репозитория живут как GitHub Issues. Все операции делай через `gh`.

## Соглашения

- **Создать задачу**: `gh issue create --title "..." --body "..."`. Многострочное тело передавай через heredoc.
- **Прочитать задачу**: `gh issue view <number> --json number,title,body,labels,comments`.
- **Список задач**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` с нужными фильтрами `--label` и `--state`.
- **Сделать задачу подзадачей родителя**: `gh issue create --parent <parent> ...` или потом `gh issue edit <parent> --add-sub-issue <child>` (`gh` 2.94+). Старый `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, как в пункте **Блокировка** ниже). Если sub-issues недоступны, в начале тела дочерней задачи напиши `Part of #<parent>`.
- **Блокировка**: нативные зависимости GitHub Issues, каноническое представление, видимое в UI. Добавь ребро через `gh issue create --blocked-by <n>,<n> ...` или `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Старый `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, где `<blocker-db-id>` — числовой **database id** блокирующей задачи (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, не `#number` и не `node_id`). Если зависимости недоступны, в начале тела дочерней задачи напиши `Blocked by: #<n>, #<n>`. Задача разблокирована, когда закрыты все блокеры.
- **Посчитать открытые блокеры**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (только открытые; 0 значит можно начинать). `gh issue view <n> --json blockedBy` включает и закрытые, поэтому фильтруй: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Комментарий**: `gh issue comment <number> --body "..."`.
- **Поставить или снять метку**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- **Закрыть**: сначала объяснение через `gh issue comment <number> --body "..."`, затем `gh issue close <number>`. На уже закрытой задаче `gh issue close --comment` теряет комментарий и всё равно завершается с кодом 0.

Репозиторий бери из `git remote -v`. Внутри клона `gh` делает это сам.

Создавай задачи только в репозитории пользователя. Никогда не создавай их в `mattpocock/skills` (репозиторий, откуда взяты эти скиллы), если пользователь им не владеет. В форке `gh` может выбрать upstream-родителя, поэтому перед первым `gh issue create` в сессии проверь цель через `gh repo view --json nameWithOwner` и подтверди её с пользователем, если это не его репозиторий.

## Pull request как поверхность триажа

**PRs as a request surface: no.** _(Поставь `yes`, если внешние PR считаются запросами фич. Этот флаг читает `/triage`.)_

Когда стоит `yes`, PR проходят те же метки и состояния, что и задачи, через аналоги `gh pr`:

- **Прочитать PR**: `gh pr view <number>`, затем `gh pr view <number> --comments` (вне TTY `--comments` печатает только комментарии, без тела), и `gh pr diff <number>` для диффа.
- **Список внешних PR для триажа**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Комментарий, метка, закрытие**: `gh pr comment`, `gh pr edit --add-label` / `--remove-label`, `gh pr close`.

У GitHub общее пространство номеров для задач и PR, поэтому голый `#42` может быть чем угодно: сначала `gh pr view 42`, если не PR, то `gh issue view 42`.

## Когда скилл говорит «publish to the issue tracker»

Создай GitHub issue.

## Когда скилл говорит «fetch the relevant ticket»

Прочитай задачу, как в пункте **Прочитать задачу** выше.

## Операции wayfinder

Их использует `/wayfinder`. **Карта** — одна задача, **дочерние** задачи — тикеты.

- **Карта**: одна задача с меткой `wayfinder:map`, в теле Notes / Decisions-so-far / Fog. `gh issue create --label wayfinder:map`.
- **Дочерний тикет**: задача, связанная с картой как GitHub sub-issue (см. **Сделать задачу подзадачей родителя**). Если sub-issues выключены, добавь дочернюю задачу в task list тела карты и напиши `Part of #<map>` в начале её тела. Метки: `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Когда тикет взят, он назначен на ведущего разработчика.
- **Блокировка**: см. **Блокировка** в соглашениях.
- **Запрос фронтира**: открытые дочерние задачи карты (`gh issue list --state open`, в рамках sub-issues или task list карты). Отбрось те, у кого есть открытый блокер (см. **Посчитать открытые блокеры** или открытая задача в строке `Blocked by`) или assignee. Берётся первая по порядку карты.
- **Взять**: `gh issue edit <n> --add-assignee @me`. Это первая запись сессии.
- **Закрыть**: `gh issue comment <n> --body "<answer>"`, затем `gh issue close <n>`, затем допиши в Decisions-so-far карты указатель на контекст (gist и ссылка).
