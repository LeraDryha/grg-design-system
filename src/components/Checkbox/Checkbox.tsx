import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react';
import { Checkbox as PrimeCheckbox } from 'primereact/checkbox';
import mdUnchecked from './shapes/md-unchecked.svg';
import mdChecked from './shapes/md-checked.svg';
import mdIndeterminate from './shapes/md-indeterminate.svg';
import smUnchecked from './shapes/sm-unchecked.svg';
import smChecked from './shapes/sm-checked.svg';
import smIndeterminate from './shapes/sm-indeterminate.svg';
import './Checkbox.css';

/* The Figma shapes: a ring when empty, a filled square with the check or the dash cut out when on */
const SHAPES = {
  md: { unchecked: mdUnchecked, checked: mdChecked, indeterminate: mdIndeterminate },
  sm: { unchecked: smUnchecked, checked: smChecked, indeterminate: smIndeterminate },
};

/** Figma "Checkbox" (135:11986): State × Indeterminate × Selected × Size × Destructive. */
export type CheckboxProps = {
  /** Figma Selected */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Figma Indeterminate: some, not all, of the items below it are selected. Shown instead of the check. */
  indeterminate?: boolean;
  /** Figma Size: sm-16, md-20 */
  size?: 'sm' | 'md';
  /** Figma Destructive: red, for a choice that removes something. For a missing required choice use `invalid`. */
  destructive?: boolean;
  /** The choice is missing or wrong: red like Destructive, and screen readers hear it as invalid. Explain it in text nearby. */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Name for a checkbox without a visible label; with Checkbox Label the label names it */
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * A box to turn one option on or off. PrimeReact Checkbox (unstyled) keeps the native checkbox for keyboard and
 * forms; the box is drawn with the Figma shapes. PrimeReact 10 has no indeterminate state, so it is set on the
 * native input here (screen readers hear "mixed").
 */
export function Checkbox({
  checked: controlled, defaultChecked = false, onChange, indeterminate = false, size = 'sm', destructive = false, invalid = false,
  disabled, required, 'aria-label': ariaLabel, 'aria-describedby': describedBy, id, name, value, className = '', ref,
}: CheckboxProps) {
  const [local, setLocal] = useState(defaultChecked);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const checked = controlled ?? local;
  const shape = indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked';

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const style = { '--cb-shape': `url("${SHAPES[size][shape]}")` } as CSSProperties;
  return (
    <PrimeCheckbox
      inputId={id}
      inputRef={node => {
        inputRef.current = node;
        if (node) node.indeterminate = indeterminate;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      required={required}
      invalid={destructive || invalid}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      icon={<span />}
      onChange={e => {
        const next = !!e.checked;
        if (controlled === undefined) setLocal(next);
        onChange?.(next);
      }}
      className={`grg-checkbox ${className}`}
      style={style}
      pt={{
        root: {
          'data-size': size,
          'data-state': shape,
          'data-destructive': destructive || invalid || undefined,
          'data-disabled': disabled || undefined,
        } as object,
        input: { className: 'grg-checkbox__input', 'aria-checked': indeterminate ? 'mixed' : undefined, 'aria-invalid': invalid || undefined } as object,
        box: { className: 'grg-checkbox__box' },
        icon: { className: 'grg-checkbox__icon' },
      }}
    />
  );
}

/**
 * The checkbox drawing alone, without a native checkbox: for rows that already are an option themselves,
 * such as a multi-select list, where a second control inside the option would confuse screen readers.
 */
export function CheckboxMark({
  checked = false, indeterminate = false, size = 'md', disabled = false, className = '',
}: Pick<CheckboxProps, 'checked' | 'indeterminate' | 'size' | 'disabled' | 'className'>) {
  const shape = indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked';
  const style = { '--cb-shape': `url("${SHAPES[size][shape]}")` } as CSSProperties;
  return (
    <span
      className={`grg-checkbox grg-checkbox--mark ${className}`}
      data-size={size}
      data-state={shape}
      data-disabled={disabled || undefined}
      style={style}
      aria-hidden="true"
    >
      <span className="grg-checkbox__box" />
    </span>
  );
}
