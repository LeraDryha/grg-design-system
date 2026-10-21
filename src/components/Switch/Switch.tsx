import { useState, type Ref } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { Icon } from '../Icon/Icon';
import './Switch.css';

/** Figma "Switch" (265:13609): State × Size × Enabled. */
export type SwitchProps = {
  /** Figma Enabled: on or off */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Figma Size: md-24, sm-16 */
  size?: 'md' | 'sm';
  disabled?: boolean;
  /** Name for a switch without a visible label; with Switch Label the label names it */
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
  name?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/* PrimeReact puts role="checkbox" on its wrapper as well as role="switch" on the input: the wrapper is only a box */
const rootPt = { role: 'none', 'aria-checked': undefined, 'aria-label': undefined, 'aria-describedby': undefined };

/**
 * Turns one setting on or off at once, without a Save button. PrimeReact InputSwitch (unstyled) keeps a native
 * checkbox with the switch role for the keyboard (Space) and forms; the track and the knob come from the CSS.
 */
export function Switch({
  checked: controlled, defaultChecked = false, onChange, size = 'md', disabled, 'aria-label': ariaLabel,
  'aria-describedby': describedBy, id, name, className = '', ref,
}: SwitchProps) {
  const [local, setLocal] = useState(defaultChecked);
  const checked = controlled ?? local;
  return (
    <InputSwitch
      inputId={id}
      inputRef={ref as never}
      name={name}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      onChange={e => {
        const next = !!e.value;
        if (controlled === undefined) setLocal(next);
        onChange?.(next);
      }}
      className={`grg-switch ${className}`}
      pt={{
        root: { ...rootPt, 'data-size': size, 'data-checked': checked || undefined, 'data-disabled': disabled || undefined } as object,
        input: { className: 'grg-switch__input' },
        slider: { className: 'grg-switch__knob' },
      }}
    />
  );
}

/** Figma "Switch mode" (265:15133): the switch for the light and the dark theme, a sun or a moon on the knob. */
export type ThemeSwitchProps = Omit<SwitchProps, 'checked' | 'defaultChecked' | 'onChange'> & {
  theme: 'light' | 'dark';
  onChange?: (theme: 'light' | 'dark') => void;
};

/** A Switch that is on for the dark theme. Screen readers hear "Dark theme, on/off" unless another name is given. */
export function ThemeSwitch({ theme, onChange, size = 'md', 'aria-label': ariaLabel = 'Dark theme', className = '', ...props }: ThemeSwitchProps) {
  return (
    <span className={`grg-theme-switch ${className}`} data-size={size} data-theme-mode={theme}>
      <Switch {...props} size={size} aria-label={ariaLabel} checked={theme === 'dark'} onChange={on => onChange?.(on ? 'dark' : 'light')} />
      <Icon name={theme === 'dark' ? 'night-mode' : 'light-mode'} size={size === 'sm' ? 12 : 16} className="grg-theme-switch__icon" />
    </span>
  );
}
