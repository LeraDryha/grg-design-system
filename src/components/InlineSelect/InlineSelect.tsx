import { useEffect, useId, useRef, type RefObject } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import './InlineSelect.css';

export type InlineSelectOption = {
  value: string;
  /** Text shown in the field, such as "+359" or "USD" */
  label: string;
  /** Text in the open list, such as "Bulgaria +359"; falls back to `label` */
  listLabel?: string;
  /** Flag, coin or other picture (URL) */
  image?: string;
};

export type InlineSelectProps = {
  options: InlineSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** The name screen readers announce, such as "Country code" */
  'aria-label': string;
  /** Figma Type: Country (flag), Coin, Icon; only changes how the picture is drawn */
  type?: 'country' | 'coin' | 'icon';
  disabled?: boolean;
  className?: string;
};

/**
 * PrimeReact 10 Dropdown focuses a hidden read-only input but gives it no name, combobox role, expanded state
 * or active option. This keeps those attributes in sync, so screen readers hear a named combobox and the
 * option highlighted with the arrow keys. (Same fix as in the marketing Storybook.)
 */
function useDropdownCombobox(rootRef: RefObject<HTMLDivElement | null>, inputRef: RefObject<HTMLInputElement | null>, listId: string, label: string) {
  useEffect(() => {
    const root = rootRef.current;
    const input = inputRef.current;
    if (!root || !input) return;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-label', label);
    const sync = () => {
      const list = root.querySelector<HTMLElement>('[role="listbox"]');
      input.setAttribute('aria-expanded', String(!!list));
      if (list) {
        list.id = listId;
        input.setAttribute('aria-controls', listId);
      } else {
        input.removeAttribute('aria-controls');
      }
      const active = list?.querySelector<HTMLElement>('[role="option"][data-p-focused="true"]');
      if (active?.id) input.setAttribute('aria-activedescendant', active.id);
      else input.removeAttribute('aria-activedescendant');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-p-focused'] });
    return () => observer.disconnect();
  }, [rootRef, inputRef, listId, label]);
}

function Option({ option }: { option?: InlineSelectOption }) {
  if (!option) return null;
  return (
    <span className="grg-inline-select__value">
      {option.image && <img className="grg-inline-select__image" src={option.image} alt="" />}
      <span>{option.label}</span>
    </span>
  );
}

/**
 * Figma "Inline select": a compact select inside a field, such as the country code of a phone number
 * or the coin of an amount. PrimeReact Dropdown (unstyled).
 * The open list has no design of its own yet: it uses the surface, shadow and text tokens until the
 * Dropdown menu component is built.
 */
export function InlineSelect({ options, value, onChange, type = 'country', disabled, className = '', 'aria-label': label }: InlineSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDropdownCombobox(rootRef, inputRef, `${id}-list`, label);
  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div className={`grg-inline-select ${className}`} data-type={type} ref={rootRef}>
      <Dropdown
        inputId={id}
        focusInputRef={inputRef}
        appendTo="self"
        options={options}
        optionValue="value"
        optionLabel="label"
        value={selected?.value}
        disabled={disabled}
        onChange={e => onChange?.(e.value)}
        valueTemplate={() => <Option option={selected} />}
        itemTemplate={(o: InlineSelectOption) => (
          <span className="grg-inline-select__value">
            {o.image && <img className="grg-inline-select__image" src={o.image} alt="" />}
            <span>{o.listLabel ?? o.label}</span>
          </span>
        )}
        dropdownIcon={<Icon name="direction-down" size={20} />}
        collapseIcon={<Icon name="direction-down" size={20} />}
        pt={{
          root: { className: 'grg-inline-select__root', 'aria-activedescendant': undefined, 'aria-disabled': disabled || undefined },
          input: { className: 'grg-inline-select__label' },
          // the native <select> PrimeReact keeps for form submit is not for assistive technology
          select: { 'aria-hidden': true },
          hiddenSelectedMessage: { className: 'grg-sr-only' },
          trigger: { className: 'grg-inline-select__trigger', 'aria-hidden': true },
          panel: { className: 'grg-inline-select__panel' },
          wrapper: { className: 'grg-inline-select__list-wrap' },
          list: { className: 'grg-inline-select__list', 'aria-label': label },
          item: { className: 'grg-inline-select__option' },
        }}
      />
    </div>
  );
}
