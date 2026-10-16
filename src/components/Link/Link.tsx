import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Link.css';

/** Figma "Link button" (132:3886): State × Size × Color, with Left and Right icons. */
export type LinkProps = Omit<ComponentPropsWithRef<'a'>, 'color'> & {
  /** Where the link goes */
  href?: string;
  /** Figma Color: Black (underlined) or Blue */
  color?: 'black' | 'blue';
  /** Figma Size: md-24, sm-20, xs-16 (the number is the height in px) */
  size?: 'md' | 'sm' | 'xs';
  /** Icon before the label (Figma Left icon) */
  leftIcon?: IconName;
  /** Icon after the label (Figma Right icon); `maximize` for external resources */
  rightIcon?: IconName;
  /** Opens in a new tab, and says so to screen readers */
  external?: boolean;
  /** Text read after the label for external links */
  externalLabel?: string;
  /** Not available: no navigation, announced as unavailable */
  disabled?: boolean;
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

const ICON_SIZE = { md: 24, sm: 20, xs: 16 } as const;

/**
 * A link: it takes people to another page, view or external resource.
 * PrimeReact has no link component, so this is a native <a>, which gives the right role, keyboard
 * behaviour (Enter) and browser features (open in a new tab, copy the address) for free.
 * A disabled link drops its href and is marked aria-disabled, since <a> has no disabled attribute.
 */
export function Link({
  href,
  color = 'black',
  size = 'md',
  leftIcon,
  rightIcon,
  external = false,
  externalLabel = '(opens in a new tab)',
  disabled = false,
  previewState = 'default',
  className = '',
  children,
  onClick,
  ...props
}: LinkProps) {
  const iconSize = ICON_SIZE[size];

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <a
      {...props}
      className={`grg-link ${className}`}
      href={disabled ? undefined : href}
      target={external && !disabled ? '_blank' : props.target}
      rel={external ? 'noopener noreferrer' : props.rel}
      role={disabled ? 'link' : undefined}
      aria-disabled={disabled || undefined}
      data-color={color}
      data-size={size}
      data-preview-state={previewState === 'default' ? undefined : previewState}
      onClick={handleClick}
    >
      {leftIcon && <Icon name={leftIcon} size={iconSize} />}
      <span>{children}</span>
      {rightIcon && <Icon name={rightIcon} size={iconSize} />}
      {external && <span className="grg-sr-only">{externalLabel}</span>}
    </a>
  );
}
