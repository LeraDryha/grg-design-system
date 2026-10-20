import { addLocale } from 'primereact/api';

/*
 * Dates follow the locale, never a fixed format. Everything comes from the browser's Intl data for the locale
 * the product passes in (or the page language, or the browser's language): the order of day, month and year,
 * the separator, the first day of the week, and month and day names. The same description feeds the date
 * fields (Input type Date, Date Picker) and PrimeReact Calendar, so the field and the calendar always agree.
 */

export type DatePart = 'day' | 'month' | 'year';

export type DateLocale = {
  /** BCP 47 code, such as en-GB, en-US, uk-UA */
  code: string;
  /** Key the locale is registered under in PrimeReact */
  primeKey: string;
  /** Day, month and year in the locale's order: en-GB day–month–year, en-US month–day–year */
  order: DatePart[];
  /** "/", "." or "-", as the locale writes dates */
  separator: string;
  /** What to type, in the locale's order: DD/MM/YYYY, MM/DD/YYYY, DD.MM.YYYY */
  placeholder: string;
  /** 0 Sunday … 6 Saturday, as PrimeReact counts */
  firstDayOfWeek: number;
  monthNames: string[];
  monthNamesShort: string[];
  /** Sunday first, as PrimeReact expects */
  dayNames: string[];
  dayNamesShort: string[];
  /** A date as the locale writes it, with leading zeros: 05/01/2026 */
  format: (date: Date) => string;
  /** A date in words, for screen readers: Monday, 5 January 2026 */
  formatLong: (date: Date) => string;
  /** A month and year for a month field: January 2026 */
  formatMonth: (date: Date) => string;
  /** Typed digits shaped into the locale's format as people type: "0501" → "05/01" */
  formatDigits: (raw: string) => string;
  /** A complete, real date from text in the locale's format, or null */
  parse: (text: string) => Date | null;
};

const LENGTH: Record<DatePart, number> = { day: 2, month: 2, year: 4 };
const LETTERS: Record<DatePart, string> = { day: 'DD', month: 'MM', year: 'YYYY' };
// Regions whose week starts on Sunday, for browsers without Intl week information
const SUNDAY_FIRST = new Set(['US', 'CA', 'MX', 'BR', 'JP', 'KR', 'TW', 'HK', 'IL', 'PH', 'IN', 'ZA', 'SA']);

const capitalise = (text: string, code: string) => text.charAt(0).toLocaleUpperCase(code) + text.slice(1);

/** The locale to use: the product's choice, else the page language, else the browser's language. */
export function resolveLocale(locale?: string): string {
  if (locale) return locale;
  if (typeof document !== 'undefined' && document.documentElement.lang) return document.documentElement.lang;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en-GB';
}

function firstDayOf(code: string): number {
  try {
    const intl = new Intl.Locale(code) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const info = intl.getWeekInfo?.() ?? intl.weekInfo;
    // Intl counts 1 Monday … 7 Sunday
    if (info) return info.firstDay % 7;
    const region = intl.maximize().region;
    return region && SUNDAY_FIRST.has(region) ? 0 : 1;
  } catch {
    return 1;
  }
}

const cache = new Map<string, DateLocale>();

/** Everything about how a locale writes and shows dates; computed once per locale. */
export function dateLocale(locale?: string): DateLocale {
  const code = resolveLocale(locale);
  const cached = cache.get(code);
  if (cached) return cached;

  const numeric = new Intl.DateTimeFormat(code, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const parts = numeric.formatToParts(new Date(2026, 0, 5));
  const order = parts.filter(p => p.type === 'day' || p.type === 'month' || p.type === 'year').map(p => p.type as DatePart);
  const separator = parts.find(p => p.type === 'literal')?.value.trim().charAt(0) || '/';

  const monthLong = new Intl.DateTimeFormat(code, { month: 'long' });
  const monthShort = new Intl.DateTimeFormat(code, { month: 'short' });
  const dayLong = new Intl.DateTimeFormat(code, { weekday: 'long' });
  const dayShort = new Intl.DateTimeFormat(code, { weekday: 'short' });
  const months = Array.from({ length: 12 }, (_, m) => new Date(2026, m, 1));
  // 4 January 2026 is a Sunday
  const days = Array.from({ length: 7 }, (_, d) => new Date(2026, 0, 4 + d));
  const monthYear = new Intl.DateTimeFormat(code, { month: 'long', year: 'numeric' });
  const long = new Intl.DateTimeFormat(code, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const pad = (date: Date): Record<DatePart, string> => ({
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  });

  const value: DateLocale = {
    code,
    primeKey: `grg-${code}`,
    order,
    separator,
    placeholder: order.map(p => LETTERS[p]).join(separator),
    firstDayOfWeek: firstDayOf(code),
    monthNames: months.map(d => capitalise(monthLong.format(d), code)),
    monthNamesShort: months.map(d => capitalise(monthShort.format(d).replace(/\.$/, ''), code)),
    dayNames: days.map(d => capitalise(dayLong.format(d), code)),
    dayNamesShort: days.map(d => capitalise(dayShort.format(d).replace(/\.$/, ''), code)),
    format: date => {
      const p = pad(date);
      return order.map(part => p[part]).join(separator);
    },
    formatLong: date => long.format(date),
    formatMonth: date => capitalise(monthYear.format(date), code),
    formatDigits: raw => {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      const out: string[] = [];
      let rest = digits;
      for (const part of order) {
        if (!rest) break;
        out.push(rest.slice(0, LENGTH[part]));
        rest = rest.slice(LENGTH[part]);
      }
      return out.join(separator);
    },
    parse: text => {
      const digits = text.replace(/\D/g, '');
      if (digits.length !== 8) return null;
      const found: Partial<Record<DatePart, number>> = {};
      let rest = digits;
      for (const part of order) {
        found[part] = Number(rest.slice(0, LENGTH[part]));
        rest = rest.slice(LENGTH[part]);
      }
      const date = new Date(found.year!, found.month! - 1, found.day!);
      // Rejects 31/02 and the like: the date must not roll over into another month
      return date.getMonth() === found.month! - 1 && date.getDate() === found.day ? date : null;
    },
  };

  // PrimeReact Calendar reads names, the first day of the week and the date format from a registered locale
  const primeFormat = order.map(p => ({ day: 'dd', month: 'mm', year: 'yy' })[p]).join(separator);
  addLocale(value.primeKey, {
    firstDayOfWeek: value.firstDayOfWeek,
    dayNames: value.dayNames,
    dayNamesShort: value.dayNamesShort,
    // The week row shows the short names (Mon, Tue), as the Figma calendar does
    dayNamesMin: value.dayNamesShort,
    monthNames: value.monthNames,
    monthNamesShort: value.monthNamesShort,
    dateFormat: primeFormat,
    today: 'Today',
    clear: 'Clear',
    weekHeader: 'Wk',
  });

  cache.set(code, value);
  return value;
}
