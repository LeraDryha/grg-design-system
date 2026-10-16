import { useId, useRef, useState, type ChangeEvent, type ComponentPropsWithRef, type FocusEvent, type ReactNode } from 'react';
import { InputText } from 'primereact/inputtext';
import { Icon, type IconName } from '../Icon/Icon';
import { ActionButton } from '../ActionButton/ActionButton';
import { FormField } from '../FormField/FormField';
import { InlineSelect, type InlineSelectOption } from '../InlineSelect/InlineSelect';
import './Input.css';

/** Figma "input" component set (73:3711): Type × State × Size × Filled, with Top/Bottom rows and icon booleans. */
export type InputProps = Omit<ComponentPropsWithRef<'input'>, 'size' | 'type' | 'prefix' | 'value' | 'defaultValue' | 'children'> & {
  /** Figma Type. Common: plain text. Phone: country code + number. Website: protocol prefix. Card: card number with a payment icon.
   *  Amount: number + coin. Date: DD / MM / YYYY. Button: text with an action (copy, reveal password). */
  type?: 'common' | 'phone' | 'website' | 'card' | 'amount' | 'date' | 'button';
  /** HTML input type, for the browser keyboard and autofill (email, password, tel, url…) */
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Figma Size: lg-44, md-40, sm-32 */
  size?: 'lg' | 'md' | 'sm';
  /** Label (Figma Floating label). Inside the empty field it works as the placeholder. */
  label?: string;
  /** Figma behaviour: the label sits inside the empty field and floats above on focus or with a value. false keeps it above. */
  floatingLabel?: boolean;
  required?: boolean;
  /** Additional text after the label; true shows "(Optional)" */
  optional?: boolean | string;
  /** Text behind the info button next to the label */
  info?: string;
  /** Help text under the field (Figma Hint text) */
  hint?: string;
  /** Error message: red border, red hint, announced with the field */
  error?: string;
  hintIcon?: boolean;
  /** Top right (Figma Key: Value) */
  topKey?: string;
  topValue?: string;
  /** Bottom right (Figma Value) */
  bottomValue?: string;
  /** Figma Left icon. Card and Button types have a default (card, link); `null` removes it. */
  leftIcon?: IconName | null;
  /** Figma Right icon. Date has a calendar by default; `null` removes it. */
  rightIcon?: IconName | null;
  /** Figma Currency icon: a short unit after the value, such as USD, sec or px */
  unit?: string;
  /** Website type: the protocol before the value */
  prefix?: string;
  /** Shows a clear button while the field has a value (on focus; always for Phone) */
  clearable?: boolean;
  clearLabel?: string;
  /** Button type: copy the value, or show and hide a password */
  action?: 'copy' | 'password';
  copyLabel?: string;
  copiedMessage?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  /** Phone type: country codes */
  countries?: InlineSelectOption[];
  country?: string;
  onCountryChange?: (value: string) => void;
  countryLabel?: string;
  /** Amount type: coins or currencies */
  coins?: InlineSelectOption[];
  coin?: string;
  onCoinChange?: (value: string) => void;
  coinLabel?: string;
  /** Card type: payment method picture (URL), such as Mastercard */
  paymentIcon?: string;
  paymentLabel?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'focus';
};

/** Card: groups of 4 digits. Date: DD / MM / YYYY. Phone: digits and spaces. Amount: digits and one decimal point. */
function format(type: InputProps['type'], raw: string) {
  if (type === 'card') return raw.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  if (type === 'date') {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(' / ');
  }
  if (type === 'phone') return raw.replace(/[^\d ]/g, '');
  if (type === 'amount') return raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
  return raw;
}

const INPUT_MODE = { card: 'numeric', date: 'numeric', phone: 'tel', amount: 'decimal' } as const;

