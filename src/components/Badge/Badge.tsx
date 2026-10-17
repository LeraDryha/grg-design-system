import type { ComponentPropsWithoutRef } from 'react';
import { Badge as PrimeBadge } from 'primereact/badge';
import { Icon, type IconName } from '../Icon/Icon';
import './Badge.css';

export type BadgeVariant = 'filled' | 'light' | 'stroke' | 'text';
export type BadgeSize = 'md' | 'sm' | 'xs';
export type BadgeType = 'text' | 'numeric' | 'dot';
export type BadgeColor = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type BadgeProps = Omit<ComponentPropsWithoutRef<'span'>, 'color' | 'children'> & {
  /** Figma Style: Filled, Light, Stroke, Text. */
  variant?: BadgeVariant;
  /** Figma Size: md-24, sm-20, xs-16. */
  size?: BadgeSize;
  /** Figma Type: Text, Numeric, Dot. */
  type?: BadgeType;
  /** Figma Color: Neutral, Info, Success, Warning, Error. */
  color?: BadgeColor;
  /** Figma Edit text: visible text; also names a standalone Dot unless aria-label is supplied. */
  label?: string;
  /** Figma Edit numeric: the counter's content. Zero is displayed; longer values grow into a pill. */
  value?: string | number;
  /** Figma Left icon: a Base icon name when on; null when off. Used by Text only. */
  leftIcon?: IconName | null;
  /** Figma Right icon: a Base icon name when on; null when off. Used by Text only. */
  rightIcon?: IconName | null;
  /** Hide a repeated visual cue from screen readers when adjacent text already supplies its meaning. */
  decorative?: boolean;
};

/** A static label, count or status dot. It does not receive focus or start an action. */
export function Badge({
  variant = 'filled', size = 'md', type = 'text', color = 'neutral',
  label = 'Badge', value = '2', leftIcon = 'brightness', rightIcon = 'brightness',
  decorative = false, className = '', role, 'aria-label': ariaLabel, ...rest
}: BadgeProps) {
  // PrimeReact Badge renders its `value`, not its children. Its native span has no interaction.
  // A named Dot (or a counter with a contextual name) is exposed as one image with that name.
  const accessibleName = ariaLabel?.trim() || (type === 'dot' ? label : undefined);
  const named = type === 'dot' || !!accessibleName;
  const content = type === 'dot'
    ? <span className="grg-badge__dot" aria-hidden="true" />
    : type === 'numeric'
      ? <span className="grg-badge__value">{value}</span>
      : <>
          {leftIcon && <Icon name={leftIcon} size={12} className="grg-badge__left-icon" />}
          <span className="grg-badge__label">{label}</span>
          {rightIcon && <Icon name={rightIcon} size={12} className="grg-badge__right-icon" />}
        </>;

  return <PrimeBadge
    {...rest}
    unstyled
    className={`grg-badge ${className}`}
    data-variant={variant}
    data-size={size}
    data-type={type}
    data-color={color}
    role={role ?? (named && !decorative ? 'img' : undefined)}
    aria-label={decorative ? undefined : accessibleName}
    aria-hidden={decorative ? true : rest['aria-hidden']}
    value={content}
  />;
}
