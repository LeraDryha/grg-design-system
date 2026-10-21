import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { InputOtp as PrimeInputOtp, type InputOtpProps as PrimeInputOtpProps } from 'primereact/inputotp';
import { InputText } from 'primereact/inputtext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { HintText } from '../FormField/FormField';
import { Icon } from '../Icon/Icon';
import './InputOtp.css';

/** Figma "OTP Input" (1447:19647) built from "OTP cells" (1447:17544): State × Type. */
export type InputOtpProps = {
  /** Name of the code for screen readers, such as "Verification code". Not shown: the heading above the cells names it on screen. */
  label: string;
  /** Number of cells. Figma shows 6; 4 to 8 */
  length?: number;
  /** Which characters a cell takes. any: digits, letters and symbols. digits: numbers only, with the number keyboard on phones */
  characters?: 'any' | 'digits';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every cell is filled, with the whole code: check it here */
  onComplete?: (value: string) => void;
  /** Help text under the cells (Figma Hint text) */
  hint?: string;
  /** Error message: every cell turns red (Figma State = Error), the message replaces the hint */
  error?: string;
  /** Warning icon before the hint (Figma Hint text Icon) */
  hintIcon?: boolean;
  /** Figma State = Disabled */
  disabled?: boolean;
  /** The code is being checked: the cells lock, a spinner turns under them and `loadingLabel` is announced */
  loading?: boolean;
  loadingLabel?: string;
  /** Name of each cell for screen readers; {index} and {length} are replaced. "Digit …" or "Character …" by default */
  cellLabel?: string;
  autoFocus?: boolean;
  id?: string;
  className?: string;
};

