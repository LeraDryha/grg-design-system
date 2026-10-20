import { useState, type ComponentPropsWithoutRef, type SyntheticEvent } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { ButtonGroupItemContent, type ButtonGroupItemProps } from './ButtonGroupItem';
import './ButtonGroup.css';

export type ButtonGroupEntry = Pick<ButtonGroupItemProps, 'label' | 'leftIcon' | 'rightIcon' | 'iconOnly' | 'disabled' | 'aria-label'> & { id: string };
export type ButtonGroupValue = string | null;
export type ButtonGroupProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect' | 'defaultValue' | 'unselectable'> & {
  /** Figma Quantity: array length; source variants contain 2–6 items. */
  items: ButtonGroupEntry[];
  /** Figma Size: md-32 or sm-24, shared by every item. */
  size?: 'md' | 'sm';
  /** Controlled single selection: an entry ID, or null. */
  value?: ButtonGroupValue;
  /** Initial selection when value is not supplied. */
  defaultValue?: ButtonGroupValue;
  /** Allow clearing the selection. Defaults to true, as in PrimeReact SelectButton. */
  allowEmpty?: boolean;
  /** Called with the new selected ID or null. Selection persists after pointer release and blur. */
  onValueChange?: (value: ButtonGroupValue, event?: SyntheticEvent) => void;
  /** Disables the whole group; entries can also be disabled individually. */
  disabled?: boolean;
  /** Accessible name describing the options or actions. */
  'aria-label': string;
};

/** Figma Button group, implemented with PrimeReact SelectButton selection and ARIA. */
export function ButtonGroup({ items, size = 'md', value, defaultValue = null, allowEmpty = true, onValueChange, disabled = false, className = '', ...props }: ButtonGroupProps) {
  const [localValue, setLocalValue] = useState<ButtonGroupValue>(defaultValue);
  const selectedValue = value === undefined ? localValue : value;
  const side = (index: number) => items.length === 1 ? 'single' : index === 0 ? 'left' : index === items.length - 1 ? 'right' : 'center';
  const groupClass = `grg-button-group ${className}`;

  return <SelectButton {...props} unstyled className={groupClass} options={items} optionLabel="label" optionValue="id" optionDisabled="disabled"
    value={selectedValue} multiple={false} disabled={disabled} allowEmpty={allowEmpty}
    onChange={event => {
      if (value === undefined) setLocalValue(event.value);
      onValueChange?.(event.value, event.originalEvent);
    }}
    itemTemplate={(item: ButtonGroupEntry) => <ButtonGroupItemContent {...item} leftIcon={item.leftIcon ?? null} rightIcon={item.rightIcon ?? null} size={size} />}
    pt={{ button: options => {
      if (!options) return {};
      const { context } = options;
      const item = context.option as ButtonGroupEntry;
      return {
        className: 'grg-button-group-item', 'data-size': size, 'data-side': side(items.indexOf(item)),
        'data-icon-only': item.iconOnly || undefined,
        'data-selected': context.selected || undefined,
        'aria-label': item['aria-label'] || item.label,
        onFocus: event => {
          // A partly visible option in a scrolling row must become fully visible, including its ring.
          event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        },
      };
    } }}
  />;
}
