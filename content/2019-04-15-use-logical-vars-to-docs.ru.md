+++
title = "Используйте логические переменные"
date = 2019-04-15
+++

> Вместо простой проверки логического выражения, лучше присвоить его значение переменной, которая сделает смысл проверки очевидным.

```js
if (elementIndex < 0 || MAX_ELEMENTS < elementIndex || elementIndex === lastElementIndex) {
  // ...
}
```

Что тут написано?

Скорее всего рядовой разработчик пропустит эту строку и даже читать не будет.
Хорошо, если автор оставил поясняющий комментарий.

Исправить ситуацию, можно, присвоив проверкам имена:

```js
const finished = elementIndex < 0 || MAX_ELEMENTS < elementIndex
const repeatedEntry = elementIndex === lastElementIndex

if (finished || repeatedEntry) {
  // ...
}
```

Стало намного проще осознать назначение условного выражения.
