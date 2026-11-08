import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Button as PrimeButton } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { PrimeReactProvider } from 'primereact/api';
import { primeReactConfig } from '../../primereact-config';
import { Icon } from '../Icon/Icon';
import { Badge, type BadgeColor } from '../Badge/Badge';
import { ActionButton } from '../ActionButton/ActionButton';
import { DropdownItem, LIST_HEIGHT, SEARCH_FROM, dropdownPanelPt, searchBehaviour, searchIcons, useListLayer, useMultiListHeader } from '../Select/dropdown';
import { useDropdownCombobox } from '../Select/useDropdownCombobox';
import type { SelectOption } from '../Select/options';
import { DatePickerPanel, type DatePickerValue } from '../DatePicker/DatePickerPanel';
import { defaultPresets, sameDay, type DatePreset } from '../DatePicker/presets';
import { dateLocale } from '../../locale/dates';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useOverlayTheme } from '../../hooks/useOverlayTheme';
import './Filter.css';

/** An option of a filter: the Select option, plus a status colour for a status filter (shown as a Badge) */
export type FilterOption = SelectOption & {
  /** Status filters: the chosen status shows as a filled Badge in this colour, such as success for Active */
  status?: BadgeColor;
};

export type FilterValue = string | string[] | DatePickerValue | null;

/** Figma "Filter" (1321:17152): State × Size × Applied (None, Single, Multi). */
export type FilterProps = {
  /** What the filter is about, such as Merchant or Status. Stays visible when a value is chosen. */
  label: string;
  /** single: one value (Applied Single); multiple: several, shown as a count (Applied Multi); date: a period from Date Picker */
  type?: 'single' | 'multiple' | 'date';
  options?: FilterOption[];
  value?: FilterValue;
  defaultValue?: FilterValue;
  /** Called at once on each choice; for a date, on Apply */
  onChange?: (value: FilterValue) => void;
  /** Figma Size: lg-44, md-40, sm-32 */
  size?: 'lg' | 'md' | 'sm';
  /** A search row in the list. By default it comes with more than 10 options; turn it on for lists that come from data. */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResults?: string;
  /** Date filter: ready-made periods (the Date Picker list by default) */
  presets?: boolean | DatePreset[];
  /** Date filter: the locale for dates; the page or browser language by default */
  locale?: string;
  disabled?: boolean;
  /** Name of the clear button; "Clear Merchant filter" by default */
  clearLabel?: string;
  /** Multiple: the label of the Select all row (from 4 options) */
  selectAllLabel?: string;
  className?: string;
};

const asArray = (v: FilterValue | undefined): string[] => (Array.isArray(v) && v.every(x => typeof x === 'string') ? (v as string[]) : []);
const isPeriod = (v: FilterValue | undefined): v is [Date | null, Date | null] => Array.isArray(v) && v.some(x => x instanceof Date);

/**
 * A compact filter for tables and lists: a label that opens the same list as Select, a chosen value or a count,
 * and a clear button. PrimeReact Dropdown (one value) or MultiSelect (several), or Date Picker for a period.
 * The clear button is the system's Action Button next to the trigger, so it is a Tab stop of its own.
 */
