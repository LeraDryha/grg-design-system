import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { dateLocale, type DateLocale } from '../../locale/dates';
import { DatePickerPanel, type DatePickerPanelProps, type DatePickerValue, type DateRangeValue } from './DatePickerPanel';
import './DatePicker.css';

export type { DatePickerValue, DateRangeValue };

export type DatePickerProps = Omit<DatePickerPanelProps, 'onApply' | 'className' | 'aria-label'> &
  Pick<InputProps, 'label' | 'floatingLabel' | 'hint' | 'error' | 'required' | 'optional' | 'info' | 'size' | 'disabled' | 'name' | 'id'> & {
    /** Initial value when the product doesn't control it */
    defaultValue?: DatePickerValue;
    /** Name of the open calendar for screen readers; "Choose a date" or "Choose a period" by default */
    calendarLabel?: string;
    className?: string;
  };

const RANGE_DASH = ' – ';

const textOf = (value: DatePickerValue | undefined, dl: DateLocale, month: boolean) => {
  if (!value) return '';
  if (Array.isArray(value)) return value[0] ? `${dl.format(value[0])}${value[1] ? RANGE_DASH + dl.format(value[1]) : ''}` : '';
  return month ? dl.formatMonth(value) : dl.format(value);
};

/** A period typed as digits: the start, a dash, then the end, each in the locale's format */
const formatRangeDigits = (raw: string, dl: DateLocale) => {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  const first = dl.formatDigits(digits.slice(0, 8));
  return digits.length > 8 ? first + RANGE_DASH + dl.formatDigits(digits.slice(8)) : first;
};

/**
 * A date field with the calendar under it: the system's Input (Date type) and the Date picker panel.
 * People can type the date in their locale's format, or open the calendar with a click, ↓ or Alt + ↓.
 */
export function DatePicker({
  value: controlled, defaultValue = null, onChange, selectionMode = 'single', view = 'date', locale, buttons,
  label, floatingLabel, hint, error, required, optional, info, size, disabled, name, id: suppliedId,
  calendarLabel, className = '', ...panel
}: DatePickerProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const overlayId = `${id}-calendar`;
  const dl = dateLocale(locale);
  const range = selectionMode === 'range';
  const month = view === 'month';
  const withButtons = buttons ?? range;
  const rootRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<DatePickerValue>(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const [text, setText] = useState(() => textOf(value, dl, month));
  const [open, setOpen] = useState(false);

  // The field shows the value whenever it changes from outside or from the calendar
  useEffect(() => setText(textOf(value, dl, month)), [value, dl, month]);

  const set = (next: DatePickerValue) => {
    if (controlled === undefined) setLocal(next);
    onChange?.(next);
  };

  const input = () => rootRef.current?.querySelector<HTMLInputElement>('input');
  const close = (focusField = true) => {
    setOpen(false);
    if (focusField) input()?.focus();
  };
  // From the keyboard, focus moves into the calendar: the chosen day, else today, else the first day that can be chosen
  const focusDay = () => {
    const overlay = rootRef.current?.querySelector<HTMLElement>('.grg-date-picker__overlay');
    const cell =
      overlay?.querySelector<HTMLElement>('.grg-calendar__day-label[data-p-highlight="true"], .grg-calendar__month[data-p-highlight="true"]') ??
      overlay?.querySelector<HTMLElement>('.p-datepicker-today .grg-calendar__day-label') ??
      overlay?.querySelector<HTMLElement>('.grg-calendar__day-label:not([data-p-disabled="true"]), .grg-calendar__month:not([data-p-disabled="true"])');
    if (!cell) return;
    cell.tabIndex = 0;
    cell.focus();
  };
  const openCalendar = (withFocus: boolean) => {
    if (disabled) return;
    setOpen(true);
    // PrimeReact redraws the days once after mounting, so focus waits for that redraw
    if (withFocus) setTimeout(focusDay, 50);
  };

  // A click outside closes the calendar without changing anything
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  const typed = (next: string) => {
    if (range) {
      const shaped = formatRangeDigits(next, dl);
      setText(shaped);
      if (!shaped) return set(null);
      const [a, b] = shaped.split(RANGE_DASH).map(part => dl.parse(part));
      if (a && b && a <= b) set([a, b]);
      return;
    }
    setText(next);
    if (!next) return set(null);
    const date = dl.parse(next);
    if (date) set(date);
  };

  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || (month && (event.key === 'Enter' || event.key === ' '))) {
      event.preventDefault();
      openCalendar(true);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`grg-date-picker ${className}`}
      onClick={event => {
        // A click anywhere in the field box opens the calendar; clicks inside the calendar don't toggle it
        if ((event.target as HTMLElement).closest('.grg-input__box')) openCalendar(false);
      }}
      onKeyDown={event => {
        // Escape inside the calendar closes it and returns to the field; inside an open month or year list, only the list closes
        const target = event.target as HTMLElement;
        if (event.key === 'Escape' && open && target.closest('.grg-date-picker__overlay') && !target.closest('[role="menu"], [role="menubar"]')) {
          event.preventDefault();
          close();
        }
      }}
    >
      <Input
        id={id}
        name={name}
        type={range || month ? 'common' : 'date'}
        locale={locale}
        label={label}
        floatingLabel={floatingLabel}
        hint={hint}
        error={error}
        required={required}
        optional={optional}
        info={info}
        size={size}
        disabled={disabled}
        readOnly={month}
        leftIcon={null}
        rightIcon={range || month ? 'calendar-01' : undefined}
        inputMode={range ? 'numeric' : undefined}
        clearable={false}
        value={text}
        onValueChange={typed}
        onKeyDown={onFieldKeyDown}
        // A combobox that opens a dialog: the ARIA pattern for a date field with a calendar
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? overlayId : undefined}
        autoComplete="off"
      />
      {open && (
        <div className="grg-date-picker__overlay" id={overlayId} role="dialog" aria-label={calendarLabel ?? (range ? 'Choose a period' : month ? 'Choose a month' : 'Choose a date')}>
          <DatePickerPanel
            {...panel}
            selectionMode={selectionMode}
            view={view}
            locale={locale}
            buttons={withButtons}
            value={value}
            onChange={next => {
              set(next);
              // Without buttons, a complete choice closes the calendar
              const complete = Array.isArray(next) ? !!next[0] && !!next[1] : !!next;
              if (!withButtons && complete) close();
            }}
            onApply={() => close()}
          />
        </div>
      )}
    </div>
  );
}
