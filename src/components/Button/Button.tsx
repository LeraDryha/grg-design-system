import type { ComponentPropsWithRef, Ref } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Icon, type IconName } from '../Icon/Icon';
import './Button.css';

/** Figma "Button" component set: Type × Size × State × Destructive × Green × Icon only, plus Left/Right icon and Text. */
export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  /** Figma Type: Primary (filled), Secondary, Outline, Text. Secondary is the default, as in the guidelines. */
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  /** Figma Size: xlg-56, lg-44, md-40, sm-32, xs-24 (the number is the height in px) */
  size?: 'xlg' | 'lg' | 'md' | 'sm' | 'xs';
  /** Figma Destructive = on → destructive, Green = on → green */
  tone?: 'neutral' | 'destructive' | 'green';
  /** Icon before the label (Figma Left icon) */
  leftIcon?: IconName;
  /** Icon after the label (Figma Right icon) */
  rightIcon?: IconName;
  /** Square button with one icon (Figma Icon only = On). Needs `aria-label`. */
  iconOnly?: boolean;
  /** Figma State = Loader: the label is replaced by a spinner, the width stays */
  loading?: boolean;
  /** Takes the full width of its container (guidelines: Justified) */
  justified?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
};

const ICON_SIZE = { xlg: 24, lg: 24, md: 20, sm: 20, xs: 16 } as const;

/** PrimeReact Button (unstyled); the look comes from Button.css and the tokens. */
export function Button({
  variant = 'secondary',
  size = 'md',
  tone = 'neutral',
  leftIcon,
  rightIcon,
  iconOnly = false,
  loading = false,
  justified = false,
  type = 'button',
  className = '',
  children,
  ref,
  ...props
}: ButtonProps) {
  const iconSize = ICON_SIZE[size];
  const onlyIcon = leftIcon ?? rightIcon ?? 'plus';

  return (
    <PrimeButton
      // PrimeReact 10 types Button as a class, but at runtime the ref receives the <button> element
      ref={ref as unknown as Ref<PrimeButton>}
      type={type}
      className={`grg-button ${className}`}
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      data-justified={justified || undefined}
      aria-busy={loading || undefined}
      {...props}
      loading={loading}
      loadingIcon={<span className="grg-button__loader"><Icon name="loading" size={iconSize} /></span>}
    >
      <span className="grg-button__content">
        {iconOnly ? (
          <Icon name={onlyIcon} size={iconSize} />
        ) : (
          <>
            {leftIcon && <Icon name={leftIcon} size={iconSize} />}
            <span className="grg-button__label">{children}</span>
            {rightIcon && <Icon name={rightIcon} size={iconSize} />}
          </>
        )}
      </span>
    </PrimeButton>
  );
}
