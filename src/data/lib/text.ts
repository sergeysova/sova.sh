import {JSDOM} from 'jsdom';

export function convertIntoText(input: string): string {
  const dom = new JSDOM(input);
  const body = dom.window.document.body;
  return body.textContent ?? '';
}

export function firstThreeLines(text: string) {
  return text.split('\n').slice(0, 3).join('\n').trim();
}

export function firstWords(count: number, text: string) {
  return text.split(' ').slice(0, count).join(' ').trim() + '…';
}
