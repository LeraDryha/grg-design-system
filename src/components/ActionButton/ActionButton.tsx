import type { ComponentPropsWithRef, Ref } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Icon, type IconName } from '../Icon/Icon';
import './ActionButton.css';

/** Figma "Action button": an icon-only button for small actions inside other components (copy, reveal, open, edit). */
export type ActionButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'color'> & {
  icon: IconName;
  /** The name screen readers announce, such as "Copy link". Required: the button has no visible text. */
  'aria-label': string;
  /** Figma Size: md-24px, sm-20px, xs-16px */
  size?: 'md' | 'sm' | 'xs';
  /** Figma Color: Grey, Blue, Red */
  color?: 'grey' | 'blue' | 'red';
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

const ICON_SIZE = { md: 24, sm: 20, xs: 16 } as const;

/** PrimeReact Button (unstyled); the look comes from ActionButton.css and the tokens. */
export function ActionButton({ icon, size = 'md', color = 'grey', previewState = 'default', type = 'button', className = '', ref, ...props }: ActionButtonProps) {
  return (
    <PrimeButton
      // PrimeReact 10 types Button as a class, but at runtime the ref receives the <button> element
      ref={ref as unknown as Ref<PrimeButton>}
      type={type}
      className={`grg-action-button ${className}`}
      data-size={size}
      data-color={color}
      data-preview-state={previewState === 'default' ? undefined : previewState}
      {...props}
    >
      <Icon name={icon} size={ICON_SIZE[size]} />
    </PrimeButton>
  );
}
