import type { ComponentPropsWithRef, Ref } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { SocialIcon } from '../SocialIcon/SocialIcon';
import './SocialButton.css';

const BRAND = { google: 'Google', facebook: 'Facebook', apple: 'Apple' } as const;

/** Figma "Social button" (68:17758): State × Icon button × Social. */
export type SocialButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  /** Figma Social: Google, Facebook, Apple */
  social: keyof typeof BRAND;
  /** Square button with the logo only (Figma Icon button = on). Screen readers still hear the label. */
  iconOnly?: boolean;
  type?: 'button' | 'submit';
};

/**
 * Sign in or sign up with a third-party account. PrimeReact Button (unstyled) with the Brand social icon:
 * Google and Facebook keep their colours, the black Apple logo turns white on the dark theme.
 * The label defaults to the Figma text, "Sign in with …".
 */
export function SocialButton({
  social,
  iconOnly = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ref,
  ...props
}: SocialButtonProps) {
  const label = children ?? `Sign in with ${BRAND[social]}`;
  return (
    <PrimeButton
      // PrimeReact 10 types Button as a class, but at runtime the ref receives the <button> element
      ref={ref as unknown as Ref<PrimeButton>}
      type={type}
      disabled={disabled}
      className={`grg-social-button ${className}`}
      data-icon-only={iconOnly || undefined}
      aria-label={iconOnly && typeof label === 'string' ? label : undefined}
      {...props}
    >
      <SocialIcon platform={social} size={24} variant={disabled ? 'gray' : 'brand'} />
      {!iconOnly && <span className="grg-social-button__label">{label}</span>}
    </PrimeButton>
  );
}
