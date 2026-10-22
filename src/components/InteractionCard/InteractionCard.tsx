import type { ReactNode } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Avatar } from '../Avatar/Avatar';
import { Badge, type BadgeColor } from '../Badge/Badge';
import { CoinIcon, type CoinName } from '../CoinIcon/CoinIcon';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import { Icon, type IconName } from '../Icon/Icon';
import './InteractionCard.css';

/* Figma page ❖ Interaction card: the set "Card" (1458:5033) and the set "Interaction card" (1450:3359). */

type Action = {
  /** The card does something: it is a button */
  onClick?: () => void;
  /** Or it leads to a page: it is a link */
  href?: string;
  /** Not in Figma: the card can't be used now; say why in the description */
  disabled?: boolean;
};

export type InteractionCardProps = Action & {
  /** Figma Type: Icon (a Featured icon), Base Icon (a plain icon) or Currency (a coin, the name and an amount) */
  type?: 'icon' | 'base-icon' | 'currency';
  /** Figma Card title / Currency */
  title: string;
  /** Figma Card description (Icon, Base Icon) */
  description?: string;
  /** Figma Badge after the title (Icon, Base Icon) */
  badge?: { label: string; color?: BadgeColor };
  /** The Base icon in the Featured icon or on its own */
  icon?: IconName;
  /** Figma Coin (Currency) */
  coin?: CoinName;
  /** Figma Amount (Currency) */
  amount?: string;
  /** Instead of the icon: any picture, such as a payment method logo */
  leading?: ReactNode;
  className?: string;
};

/** The card body is a PrimeReact Button, a link or (with no action) a plain block, so the whole card is one target. */
function Shell({ onClick, href, disabled, className, children, ...data }: Action & { className: string; children: ReactNode } & Record<`data-${string}`, unknown>) {
  if (href && !disabled) return <a className={className} href={href} {...data}>{children}</a>;
  if (onClick || href) {
    return (
      <PrimeButton unstyled type="button" className={className} onClick={onClick} disabled={disabled} {...data}>
        {children}
      </PrimeButton>
    );
  }
  return <div className={className} data-static {...data}>{children}</div>;
}

/**
 * Figma "Card": a row to pick from a short list, such as a withdrawal method or a currency. The whole card is one
 * button or link; the chevron says it leads on.
 */
export function InteractionCard({
  type = 'icon', title, description, badge, icon = type === 'base-icon' ? 'diamond' : 'mail', coin = 'bitcoin-btc', amount,
  leading, onClick, href, disabled = false, className = '',
}: InteractionCardProps) {
  const picture = leading
    ?? (type === 'icon' ? <FeaturedIcon type="primary" size="md" filled={false} icon={icon} />
      : type === 'base-icon' ? <Icon name={icon} size={24} className="grg-interaction-card__icon" />
      : <CoinIcon name={coin} size={24} />);
  const leads = !!(onClick || href) && type !== 'currency';
  return (
    <Shell onClick={onClick} href={href} disabled={disabled} className={`grg-interaction-card ${className}`}
      data-type={type} data-disabled={disabled || undefined}>
      <span className="grg-interaction-card__leading">{picture}</span>
      {type === 'currency' ? (
        <span className="grg-interaction-card__row">
          <span className="grg-interaction-card__title">{title}</span>
          {amount && <span className="grg-interaction-card__amount">{amount}</span>}
        </span>
      ) : (
        <span className="grg-interaction-card__text">
          <span className="grg-interaction-card__top">
            <span className="grg-interaction-card__title">{title}</span>
            {badge && <Badge variant="light" size="sm" color={badge.color ?? 'success'} label={badge.label} leftIcon={null} rightIcon={null} />}
          </span>
          {description && <span className="grg-interaction-card__description">{description}</span>}
        </span>
      )}
      {leads && <Icon name="direction-right" size={20} className="grg-interaction-card__chevron" />}
    </Shell>
  );
}

export type InteractionTileProps = Action & {
  /** Figma Filled: On is a company (avatar, title, subtitle, badge); Off is the "create" tile with a plus */
  filled?: boolean;
  /** Figma Title (Filled On) or the text under the plus (Filled Off) */
  title: string;
  /** Figma Subtitles */
  subtitle?: string;
  /** Figma Badge */
  badge?: { label: string; color?: BadgeColor };
  /** The company picture; without it the Avatar company placeholder */
  image?: string;
  /** Figma State Active: the chosen one, such as the current company */
  selected?: boolean;
  className?: string;
};

/** Figma "Interaction card": a 200px tile to choose a company, or to create one. */
export function InteractionTile({
  filled = true, title, subtitle, badge, image, selected, onClick, href, disabled = false, className = '',
}: InteractionTileProps) {
  return (
    <Shell onClick={onClick} href={href} disabled={disabled} className={`grg-interaction-tile ${className}`}
      data-filled={filled || undefined} data-selected={selected || undefined} data-disabled={disabled || undefined}
      {...(selected !== undefined && (onClick || href) ? { 'aria-pressed': selected } : {})}>
      {filled ? (
        <>
          <Avatar size={48} shape="company" src={image} decorative />
          <span className="grg-interaction-tile__text">
            <span className="grg-interaction-tile__title">{title}</span>
            {subtitle && <span className="grg-interaction-tile__subtitle">{subtitle}</span>}
          </span>
          {badge && <Badge variant="light" size="md" color={badge.color ?? 'success'} label={badge.label} leftIcon={null} rightIcon={null} />}
        </>
      ) : (
        <>
          {/* Figma draws a Secondary icon-only Button; inside a button it is a picture of one */}
          <span className="grg-interaction-tile__plus" aria-hidden="true"><Icon name="plus" size={24} /></span>
          <span className="grg-interaction-tile__subtitle">{title}</span>
        </>
      )}
    </Shell>
  );
}
