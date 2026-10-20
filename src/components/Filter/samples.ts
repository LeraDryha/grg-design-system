import type { FilterOption } from './Filter';

/** Merchants: a list that comes from data and grows, so its filter has a search row */
export const sampleMerchants: FilterOption[] = [
  'Corefy', 'Crypto Proxy', 'Code', 'Merchant Portal', 'Kuna Otc', 'Kuna IO', 'International Crypto Settlement Provider',
  'Payman', 'Stripe', 'Adyen', 'SEPA Gateway', 'Northwind Pay',
].map(label => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));

/** Statuses: a short fixed list; the chosen one shows as a status Badge */
export const sampleStatuses: FilterOption[] = [
  { value: 'active', label: 'Active', status: 'success' },
  { value: 'passive', label: 'Passive', status: 'warning' },
  { value: 'blocked', label: 'Blocked', status: 'error' },
];

export const sampleTypes: FilterOption[] = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'trading', label: 'Trading' },
  { value: 'withdrawal', label: 'Withdrawal' },
];

export const sampleCurrencies: FilterOption[] = [
  { value: 'BTC', label: 'BTC', listLabel: 'Bitcoin (BTC)', coin: 'bitcoin-btc' },
  { value: 'ETH', label: 'ETH', listLabel: 'Ethereum (ETH)', coin: 'ethereum-eth' },
  { value: 'USDT', label: 'USDT', listLabel: 'Tether (USDT)', coin: 'tether-usdt' },
  { value: 'XRP', label: 'XRP', listLabel: 'Ripple (XRP)', coin: 'xrp-xrp' },
];
