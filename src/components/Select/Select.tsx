import { useEffect, useId, useRef, useState, type HTMLAttributes, type MouseEvent, type RefObject } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { PrimeReactProvider } from 'primereact/api';
import { primeReactConfig } from '../../primereact-config';
import { OverflowSummary } from './OverflowSummary';
import { Icon, type IconName } from '../Icon/Icon';
import { FormField } from '../FormField/FormField';
import { EMPTY_ICON, OptionPicture, type OptionKind, type SelectOption } from './options';
import { DropdownItem, DropdownSkeleton, LIST_HEIGHT, SEARCH_FROM, dropdownPanelPt, searchIcons, useListLayer } from './dropdown';
import { useDropdownCombobox } from './useDropdownCombobox';
import './Select.css';

export type { SelectOption };

/** Figma "Select" component set (404:42432): Type × State × Filled × Size, with Icon, Top and Hint text booleans. */
export type SelectProps = {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Figma Type: Common, Country, User, Payment method, Coin. Sets the picture in an empty field. */
  type?: Exclude<OptionKind, 'icon'>;
  /** Figma Size: lg-44px, md-40px, sm-32px */
  size?: 'lg' | 'md' | 'sm';
  /** Label (Figma Floating label). Inside the empty field it works as the placeholder. */
  label: string;
  /** Figma behaviour: the label sits inside the empty field and floats above when it's open or has a value. false keeps it above. */
  floatingLabel?: boolean;
  /** Placeholder when the label is kept above, such as "Select a currency" */
  placeholder?: string;
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
  /** Figma Icon: the picture before the value. Common uses this icon; other types show the chosen option's flag, coin, card or photo. */
  icon?: boolean;
  /** Icon of an empty Common select (Figma: coin) */
  emptyIcon?: IconName;
  /** A search row at the top of the list. On by default with more than 10 options (Figma guidelines). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown when the search finds nothing (Figma Empty) */
  noResults?: string;
  /** The options are loading: the list shows grey rows (Figma Skeleton) */
  loading?: boolean;
  /** Multi-select (Figma examples): checkboxes in the list, the choices listed in the field with commas */
  multiple?: boolean;
  /** Chosen options of a multi-select, in choice order */
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  /** Name of the clear button of a multi-select */
  clearLabel?: string;
  /** Opens the list when the field first appears, for a step where choosing is the only task. Doesn't move focus. */
  defaultOpen?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

/**
 * A field that opens a list to choose one option. PrimeReact Dropdown (unstyled) in the shared field frame;
 * label, hint and Key: value are the same parts as in Input and Text Area.
 */
export function Select({
  options, value: controlled, defaultValue, onChange, type = 'common', size = 'md',
  label, floatingLabel = true, placeholder, required, optional, info, hint, error, hintIcon = true, topKey, topValue,
  icon = true, emptyIcon, searchable, searchPlaceholder = 'Search', noResults = 'There are no search results', loading = false,
  multiple = false, values: controlledValues, defaultValues = [], onValuesChange, clearLabel = 'Clear selection', defaultOpen = false,
  disabled, id: suppliedId, name, className = '',
}: SelectProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = `${id}-hint`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<Dropdown>(null);
  const multiRef = useRef<MultiSelect>(null);
  const layer = useListLayer(rootRef);
  // PrimeReact's own show(): it opens the list without scrolling the page to the field
  useEffect(() => {
    if (defaultOpen) (multiple ? multiRef : dropdownRef).current?.show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [local, setLocal] = useState(defaultValue);
  const [localValues, setLocalValues] = useState<string[]>(defaultValues);
  const values = controlledValues ?? localValues;
  const chosen = values.map(v => options.find(o => o.value === v)).filter((o): o is SelectOption => !!o);
  const withSearch = searchable ?? options.length >= SEARCH_FROM;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const value = controlled === undefined ? local : controlled;
  const selected = options.find(o => o.value === value);
  const isFocused = focused || open;
  const labelVisible = !floatingLabel || isFocused || (multiple ? chosen.length > 0 : !!selected);
  const message = error || hint;
  useDropdownCombobox(rootRef, inputRef, `${id}-list`, label, message ? hintId : undefined, !!error);

  const empty = emptyIcon ?? EMPTY_ICON[type];
  const lead = !icon ? null : selected && type !== 'common' ? (
    <OptionPicture option={selected} />
  ) : (
    <span className="grg-select__icon"><Icon name={selected?.icon ?? empty} size={20} /></span>
  );

  return (
    <FormField
      className={`grg-select ${className}`}
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
      disabled={disabled}
    >
      <div
        ref={rootRef}
        className="grg-select__frame"
        data-size={size}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-open={open || undefined}
      >
        {multiple ? (
          // PrimeReact 10 marks the option under the arrow keys only with its .p-focus class (the pass-through
          // context it gives for this is empty), so this one widget keeps PrimeReact's class names. Its base
          // styles are structural only; no PrimeReact theme is loaded.
          <PrimeReactProvider value={{ ...primeReactConfig, unstyled: false }}>
          <MultiSelect
            ref={multiRef}
            inputId={id}
            name={name}
            // PrimeReact types the ref as a select; at runtime it is the hidden input
            inputRef={inputRef as unknown as RefObject<HTMLSelectElement>}
            appendTo="self"
            scrollHeight={LIST_HEIGHT}
            options={loading ? [] : options}
            optionValue="value"
            optionLabel="label"
            optionDisabled="disabled"
            value={values}
            disabled={disabled}
            filter={withSearch}
            filterBy="label,listLabel"
            filterPlaceholder={searchPlaceholder}
            emptyFilterMessage={noResults}
            // Typed as text, but PrimeReact renders any node here: the skeleton while loading
            emptyMessage={(loading ? <DropdownSkeleton /> : noResults) as unknown as string}
            showSelectAll={false}
            showClear={chosen.length > 0 && !disabled}
            {...searchIcons}
            onChange={e => {
              const next = (e.value as string[]) ?? [];
              // Keep the order in which the options were chosen, as Figma asks
              const ordered = [...values.filter(v => next.includes(v)), ...next.filter(v => !values.includes(v))];
              if (controlledValues === undefined) setLocalValues(ordered);
              onValuesChange?.(ordered);
            }}
            onShow={() => { setOpen(true); layer.place(); }}
            onHide={() => { setOpen(false); layer.release(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectedItemTemplate={(v: string | undefined) =>
              // Called once per chosen option: the first call draws the whole summary, or the placeholder when empty
              v === undefined || v === values[0] ? (
                <span className="grg-select__value">
                  {icon && type === 'common' && <span className="grg-select__icon"><Icon name={empty} size={20} /></span>}
                  {chosen.length ? (
                    <OverflowSummary className="grg-select__text" labels={chosen.map(o => o.label)} />
                  ) : (
                    <span className="grg-select__text" data-placeholder>{floatingLabel ? label : placeholder ?? ''}</span>
                  )}
                </span>
              ) : null
            }
            itemTemplate={(o: SelectOption) => <DropdownItem option={o} selected={values.includes(o.value)} multiple />}
            dropdownIcon={<Icon name="direction-down" size={20} />}
            // A function, so PrimeReact's click and keyboard handlers reach the button (an element would drop them)
            clearIcon={({ iconProps }: { iconProps: HTMLAttributes<HTMLSpanElement> }) => (
              <span
                {...iconProps}
                className="grg-select__clear"
                role="button"
                aria-label={clearLabel}
                onClick={e => {
                  // Clearing shouldn't also open the list
                  e.stopPropagation();
                  iconProps.onClick?.(e);
                }}
              >
                <Icon name="remove" size={20} />
              </span>
            )}
            pt={{
              root: { className: 'grg-select__box', 'aria-disabled': disabled || undefined } as object,
              labelContainer: { className: 'grg-select__input' },
              label: { className: 'grg-select__label' },
              hiddenInputWrapper: { className: 'grg-sr-only' },
              trigger: { className: 'grg-select__trigger', 'aria-hidden': true },
              panel: { className: 'grg-dropdown grg-dropdown--select' },
              // Without search the header would hold only the hidden close button and a divider
              header: withSearch ? { className: 'grg-dropdown__header' } : { hidden: true },
              filterContainer: { className: 'grg-dropdown__search' },
              filterInput: { className: 'grg-dropdown__search-input', 'aria-label': `Search ${label.toLowerCase()}` },
              closeButton: { hidden: true },
              wrapper: { className: 'grg-dropdown__scroll' },
              list: { className: 'grg-dropdown__list', 'aria-label': label },
              // Each option gets an id, so the combobox can point at the one under the arrow keys. A click keeps focus
              // in the field (or the search), as in a listbox; PrimeReact would move it to the option's own checkbox.
              item: ({ context }: { context: { index: number } }) => ({
                className: 'grg-dropdown__option',
                id: `${id}-option-${context.index}`,
                onMouseDown: (event: MouseEvent) => event.preventDefault(),
              }),
              // The option itself is the checkbox (aria-selected); PrimeReact's inner checkbox would be a second control
              checkboxContainer: { hidden: true },
              emptyMessage: { className: 'grg-dropdown__empty', role: 'option', 'aria-disabled': true, 'aria-selected': false } as object,
            }}
          />
          </PrimeReactProvider>
        ) : (
          <Dropdown
            ref={dropdownRef}
            inputId={id}
            name={name}
            focusInputRef={inputRef}
            appendTo="self"
            scrollHeight={LIST_HEIGHT}
            options={options}
            optionValue="value"
            optionLabel="label"
            optionDisabled="disabled"
            value={value ?? null}
            disabled={disabled}
            required={required}
            filter={withSearch}
            filterBy="label,listLabel"
            filterPlaceholder={searchPlaceholder}
            showFilterClear={withSearch}
            emptyFilterMessage={noResults}
            emptyMessage={noResults}
            {...searchIcons}
            onChange={e => {
              if (controlled === undefined) setLocal(e.value);
              onChange?.(e.value);
            }}
            onShow={() => { setOpen(true); layer.place(); }}
            onHide={() => { setOpen(false); layer.release(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            valueTemplate={() => (
              <span className="grg-select__value">
                {lead}
                <span className="grg-select__text" data-placeholder={!selected || undefined}>
                  {selected ? selected.label : floatingLabel ? label : placeholder ?? ''}
                </span>
              </span>
            )}
            itemTemplate={(o: SelectOption) => <DropdownItem option={o} selected={o.value === selected?.value} />}
            {...(loading && { options: [], emptyMessage: <DropdownSkeleton />, emptyFilterMessage: <DropdownSkeleton /> })}
            dropdownIcon={<Icon name="direction-down" size={20} />}
            collapseIcon={<Icon name="direction-up" size={20} />}
            pt={{
              root: { className: 'grg-select__box', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
              input: { className: 'grg-select__input' },
              select: { 'aria-hidden': true },
              hiddenSelectedMessage: { className: 'grg-sr-only' },
              trigger: { className: 'grg-select__trigger', 'aria-hidden': true },
              ...dropdownPanelPt(label, 'select'),
            }}
          />
        )}
      </div>
    </FormField>
  );
}
