import type { HTMLAttributes } from 'react';
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

/** Pass-through classes for the PrimeReact Dropdown panel, list, search and options. */
export function dropdownPanelPt(label: string): DropdownPassThroughOptions {
  return {
    panel: { className: 'grg-dropdown' },
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
