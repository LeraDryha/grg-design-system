import type { CSSProperties } from 'react';
import { avatarColors, type AvatarColor } from '../Avatar/Avatar';
import { Icon, type IconName } from '../Icon/Icon';
import './TransactionIcon.css';

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'exchange' | 'cashback';

/** Figma Misc icons › "Transaction type icon" (1788:3852): Size; the colour and the icon are set per transaction. */
export type TransactionIconProps = {
  /** The kind of transaction: its colour and icon, as in the Figma examples */
  type?: TransactionType;
  /** Figma Size: sm-20, md-24, lg-48 */
  size?: 'sm' | 'md' | 'lg';
  /** It didn't go through (cancelled, arrested): red with a cross, whatever its kind. The only state it shows;
   *  every other status is the Badge next to it */
  failed?: boolean;
  /** Another Base icon, for a kind of transaction not listed */
  icon?: IconName;
  /** Another Additional colour, for a kind of transaction not listed */
  color?: AvatarColor;
  /** What it means, for screen readers, when nothing next to it says so (such as "Deposit"). Decorative without it */
  label?: string;
  className?: string;
};

const TYPES: Record<TransactionType, { icon: IconName; color: AvatarColor }> = {
  deposit: { icon: 'arrow-down', color: 'blue' },
  withdrawal: { icon: 'arrow-up', color: 'orange' },
  payment: { icon: 'bill', color: 'indigo' },
  exchange: { icon: 'exchange', color: 'green' },
  cashback: { icon: 'gift', color: 'purple' },
};

/** A transaction's colour (an Additional colour name): its kind's, or red when it failed. For surfaces tinted to
 *  match it, such as the header of its details (`var(--add-<colour>-50)`) */
export function transactionColor({ type = 'deposit', failed = false, color }: Pick<TransactionIconProps, 'type' | 'failed' | 'color'>): AvatarColor {
  if (failed) return 'red';
  return color && avatarColors.includes(color) ? color : TYPES[type].color;
}

const ICON_SIZE = { sm: 16, md: 16, lg: 32 } as const;

/** The kind of a transaction: a white icon on an Additional colour tile, in lists, tables and notifications. */
export function TransactionIcon({ type = 'deposit', size = 'md', failed = false, icon, color, label, className = '' }: TransactionIconProps) {
  const tile = transactionColor({ type, failed, color });
  return (
    <span
      className={`grg-transaction-icon ${className}`}
      data-size={size}
      style={{ '--ti-color': `var(--add-${tile}-300)` } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon name={failed ? 'remove' : icon ?? TYPES[type].icon} size={ICON_SIZE[size]} />
    </span>
  );
}
