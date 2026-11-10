import { useEffect, useRef, useState } from 'react';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { DatePickerPanel } from '../../components/DatePicker/DatePickerPanel';
import { defaultPresets, sameDay, type DatePreset } from '../../components/DatePicker/presets';
import { Icon } from '../../components/Icon/Icon';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { formatDay, formatPeriod } from '../../locale/format';

/* The period select of the GRX Pay screens (Dashboard, Invoices): the Figma periods, then Custom period… which opens
   the system's calendar under the select. Not the admin's Filter. */

export const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
export const pad = (n: number) => String(n).padStart(2, '0');
/** A day, as Foundations → Formats writes it: 10 Nov 2026 */
export const date = (d: Date) => formatDay(d);

/** The periods of the Figma Time period list */
export const PERIODS: DatePreset[] = [
  { id: 'today', label: 'Today', range: today => [startOf(today), startOf(today)] },
  { id: 'this-week', label: 'This week', range: today => { const monday = shift(today, -((today.getDay() + 6) % 7)); return [monday, shift(monday, 6)]; } },
  { id: 'this-month', label: 'This month', range: today => [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)] },
  { id: 'last-30-days', label: 'Last 30 days', range: today => [shift(today, -29), startOf(today)] },
  { id: 'last-month', label: 'Last month', range: today => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)] },
];
export type Range = [Date, Date];
export const thisMonth = () => PERIODS[2].range(new Date()) as Range;

/** A period's name: its preset, or its dates */
export const periodName = ([from, to]: Range) => PERIODS.find(p => { const r = p.range(new Date()); return r && sameDay(r[0], from) && sameDay(r[1], to); })?.label
  ?? formatPeriod(from, to);

/** `allLabel` adds "all time" at the top of the list (value null), as the Invoices filter "All period" */
export function PeriodSelect({ value, onChange, allLabel, 'aria-label': label = 'Period' }: {
  value: Range | null; onChange: (value: Range | null) => void; allLabel?: string; 'aria-label'?: string;
}) {
  const [calendar, setCalendar] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const name = value ? periodName(value) : allLabel ?? '';
  const preset = value ? PERIODS.find(p => p.label === name) : undefined;
  // The list: all time (when offered), the Figma periods, a custom period once chosen (its dates, checked), then Custom period…
  const options = [
    ...(allLabel ? [{ value: 'all', label: allLabel }] : []),
    ...PERIODS.map(p => ({ value: p.id, label: p.label })),
    ...(value && !preset ? [{ value: 'chosen', label: name }] : []),
    { value: 'custom', label: 'Custom period…', icon: 'calendar' as const },
  ];
  // The calendar closes with Escape or a click outside, and gives focus back to the select
  useEffect(() => {
    if (!calendar) return;
    const close = () => { setCalendar(false); root.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setCalendar(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [calendar]);
  return (
    <span ref={root} className="grg-ip-period">
      <CompactSelect size="sm" aria-label={label} options={options} value={!value ? 'all' : preset?.id ?? 'chosen'}
        onChange={next => {
          if (next === 'custom') setCalendar(true);
          else if (next === 'all') onChange(null);
          else { const range = PERIODS.find(p => p.id === next)?.range(new Date()); if (range) onChange(range as Range); }
        }} />
      {/* Custom period: the system's calendar, two months with Reset / Apply, under the select */}
      {calendar && (
        <div className="grg-ip-period__calendar" role="dialog" aria-label="Choose a period">
          <DatePickerPanel selectionMode="range" double value={value ?? undefined}
            onChange={next => { if (Array.isArray(next) && next[0]) onChange([next[0], next[1] ?? next[0]]); }}
            onApply={() => { setCalendar(false); root.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus(); }} />
        </div>
      )}
    </span>
  );
}

/** Figma Invoices: the Date Picker's own presets, "All time" named "All period" */
const LIST_PRESETS: DatePreset[] = defaultPresets.slice(0, 6).map(p => (p.id === 'all' ? { ...p, label: 'All period' } : p));
const listName = (value: Range | null) => !value ? 'All period'
  : LIST_PRESETS.find(p => { const r = p.range(new Date()); return r && sameDay(r[0], value[0]) && sameDay(r[1], value[1]); })?.label
    ?? formatPeriod(value[0], value[1]);

/**
 * Figma Invoices: a select that opens the whole Date Picker, its presets on the left and the calendar with Reset / Apply.
 * The trigger is the Compact Select's (the same classes, so it looks and behaves like the selects beside it); a list
 * can't hold a calendar, so the panel is the system's DatePickerPanel in a dialog under it, lined up with its right edge.
 */
export function PeriodPicker({ value, onChange, 'aria-label': label = 'Period' }: { value: Range | null; onChange: (value: Range | null) => void; 'aria-label'?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  useKeyboardNavigation(box);
  const name = listName(value);
  const close = (focus = true) => { setOpen(false); if (focus) root.current?.querySelector<HTMLElement>('button')?.focus(); };
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  });
  return (
    <span ref={root} className="grg-ip-period">
      <span ref={box} className="grg-compact-select" data-type="default" data-size="sm" data-open={open || undefined}>
        <button type="button" className="grg-compact-select__box grg-ip-period__button" aria-haspopup="dialog" aria-expanded={open}
          aria-label={`${label}: ${name}`} onClick={() => setOpen(!open)}>
          <span className="grg-compact-select__value"><span className="grg-compact-select__text">{name}</span></span>
          <span className="grg-compact-select__trigger" aria-hidden="true"><Icon name={open ? 'direction-up' : 'direction-down'} size={20} /></span>
        </button>
      </span>
      {open && (
        <div className="grg-ip-period__calendar" role="dialog" aria-label="Choose a period">
          <DatePickerPanel selectionMode="range" presets={LIST_PRESETS} value={value ?? null}
            onChange={next => onChange(Array.isArray(next) && next[0] ? [next[0], next[1] ?? next[0]] : null)}
            onApply={() => close()} />
        </div>
      )}
    </span>
  );
}
