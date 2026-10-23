type LANG = 'ru' | 'en';

const current = import.meta.env.PUBLIC_LANGUAGE as LANG;

export function switchLang<T>(variants: {[Key in LANG]: T}): T {
  return variants[current];
}

export function optionalTranslate<T extends string | number>(variants: {[Key in LANG]: T} | T) {
  if (typeof variants === 'object' && variants !== null) return switchLang(variants);
  return variants;
}
