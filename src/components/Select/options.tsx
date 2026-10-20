import { Icon, type IconName } from '../Icon/Icon';
import { CountryIcon, type CountryCode } from '../CountryIcon/CountryIcon';
import { CoinIcon, type CoinName } from '../CoinIcon/CoinIcon';
import { PaymentIcon, type PaymentMethod } from '../PaymentIcon/PaymentIcon';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { SocialIcon, type SocialPlatform } from '../SocialIcon/SocialIcon';

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
  /** Avatar of a person or a company (Type User): a photo, initials of the label, or a shape, in a colour */
  avatar?: Pick<AvatarProps, 'src' | 'initials' | 'shape' | 'color'>;
  /** Social platform logo, Brand style (Dropdown menu item Type Social) */
  social?: SocialPlatform;
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

/** The option's picture: 20px tall (payment cards 28 × 20; an avatar with a description 40px). Decorative: the label names the option. */
export function OptionPicture({ option, className = '', large = false }: { option: SelectOption; className?: string; large?: boolean }) {
  const cls = `grg-option-picture ${className}`;
  if (option.country) return <CountryIcon className={cls} code={option.country} size={20} />;
  if (option.coin) return <CoinIcon className={cls} name={option.coin} size={20} />;
  if (option.paymentMethod) return <PaymentIcon className={cls} method={option.paymentMethod} size={20} />;
  if (option.avatar) return <Avatar className={cls} size={large ? 40 : 20} name={option.label} {...option.avatar} decorative />;
  if (option.social) return <SocialIcon className={cls} platform={option.social} size={20} />;
  if (option.icon) return <span className={`${cls} grg-option-picture--icon`}><Icon name={option.icon} size={20} /></span>;
  return null;
}
