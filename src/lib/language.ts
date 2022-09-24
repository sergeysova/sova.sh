type LANG = 'ru' | 'en';

const current = import.meta.env.PUBLIC_LANGUAGE as LANG;

export function switchLang<T>(variants: {[Key in LANG]: T}): T {
  return variants[current];
}
