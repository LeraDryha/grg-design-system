import { cloneElement, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { TabPanel, TabView, type TabPanelHeaderTemplateOptions } from 'primereact/tabview';
import { Badge } from '../Badge/Badge';
import { Icon, type IconName } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import { TransactionIcon, type TransactionType } from '../TransactionIcon/TransactionIcon';
import './TabMenu.css';

/* Figma page ❖ Tab Menu: "Tab menu horizontal" (574:32575), "Tab menu vertical" (574:32759), their items
   (574:32525, 574:32666) and "Usage Guidelines" (646:32013). */

/** One tab: Figma Tab menu horizontal item / vertical item */
export type TabMenuItem = {
  id: string;
  /** Figma Label */
  label: string;
  /** Figma Icon: a Base icon before the label */
  icon?: IconName;
  /** Figma Transaction icon (vertical): the kind of transaction instead of an icon */
  transaction?: TransactionType;
  /** Figma Badge: a count after the label, such as unread items */
  badge?: number | string;
  disabled?: boolean;
};

export type TabMenuProps = {
  items: TabMenuItem[];
  /** The id of the open tab */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Figma Tab menu horizontal (an underline) or vertical (a bar on the left) */
  orientation?: 'horizontal' | 'vertical';
  /** Figma Text off: icons only, each named in a tooltip */
  iconOnly?: boolean;
  /** Vertical: Figma Content divider text, a small title over the tabs */
  title?: string;
  /** Vertical: Figma Arrow, a chevron at the end of each tab */
  arrow?: boolean;
  /** What the tabs are, for screen readers, when there is no title */
  'aria-label'?: string;
  /** The content of the open tab (Figma Tab view) */
  children?: (item: TabMenuItem) => ReactNode;
  /** Something at the end of the tab row, such as "Mark all as read" (horizontal) */
  end?: ReactNode;
  className?: string;
};

/**
 * Switches between views of the same place: All and Unread, sections of a settings page. PrimeReact TabView
 * (unstyled) gives the tab roles, the panels and the arrow keys; the faces are the Figma items. The vertical tabs also
 * move with the up and down arrows, which PrimeReact doesn't do.
 */
export function TabMenu({
  items, value, defaultValue, onChange, orientation = 'horizontal', iconOnly = false, title, arrow = false,
  'aria-label': label, children, end, className = '',
}: TabMenuProps) {
  const [local, setLocal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? local;
  const activeIndex = Math.max(0, items.findIndex(item => item.id === active));
  const vertical = orientation === 'vertical';

  const choose = (index: number) => {
    const id = items[index]?.id;
    if (id === undefined) return;
    if (value === undefined) setLocal(id);
    onChange?.(id);
  };

  // Vertical tabs: up and down move between them like left and right
  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!vertical || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])'));
    const index = tabs.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    tabs[(index + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length]?.focus();
  };

  /* PrimeReact's own tab element keeps its role, ids, keys and clicks: only what is inside it is replaced */
  const face = (item: TabMenuItem) => (options: TabPanelHeaderTemplateOptions) => {
    const element = options.element as ReactElement<{ className?: string; children?: ReactNode }>;
    const tab = cloneElement(
      element,
      { className: 'grg-tab' },
      <>
        {item.transaction
          ? <TransactionIcon type={item.transaction} size="sm" />
          : item.icon && <Icon name={item.icon} size={20} className="grg-tab__icon" />}
        <span className={iconOnly ? 'grg-sr-only' : 'grg-tab__label'}>{item.label}</span>
        {item.badge !== undefined && !iconOnly && (
          <Badge variant="light" size="sm" type="numeric" color="neutral" value={item.badge} className="grg-tab__badge" />
        )}
        {vertical && arrow && <Icon name="direction-right" size={20} className="grg-tab__arrow" />}
      </>,
    );
    return iconOnly ? <Tooltip title={item.label} side={vertical ? 'right' : 'bottom'} purpose="repeat">{tab}</Tooltip> : tab;
  };

  return (
    <div className={`grg-tab-menu ${className}`} data-orientation={orientation} data-icon-only={iconOnly || undefined} onKeyDownCapture={onKeyDownCapture}>
      {vertical && title && <p className="grg-tab-menu__title">{title}</p>}
      <TabView
        activeIndex={activeIndex}
        onTabChange={event => choose(event.index)}
        pt={{
          root: { className: 'grg-tab-menu__view' },
          navContainer: { className: 'grg-tab-menu__bar' },
          navContent: { className: 'grg-tab-menu__nav-content' },
          nav: {
            className: 'grg-tab-menu__nav',
            'aria-orientation': orientation,
            'aria-label': title ?? label,
          } as object,
          inkbar: { className: 'grg-tab-menu__ink' },
          panelContainer: { className: 'grg-tab-menu__panels' },
        }}
      >
        {items.map(item => (
          <TabPanel
            key={item.id}
            header={item.label}
            disabled={item.disabled}
            headerTemplate={face(item)}
            pt={{
              header: { className: 'grg-tab-menu__item', 'data-active': item.id === active || undefined } as object,
              content: { className: 'grg-tab-menu__panel' },
            }}
          >
            {children?.(item)}
          </TabPanel>
        ))}
      </TabView>
      {end && <div className="grg-tab-menu__end">{end}</div>}
    </div>
  );
}
