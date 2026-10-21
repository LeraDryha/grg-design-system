import type { MouseEvent } from 'react';
import { ActionButton } from '../ActionButton/ActionButton';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import { Icon, type IconName } from '../Icon/Icon';
import './FeatureCard.css';

/** Figma ❖ Navigation › "Feature cards" (769:16436): Type × Color. */
export type FeatureCardProps = {
  /** Figma Type: Left icon (an offer, the whole card is a link) or Support (a note that can be closed) */
  type?: 'left-icon' | 'support';
  /** Figma Color. Black turns light in the dark theme; Primary keeps its gold and dark text in both themes */
  color?: 'white' | 'gray' | 'black' | 'primary';
  /** Figma Title */
  title: string;
  /** Figma description: one line for Left icon, up to two for Support */
  description?: string;
  /** The Base icon: in the tile for Left icon (`gift` by default), before the title for Support (`support`) */
  icon?: IconName;
  /** Left icon: where the card leads */
  href?: string;
  /** Left icon: what the card does, instead of or as well as `href` */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Support: the close button (Figma Action button); without it there is none */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
};

/**
 * A small card that brings something to attention: an offer at the bottom of a sidebar, or a way to get help.
 * Not a PrimeReact component: a link or a plain block.
 */
export function FeatureCard({
  type = 'left-icon', color = 'white', title, description, icon, href, onClick, onClose, closeLabel = 'Close', className = '',
}: FeatureCardProps) {
  const attrs = {
    className: `grg-feature-card ${color === 'black' ? 'grg-theme-invert' : ''} ${className}`,
    'data-type': type,
    'data-color': color,
    // Primary is a gold card with dark text in both themes
    'data-theme': color === 'primary' ? 'light' : undefined,
  };

  if (type === 'support') {
    return (
      <div {...attrs}>
        <div className="grg-feature-card__text">
          <p className="grg-feature-card__title">
            <Icon name={icon ?? 'support'} size={20} className="grg-feature-card__title-icon" />
            {title}
          </p>
          {description && <p className="grg-feature-card__description">{description}</p>}
        </div>
        {onClose && <ActionButton icon="remove" size="xs" aria-label={closeLabel} onClick={onClose} className="grg-feature-card__close" />}
      </div>
    );
  }

  const content = (
    <>
      <FeaturedIcon type="neutral" size="sm" icon={icon ?? 'gift'} />
      <span className="grg-feature-card__text">
        <span className="grg-feature-card__title">{title}</span>
        {description && <span className="grg-feature-card__description">{description}</span>}
      </span>
    </>
  );
  if (href) return <a {...attrs} href={href} onClick={onClick}>{content}</a>;
  if (onClick) return <button type="button" {...attrs} onClick={onClick}>{content}</button>;
  return <div {...attrs}>{content}</div>;
}
