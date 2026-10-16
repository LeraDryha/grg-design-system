import type { InlineSelectOption } from '../InlineSelect/InlineSelect';

/* Sample data for stories. Flags and coins come from Foundations/Icons (Country icons, Coin icons). */

export const sampleCountries: InlineSelectOption[] = [
  { value: 'BG', label: '+359', listLabel: 'Bulgaria +359', country: 'bg' },
  { value: 'UA', label: '+380', listLabel: 'Ukraine +380', country: 'ua' },
  { value: 'PL', label: '+48', listLabel: 'Poland +48', country: 'pl' },
  { value: 'DE', label: '+49', listLabel: 'Germany +49', country: 'de' },
  { value: 'GB', label: '+44', listLabel: 'United Kingdom +44', country: 'gb' },
  { value: 'US', label: '+1', listLabel: 'United States +1', country: 'us' },
];

export const sampleCoins: InlineSelectOption[] = [
  { value: 'USDC', label: 'USD', listLabel: 'USD Coin (USDC)', coin: 'usd-coin-usdc' },
  { value: 'USDT', label: 'USDT', listLabel: 'Tether (USDT)', coin: 'tether-usdt' },
  { value: 'BTC', label: 'BTC', listLabel: 'Bitcoin (BTC)', coin: 'bitcoin-btc' },
  { value: 'ETH', label: 'ETH', listLabel: 'Ethereum (ETH)', coin: 'ethereum-eth' },
];
