import { Icon, type IconName } from '../Icon/Icon';
import { CountryIcon, type CountryCode } from '../CountryIcon/CountryIcon';
import { CoinIcon, type CoinName } from '../CoinIcon/CoinIcon';
import { PaymentIcon, type PaymentMethod } from '../PaymentIcon/PaymentIcon';

/** One option of Select, Compact select or Inline select. The picture follows the Figma Type. */
export type SelectOption = {
  value: string;
  /** Text shown in the field, such as "Bulgaria", "+359" or "BTC" */
  label: string;
  /** Text in the open list, such as "Bulgaria +359"; falls back to `label` */
  listLabel?: string;
  /** Base icon (Type Common / Icon) */
  icon?: IconName;
  /** Flag from Country icons, such as `ua` (Type Country) */
  country?: CountryCode;
  /** Logo from Coin icons, such as `bitcoin-btc` (Type Coin) */
  coin?: CoinName;
  /** Logo from Payment method icons, such as `mastercard` (Type Payment method) */
  paymentMethod?: PaymentMethod;
  /** Photo or company logo, URL (Type User). A simple round picture until Avatar is built. */
  avatar?: string;
  /** The option can't be chosen right now */
  disabled?: boolean;
};

export type OptionKind = 'common' | 'icon' | 'country' | 'coin' | 'payment' | 'user';

/** What an empty field shows for each type (Figma placeholders: coin, globe, user, card). */
export const EMPTY_ICON: Record<OptionKind, IconName> = {
  common: 'coin',
  icon: 'coin',
  country: 'globe',
  coin: 'coin',
  payment: 'card',
  user: 'user',
};

/** The option's picture: 20px tall (payment cards 28 × 20). Decorative: the label names the option. */
export function OptionPicture({ option, className = '' }: { option: SelectOption; className?: string }) {
  const cls = `grg-option-picture ${className}`;
  if (option.country) return <CountryIcon className={cls} code={option.country} size={20} />;
  if (option.coin) return <CoinIcon className={cls} name={option.coin} size={20} />;
  if (option.paymentMethod) return <PaymentIcon className={cls} method={option.paymentMethod} size={20} />;
  if (option.avatar) return <img className={`${cls} grg-option-picture--avatar`} src={option.avatar} alt="" />;
  if (option.icon) return <span className={`${cls} grg-option-picture--icon`}><Icon name={option.icon} size={20} /></span>;
  return null;
}
