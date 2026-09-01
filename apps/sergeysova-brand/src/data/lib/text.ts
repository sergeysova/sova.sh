import {JSDOM} from 'jsdom';

export function convertIntoText(input: string): string {
  const dom = new JSDOM(input);
  const body = dom.window.document.body;
  return body.textContent ?? '';
}

export function firstThreeLines(text: string) {
  return text.split('\n').slice(0, 3).join('\n').trim();
}

export function removeCredits(text: string) {
  return removeExtraFromSeparator('———\n', text);
}

export function removeExtraFromSeparator(separator: string, text: string) {
  return text.split(separator, 2)[0];
}

export function firstWords(count: number, text: string) {
  const words = text.split(' ');
  const moreThanRequired = words.length > count;
  const result = words.slice(0, count).join(' ').trim();
  if (moreThanRequired) {
    return result + '…';
  }
  return result;
}
