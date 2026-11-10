import { resolveLocale } from './dates';

/*
 * How the product writes a moment, a period and an amount (Foundations → Formats). Like the date fields, everything
 * follows the locale; the month is always a word, so 10/11 is never read as 11 October.
 */

/** A moment in a table or a card: 10 Nov 2026, 12:49 (en-GB) · Nov 10, 2026, 12:49 PM (en-US). Seconds for details */
export function formatDateTime(date: Date, { seconds = false, locale }: { seconds?: boolean; locale?: string } = {}) {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined,
  }).format(date);
}

/** A day: 10 Nov 2026 */
export function formatDay(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(resolveLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** A period, the shared parts once: 1 – 7 Nov 2026 · 28 Oct – 3 Nov 2026 · 28 Dec 2025 – 3 Jan 2026 */
export function formatPeriod(from: Date, to: Date, locale?: string) {
  return new Intl.DateTimeFormat(resolveLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' }).formatRange(from, to);
}

/** Money people count in cents: fiat and stablecoins */
const CENTS = new Set(['EUR', 'USD', 'GBP', 'UAH', 'PLN', 'CHF', 'USDT', 'USDC', 'DAI', 'EURC', 'BUSD']);

/** Decimals of a currency: 2 for fiat and stablecoins (always shown), up to 8 for crypto (no trailing zeros) */
export const amountDigits = (currency: string) => (CENTS.has(currency.toUpperCase()) ? 2 : 8);

/** A number in a currency's decimals, without the code: 1,200.00 · 0.065769 */
export function formatNumber(value: number, currency: string, locale?: string) {
  const cents = amountDigits(currency) === 2;
  return new Intl.NumberFormat(resolveLocale(locale), { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 8 }).format(value);
}

/** An amount with its code: 1,200.00 USDT · 0.065769 ETH · 0 BTC */
export const formatAmount = (value: number, currency: string, locale?: string) => `${formatNumber(value, currency, locale)} ${currency}`;
