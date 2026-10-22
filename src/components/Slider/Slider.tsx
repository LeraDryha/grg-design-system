import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Slider as PrimeSlider } from 'primereact/slider';
import { ActionButton } from '../ActionButton/ActionButton';
import './Slider.css';

/* Figma page ❖ Slider: "Slider" (738:27965), "Range slider" (738:28938), "Control handle" (738:6802),
   "Usage Guidelines" (747:8144) and "Examples" (747:8246). */

type Value = number | [number, number];

export type SliderProps<V extends Value = Value> = {
  /** One number, or two for a range (Figma Range slider): the handles can't pass each other */
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** Any limits and step; Figma shows 0–100% in steps of 25% only as an example */
  min?: number;
  max?: number;
  step?: number;
  /** Figma Label */
  label?: string;
  /** Figma Sublabel, such as "(Optional)" */
  sublabel?: string;
  /** Name for a slider without a visible label */
  'aria-label'?: string;
  /** Figma Value: the current value top right (both values for a range) */
  showValue?: boolean;
  /** How a value is written, such as `v => `${v} USDT``; the number by default */
  format?: (value: number) => string;
  /** Figma Control handle: nothing, the value under the handle (Text), or above it while hovered, focused or dragged (Tooltip) */
  handleValue?: 'none' | 'text' | 'tooltip';
  /** − and + at the ends that move by one step, as in the Figma photo example */
  steppers?: boolean;
  /** Names of the range handles for screen readers */
  rangeLabels?: [string, string];
  disabled?: boolean;
  className?: string;
};

/**
 * Picks a number, or a range, by dragging along a track: an amount, a price range, a zoom. PrimeReact Slider (unstyled)
 * gives the dragging and the keys (arrows, PageUp / PageDown, Home / End); the look is the Figma track and handle.
 */
export function Slider<V extends Value = number>({
  value: controlled, defaultValue, onChange, min = 0, max = 100, step = 1, label, sublabel, 'aria-label': ariaLabel,
  showValue = true, format = String, handleValue = 'none', steppers = false, rangeLabels = ['Minimum', 'Maximum'], disabled = false,
  className = '',
}: SliderProps<V>) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const range = Array.isArray(controlled ?? defaultValue);
  const [local, setLocal] = useState<Value>(defaultValue ?? (range ? [min, max] : min));
  const value = (controlled ?? local) as Value;
  const values = Array.isArray(value) ? value : [value];
  const percent = (number: number) => ((Math.min(Math.max(number, min), max) - min) * 100) / (max - min);
  const text = values.map(format).join(' – ');

  const change = (next: Value) => {
    if (controlled === undefined) setLocal(next);
    onChange?.(next as V);
  };

  /* PrimeReact gives each handle the position in percent as its value, and both handles the same name: each handle
     gets its real value, its text and, in a range, its own name */
  useLayoutEffect(() => {
    const handles = root.current?.querySelectorAll<HTMLElement>('[role="slider"]') ?? [];
    handles.forEach((handle, index) => {
      handle.setAttribute('aria-valuenow', String(values[index]));
      handle.setAttribute('aria-valuetext', format(values[index]));
      handle.setAttribute('data-handle', String(index));
      if (label) handle.setAttribute('aria-labelledby', range ? `${id}-label ${id}-handle-${index}` : `${id}-label`);
      else handle.setAttribute('aria-label', range ? `${ariaLabel ?? ''} ${rangeLabels[index]}`.trim() : ariaLabel ?? '');
      if (sublabel) handle.setAttribute('aria-describedby', `${id}-sublabel`);
      if (disabled) handle.setAttribute('aria-disabled', 'true');
      else handle.removeAttribute('aria-disabled');
      if (disabled) handle.setAttribute('tabindex', '-1');
    });
  });

  const nudge = (direction: 1 | -1) => {
    if (Array.isArray(value)) return;
    change(Math.min(max, Math.max(min, value + direction * step)));
  };

  return (
    <div className={`grg-slider ${className}`} data-disabled={disabled || undefined} data-handle-value={handleValue}>
      {(label || (showValue && !steppers)) && (
        <div className="grg-slider__head">
          {label && (
            <span className="grg-slider__title">
              <span className="grg-slider__label" id={`${id}-label`}>{label}</span>
              {sublabel && <span className="grg-slider__sublabel" id={`${id}-sublabel`}>{sublabel}</span>}
            </span>
          )}
          {showValue && <span className="grg-slider__value" aria-hidden="true">{text}</span>}
        </div>
      )}
      {range && rangeLabels.map((name, index) => <span key={name} id={`${id}-handle-${index}`} hidden>{name}</span>)}
      <div className="grg-slider__row">
        {steppers && !range && (
          <ActionButton icon="minus" size="sm" aria-label={`Less${label ? `: ${label}` : ''}`} disabled={disabled || values[0] <= min} onClick={() => nudge(-1)} />
        )}
        <div className="grg-slider__track-box" ref={root}>
          <PrimeSlider
            value={value as never}
            range={range}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={event => change(event.value as Value)}
            pt={{
              root: { className: 'grg-slider__track' },
              range: { className: 'grg-slider__fill' },
              handle: { className: 'grg-slider__handle' },
            } as object}
          />
          {handleValue !== 'none' && values.map((number, index) => (
            <span key={index} className="grg-slider__bubble" data-index={index} style={{ left: `${percent(number)}%` }} aria-hidden="true">
              {format(number)}
            </span>
          ))}
        </div>
        {steppers && !range && (
          <ActionButton icon="plus" size="sm" aria-label={`More${label ? `: ${label}` : ''}`} disabled={disabled || values[0] >= max} onClick={() => nudge(1)} />
        )}
      </div>
    </div>
  );
}
