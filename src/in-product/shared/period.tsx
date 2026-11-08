import { useEffect, useRef, useState } from 'react';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { DatePickerPanel } from '../../components/DatePicker/DatePickerPanel';
import { sameDay, type DatePreset } from '../../components/DatePicker/presets';

/* The period select of the GRX Pay screens (Dashboard, Invoices): the Figma periods, then Custom period… which opens
   the system's calendar under the select. Not the admin's Filter. */

export const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
export const pad = (n: number) => String(n).padStart(2, '0');
/** dd/mm/yyyy */
export const date = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

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
  ?? `${date(from)} – ${date(to)}`;

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
