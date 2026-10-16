import type { InlineSelectOption } from '../InlineSelect/InlineSelect';
import flagBg from '../../assets/flag-bg.svg';
import flagDe from '../../assets/flag-de.svg';
import flagGb from '../../assets/flag-gb.svg';
import flagPl from '../../assets/flag-pl.svg';
import flagUa from '../../assets/flag-ua.svg';
import flagUs from '../../assets/flag-us.svg';
import coinBtc from '../../assets/coin-btc.svg';
import coinEth from '../../assets/coin-eth.svg';
import coinUsdc from '../../assets/coin-usdc.svg';
import coinUsdt from '../../assets/coin-usdt.svg';
import mastercard from '../../assets/mastercard.svg';

/* Sample data for stories. Flags, coins and payment icons come from the Figma icons page. */

export const sampleCountries: InlineSelectOption[] = [
  { value: 'BG', label: '+359', listLabel: 'Bulgaria +359', image: flagBg },
  { value: 'UA', label: '+380', listLabel: 'Ukraine +380', image: flagUa },
  { value: 'PL', label: '+48', listLabel: 'Poland +48', image: flagPl },
  { value: 'DE', label: '+49', listLabel: 'Germany +49', image: flagDe },
  { value: 'GB', label: '+44', listLabel: 'United Kingdom +44', image: flagGb },
  { value: 'US', label: '+1', listLabel: 'United States +1', image: flagUs },
];

export const sampleCoins: InlineSelectOption[] = [
  { value: 'USDC', label: 'USD', listLabel: 'USD Coin (USDC)', image: coinUsdc },
  { value: 'USDT', label: 'USDT', listLabel: 'Tether (USDT)', image: coinUsdt },
  { value: 'BTC', label: 'BTC', listLabel: 'Bitcoin (BTC)', image: coinBtc },
  { value: 'ETH', label: 'ETH', listLabel: 'Ethereum (ETH)', image: coinEth },
];

export const paymentIcons = { mastercard };
