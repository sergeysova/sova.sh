// @ts-ignore
import {JSDOM} from 'jsdom';
import {convertIntoText} from './text';

test('simple paragraph with link and bold', async () => {
  const source =
    '<p>Важно: я сюда кидаю не новые статьи, а которые я посчитал полезными. Если видите полезные статьи, которые стоит прочитать мне и поделиться с окружением, <a href="https://t.me/sovasergey" target="_blank">кидайте <b>мне</b> в личку</a>.</p>';
  const result = convertIntoText(source);

  expect(result).toBe(
    'Важно: я сюда кидаю не новые статьи, а которые я посчитал полезными. Если видите полезные статьи, которые стоит прочитать мне и поделиться с окружением, кидайте мне в личку.',
  );
});
