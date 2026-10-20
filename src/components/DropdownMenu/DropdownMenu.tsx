import { cloneElement, useId, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import type { MenuItemOptions } from 'primereact/menuitem';
import { TieredMenu } from 'primereact/tieredmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Icon, type IconName } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { DropdownMenuItem, type DropdownMenuItemContent } from './DropdownMenuItem';
import '../Select/Dropdown.css';
import './DropdownMenu.css';

/** A row that does something: picture, label, description, badge; with `items` it opens a submenu */
export type DropdownMenuAction = DropdownMenuItemContent & {
  kind?: 'item';
  onSelect?: () => void;
  /** Goes to a page instead */
  href?: string;
  /** A submenu (Figma Arrow) */
  items?: DropdownMenuEntry[];
  /** A check at the end, for a choice such as "Sort by" */
  selected?: boolean;
};

/** Everything a dropdown menu can hold (Figma Dropdown menu item and Dropdown misc items) */
export type DropdownMenuEntry =
  | DropdownMenuAction
  /** Who the menu belongs to: an avatar with a name and an email, not clickable */
  | (DropdownMenuItemContent & { kind: 'header' })
  /** Content divider line */
  | { kind: 'divider' }
  /** Content divider text: a small title over a group, such as "Support" */
  | { kind: 'section'; label: string }
  /** Caption: a short note, such as a version, with an optional text button */
  | { kind: 'caption'; text: string; action?: { label: string; icon?: IconName; onSelect: () => void } }
  /** Button: a full-width outline button at the end, such as "Add new account" */
  | { kind: 'button'; label: string; icon?: IconName; onSelect: () => void };

export type DropdownMenuProps = {
  items: DropdownMenuEntry[];
  /** The control that opens the menu; spread the given props on it */
  trigger?: (props: { onClick: (event: MouseEvent<HTMLElement>) => void; 'aria-haspopup': 'menu'; 'aria-expanded': boolean; 'aria-controls': string }) => ReactNode;
  /** Shown in place, always open (documentation, or a menu inside a panel) */
  inline?: boolean;
  /** The menu's name for screen readers, such as "Account" */
  'aria-label': string;
  /** Width of the menu; the Figma examples use 240 or 320 */
  width?: number;
  /** Where the menu opens under the trigger */
  align?: 'start' | 'end';
  className?: string;
};

/**
 * A list of actions that opens from a button: create, go to, change a setting, sign out. PrimeReact TieredMenu
 * (unstyled) gives the keyboard (arrows, Enter, Escape, → into a submenu) and the menu roles; the rows are the
 * Figma Dropdown menu item. For choosing a value in a form, use Select.
 */
export function DropdownMenu({ items, trigger, inline = false, 'aria-label': label, width, align = 'start', className = '' }: DropdownMenuProps) {
  const id = useId();
  const menu = useRef<TieredMenu>(null);
  const [open, setOpen] = useState(false);

  /* PrimeReact activates a row (pointer, Enter, Space) through its action link: keep that link and only replace
     what is inside it, so commands, links and the keyboard work as in PrimeReact. */
  const inAction = (content: ReactNode) => (_item: MenuItem, options: MenuItemOptions) =>
    cloneElement(options.element as ReactElement<{ children?: ReactNode }>, {}, content);

  const toModel = (entries: DropdownMenuEntry[]): MenuItem[] =>
    entries.map((entry): MenuItem => {
      if (entry.kind === 'divider') return { separator: true };
      if (entry.kind === 'section') {
        return { label: entry.label, disabled: true, className: 'grg-dropdown-menu__section', template: () => <span className="grg-dropdown-menu__section-text">{entry.label}</span> };
      }
      if (entry.kind === 'caption') {
        return {
          label: entry.action?.label ?? entry.text,
          disabled: !entry.action,
          command: entry.action?.onSelect,
          className: 'grg-dropdown-menu__caption',
          template: inAction(
            <span className="grg-dropdown-menu__caption-row">
              <span className="grg-dropdown-menu__caption-text">{entry.text}</span>
              {entry.action && (
                // The look of a text button; the whole row is the action, so it isn't a second control
                <span className="grg-dropdown-menu__caption-button" aria-hidden="true">
                  <Button variant="text" size="sm" leftIcon={entry.action.icon} tabIndex={-1}>
                    {entry.action.label}
                  </Button>
                </span>
              )}
            </span>,
          ),
        };
      }
      if (entry.kind === 'button') {
        return {
          label: entry.label,
          command: entry.onSelect,
          className: 'grg-dropdown-menu__button',
          template: inAction(
            <span className="grg-dropdown-menu__button-face">
              {entry.icon && <Icon name={entry.icon} size={20} />}
              {entry.label}
            </span>,
          ),
        };
      }
      if (entry.kind === 'header') {
        const { kind: _kind, ...content } = entry;
        return { label: entry.label, disabled: true, className: 'grg-dropdown-menu__header', template: () => <DropdownMenuItem {...content} /> };
      }
      const { kind: _kind, onSelect, href, items: sub, selected, ...content } = entry;
      return {
        label: entry.label,
        url: href,
        disabled: entry.disabled,
        command: onSelect,
        items: sub ? toModel(sub) : undefined,
        template: inAction(<DropdownMenuItem {...content} selected={selected} arrow={!!sub} />),
      };
    });

  const style = width ? { width } : undefined;
  const tiered = (
    <TieredMenu
      ref={menu}
      id={`${id}-menu`}
      model={toModel(items)}
      popup={!inline}
      appendTo="self"
      onShow={() => setOpen(true)}
      onHide={() => setOpen(false)}
      submenuIcon={null}
      style={style}
      // `content` (the row inside each item) exists at runtime but is missing from PrimeReact's types
      pt={{
        root: { className: `grg-dropdown grg-dropdown-menu ${inline ? 'grg-dropdown-menu--inline' : ''}` },
        menu: { className: 'grg-dropdown__list grg-dropdown-menu__list', 'aria-label': label } as object,
        submenu: { className: 'grg-dropdown grg-dropdown__list grg-dropdown-menu__submenu' },
        menuitem: { className: 'grg-dropdown__option grg-dropdown-menu__item' },
        content: { className: 'grg-dropdown-menu__content' },
        action: { className: 'grg-dropdown-menu__action' },
        separator: { className: 'grg-dropdown-menu__divider' },
      } as object}
    />
  );

  if (inline) return <div className={`grg-dropdown-menu-host ${className}`}>{tiered}</div>;
  return (
    <div className={`grg-dropdown-menu-host ${className}`} data-align={align}>
      {trigger?.({
        onClick: event => menu.current?.toggle(event),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': `${id}-menu`,
      })}
      {tiered}
    </div>
  );
}
