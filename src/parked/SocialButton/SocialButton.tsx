import type { ComponentPropsWithRef, Ref } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Icon } from '../../components/Icon/Icon';
import facebook from '../../assets/social-facebook.svg';
import google from '../../assets/social-google.svg';
import './SocialButton.css';

const BRAND = { google: 'Google', facebook: 'Facebook', apple: 'Apple' } as const;

/** Figma "Social button": State × Icon button × Social. */
export type SocialButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  /** Figma Social: Google, Facebook, Apple */
  social: keyof typeof BRAND;
  /** Square button with the logo only (Figma Icon button = on). Its name is "Sign in with …". */
  iconOnly?: boolean;
  type?: 'button' | 'submit';
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

/**
 * Sign in with a third-party account. PrimeReact Button (unstyled).
 * Google and Facebook keep their brand colours; the Apple logo is one colour and follows the theme.
 */
export function SocialButton({ social, iconOnly = false, previewState = 'default', type = 'button', className = '', children, ref, ...props }: SocialButtonProps) {
  const label = children ?? `Sign in with ${BRAND[social]}`;
  return (
    <PrimeButton
      // PrimeReact 10 types Button as a class, but at runtime the ref receives the <button> element
      ref={ref as unknown as Ref<PrimeButton>}
      type={type}
      className={`grg-social-button ${className}`}
      data-icon-only={iconOnly || undefined}
      data-preview-state={previewState === 'default' ? undefined : previewState}
      aria-label={iconOnly ? (typeof label === 'string' ? label : `Sign in with ${BRAND[social]}`) : undefined}
      {...props}
    >
      {social === 'apple' ? (
        <Icon name="apple" size={24} />
      ) : (
        <img className="grg-social-button__logo" src={social === 'google' ? google : facebook} alt="" />
      )}
      {!iconOnly && <span>{label}</span>}
    </PrimeButton>
  );
}
