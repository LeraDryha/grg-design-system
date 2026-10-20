import { useId, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import { EMPTY_ICON, OptionPicture, type SelectOption } from '../Select/options';
import { DropdownItem, LIST_HEIGHT, dropdownPanelPt, searchIcons } from '../Select/dropdown';
import { useDropdownCombobox } from '../Select/useDropdownCombobox';
import './CompactSelect.css';

/** Figma "Compact select" (404:56948): Type × Size × State. */
export type CompactSelectProps = {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Shown when no available option matches the value. Never substitutes another option. */
  placeholder?: string;
  /** Figma Type: Default (short text, such as USD), Icon, Country (flag), Coin. Pictures show without text. */
  type?: 'default' | 'icon' | 'country' | 'coin';
  /** Figma Size: lg-44, md-40, sm-32 */
  size?: 'lg' | 'md' | 'sm';
  /** The name screen readers announce, such as "Currency". There is no visible label. */
  'aria-label': string;
  /** A search row at the top of the list, for long lists */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResults?: string;
  /** Red border: the choice is missing or wrong. Explain it next to the select. */
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

/**
 * A select without a label or hint, for tight spots next to other controls: a currency next to an amount,
 * a country, a coin. PrimeReact Dropdown (unstyled), with the same open list as Select.
 */
export function CompactSelect({
  options, value: controlled, defaultValue, onChange, placeholder = 'Select', type = 'default', size = 'md', 'aria-label': label,
  searchable = false, searchPlaceholder = 'Search', noResults = 'Nothing found',
  invalid, disabled, id: suppliedId, name, className = '', previewState = 'default',
}: CompactSelectProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const value = controlled === undefined ? local : controlled;
  const selected = options.find(o => o.value === value);
  useDropdownCombobox(rootRef, inputRef, `${id}-list`, label, undefined, invalid);

  return (
    <div
      ref={rootRef}
      className={`grg-compact-select ${className}`}
      data-type={type}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-open={open || previewState === 'active' || undefined}
      data-preview-state={previewState === 'default' ? undefined : previewState}
    >
      <Dropdown
        inputId={id}
        name={name}
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
        onShow={() => setOpen(true)}
        onHide={() => setOpen(false)}
        valueTemplate={() =>
          type === 'default' ? (
            <span className="grg-compact-select__text" data-placeholder={!selected || undefined}>{selected?.label ?? placeholder}</span>
          ) : selected ? (
            <OptionPicture option={selected} />
          ) : (
            <Icon name={EMPTY_ICON[type]} size={20} />
          )
        }
        itemTemplate={(o: SelectOption) => <DropdownItem option={o} selected={o.value === selected?.value} />}
        dropdownIcon={<Icon name="direction-down" size={20} />}
        collapseIcon={<Icon name="direction-up" size={20} />}
        pt={{
          root: { className: 'grg-compact-select__box', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
          input: { className: 'grg-compact-select__value' },
          select: { 'aria-hidden': true },
          hiddenSelectedMessage: { className: 'grg-sr-only' },
          trigger: { className: 'grg-compact-select__trigger', 'aria-hidden': true },
          ...dropdownPanelPt(label),
        }}
      />
    </div>
  );
}
