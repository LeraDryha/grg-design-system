import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { Icon, type IconName } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import './SegmentControl.css';

/* Figma page ❖ Segment control: "Segment control" (204:21043), "Segment control item" (204:20934),
   "Usage Guidelines" (786:69807) and "Examples" (790:5480). */

/** One segment: Figma Segment control item */
export type Segment = {
  value: string;
  /** Figma Edit text. With `iconOnly` it names the segment in a tooltip and for screen readers */
  label: string;
  /** Figma Icon: a Base icon before the label */
  icon?: IconName;
  /** Figma State = Active-green / Active-red: the colour of this segment when it is selected, such as Buy and Sell */
  color?: 'green' | 'red';
  disabled?: boolean;
};

export type SegmentControlProps = {
  /** 2 to 6 segments (Figma Quantity 02–06) */
  segments: Segment[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** `choice` picks a value (heard as a set of options); `tabs` switches the content under it (heard as tabs) */
  role?: 'choice' | 'tabs';
  /** The content of the selected segment, with role `tabs` (Figma Content view) */
  children?: (segment: Segment) => ReactNode;
  /** Equal segments across the whole width (as Buy and Sell), or each segment as wide as its content */
  fullWidth?: boolean;
  /** Figma Icon only: icons without labels, each named in a tooltip */
  iconOnly?: boolean;
  /** What is being chosen, for screen readers, such as "Order side" */
  'aria-label': string;
  disabled?: boolean;
  className?: string;
};

/**
 * Picks one of a few options in a row, or switches between views of the same content. PrimeReact SelectButton
 * (unstyled) gives the segments and the clicks; the keyboard follows the radio or tab pattern of the role: the
 * arrow keys move and choose, Tab enters and leaves in one step. One segment is always selected.
 */
export function SegmentControl({
  segments, value: controlled, defaultValue, onChange, role = 'choice', children, fullWidth = false, iconOnly = false,
  'aria-label': label, disabled = false, className = '',
}: SegmentControlProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(defaultValue ?? segments.find(segment => !segment.disabled)?.value);
  const value = controlled ?? local;
  const selected = segments.find(segment => segment.value === value) ?? segments[0];
  const tabs = role === 'tabs';

  const choose = (next: string) => {
    if (controlled === undefined) setLocal(next);
    onChange?.(next);
  };

  /* The arrow keys move to the next enabled segment and choose it (radio and tab pattern); Enter and Space too.
     PrimeReact only moves focus with the arrows and doesn't answer Enter. */
  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Enter', ' '];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const enabled = segments.map((segment, index) => ({ segment, index })).filter(({ segment }) => !segment.disabled);
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('.grg-segment') ?? []);
    const focused = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Enter' || event.key === ' ') {
      const segment = segments[focused];
      if (segment && !segment.disabled) choose(segment.value);
      return;
    }
    const position = Math.max(0, enabled.findIndex(({ index }) => index === focused));
    const next =
      event.key === 'Home' ? enabled[0]
        : event.key === 'End' ? enabled[enabled.length - 1]
          : enabled[(position + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length];
    if (!next) return;
    choose(next.segment.value);
    items[next.index]?.focus();
  };

  const face = (segment: Segment) => (
    <span className="grg-segment__face">
      {segment.icon && <Icon name={segment.icon} size={16} className="grg-segment__icon" />}
      {!iconOnly && <span className="grg-segment__label">{segment.label}</span>}
    </span>
  );

  const control = (
    <div
      ref={root}
      className={`grg-segment-control ${className}`}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      data-disabled={disabled || undefined}
      onKeyDownCapture={onKeyDownCapture}
    >
      <SelectButton
        value={selected?.value}
        options={segments}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        disabled={disabled}
        allowEmpty={false}
        itemTemplate={face}
        onChange={event => event.value != null && choose(event.value)}
        aria-label={label}
        pt={{
          root: { className: 'grg-segment-control__track', role: tabs ? 'tablist' : 'radiogroup', 'aria-label': label } as object,
          button: ({ context }: { context: { selected: boolean; disabled: boolean; option: Segment } }) => {
            const index = segments.indexOf(context.option);
            return {
              className: 'grg-segment',
              id: `${id}-${index}`,
              role: tabs ? 'tab' : 'radio',
              'aria-pressed': undefined,
              'aria-checked': tabs ? undefined : context.selected,
              'aria-selected': tabs ? context.selected : undefined,
              'aria-controls': tabs ? `${id}-panel` : undefined,
              'aria-label': context.option.label,
              tabIndex: !disabled && context.selected ? 0 : -1,
              'data-selected': context.selected || undefined,
              'data-color': context.option.color,
            };
          },
        } as object}
      />
    </div>
  );

  // Icon-only segments show their names in tooltips (screen readers hear the names from the segments)
  const withTooltips = iconOnly ? <>{control}<SegmentTooltips root={root} segments={segments} /></> : control;

  if (!tabs || !children) return withTooltips;
  return (
    <div className="grg-segment-control__view">
      {withTooltips}
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${segments.indexOf(selected)}`} className="grg-segment-control__panel">
        {selected && children(selected)}
      </div>
    </div>
  );
}

/** A tooltip for each icon-only segment, on the segment element PrimeReact renders */
function SegmentTooltips({ root, segments }: { root: RefObject<HTMLDivElement | null>; segments: Segment[] }) {
  const [elements, setElements] = useState<HTMLElement[]>([]);
  useEffect(() => setElements(Array.from(root.current?.querySelectorAll<HTMLElement>('.grg-segment') ?? [])), [root, segments]);
  return (
    <>
      {elements.map((element, index) => (
        <Tooltip key={segments[index]?.value ?? index} target={element} title={segments[index]?.label ?? ''} side="bottom" purpose="repeat" />
      ))}
    </>
  );
}
