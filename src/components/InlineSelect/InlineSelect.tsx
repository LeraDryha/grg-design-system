import { useId, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import { OptionPicture, type SelectOption } from '../Select/options';
import { DropdownItem, dropdownPanelPt, searchIcons } from '../Select/dropdown';
import { useDropdownCombobox } from '../Select/useDropdownCombobox';
import './InlineSelect.css';

/** Options of Inline select: the same as Select (flag, coin or icon, label, list label). */
export type InlineSelectOption = SelectOption;

/** Figma "Inline select" (424:72942): State × Type. */
export type InlineSelectProps = {
  options: InlineSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
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
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'focus';
};

/**
 * Figma "Inline select": a compact select inside a field, such as the country code of a phone number
 * or the coin of an amount. PrimeReact Dropdown (unstyled), with the same open list as Select.
 */
export function InlineSelect({
  options, value, onChange, type = 'country', searchable = false, searchPlaceholder = 'Search', noResults = 'Nothing found',
  disabled, className = '', 'aria-label': label, previewState = 'default',
}: InlineSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDropdownCombobox(rootRef, inputRef, `${id}-list`, label);
  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div
      className={`grg-inline-select ${className}`}
      data-type={type}
      data-preview-state={previewState === 'default' ? undefined : previewState}
      ref={rootRef}
    >
      <Dropdown
        inputId={id}
        focusInputRef={inputRef}
        appendTo="self"
        options={options}
        optionValue="value"
        optionLabel="label"
        optionDisabled="disabled"
        value={selected?.value}
        disabled={disabled}
        filter={searchable}
        filterBy="label,listLabel"
        filterPlaceholder={searchPlaceholder}
        showFilterClear={searchable}
        emptyFilterMessage={noResults}
        emptyMessage={noResults}
        {...searchIcons}
        onChange={e => onChange?.(e.value)}
        valueTemplate={() =>
          selected ? (
            <span className="grg-inline-select__value">
              <OptionPicture option={selected} className="grg-inline-select__image" />
              <span>{selected.label}</span>
            </span>
          ) : null
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
          ...dropdownPanelPt(label),
        }}
      />
    </div>
  );
}
