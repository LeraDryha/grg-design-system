import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react';
import { Calendar } from 'primereact/calendar';
import { ListBox } from 'primereact/listbox';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { dateLocale } from '../../locale/dates';
import { defaultPresets, sameDay, type DatePreset } from './presets';
import './DatePicker.css';

/** One date, or a period as [start, end]; the end is null while only the start is chosen */
export type DateRangeValue = [Date | null, Date | null];
export type DatePickerValue = Date | DateRangeValue | null;

/** Figma "Date picker" (272:2619): Double × Presets × Buttons, built on PrimeReact Calendar. */
export type DatePickerPanelProps = {
  /** Figma Variants / Type: Default (one date) or Range */
  selectionMode?: 'single' | 'range';
  value?: DatePickerValue;
  /** Called with the chosen date or period: at once, or on Apply when there are buttons */
  onChange?: (value: DatePickerValue) => void;
  /** Figma Double: two months side by side, for periods across a month boundary */
  double?: boolean;
  /** Figma Presets: ready-made periods on the left. true shows the Figma list; or pass your own. Range only. */
  presets?: boolean | DatePreset[];
  /** Figma Buttons: Reset and Apply; the choice is applied only on Apply. On by default for a period. */
  buttons?: boolean;
  /** Month: a grid of months for choosing a whole month (Figma Month) instead of days */
  view?: 'date' | 'month';
  /** The locale for month and day names and the first day of the week; the page or browser language by default */
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  /** Years in the year list; ten years either side of today by default */
  yearRange?: [number, number];
  /** Called on Apply, after onChange; a field closes its panel here */
  onApply?: () => void;
  resetLabel?: string;
  applyLabel?: string;
  /** Name of the calendar for screen readers */
  'aria-label'?: string;
  className?: string;
};

type CalendarDate = { day: number; month: number; year: number; today: boolean; otherMonth: boolean };

const isRange = (v: DatePickerValue | undefined): v is DateRangeValue => Array.isArray(v);
const today = () => new Date();

/**
 * The open calendar: optional presets, one or two months and Reset / Apply. PrimeReact Calendar (inline, unstyled)
 * gives the grid, the keyboard and the ARIA; the month and year lists are the system's Dropdown Menu.
 */
