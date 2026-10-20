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

import avatarPhoto from '../../assets/avatar-sample.jpg';

export const sampleUsers: SelectOption[] = [
  { value: 'sergio-schroeder', label: 'Sergio Schroeder', avatar: { initials: true, color: 'sky' } },
  { value: 'warren-fritsch', label: 'Warren Fritsch', avatar: { src: avatarPhoto } },
  { value: 'clifton-armstrong', label: 'Clifton Armstrong', avatar: { initials: true, color: 'green' } },
  { value: 'dwight-konopelski', label: 'Ms. Dwight Konopelski', avatar: { initials: true } },
  { value: 'gwen-mosciski', label: 'Miss Gwen Mosciski', avatar: { initials: true, color: 'purple' } },
  { value: 'brad-zemlak', label: 'Brad Zemlak', avatar: { src: avatarPhoto } },
  { value: 'golden-ratio', label: 'Golden Ratio Group', avatar: { shape: 'company', color: 'amber' } },
];

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

export const sampleProviders: SelectOption[] = [
  'Payman', 'Stripe', 'Adyen', 'SEPA EUR', 'SWIFT USD', 'Visa Processing', 'Mastercard Gateway', 'Crypto Processing', 'Internal Settlement',
].map(label => ({ value: label.split(' ')[0].toLowerCase(), label }));
