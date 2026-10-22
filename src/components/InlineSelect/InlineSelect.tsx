import { useId, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import { OptionPicture, type SelectOption } from '../Select/options';
import { DropdownItem, LIST_HEIGHT, dropdownPanelPt, searchIcons, useListLayer } from '../Select/dropdown';
import { useDropdownCombobox } from '../Select/useDropdownCombobox';
import './InlineSelect.css';

/** Options of Inline select: the same as Select (flag, coin or icon, label, list label). */
export type InlineSelectOption = SelectOption;

/** Figma "Inline select" (424:72942): State × Type. */
export type InlineSelectProps = {
  options: InlineSelectOption[];
  /** Controlled value: the current language, country or currency from the application. */
  value?: string | null;
  /** Initial value when the application does not control the selection. */
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Shown when no available option matches the value. */
  placeholder?: string;
  /** The name screen readers announce, such as "Country code" */
  'aria-label': string;
  /** Figma Type: Country (flag), Coin, Icon; only changes how the picture is drawn */
  type?: 'country' | 'coin' | 'icon';
  /** A search row at the top of the list, for long lists such as all country codes */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResults?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Figma "Inline select": a compact select inside a field, such as the country code of a phone number
 * or the coin of an amount. PrimeReact Dropdown (unstyled), with the same open list as Select.
 */
export function InlineSelect({
  options, value: controlled, defaultValue, onChange, placeholder = 'Select', type = 'country', searchable = false, searchPlaceholder = 'Search', noResults = 'Nothing found',
  disabled, className = '', 'aria-label': label,
}: InlineSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const layer = useListLayer(rootRef);
  useDropdownCombobox(rootRef, inputRef, `${id}-list`, label);
  const [local, setLocal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const value = controlled === undefined ? local : controlled;
  const selected = options.find(o => o.value === value);

  return (
    <div
      className={`grg-inline-select ${className}`}
      data-type={type}
      data-disabled={disabled || undefined}
      data-open={open || undefined}
      ref={rootRef}
    >
      <Dropdown
        inputId={id}
        focusInputRef={inputRef}
        appendTo="self"
        scrollHeight={LIST_HEIGHT}
        options={options}
        optionValue="value"
        optionLabel="label"
        optionDisabled="disabled"
        value={selected?.value ?? null}
        disabled={disabled}
        filter={searchable}
        filterBy="label,listLabel"
        filterPlaceholder={searchPlaceholder}
        showFilterClear={searchable}
        emptyFilterMessage={noResults}
        emptyMessage={noResults}
        {...searchIcons}
        onChange={e => {
          if (controlled === undefined) setLocal(e.value);
          onChange?.(e.value);
        }}
        onShow={() => { setOpen(true); layer.place(); }}
        onHide={() => { setOpen(false); layer.release(); }}
        valueTemplate={() =>
          selected ? (
            <span className="grg-inline-select__value">
              <OptionPicture option={selected} className="grg-inline-select__image" />
              <span>{selected.label}</span>
            </span>
          ) : <span className="grg-inline-select__value" data-placeholder>{placeholder}</span>
        }
        itemTemplate={(o: InlineSelectOption) => <DropdownItem option={o} selected={o.value === selected?.value} />}
        dropdownIcon={<Icon name="direction-down" size={20} />}
        collapseIcon={<Icon name="direction-up" size={20} />}
        pt={{
          root: { className: 'grg-inline-select__root', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
          input: { className: 'grg-inline-select__label' },
          select: { 'aria-hidden': true },
          hiddenSelectedMessage: { className: 'grg-sr-only' },
          trigger: { className: 'grg-inline-select__trigger', 'aria-hidden': true },
          ...dropdownPanelPt(label, 'inline'),
        }}
      />
    </div>
  );
}