/** PrimeReact InputText (unstyled) inside the field frame. Figma is the source of every value in Input.css. */
export function Input({
  type = 'common', inputType, size = 'md', label, floatingLabel = true, required, optional, info,
  hint, error, hintIcon = true, topKey, topValue, bottomValue,
  leftIcon, rightIcon, unit, prefix, clearable = true, clearLabel = 'Clear',
  action, copyLabel = 'Copy', copiedMessage = 'Copied', showPasswordLabel = 'Show password', hidePasswordLabel = 'Hide password',
  countries = [], country, onCountryChange, countryLabel = 'Country code',
  coins = [], coin, onCoinChange, coinLabel = 'Currency',
  paymentIcon, paymentLabel = 'Card type',
  value: controlled, defaultValue = '', onValueChange, previewState = 'default',
  id: suppliedId, disabled, placeholder, className = '', onFocus, onBlur, 'aria-describedby': describedBy, ref, ...props
}: InputProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = `${id}-hint`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [local, setLocal] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState('');
  const value = controlled ?? local;
  const isFocused = focused || previewState === 'focus';
  const filled = value !== '';

  function setValue(next: string) {
    if (controlled === undefined) setLocal(next);
    onValueChange?.(next);
  }

  // Focus stays "inside" while it moves between the input and the buttons in the field
  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    setFocused(true);
    if (event.target === inputRef.current) onFocus?.(event as unknown as FocusEvent<HTMLInputElement>);
  }
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    if (event.target === inputRef.current) onBlur?.(event as unknown as FocusEvent<HTMLInputElement>);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(copiedMessage);
    } catch {
      setStatus('');
    }
  }

  const htmlType = action === 'password' ? (revealed ? 'text' : 'password') : inputType ?? (type === 'phone' ? 'tel' : type === 'website' ? 'url' : 'text');
  const labelVisible = !floatingLabel || isFocused || filled;
  const showClear = clearable && filled && !disabled && (type === 'phone' || (type === 'common' && isFocused));
  const message = error || hint;
  const separator = <span className="grg-input__separator" aria-hidden="true" />;
  const icon = (name: IconName | null | undefined, trailing = false): ReactNode =>
    name ? <span className="grg-input__icon" data-trailing={trailing || undefined}><Icon name={name} size={20} /></span> : null;

  const clear = showClear && (
    <ActionButton
      icon="remove"
      size="sm"
      aria-label={clearLabel}
      onMouseDown={e => e.preventDefault()}
      onClick={() => {
        setValue('');
        inputRef.current?.focus();
      }}
    />
  );

  const field = (
    <InputText
      {...props}
      ref={node => {
        inputRef.current = node as HTMLInputElement | null;
        if (typeof ref === 'function') ref(node as HTMLInputElement | null);
        else if (ref) ref.current = node as HTMLInputElement | null;
      }}
      id={id}
      type={htmlType}
      inputMode={INPUT_MODE[type as keyof typeof INPUT_MODE]}
      className="grg-input__control"
      value={value}
      disabled={disabled}
      required={required}
      placeholder={floatingLabel && label ? label : placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={[describedBy, message ? hintId : undefined].filter(Boolean).join(' ') || undefined}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(format(type, e.target.value))}
    />
  );

  return (
    <FormField
      className={`grg-input ${className}`}
      controlId={id}
      hintId={hintId}
      label={label}
      required={required}
      optional={optional}
      info={info}
      labelVisible={labelVisible}
      labelState={isFocused ? 'active' : 'default'}
      hint={hint}
      error={error}
      hintIcon={hintIcon}
      topKey={topKey}
      topValue={topValue}
      bottomValue={bottomValue}
      disabled={disabled}
    >
      <div
        className="grg-input__box"
        data-type={type}
        data-size={size}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-preview-state={previewState === 'hover' ? 'hover' : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {type === 'phone' && (
          <>
            <InlineSelect type="country" options={countries} value={country} onChange={onCountryChange} aria-label={countryLabel} disabled={disabled} />
            {separator}
          </>
        )}
        {type === 'website' && (
          <>
            <span className="grg-input__affix">{prefix ?? 'http://'}</span>
            {separator}
          </>
        )}
        {icon(leftIcon === undefined ? (type === 'card' ? 'card' : type === 'button' ? 'link' : null) : leftIcon)}
        {field}
        {clear}
        {type === 'common' && unit && <span className="grg-input__affix">{unit}</span>}
        {(type === 'common' || type === 'website') && icon(rightIcon, true)}
        {type === 'date' && icon(rightIcon === undefined ? 'calendar' : rightIcon, true)}
        {type === 'card' && paymentIcon && <img className="grg-input__payment" src={paymentIcon} alt={paymentLabel} />}
        {type === 'amount' && (
          <>
            {separator}
            <InlineSelect type="coin" options={coins} value={coin} onChange={onCoinChange} aria-label={coinLabel} disabled={disabled} />
          </>
        )}
        {type === 'button' && action && (
          <>
            {separator}
            {action === 'copy' ? (
              <ActionButton icon="copy" size="sm" aria-label={copyLabel} disabled={disabled} onClick={copy} />
            ) : (
              <ActionButton
                icon={revealed ? 'eye-disable' : 'eye'}
                size="sm"
                aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
                aria-pressed={revealed}
                aria-controls={id}
                disabled={disabled}
                onClick={() => setRevealed(!revealed)}
              />
            )}
          </>
        )}
        <span className="grg-sr-only" role="status">{status}</span>
      </div>
    </FormField>
  );
}
