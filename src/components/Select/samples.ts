import type { SelectOption } from './options';

/* Sample data for stories, after the Figma Select examples. */

export const samplePayments: SelectOption[] = [
  { value: 'rent', label: 'Rent payment', icon: 'home' },
  { value: 'utility', label: 'Utility payment', icon: 'flash' },
  { value: 'donation', label: 'Donation', icon: 'donate' },
  { value: 'tax', label: 'Tax payment', icon: 'file-doc' },
  { value: 'insurance', label: 'Insurance payment', icon: 'umbrella' },
];

export const sampleCountries: SelectOption[] = [
  { value: 'AT', label: 'Austria', country: 'at' },
  { value: 'BE', label: 'Belgium', country: 'be' },
  { value: 'BG', label: 'Bulgaria', country: 'bg' },
  { value: 'HR', label: 'Croatia', country: 'hr' },
  { value: 'CY', label: 'Cyprus', country: 'cy' },
  { value: 'CZ', label: 'Czechia', country: 'cz' },
  { value: 'DK', label: 'Denmark', country: 'dk' },
  { value: 'EE', label: 'Estonia', country: 'ee' },
  { value: 'FI', label: 'Finland', country: 'fi' },
  { value: 'FR', label: 'France', country: 'fr' },
  { value: 'DE', label: 'Germany', country: 'de' },
  { value: 'PL', label: 'Poland', country: 'pl' },
  { value: 'UA', label: 'Ukraine', country: 'ua' },
];

/** A round picture with initials, standing in for a photo until Avatar is built. */
const initials = (name: string, hue: number) => {
  const text = name.replace(/^(Ms|Mr|Miss)\.? /, '').split(' ').map(w => w[0]).join('').slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="hsl(${hue} 45% 55%)"/><text x="20" y="25" font-family="sans-serif" font-size="15" font-weight="600" fill="#fff" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const sampleUsers: SelectOption[] = [
  'Sergio Schroeder', 'Warren Fritsch', 'Clifton Armstrong', 'Ms. Dwight Konopelski', 'Miss Gwen Mosciski', 'Brad Zemlak',
].map((name, i) => ({ value: name.toLowerCase().replace(/\W+/g, '-'), label: name, avatar: initials(name, 30 + i * 55) }));

export const samplePaymentMethods: SelectOption[] = [
  { value: 'amex', label: 'Amex', paymentMethod: 'amex' },
  { value: 'amazon', label: 'Amazon Pay', paymentMethod: 'amazon' },
  { value: 'applepay', label: 'Apple Pay', paymentMethod: 'applepay' },
  { value: 'mastercard', label: 'Mastercard', paymentMethod: 'mastercard' },
  { value: 'bitcoin', label: 'Bitcoin', paymentMethod: 'bitcoin' },
  { value: 'citadele', label: 'Citadele', paymentMethod: 'citadele' },
];

export const sampleCoins: SelectOption[] = [
  { value: 'BTC', label: 'Bitcoin (BTC)', coin: 'bitcoin-btc' },
  { value: 'ETH', label: 'Ethereum (ETH)', coin: 'ethereum-eth' },
  { value: 'USDT', label: 'Tether (USDT)', coin: 'tether-usdt' },
  { value: 'TRTL', label: 'Turtlecoin (Trtl)', coin: 'turtlecoin-trtl' },
  { value: 'XRP', label: 'XRP (XRP)', coin: 'xrp-xrp' },
  { value: 'MBL', label: 'MovieBloc (MBL)', coin: 'moviebloc-mbl' },
  { value: 'NANO', label: 'Nano (NANO)', coin: 'nano-nano' },
];

export const sampleCurrencies: SelectOption[] = [
  { value: 'USD', label: 'USD', listLabel: 'US dollar (USD)', coin: 'usd' },
  { value: 'EUR', label: 'EUR', listLabel: 'Euro (EUR)', coin: 'eur' },
  { value: 'UAH', label: 'UAH', listLabel: 'Hryvnia (UAH)', coin: 'uah' },
  { value: 'CNY', label: 'CNY', listLabel: 'Yuan (CNY)', coin: 'cny' },
];
