import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Chips as PrimeChips } from 'primereact/chips';
import { Button as PrimeButton } from 'primereact/button';
import { Icon } from '../Icon/Icon';
import { FormField } from '../FormField/FormField';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import '../Chip/Chip.css';
import './MultiValueInput.css';

export type MultiValueInputProps = {
  /** Figma Label: the floating label, inside the empty field */
  label: string;
  /** Figma Size: lg-44, md-40, sm-32 (sm uses sm-20 chips) */
  size?: 'lg' | 'md' | 'sm';
  /** Figma Required asterisk */
  required?: boolean;
  /** Figma Additional text: "(Optional)" or your own words */
  optional?: boolean | string;
  /** Figma Top Key Value */
  topKey?: string;
  topValue?: string;
  /** Figma Bottom Key Value */
  bottomValue?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  info?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** PrimeReact separator; Enter always commits a value. */
  separator?: string;
  allowDuplicate?: boolean;
  /** Figma guideline: at most three rows before +N more. */
  collapsedRows?: number;
  moreLabel?: (count: number) => string;
  lessLabel?: string;
  className?: string;
};
const EMPTY: string[] = [];
const moreText = (count: number) => `+${count} more`;

/** Figma Multi-value Input: several values in one field, each a removable chip.
 * PrimeReact Chips supplies value entry, paste, removal and arrow-key navigation.
 * The measured overflow and expansion control implement the GRG three-row guideline. */