export function DatePickerPanel({
  selectionMode = 'single', value = null, onChange, double = false, presets = false, buttons, view = 'date',
  locale, minDate, maxDate, disabledDates, yearRange, onApply, resetLabel = 'Reset', applyLabel = 'Apply',
  'aria-label': label, className = '',
}: DatePickerPanelProps) {
  const id = useId();
  const dl = dateLocale(locale);
  const range = selectionMode === 'range';
  const withButtons = buttons ?? range;
  const presetList = range && presets ? (presets === true ? defaultPresets : presets) : [];
  const [draft, setDraft] = useState<DatePickerValue>(value);
  // The panel follows a value set from outside, such as a date typed into the field
  useEffect(() => setDraft(value), [value]);
  /* The month on screen belongs to PrimeReact, so its arrows, keys and focus work as designed. The panel only moves
     it on purpose: to a chosen preset, or to a date typed into the field ("jump", cleared once applied). */
  const [jump, setJump] = useState<Date>();
  useEffect(() => { if (jump) setJump(undefined); }, [jump]);
  const fromCalendar = useRef(false);
  useEffect(() => {
    if (fromCalendar.current) { fromCalendar.current = false; return; }
    const date = isRange(value) ? value[0] : value;
    if (date) setJump(new Date(date.getFullYear(), date.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  // The first header draws both lists; the second month's year is worked out from the first month's
  const header = useRef({ month: 0, firstYear: true });

  const commit = (next: DatePickerValue) => {
    fromCalendar.current = true;
    setDraft(next);
    if (!withButtons) onChange?.(next);
  };

  // Which preset matches the period on screen; "All time" matches no period
  const now = today();
  const activePreset = presetList.find(p => {
    const r = p.range(now);
    if (!r) return !isRange(draft) || (!draft[0] && !draft[1]);
    return isRange(draft) && sameDay(draft[0], r[0]) && sameDay(draft[1], r[1]);
  })?.id;

  const [start, end] = isRange(draft) ? draft : [draft, null];
  const position = (date: { day: number; month: number; year: number }) => {
    if (!range || !start) return undefined;
    const d = new Date(date.year, date.month, date.day);
    if (sameDay(d, start) && (!end || sameDay(d, end))) return 'single';
    if (sameDay(d, start)) return 'start';
    if (end && sameDay(d, end)) return 'end';
    if (end && d > start && d < end) return 'middle';
    return undefined;
  };

  const years = yearRange ?? [now.getFullYear() - 10, now.getFullYear() + 10];
  const yearOptions = Array.from({ length: years[1] - years[0] + 1 }, (_, i) => years[0] + i)
    .filter(y => (!minDate || y >= minDate.getFullYear()) && (!maxDate || y <= maxDate.getFullYear()));
  const navigatorTrigger = (text: string) => (props: Parameters<NonNullable<Parameters<typeof DropdownMenu>[0]['trigger']>>[0]) => (
    <Button {...props} variant="text" size="sm" leftIcon={undefined} rightIcon={props['aria-expanded'] ? 'direction-up' : 'direction-down'}>{text}</Button>
  );

  return (
    <div className={`grg-date-panel ${className}`} data-presets={presetList.length > 0 || undefined} role="group" aria-label={label ?? (range ? 'Choose a period' : 'Choose a date')}>
      {presetList.length > 0 && (
        <>
          <ListBox
            className="grg-date-panel__presets"
            options={presetList}
            optionLabel="label"
            optionValue="id"
            optionDisabled="disabled"
            value={activePreset ?? null}
            onChange={e => {
              const preset = presetList.find(p => p.id === e.value);
              if (!preset) return;
              const r = preset.range(today());
              commit(r);
              if (r) setJump(new Date(r[1].getFullYear(), r[1].getMonth() - (double ? 1 : 0), 1));
            }}
            itemTemplate={(p: DatePreset) => (
              <span className="grg-date-panel__preset">
                <span>{p.label}</span>
                {/* Every row keeps room for the check, so the list doesn't change width when a period is chosen */}
                <span className="grg-date-panel__check" data-on={p.id === activePreset || undefined}><Icon name="check" size={24} /></span>
              </span>
            )}
            pt={{
              // The list itself takes the Tab stop (PrimeReact's hidden focus catchers are aria-hidden yet focusable)
          list: { className: 'grg-date-panel__preset-list', 'aria-label': 'Periods', tabIndex: 0 },
          hiddenFirstFocusableEl: { tabIndex: -1 },
          hiddenLastFocusableEl: { tabIndex: -1 },
              item: { className: 'grg-date-panel__preset-item' },
              // Not in PrimeReact's types, but read by ListBox
            } as object}
          />
          <span className="grg-date-panel__divider" aria-hidden="true" />
        </>
      )}
      <Calendar
        inline
        value={(range ? (isRange(draft) ? draft : null) : (isRange(draft) ? null : draft)) as never}
        onChange={e => commit((e.value ?? null) as DatePickerValue)}
        selectionMode={selectionMode}
        numberOfMonths={double ? 2 : 1}
        view={view}
        viewDate={jump}
        locale={dl.primeKey}
        showOtherMonths
        selectOtherMonths={false}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        monthNavigator={view === 'date'}
        yearNavigator={view === 'date'}
        yearRange={`${years[0]}:${years[1]}`}
        prevIcon={<Icon name="direction-left" size={20} />}
        nextIcon={<Icon name="direction-right" size={20} />}
        monthNavigatorTemplate={e => {
          header.current = { month: Number(e.value), firstYear: true };
          return (
            <DropdownMenu
              aria-label="Month"
              className="grg-date-panel__navigator"
              width={200}
              trigger={navigatorTrigger(dl.monthNames[Number(e.value)])}
              items={dl.monthNames.map((name, m) => ({
                label: name,
                selected: m === Number(e.value),
                onSelect: () => e.onChange({} as SyntheticEvent, m),
              }))}
            />
          );
        }}
        // PrimeReact draws a year list in every month's header; only the first month gets one, the second shows its year
        yearNavigatorTemplate={e => {
          const year = Number(e.value);
          if (!header.current.firstYear) {
            return <span className="grg-calendar__title-text">{header.current.month === 11 ? year + 1 : year}</span>;
          }
          header.current.firstYear = false;
          return (
            <DropdownMenu
              aria-label="Year"
              className="grg-date-panel__navigator"
              width={120}
              trigger={navigatorTrigger(String(year))}
              items={yearOptions.map(y => ({
                label: String(y),
                selected: y === year,
                onSelect: () => e.onChange({} as SyntheticEvent, y),
              }))}
            />
          );
        }}
        dateTemplate={date => {
          const full = dl.formatLong(new Date(date.year, date.month, date.day));
          return (
            <>
              {/* No spans inside: PrimeReact finds the focusable day by its span */}
              <i className="grg-calendar__number" aria-hidden="true">{date.day}</i>
              {/* Figma marks today with a dot; screen readers hear the full date, and "today" */}
              {date.today && <i className="grg-calendar__today" aria-hidden="true" />}
              <small className="grg-sr-only">{date.today ? `${full}, today` : full}</small>
            </>
          );
        }}
        footerTemplate={withButtons ? () => (
          <div className="grg-calendar__buttons">
            <Button variant="outline" size="sm" leftIcon={undefined} onClick={() => setDraft(null)}>{resetLabel}</Button>
            <Button variant="primary" size="sm" leftIcon={undefined} onClick={() => { onChange?.(draft); onApply?.(); }}>{applyLabel}</Button>
          </div>
        ) : undefined}
        pt={{
          root: { className: 'grg-calendar', id: `${id}-calendar` },
          panel: { className: 'grg-calendar__panel' },
          groupContainer: { className: 'grg-calendar__groups' },
          group: { className: 'grg-calendar__group' },
          header: { className: 'grg-calendar__header' },
          previousButton: { className: 'grg-calendar__arrow', 'aria-label': 'Previous month' },
          nextButton: { className: 'grg-calendar__arrow', 'aria-label': 'Next month' },
          title: { className: 'grg-calendar__title' },
          // The second month of a pair shows its name as text: both months move together with the outer arrows
          monthTitle: { className: 'grg-calendar__title-text', disabled: true, tabIndex: -1, 'aria-label': undefined },
          // In the month grid the year opens the year grid (next to days the year is a list)
          yearTitle: { className: 'grg-calendar__title-button' },
          container: { className: 'grg-calendar__container' },
          table: { className: 'grg-calendar__table' },
          weekDay: { className: 'grg-calendar__weekday' },
          /* PrimeReact puts the selection on the focusable span inside each cell. The span becomes the grid cell
             (named by the full date in its content, "Monday, 5 January 2026, today"), and the table cell only lays it out. */
          day: ({ context }: { context: { date: CalendarDate } }) => ({
            // p-datepicker-today: the class PrimeReact looks for to put keyboard focus on today when nothing is chosen
            className: `grg-calendar__day${context.date.today ? ' p-datepicker-today' : ''}`,
            role: 'presentation',
            'aria-label': undefined,
            'data-range': position(context.date),
          }),
          dayLabel: { className: 'grg-calendar__day-label', role: 'gridcell' },
          monthPicker: { className: 'grg-calendar__months' },
          month: { className: 'grg-calendar__month' },
          yearPicker: { className: 'grg-calendar__years' },
          year: { className: 'grg-calendar__month' },
          footer: { className: 'grg-calendar__footer' },
        } as object}
      />
    </div>
  );
}
