const map: Record<string, string> = { en: 'English', ja: '日本語', zh: '中文' };

export function detectLang(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language.split('-')[0];
  }
  return 'en';
}

export function humanLang(code: string): string {
  return map[code] || code;
}