export function MultiValueInput({ label, size = 'md', required, optional, topKey, topValue, bottomValue, value: controlled, defaultValue = EMPTY, onChange, placeholder,
  hint, error, info, disabled = false, readOnly = false, separator = ',', allowDuplicate = false,
  collapsedRows = 3, moreLabel = moreText, lessLabel = 'Show less', className = '',
}: MultiValueInputProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [inputSlot, setInputSlot] = useState<HTMLLIElement | null>(null);
  const [local, setLocal] = useState(defaultValue);
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(defaultValue.length);
  const values = controlled ?? local;
  const overflowing = visibleCount < values.length;
  const collapsed = overflowing && !expanded;
  useKeyboardNavigation(root);
  useLayoutEffect(() => {
    setInputSlot(root.current?.querySelector<HTMLLIElement>('.grg-multi-value__entry') ?? null);
  }, []);

  useLayoutEffect(() => {
    const measureRoot = mirror.current;
    const list = root.current?.querySelector<HTMLElement>('.grg-multi-value__list');
    if (!measureRoot || !list) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const style = getComputedStyle(list);
      const width = list.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (width <= 0) return;
      const gap = parseFloat(style.columnGap) || 0;
      const widths = Array.from(measureRoot.querySelectorAll<HTMLElement>('[data-measure-chip]'), n => Math.min(n.getBoundingClientRect().width, width));
      const more = measureRoot.querySelector<HTMLElement>('[data-measure-more]')!;
      const maxRows = Math.max(1, Math.floor(collapsedRows));
      const rowsFor = (items: number[]) => {
        let row = 1, used = 0;
        for (const item of items) {
          const next = Math.min(item, width);
          if (used && used + gap + next > width + 0.5) { row++; used = next; }
          else used += (used ? gap : 0) + next;
        }
        return row;
      };
      const inputWidth = parseFloat(getComputedStyle(list.querySelector('input')!).minWidth) || 0;
      if (rowsFor([...widths, inputWidth]) <= maxRows) { setVisibleCount(values.length); return; }
      let count = values.length - 1;
      for (; count >= 0; count--) {
        more.textContent = moreLabel(values.length - count);
        if (rowsFor([...widths.slice(0, count), more.getBoundingClientRect().width]) <= maxRows) break;
      }
      setVisibleCount(Math.max(0, count));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    document.fonts.ready.then(measure);
    return () => { alive = false; observer.disconnect(); };
  }, [values, collapsedRows, moreLabel, readOnly, disabled]);

  useLayoutEffect(() => {
    // Keep the complete value in PrimeReact; collapsing only affects presentation, never stored data.
    root.current?.querySelectorAll<HTMLElement>('.grg-multi-value__token').forEach((token, index) => {
      token.hidden = collapsed && index >= visibleCount;
    });
  }, [values, collapsed, visibleCount]);

  const toggle = () => {
    setExpanded(!expanded);
    // Keep keyboard focus on the expansion control through reflow.
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('.grg-multi-value__more')?.focus({ preventScroll: true }));
  };
  const contentId = `${id}-values`;
  const chipSize = size === 'sm' ? 'sm' : 'md';
  return <FormField controlId={id} hintId={`${id}-hint`} label={label} info={info} required={required} optional={optional}
    topKey={topKey} topValue={topValue} bottomValue={bottomValue}
    labelVisible={focused || values.length > 0} labelState={focused ? 'active' : 'default'}
    hint={hint} error={error} disabled={disabled} className={`grg-multi-value ${className}`}>
    <div ref={root} className="grg-multi-value__frame" data-size={size} data-focused={focused || undefined} data-disabled={disabled || undefined}
      data-invalid={!!error || undefined} data-collapsed={collapsed || undefined}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onPasteCapture={event => { if (disabled || readOnly) { event.preventDefault(); event.stopPropagation(); } }}
      onKeyDownCapture={event => {
        if (collapsed && ['ArrowLeft', 'ArrowRight', 'Backspace'].includes(event.key)) setExpanded(true);
        if (readOnly && ['Backspace', 'Delete', 'Enter'].includes(event.key) && event.target === input.current) event.preventDefault();
      }}>
      <PrimeChips unstyled inputId={id} inputRef={input} value={values} disabled={disabled} readOnly={readOnly}
        separator={separator} allowDuplicate={allowDuplicate} aria-label={label}
        placeholder={values.length ? placeholder : placeholder ?? label}
        aria-describedby={hint || error ? `${id}-hint` : undefined} aria-invalid={!!error || undefined}
        onChange={event => {
          if (disabled || readOnly) return;
          const next = event.value ?? [];
          // Do not hide the focused entry when a newly added value creates overflow.
          if (next.length > values.length) setExpanded(true);
          // PrimeReact 10 keeps a removed token's index. Return to entry so the active
          // descendant never references a missing token and arrows remain usable.
          if (next.length < values.length && document.activeElement === root.current?.querySelector('.grg-multi-value__list')) {
            setExpanded(true);
            requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
          }
          if (controlled === undefined) setLocal(next);
          onChange?.(next);
        }}
        removeIcon={options => <span className={options.iconProps.className} onClick={options.iconProps.onClick} aria-hidden="true"><Icon name="remove" size={16} /></span>}
        pt={{
          root: { className: 'grg-multi-value__root' },
          // PrimeReact 10 puts the textbox inside its listbox. An editable group permits
          // mixed controls and retains its supported aria-activedescendant navigation.
          container: { id: contentId, className: 'grg-multi-value__list', role: 'group', 'aria-orientation': undefined, 'aria-label': label, 'aria-describedby': hint || error ? `${id}-hint` : undefined },
          token: { role: 'group', 'aria-selected': undefined, 'aria-setsize': undefined, 'aria-posinset': undefined, className: 'grg-multi-value__token grg-chip', 'data-size': chipSize, 'data-variant': 'filled', 'data-removable': !readOnly && !disabled || undefined, 'aria-disabled': disabled || undefined },
          label: { className: 'grg-chip__label' },
          removeTokenIcon: { className: 'grg-multi-value__remove' },
          input: { className: 'grg-multi-value__input' },
          inputToken: { className: 'grg-multi-value__entry', role: 'presentation' },
        }} />
      {inputSlot && overflowing && createPortal(<PrimeButton unstyled type="button" className="grg-multi-value__more"
        aria-expanded={expanded} aria-controls={contentId} disabled={disabled} onClick={event => { event.stopPropagation(); toggle(); }}
        onKeyDown={event => event.stopPropagation()}>{expanded ? lessLabel : moreLabel(values.length - visibleCount)}</PrimeButton>, inputSlot)}
      <div ref={mirror} className="grg-multi-value__measure" aria-hidden="true" inert>
        {values.map((value, index) => <span key={index} data-measure-chip className="grg-chip" data-size={chipSize} data-removable={!readOnly && !disabled || undefined}>
          <span className="grg-chip__label">{value}</span>{!readOnly && !disabled && <Icon name="remove" size={16} />}
        </span>)}
        <span data-measure-more className="grg-multi-value__more">{moreLabel(values.length)}</span>
      </div>
    </div>
  </FormField>;
}
