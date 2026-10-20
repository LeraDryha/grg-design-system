import { resolveLocale } from '../../locale/dates';

/** A file size as people read it, in the locale's number format: 120 KB, 1.2 MB (1,2 MB in Ukrainian) */
export function formatFileSize(bytes: number, locale?: string) {
  const number = new Intl.NumberFormat(resolveLocale(locale), { maximumFractionDigits: 1 });
  if (bytes >= 1024 * 1024) return `${number.format(bytes / (1024 * 1024))} MB`;
  return `${number.format(Math.round(bytes / 1024))} KB`;
}
