import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import { HintText } from '../FormField/FormField';
import mdUnchecked from './shapes/md-unchecked.svg';
import mdChecked from './shapes/md-checked.svg';
import smUnchecked from './shapes/sm-unchecked.svg';
import smChecked from './shapes/sm-checked.svg';
import './Radio.css';

/* The Figma shapes: a ring, and the ring with the dot when selected */
const SHAPES = {
  md: { unchecked: mdUnchecked, checked: mdChecked },
  sm: { unchecked: smUnchecked, checked: smChecked },
};

type GroupState = { name: string; value?: string | null; select: (value: string) => void; invalid: boolean; size?: 'sm' | 'md'; disabled?: boolean; describedBy?: string };
const RadioGroupContext = createContext<GroupState | null>(null);

/** Figma "Radio" (136:11127): State × Selected × Size × Destructive. */
export type RadioProps = {
  /** The value this option stands for in its group */
  value: string;
  /** Figma Selected, outside a RadioGroup */
  checked?: boolean;
  onChange?: (value: string) => void;
  /** Figma Size: sm-16, md-20 */
  size?: 'sm' | 'md';
  /** Figma Destructive: red, for an option that removes something. A missing choice is the group's `error` */
  destructive?: boolean;
  disabled?: boolean;
  /** Name for a radio without a visible label; with Radio Label the label names it */
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
  /** The group's name, outside a RadioGroup */
  name?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * One option of a group where only one can be chosen. PrimeReact RadioButton (unstyled) keeps the native radio:
 * the arrow keys move and choose within the group, Tab enters and leaves it in one step. The ring is the Figma shape.
 */
export function Radio({
  value, checked: ownChecked, onChange, size: ownSize, destructive = false, disabled: ownDisabled, 'aria-label': ariaLabel,
  'aria-describedby': describedBy, id, name: ownName, className = '', ref,
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const checked = group ? group.value === value : !!ownChecked;
  const size = ownSize ?? group?.size ?? 'sm';
  const disabled = ownDisabled ?? group?.disabled;
  const red = destructive || !!group?.invalid;
  const shape = checked ? 'checked' : 'unchecked';
  const style = { '--rd-shape': `url("${SHAPES[size][shape]}")` } as CSSProperties;
  return (
    <RadioButton
      inputId={id}
      inputRef={ref as never}
      name={group?.name ?? ownName}
      value={value}
      checked={checked}
      disabled={disabled}
      invalid={red}
      aria-label={ariaLabel}
      aria-describedby={[describedBy, group?.describedBy].filter(Boolean).join(' ') || undefined}
      onChange={() => (group ? group.select(value) : onChange?.(value))}
      className={`grg-radio ${className}`}
      style={style}
      pt={{
        root: { 'data-size': size, 'data-state': shape, 'data-destructive': red || undefined, 'data-disabled': disabled || undefined } as object,
        input: { className: 'grg-radio__input', 'aria-invalid': group?.invalid || undefined } as object,
        box: { className: 'grg-radio__box' },
        icon: { className: 'grg-radio__icon' },
      }}
    />
  );
}

export type RadioGroupProps = {
  /** What is being chosen, such as "Payout method": the group's name for screen readers and its title */
  label: string;
  /** A line under the title */
  hint?: string;
  /** Error under the group, such as "Choose a payout method": the rings turn red and screen readers read it with the group */
  error?: string;
  /** The chosen value; null or undefined when nothing is chosen yet */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Options one under another (12px apart), or in a row (24px apart) */
  orientation?: 'vertical' | 'horizontal';
  /** Figma Size of every radio inside */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** The form field name; one is made up if not given */
  name?: string;
  /** Radios or Radio Labels */
  children: ReactNode;
  className?: string;
};

/** A titled group of radios: only one can be chosen. Not in Figma; the title is a field label, the error a Hint text. */
export function RadioGroup({
  label, hint, error, value: controlled, defaultValue = null, onChange, orientation = 'vertical', size, disabled, name, children, className = '',
}: RadioGroupProps) {
  const id = useId();
  const [local, setLocal] = useState(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const state: GroupState = {
    name: name ?? id,
    value,
    size,
    disabled,
    invalid: !!error,
    describedBy: errorId,
    select: next => {
      if (controlled === undefined) setLocal(next);
      onChange?.(next);
    },
  };
  return (
    <fieldset
      className={`grg-radio-group ${className}`}
      data-orientation={orientation}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={!!error || undefined}
      disabled={disabled}
    >
      <legend className="grg-radio-group__label">{label}</legend>
      {/* A legend isn't a flex item of its fieldset: the rest sits in its own column */}
      <div className="grg-radio-group__body">
        {hint && <p className="grg-radio-group__hint" id={hintId}>{hint}</p>}
        <div className="grg-radio-group__options">
          <RadioGroupContext.Provider value={state}>{children}</RadioGroupContext.Provider>
        </div>
        {error && <HintText id={errorId} state="error">{error}</HintText>}
      </div>
    </fieldset>
  );
}
