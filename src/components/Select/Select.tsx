import { useId, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Icon, type IconName } from '../Icon/Icon';
import { FormField } from '../FormField/FormField';
import { EMPTY_ICON, OptionPicture, type OptionKind, type SelectOption } from './options';
import { DropdownItem, dropdownPanelPt, searchIcons } from './dropdown';
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
  /** A search row at the top of the list, for long lists (Figma examples: countries, users, coins) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown when the search finds nothing */
  noResults?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  /** Shows a state as static, for documentation only */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

/**
 * A field that opens a list to choose one option. PrimeReact Dropdown (unstyled) in the shared field frame;
 * label, hint and Key: value are the same parts as in Input and Text Area.
 */
export function Select({
  options, value: controlled, defaultValue, onChange, type = 'common', size = 'md',
  label, floatingLabel = true, placeholder, required, optional, info, hint, error, hintIcon = true, topKey, topValue,
  icon = true, emptyIcon, searchable = false, searchPlaceholder = 'Search', noResults = 'Nothing found',
  disabled, id: suppliedId, name, className = '', previewState = 'default',
}: SelectProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = `${id}-hint`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const value = controlled === undefined ? local : controlled;
  const selected = options.find(o => o.value === value);
  const isFocused = focused || open || previewState === 'active' || previewState === 'focus';
  const labelVisible = !floatingLabel || isFocused || !!selected;
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
        data-preview-state={previewState === 'default' ? undefined : previewState}
      >
        <Dropdown
          inputId={id}
          name={name}
          focusInputRef={inputRef}
          appendTo="self"
          options={options}
          optionValue="value"
          optionLabel="label"
          optionDisabled="disabled"
          value={value ?? null}
          disabled={disabled}
          required={required}
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
          dropdownIcon={<Icon name="direction-down" size={20} />}
          collapseIcon={<Icon name="direction-up" size={20} />}
          pt={{
            root: { className: 'grg-select__box', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
            input: { className: 'grg-select__input' },
            select: { 'aria-hidden': true },
            hiddenSelectedMessage: { className: 'grg-sr-only' },
            trigger: { className: 'grg-select__trigger', 'aria-hidden': true },
            ...dropdownPanelPt(label),
          }}
        />
      </div>
    </FormField>
  );
}
