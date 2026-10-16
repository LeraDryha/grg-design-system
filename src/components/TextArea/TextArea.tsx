import { useId, useLayoutEffect, useRef, useState, type ChangeEvent, type ComponentPropsWithRef, type KeyboardEvent, type PointerEvent } from 'react';
import { Icon } from '../Icon/Icon';
import { InputTextarea } from 'primereact/inputtextarea';
import { FormField } from '../FormField/FormField';
import { CharacterCounter } from './CharacterCounter';
import './TextArea.css';

/** Figma "Text Area" component set (77:484318): State × Filled × Size, with Top/Bottom rows and a Character counter. */
export type TextAreaProps = Omit<ComponentPropsWithRef<'textarea'>, 'value' | 'defaultValue' | 'children'> & {
  /** Figma Size: lg (44px base input), md (40px), sm (32px). Only the paddings change; lg for a standalone field. */
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
  /** Error message: red border, red hint and counter, announced with the field */
  error?: string;
  hintIcon?: boolean;
  /** Top right (Figma Key: Value) */
  topKey?: string;
  topValue?: string;
  /** Bottom right (Figma Value) */
  bottomValue?: string;
  /** Figma Character counter. Shows "count/maxLength", or just the count without a limit. */
  counter?: boolean;
  /** The character limit. Typing past it is allowed, so pasted text isn't cut off; the field shows an error instead. */
  maxLength?: number;
  /** Error shown over the limit, unless `error` is set */
  limitError?: string;
  /** The resize handle at the bottom right (Figma "16/resize"): drag it, or use the arrow keys, to change the height */
  resizable?: boolean;
  /** Name of the resize handle for screen readers and its tooltip */
  resizeLabel?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'focus';
};

/** PrimeReact InputTextarea (unstyled) inside the shared field frame, as Input. Figma is the source of every value in TextArea.css. */
export function TextArea({
  size = 'lg', label, floatingLabel = true, required, optional, info,
  hint, error, hintIcon = true, topKey, topValue, bottomValue,
  counter = true, maxLength, limitError = 'Character limit exceeded.', resizable = true, resizeLabel = 'Resize text area',
  value: controlled, defaultValue = '', onValueChange, previewState = 'default',
  id: suppliedId, disabled, placeholder, className = '', onFocus, onBlur, rows = 3, 'aria-describedby': describedBy, ref, ...props
}: TextAreaProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = `${id}-hint`;
  const counterId = `${id}-counter`;
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ y: number; height: number } | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  // The handle reports the height to screen readers (a focusable separator needs a value)
  const [bounds, setBounds] = useState({ now: 0, min: 0, max: 0 });
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const { min, max } = limits();
    setBounds({ now: Math.round(box.getBoundingClientRect().height), min, max: Number.isFinite(max) ? max : min });
  }, [height]);
  const [local, setLocal] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const value = controlled ?? local;
  const isFocused = focused || previewState === 'focus';
  const filled = value !== '';
  const overLimit = maxLength !== undefined && value.length > maxLength;
  const shownError = error || (overLimit ? limitError : undefined);
  const labelVisible = !floatingLabel || isFocused || filled;

  /* Resizing: the field grows down and back from its starting height (122px, Figma) to 400px, about
     14 lines; past that the text scrolls. The limits come from CSS (min-height, max-height), so they stay tokens. */
  function limits() {
    const style = boxRef.current ? getComputedStyle(boxRef.current) : null;
    return { min: parseFloat(style?.minHeight ?? '0') || 0, max: parseFloat(style?.maxHeight ?? '') || Infinity };
  }
  function resizeTo(next: number) {
    const { min, max } = limits();
    setHeight(Math.round(Math.min(max, Math.max(min, next))));
  }
  function startDrag(event: PointerEvent<HTMLSpanElement>) {
    if (!boxRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, height: boxRef.current.getBoundingClientRect().height };
  }
  function moveDrag(event: PointerEvent<HTMLSpanElement>) {
    if (drag.current) resizeTo(drag.current.height + event.clientY - drag.current.y);
  }
  function endDrag() {
    drag.current = null;
  }
  // Arrow keys change the height by one line (20px), Home and End jump to the limits
  function resizeWithKeys(event: KeyboardEvent<HTMLSpanElement>) {
    const current = boxRef.current?.getBoundingClientRect().height ?? 0;
    const { min, max } = limits();
    const next = { ArrowDown: current + 20, ArrowUp: current - 20, Home: min, End: max }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    resizeTo(next);
  }

  function setValue(next: string) {
    if (controlled === undefined) setLocal(next);
    onValueChange?.(next);
  }

  return (
    <FormField
      className={`grg-textarea ${className}`}
      controlId={id}
      hintId={hintId}
      label={label}
      required={required}
      optional={optional}
      info={info}
      labelVisible={labelVisible}
      labelState={isFocused ? 'active' : 'default'}
      hint={hint}
      error={shownError}
      hintIcon={hintIcon}
      topKey={topKey}
      topValue={topValue}
      bottomValue={bottomValue}
      disabled={disabled}
    >
      <div
        ref={boxRef}
        style={height === null ? undefined : { height }}
        className="grg-textarea__box"
        data-size={size}
        data-invalid={shownError ? true : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-preview-state={previewState === 'hover' ? 'hover' : undefined}
        // A click on the empty part of the field (around the counter) puts the cursor in the text.
        // On click, not mouse down: mouse down on the corner starts resizing the field.
        onClick={e => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.grg-textarea__counter')) areaRef.current?.focus();
        }}
      >
        <InputTextarea
          {...props}
          ref={node => {
            areaRef.current = node as HTMLTextAreaElement | null;
            if (typeof ref === 'function') ref(node as HTMLTextAreaElement | null);
            else if (ref) ref.current = node as HTMLTextAreaElement | null;
          }}
          id={id}
          rows={rows}
          className="grg-textarea__control"
          value={value}
          disabled={disabled}
          required={required}
          placeholder={floatingLabel && label ? label : placeholder}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={[describedBy, shownError || hint ? hintId : undefined, counter ? counterId : undefined].filter(Boolean).join(' ') || undefined}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        />
        {(counter || resizable) && (
          <span className="grg-textarea__counter" data-state={disabled ? 'disabled' : shownError ? 'error' : 'default'}>
            {counter && (
              <CharacterCounter
                id={counterId}
                count={value.length}
                max={maxLength}
                state={disabled ? 'disabled' : shownError ? 'error' : 'default'}
                resizeIcon={false}
              />
            )}
            {resizable && (
              // The Figma resize icon, made a real handle: drag it down or back up, or focus it and use the arrow keys.
              // A separator is the ARIA role for a handle that resizes the area before it.
              <span
                className="grg-textarea__resize"
                role={disabled ? undefined : 'separator'}
                aria-orientation="horizontal"
                aria-label={disabled ? undefined : resizeLabel}
                aria-hidden={disabled || undefined}
                title={disabled ? undefined : `${resizeLabel}: drag or use the arrow keys`}
                tabIndex={disabled ? undefined : 0}
                aria-valuenow={disabled ? undefined : bounds.now}
                aria-valuemin={disabled ? undefined : bounds.min}
                aria-valuemax={disabled ? undefined : bounds.max}
                aria-valuetext={disabled ? undefined : `${bounds.now} pixels tall`}
                onPointerDown={disabled ? undefined : startDrag}
                onPointerMove={disabled ? undefined : moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={disabled ? undefined : resizeWithKeys}
              >
                <Icon name="resize" size={16} />
              </span>
            )}
          </span>
        )}
      </div>
    </FormField>
  );
}
