import type { ComponentPropsWithRef, Ref } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Icon, type IconName } from '../Icon/Icon';
import './ButtonGroupItem.css';

export type ButtonGroupItemProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  /** Figma Text: visible label and the default accessible name for an icon-only button. */
  label: string;
  /** Figma Size: md-32 or sm-24. */
  size?: 'md' | 'sm';
  /** Figma Side: Left, Center or Right. Single is the code fallback for a one-item group. */
  side?: 'left' | 'center' | 'right' | 'single';
  /** Figma Left icon: Base icon name when on; null when off. */
  leftIcon?: IconName | null;
  /** Figma Right icon: Base icon name when on; null when off. */
  rightIcon?: IconName | null;
  /** Figma Icon only: square button using the left icon, then right icon, then plus. */
  iconOnly?: boolean;
  /** Persistent toggle state. The assembled selection group manages this through SelectButton. */
  selected?: boolean;
  /** Figma State Default, Hovered, Active: static previews; Disabled uses the native disabled prop. */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

/** PrimeReact Button with the geometry and tokens of the Button group item set. */
export function ButtonGroupItem({ label, size = 'md', side = 'left', leftIcon = 'plus', rightIcon = 'plus', iconOnly = false, selected, previewState = 'default', type = 'button', className = '', ref, 'aria-label': ariaLabel, ...props }: ButtonGroupItemProps) {
  return <PrimeButton {...props} unstyled ref={ref as unknown as Ref<PrimeButton>} type={type}
    className={`grg-button-group-item ${className}`} data-size={size} data-side={side}
    data-icon-only={iconOnly || undefined} data-preview-state={previewState === 'default' ? undefined : previewState}
    data-selected={selected || undefined} aria-pressed={selected}
    aria-label={ariaLabel || (iconOnly ? label : undefined)}
  >
    <ButtonGroupItemContent label={label} size={size} leftIcon={leftIcon} rightIcon={rightIcon} iconOnly={iconOnly} />
  </PrimeButton>;
}

/** Shared presentation without a nested control inside PrimeReact SelectButton's button role. */
export function ButtonGroupItemContent({ label, size = 'md', leftIcon, rightIcon, iconOnly }: Pick<ButtonGroupItemProps, 'label' | 'size' | 'leftIcon' | 'rightIcon' | 'iconOnly'>) {
  const iconSize = size === 'sm' ? 16 : 20;
  return <>{iconOnly
      ? <Icon className="grg-button-group-item__icon" name={leftIcon ?? rightIcon ?? 'plus'} size={iconSize} />
      : <>
          {leftIcon && <Icon className="grg-button-group-item__icon" name={leftIcon} size={iconSize} />}
          <span className="grg-button-group-item__label">{label}</span>
          {rightIcon && <Icon className="grg-button-group-item__icon" name={rightIcon} size={iconSize} />}
        </>}
  </>;
}