export function Filter({
  label, type = 'single', options = [], value: controlled, defaultValue = null, onChange, size = 'md',
  searchable, searchPlaceholder = 'Search', noResults = 'Nothing found', presets = true, locale,
  disabled = false, clearLabel, selectAllLabel = 'Select all', className = '',
}: FilterProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<Tooltip>(null);
  const layer = useListLayer(rootRef);
  const themeProps = useOverlayTheme(rootRef);
  const [local, setLocal] = useState<FilterValue>(defaultValue);
  const value = controlled === undefined ? local : controlled;
  const [open, setOpen] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const dl = dateLocale(locale);
  const presetList = presets === true ? defaultPresets : presets || [];
  const chosen = type === 'multiple' ? asArray(value).map(v => options.find(o => o.value === v)).filter((o): o is FilterOption => !!o) : [];
  const single = type === 'single' ? options.find(o => o.value === value) : undefined;
  const period = type === 'date' && isPeriod(value) && value[0] ? value : null;

  // What the filter shows once applied: a value, a status, a count, or a period (its preset's name when it matches one)
  const periodText = period
    ? presetList.find(p => { const r = p.range(new Date()); return r && sameDay(r[0], period[0]) && sameDay(r[1], period[1]); })?.label
      ?? `${dl.format(period[0]!)}${period[1] ? ` – ${dl.format(period[1])}` : ''}`
    : '';
  const applied: 'none' | 'single' | 'multi' = chosen.length > 1 ? 'multi' : chosen.length === 1 || single || period ? 'single' : 'none';
  const valueText = single?.label ?? chosen[0]?.label ?? periodText;
  const fullText = applied === 'multi' ? chosen.map(o => o.label).join(', ') : valueText;
  // Screen readers hear the label and what is applied, which the tooltip shows only to the eye
  const name = applied === 'none' ? label : applied === 'multi' ? `${label}: ${chosen.length} selected, ${fullText}` : `${label}: ${valueText}`;

  useDropdownCombobox(rootRef, inputRef, `${id}-list`, name);
  useKeyboardNavigation(rootRef);

  // A long value is cut with an ellipsis (264px at most, Figma guidelines); the tooltip then shows it in full
  useLayoutEffect(() => {
    const el = valueRef.current;
    if (!el) { setTruncated(false); return; }
    const measure = () => setTruncated(el.scrollWidth > el.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [valueText, applied]);
  const showTooltip = !open && (applied === 'multi' || (applied === 'single' && truncated));

  const set = (next: FilterValue) => {
    if (controlled === undefined) setLocal(next);
    onChange?.(next);
  };
  const clear = () => {
    set(type === 'multiple' ? [] : null);
    // The clear button goes away with the value, so focus returns to the filter
    requestAnimationFrame(() => (type === 'date' ? triggerRef.current : inputRef.current)?.focus());
  };

  // The date filter's calendar closes on a click outside, and on Escape returns to the filter
  useEffect(() => {
    if (type !== 'date' || !open) return;
    const outside = (event: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [type, open]);

  const withSearch = searchable ?? options.length >= SEARCH_FROM;
  const multiHeader = useMultiListHeader({ options, values: asArray(value), onValues: set, withSearch, selectAllLabel });
  const badgeSize = size === 'sm' ? 'xs' : 'sm';

  const content = (
    <span className="grg-filter__content">
      <span className="grg-filter__label">{label}</span>
      {applied === 'single' && (
        <>
          {/* The date filter is a button named by its own text; the colon keeps "Created date: Last 30 days" apart */}
          {type === 'date' && <span className="grg-sr-only">: </span>}
          <span className="grg-filter__separator" aria-hidden="true" />
          {single?.status ? (
            <Badge variant="filled" size="sm" color={single.status} label={single.label} leftIcon={null} rightIcon={null} decorative />
          ) : (
            <span ref={valueRef} className="grg-filter__value">{valueText}</span>
          )}
        </>
      )}
      {applied === 'multi' && <Badge type="numeric" variant="filled" size={badgeSize} color="neutral" value={chosen.length} decorative />}
    </span>
  );

  const panelPt = {
    ...dropdownPanelPt(label, 'filter'),
    header: withSearch ? { className: 'grg-dropdown__header' } : { hidden: true },
  };

  return (
    <div
      ref={rootRef}
      className={`grg-filter ${className}`}
      data-size={size}
      data-applied={applied}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
      onMouseEnter={event => showTooltip && tooltipRef.current?.show(event as unknown as Parameters<Tooltip['show']>[0])}
      onMouseLeave={() => tooltipRef.current?.hide()}
      onFocus={event => showTooltip && event.target === (type === 'date' ? triggerRef.current : inputRef.current)
        && tooltipRef.current?.show({ currentTarget: rootRef.current } as unknown as Parameters<Tooltip['show']>[0])}
      onBlur={() => tooltipRef.current?.hide()}
      onKeyDown={event => {
        if (type === 'date' && open && event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      {type === 'single' && (
        <Dropdown
          inputId={id}
          focusInputRef={inputRef}
          appendTo="self"
          scrollHeight={LIST_HEIGHT}
          options={options}
          optionValue="value"
          optionLabel="label"
          optionDisabled="disabled"
          value={single?.value ?? null}
          disabled={disabled}
          filter={withSearch}
          filterBy="label,listLabel"
          filterPlaceholder={searchPlaceholder}
          emptyFilterMessage={noResults}
          emptyMessage={noResults}
          {...searchIcons}
          {...searchBehaviour}
          onChange={e => set(e.value)}
          onShow={() => { setOpen(true); layer.place(); }}
          onHide={() => { setOpen(false); layer.release(); }}
          valueTemplate={() => content}
          itemTemplate={({ status: _status, ...o }: FilterOption) => <DropdownItem option={o} selected={o.value === single?.value} />}
          dropdownIcon={<Icon name="direction-down" size={20} />}
          collapseIcon={<Icon name="direction-up" size={20} />}
          pt={{
            root: { className: 'grg-filter__trigger', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
            input: { className: 'grg-filter__input' },
            select: { 'aria-hidden': true },
            hiddenSelectedMessage: { className: 'grg-sr-only' },
            // Once applied, the clear button takes the chevron's place (Figma)
            trigger: { className: 'grg-filter__chevron', 'aria-hidden': true, hidden: applied !== 'none' },
            ...panelPt,
          }}
        />
      )}
      {type === 'multiple' && (
        // As in Select: PrimeReact marks the option under the arrow keys only with .p-focus, so this widget keeps its class names
        <PrimeReactProvider value={{ ...primeReactConfig, unstyled: false }}>
          <MultiSelect
            inputId={id}
            inputRef={inputRef as unknown as RefObject<HTMLSelectElement>}
            appendTo="self"
            scrollHeight={LIST_HEIGHT}
            options={options}
            optionValue="value"
            optionLabel="label"
            optionDisabled="disabled"
            value={asArray(value)}
            disabled={disabled}
            filter={withSearch}
            filterBy="label,listLabel"
            filterPlaceholder={searchPlaceholder}
            emptyFilterMessage={noResults}
            emptyMessage={noResults}
            showSelectAll={false}
            {...searchIcons}
            {...multiHeader.props}
            onChange={e => {
              // Each tick applies at once and the list stays open, so several can be ticked in a row
              const next = (e.value as string[]) ?? [];
              const current = asArray(value);
              set([...current.filter(v => next.includes(v)), ...next.filter(v => !current.includes(v))]);
            }}
            onShow={() => { setOpen(true); layer.place(); }}
            onHide={() => { setOpen(false); layer.release(); multiHeader.reset(); }}
            // Called once per chosen option: the first call draws the whole filter
            selectedItemTemplate={(v: string | undefined) => (v === undefined || v === asArray(value)[0] ? content : null)}
            itemTemplate={({ status: _status, ...o }: FilterOption) => <DropdownItem option={o} selected={asArray(value).includes(o.value)} multiple />}
            dropdownIcon={<Icon name="direction-down" size={20} />}
            pt={{
              root: { className: 'grg-filter__trigger', 'aria-disabled': disabled || undefined } as object,
              labelContainer: { className: 'grg-filter__input' },
              label: { className: 'grg-filter__label-wrap' },
              hiddenInputWrapper: { className: 'grg-sr-only' },
              trigger: { className: 'grg-filter__chevron', 'aria-hidden': true, hidden: applied !== 'none' },
              panel: { className: 'grg-dropdown grg-dropdown--filter' },
              filterContainer: { className: 'grg-dropdown__search' },
              // MultiSelect hands this to its InputText, which reads it as that component's own pass-through (types say otherwise)
              filterInput: { root: { className: 'grg-dropdown__search-input', 'aria-label': `Search ${label.toLowerCase()}` } } as object,
              closeButton: { hidden: true },
              wrapper: { className: 'grg-dropdown__scroll' },
              list: { className: 'grg-dropdown__list', 'aria-label': label },
              item: ({ context }: { context: { index: number } }) => ({
                className: 'grg-dropdown__option',
                id: `${id}-option-${context.index}`,
                // A click keeps focus in the filter (or its search), as in a listbox
                onMouseDown: (event: MouseEvent) => event.preventDefault(),
              }),
              checkboxContainer: { hidden: true },
              emptyMessage: { className: 'grg-dropdown__empty', role: 'option', 'aria-disabled': true, 'aria-selected': false } as object,
            }}
          />
        </PrimeReactProvider>
      )}
      {type === 'date' && (
        <>
          <PrimeButton
            ref={triggerRef as unknown as RefObject<PrimeButton>}
            unstyled
            type="button"
            className="grg-filter__trigger grg-filter__button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? `${id}-calendar` : undefined}
            onClick={() => setOpen(!open)}
          >
            {content}
            {applied === 'none' && <span className="grg-filter__chevron" aria-hidden="true"><Icon name="calendar-01" size={20} /></span>}
          </PrimeButton>
          {open && (
            <div className="grg-filter__overlay" id={`${id}-calendar`} role="dialog" aria-label={`Choose a period: ${label}`}>
              <DatePickerPanel
                selectionMode="range"
                double
                presets={presets}
                locale={locale}
                value={period}
                onChange={next => set(Array.isArray(next) && next[0] ? next : null)}
                onApply={() => { setOpen(false); triggerRef.current?.focus(); }}
              />
            </div>
          )}
        </>
      )}
      {applied !== 'none' && (
        <ActionButton className="grg-filter__clear" icon="remove" size="sm" aria-label={clearLabel ?? `Clear ${label} filter`} disabled={disabled} onClick={clear} />
      )}
      {showTooltip && (
        <Tooltip
          ref={tooltipRef}
          // No target: the filter shows it on hover and on keyboard focus (PrimeReact would only listen to the pointer)
          content={fullText}
          position="bottom"
          autoHide={false}
          className="grg-filter-tooltip"
          pt={{ root: themeProps, text: { className: 'grg-filter-tooltip__text' }, arrow: { className: 'grg-filter-tooltip__arrow' } } as object}
        />
      )}
    </div>
  );
}
