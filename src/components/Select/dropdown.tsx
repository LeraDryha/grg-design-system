import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type RefObject } from 'react';
import type { DropdownPassThroughOptions } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import { DropdownMenuItem } from '../DropdownMenu/DropdownMenuItem';
import type { SelectOption } from './options';
import './Dropdown.css';

/*
 * The open list shared by Select, Compact select and Inline select, after the Figma Dropdown menu
 * (panel, Dropdown menu item, Dropdown misc items: Search and Content divider line). Its rows are the same
 * Dropdown menu item as in Dropdown Menu.
 */

/** A row of the list: picture, label, description, and a check (single) or a checkbox (multiple) at the end. */
export function DropdownItem({ option, selected, multiple = false }: { option: SelectOption; selected: boolean; multiple?: boolean }) {
  const { value: _value, listLabel, label, ...content } = option;
  return <DropdownMenuItem {...content} label={listLabel ?? label} selected={selected} multiple={multiple} />;
}

/** Loading rows (Figma Skeleton): grey bars in the place of the options while they load */
export function DropdownSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <span className="grg-dropdown__skeleton" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <span key={i} className="grg-dropdown__skeleton-row" />)}
    </span>
  );
}

/** Up to 9 rows show without scrolling; a search row comes with more than 10 options (Figma guidelines). */
export const SEARCH_FROM = 11;

/** The list's height before it scrolls: nine 40px rows and their gaps. PrimeReact sets it inline (200px by default). */
export const LIST_HEIGHT = 'calc(var(--space-4000) * 2 + var(--space-1400))';

/**
 * Inside a modal the open list is drawn over the modal (fixed to the screen), so it is never cut off by the modal or
 * pushes its scrolling content aside. It stays in the modal's markup, next to its field: the modal is `aria-modal`, and
 * screen readers must keep reaching the options. Outside a modal nothing changes.
 * Call `place` when the list opens; it follows scrolling, resizing and a list that changes height (search).
 */
export function useListLayer(root: RefObject<HTMLElement | null>) {
  const [inModal, setInModal] = useState(false);
  useLayoutEffect(() => setInModal(!!root.current?.closest('.grg-modal-dialog')), [root]);
  const stop = useRef<() => void>(undefined);
  useEffect(() => () => stop.current?.(), []);

  const place = () => {
    stop.current?.();
    const host = root.current;
    const panel = host?.querySelector<HTMLElement>('.grg-dropdown');
    if (!inModal || !host || !panel) return;
    // The offsets and the smallest width the field gives its list, read before the list leaves the flow
    const before = getComputedStyle(panel);
    const gap = Math.abs(parseFloat(before.marginTop)) || 0;
    const shift = parseFloat(before.marginLeft) || 0;
    const minWidth = parseFloat(before.minWidth) || 0;
    panel.setAttribute('data-layer', 'top');
    let busy = false;
    const placed = { top: '', left: '' };
    const update = () => {
      if (busy) return;
      busy = true;
      panel.style.position = 'fixed';
      const field = host.getBoundingClientRect();
      panel.style.minWidth = `${Math.max(minWidth, field.width)}px`;
      const height = panel.offsetHeight;
      const below = field.bottom + gap;
      const top = below + height > window.innerHeight && field.top - gap - height > 0 ? field.top - gap - height : below;
      const left = Math.min(field.left + shift, window.innerWidth - panel.offsetWidth - gap);
      // A transformed or filtered ancestor (the overlay's blur) moves "fixed": measure where 0,0 lands and correct
      panel.style.top = '0px';
      panel.style.left = '0px';
      const origin = panel.getBoundingClientRect();
      panel.style.top = `${top - origin.top}px`;
      panel.style.left = `${Math.max(gap, left) - origin.left}px`;
      placed.top = panel.style.top;
      placed.left = panel.style.left;
      busy = false;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    // PrimeReact positions the list itself (next to the field) as it opens and filters: put it back over the modal
    const restyled = new MutationObserver(() => {
      if (panel.style.position !== 'fixed' || panel.style.top !== placed.top || panel.style.left !== placed.left) update();
    });
    restyled.observe(panel, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('resize', update);
    document.addEventListener('scroll', update, true);
    stop.current = () => {
      observer.disconnect();
      restyled.disconnect();
      window.removeEventListener('resize', update);
      document.removeEventListener('scroll', update, true);
      stop.current = undefined;
    };
  };
  return { place, release: () => stop.current?.() };
}

/** Pass-through classes for the PrimeReact Dropdown panel, list, search and options. `owner` names the field the
 *  list belongs to, for its own offsets. */
export function dropdownPanelPt(label: string, owner = 'select'): DropdownPassThroughOptions {
  return {
    panel: { className: `grg-dropdown grg-dropdown--${owner}` },
    header: { className: 'grg-dropdown__header' },
    filterContainer: { className: 'grg-dropdown__search' },
    filterInput: { className: 'grg-dropdown__search-input', 'aria-label': `Search ${label.toLowerCase()}` },
    wrapper: { className: 'grg-dropdown__scroll' },
    list: { className: 'grg-dropdown__list', 'aria-label': label },
    // The visible template may use listLabel. Let its text name the option instead of Prime's short label.
    item: { className: 'grg-dropdown__option', 'aria-label': undefined },
    itemLabel: { className: 'grg-dropdown__item-wrap' },
    // Inside a listbox the message must be an option; it can't be chosen
    emptyMessage: { className: 'grg-dropdown__empty', role: 'option', 'aria-disabled': true, 'aria-selected': false } as object,
  };
}

/** Icons for the search row (Figma: search, remove). Functions, so PrimeReact's handlers (clear the search) reach them. */
type IconOptions = { iconProps: HTMLAttributes<HTMLSpanElement> };
export const searchIcons = {
  filterIcon: <span className="grg-dropdown__search-icon" aria-hidden="true"><Icon name="search" size={20} /></span>,
  filterClearIcon: ({ iconProps }: IconOptions) => (
    <span {...iconProps} className="grg-dropdown__search-clear" role="button" aria-label="Clear search">
      <Icon name="remove" size={20} />
    </span>
  ),
};
