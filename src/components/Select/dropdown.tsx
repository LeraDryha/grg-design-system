import type { DropdownPassThroughOptions } from 'primereact/dropdown';
import { Icon } from '../Icon/Icon';
import { OptionPicture, type SelectOption } from './options';
import './Dropdown.css';

/*
 * The open list shared by Select, Compact select and Inline select, after the Figma Dropdown menu
 * (panel, Dropdown menu item, Dropdown misc items: Search and Content divider line). The full Dropdown menu
 * component (badges, descriptions, checkboxes, captions) is built separately.
 */

/** A row of the list: picture, label, and a check on the selected option (Dropdown menu item). */
export function DropdownItem({ option, selected }: { option: SelectOption; selected: boolean }) {
  return (
    <span className="grg-dropdown__item">
      <OptionPicture option={option} />
      <span className="grg-dropdown__label">{option.listLabel ?? option.label}</span>
      {selected && <Icon name="check" size={20} />}
    </span>
  );
}

/** Pass-through classes for the PrimeReact Dropdown panel, list, search and options. */
export function dropdownPanelPt(label: string): DropdownPassThroughOptions {
  return {
    panel: { className: 'grg-dropdown' },
    header: { className: 'grg-dropdown__header' },
    filterContainer: { className: 'grg-dropdown__search' },
    filterInput: { className: 'grg-dropdown__search-input', 'aria-label': `Search ${label.toLowerCase()}` },
    wrapper: { className: 'grg-dropdown__scroll' },
    list: { className: 'grg-dropdown__list', 'aria-label': label },
    item: { className: 'grg-dropdown__option' },
    itemLabel: { className: 'grg-dropdown__item-wrap' },
    emptyMessage: { className: 'grg-dropdown__empty' },
  };
}

/** Icons for the search row (Figma: search, remove). */
export const searchIcons = {
  filterIcon: <span className="grg-dropdown__search-icon" aria-hidden="true"><Icon name="search" size={20} /></span>,
  filterClearIcon: <span className="grg-dropdown__search-clear" aria-hidden="true"><Icon name="remove" size={20} /></span>,
};
