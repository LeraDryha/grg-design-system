import { useState, type ComponentPropsWithoutRef, type KeyboardEvent, type SyntheticEvent } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { ButtonGroupItemContent, type ButtonGroupItemProps } from './ButtonGroupItem';
import './ButtonGroup.css';

export type ButtonGroupEntry = Pick<ButtonGroupItemProps, 'label' | 'leftIcon' | 'rightIcon' | 'iconOnly' | 'disabled' | 'previewState' | 'aria-label'> & { id: string };
export type ButtonGroupValue = string | string[] | null;
export type ButtonGroupProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect' | 'defaultValue' | 'unselectable'> & {
  /** Figma Quantity: array length; source variants contain 2–6 items. */
  items: ButtonGroupEntry[];
  /** Figma Size: md-32 or sm-24, shared by every item. */
  size?: 'md' | 'sm';
  /** PrimeReact multiple: select several independent options instead of one. */
  multiple?: boolean;
  /** Controlled selection: an entry ID, an array of IDs in multiple mode, or null. */
  value?: ButtonGroupValue;
  /** Initial selection when value is not supplied. */
  defaultValue?: ButtonGroupValue;
  /** Allow clearing the selection. Defaults to false for single and true for multiple. */
  allowEmpty?: boolean;
  /** Called with the new selected ID(s). Selection persists after pointer release and blur. */
  onValueChange?: (value: ButtonGroupValue, event?: SyntheticEvent) => void;
  /** Disables the whole group; entries can also be disabled individually. */
  disabled?: boolean;
  /** Accessible name describing the options or actions. */
  'aria-label': string;
};

/** Figma Button group, implemented with PrimeReact SelectButton selection and ARIA. */
export function ButtonGroup({ items, size = 'md', multiple = false, value, defaultValue = null, allowEmpty = multiple, onValueChange, disabled = false, className = '', ...props }: ButtonGroupProps) {
  const [localValue, setLocalValue] = useState<ButtonGroupValue>(defaultValue);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const rawValue = value === undefined ? localValue : value;
  const selectedValue = multiple ? (Array.isArray(rawValue) ? rawValue : rawValue === null ? [] : [rawValue]) : (Array.isArray(rawValue) ? rawValue[0] ?? null : rawValue);
  const side = (index: number) => items.length === 1 ? 'single' : index === 0 ? 'left' : index === items.length - 1 ? 'right' : 'center';
  const groupClass = `grg-button-group ${className}`;

  const enabled = disabled ? [] : items.filter(item => !item.disabled);
  const tabId = enabled.find(item => item.id === focusedId)?.id
    ?? enabled.find(item => Array.isArray(selectedValue) ? selectedValue.includes(item.id) : selectedValue === item.id)?.id
    ?? enabled[0]?.id;

  // PrimeReact 10.9.9's arrow handler includes disabled options and its button role lacks Enter.
  // Keep its selection model and ARIA; fill these keyboard gaps with one enabled Tab stop.
  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.currentTarget.getAttribute('aria-disabled') === 'true') return;
    if (event.key === 'Enter') {
      event.preventDefault(); event.stopPropagation(); event.currentTarget.click(); return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const buttons = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLElement>('[role="button"]:not([aria-disabled="true"])'));
    const index = buttons.indexOf(event.currentTarget);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return <SelectButton {...props} unstyled className={groupClass} options={items} optionLabel="label" optionValue="id" optionDisabled="disabled"
    value={selectedValue} multiple={multiple} disabled={disabled} allowEmpty={multiple || allowEmpty}
    onChange={event => {
      // PrimeReact's allowEmpty=false blocks every deselection in multiple mode; only reject an empty result.
      if (!allowEmpty && (event.value === null || (Array.isArray(event.value) && event.value.length === 0))) return;
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
        'data-preview-state': item.previewState === 'default' ? undefined : item.previewState,
        'data-selected': context.selected || undefined,
        'aria-label': item['aria-label'] || item.label,
        tabIndex: !context.disabled && item.id === tabId ? 0 : -1,
        onFocus: event => {
          setFocusedId(item.id);
          // A partly visible option in a scrolling row must become fully visible, including its ring.
          event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        },
        onKeyDownCapture: handleKey,
      };
    } }}
  />;
}