type TemplateOptions = {
  events: {
    onInput: (event: FormEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onFocus: (event: FormEvent<HTMLInputElement>) => void;
    onBlur: (event: FormEvent<HTMLInputElement>) => void;
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  };
  props: { value: string; tabIndex?: number; autoFocus?: boolean; 'data-index': number };
};

/** Pasted or autofilled text: spaces go; digits keeps numbers only; a code longer than the cells also loses its hyphens ("123-456"). */
function clean(text: string, characters: InputOtpProps['characters'], length: number) {
  const compact = text.replace(/\s/g, '');
  if (characters === 'digits') return compact.replace(/\D/g, '');
  return compact.length > length ? compact.replace(/-/g, '') : compact;
}

/**
 * PrimeReact InputOtp (unstyled) gives the cells, typing from cell to cell, Backspace and the arrow keys.
 * Its template adds what PrimeReact leaves out: autofill of a code from SMS or email (one-time-code),
 * pasting from any cell (PrimeReact keeps one character too many and refuses "123 456"), Delete,
 * typing over a filled cell, a name for every cell and the hint for screen readers.
 */
export function InputOtp({
  label, length = 6, characters = 'any', value: controlled, defaultValue = '', onValueChange, onComplete,
  hint, error, hintIcon = true, disabled = false, loading = false, loadingLabel = 'Verifying code',
  cellLabel, autoFocus, id: suppliedId, className = '',
}: InputOtpProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  useKeyboardNavigation(rootRef);
  const [local, setLocal] = useState(defaultValue.slice(0, length));
  const value = (controlled ?? local).slice(0, length);
  // While the code is checked the spinner takes the hint's place
  const message = loading ? undefined : error || hint;
  const locked = disabled || loading;
  const cellName = cellLabel ?? (characters === 'digits' ? 'Digit {index} of {length}' : 'Character {index} of {length}');

  function setValue(next: string) {
    if (next === value) return;
    if (controlled === undefined) setLocal(next);
    onValueChange?.(next);
    if (next.length === length) onComplete?.(next);
  }

  const cells = () => Array.from(rootRef.current?.querySelectorAll<HTMLInputElement>('input') ?? []);
  function focusCell(index: number) {
    const cell = cells()[Math.min(index, length - 1)];
    cell?.focus();
    cell?.select();
  }

  /** Several characters at once, from the cell they arrive in; a whole code always starts at the first cell */
  function fill(from: number, text: string) {
    const code = clean(text, characters, length);
    if (!code || locked) return;
    const start = code.length >= length ? 0 : Math.min(from, value.length);
    const next = (value.slice(0, start) + code).slice(0, length);
    setValue(next);
    requestAnimationFrame(() => focusCell(next.length));
  }

  // After the check the cells unlock; if it failed, focus goes back to the last cell to correct it
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current && !loading && error && rootRef.current?.contains(document.activeElement)) focusCell(value.length - 1);
    wasLoading.current = loading;
  });

  const template = ({ events, props }: TemplateOptions) => {
    const index = props['data-index'];
    return (
      <InputText
        className="grg-otp__cell"
        value={props.value}
        type="text"
        inputMode={characters === 'digits' ? 'numeric' : 'text'}
        // Phones offer the code from the SMS or the email in the first cell; it is spread over all of them
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={props.autoFocus}
        tabIndex={props.tabIndex}
        disabled={disabled}
        readOnly={loading}
        // Locked while the code is checked, but focus stays where it was
        aria-disabled={loading || undefined}
        aria-label={cellName.replace('{index}', String(index + 1)).replace('{length}', String(length))}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? hintId : undefined}
        data-index={index}
        onFocus={events.onFocus}
        onBlur={events.onBlur}
        onPaste={event => {
          event.preventDefault();
          fill(index, event.clipboardData.getData('text'));
        }}
        onKeyDown={event => {
          // PrimeReact's Delete looks the cell up by an id it never sets: clear the cell here
          if (event.key === 'Delete' && !locked) {
            event.preventDefault();
            setValue(value.slice(0, index) + value.slice(index + 1));
            return;
          }
          // A character typed into a filled cell replaces it, even when a click left the caret beside it
          // (PrimeReact refuses typing into a full code without a selection)
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) event.currentTarget.select();
          events.onKeyDown(event);
        }}
        onInput={(event: FormEvent<HTMLInputElement>) => {
          const input = event.currentTarget;
          const native = event.nativeEvent as InputEvent;
          if (locked || native.inputType === 'insertFromPaste') return;
          // Typing into a filled cell keeps the new character only
          if (native.inputType === 'insertText' && native.data && input.value.length > 1) input.value = native.data.slice(-1);
          // Autofill brings the whole code into one cell
          else if (input.value.length > 1) {
            fill(index, input.value);
            input.value = props.value;
            return;
          }
          if (input.value && !clean(input.value, characters, length)) {
            input.value = props.value;
            return;
          }
          events.onInput(event);
        }}
      />
    );
  };

  return (
    <div
      ref={rootRef}
      className={`grg-otp ${className}`}
      data-invalid={error ? true : undefined}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
    >
      <span id={labelId} className="grg-sr-only">{label}</span>
      <div role="group" aria-labelledby={labelId} aria-describedby={message ? hintId : undefined} aria-busy={loading || undefined}>
        <PrimeInputOtp
          // Unstyled PrimeReact drops className on InputOtp; pt reaches its root
          pt={{ root: { className: 'grg-otp__cells' } }}
          value={value}
          length={length}
          integerOnly={characters === 'digits'}
          disabled={disabled}
          invalid={!!error}
          autoFocus={autoFocus}
          // `readonly` in the types, `readOnly` in the code: PrimeReact ignores typing while the code is checked
          {...({ readOnly: loading } as Partial<PrimeInputOtpProps>)}
          onChange={event => setValue(String(event.value ?? ''))}
          inputTemplate={template as unknown as PrimeInputOtpProps['inputTemplate']}
        />
      </div>
      {loading && <span className="grg-otp__loader"><Icon name="loading" size={24} /></span>}
      {message && (
        <HintText id={hintId} state={disabled ? 'disabled' : error ? 'error' : 'default'} icon={hintIcon}>{message}</HintText>
      )}
      <span className="grg-sr-only" role="status">{loading ? loadingLabel : ''}</span>
    </div>
  );
}
