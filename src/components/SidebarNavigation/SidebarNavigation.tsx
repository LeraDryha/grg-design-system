import {
  createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore,
  type KeyboardEvent, type MouseEvent, type ReactElement, type SyntheticEvent, type ReactNode, type RefObject,
} from 'react';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { ActionButton } from '../ActionButton/ActionButton';
import { ApiIcon, type ApiMethod } from '../ApiIcon/ApiIcon';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { Icon, type IconName } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import './SidebarNavigation.css';

/* Figma page ❖ Navigation: "Sidebar items" (765:2532), "Header card" (765:2385), "User profile card" (765:11047)
   and "Feature cards" (769:16436), put together by "Usage Guidelines" (771:56482) and
   "Sidebar layout architecture – Guidelines" (771:56644). */

/** A page in the sidebar: one row of Figma Sidebar items */
export type SidebarItem = {
  id: string;
  /** Figma Edit text */
  label: string;
  href?: string;
  /** Figma Leading icon: first-level rows only, as the guidelines say */
  icon?: IconName;
  /** Figma Right badge: a short label after the text, such as "New" or a count */
  badge?: string;
  /** Figma Left badge: the HTTP method of an API endpoint (API icon) */
  apiMethod?: ApiMethod;
  /** Second-level pages (Figma Level = Child). The row then opens and closes them (Figma Arrow) */
  items?: SidebarItem[];
};

/** A group of rows under an optional title (Figma Content divider text, such as MAIN) */
export type SidebarSection = { title?: string; items: SidebarItem[] };

/** expanded 272px, collapsed 80px (icons only), drawer: hidden, slides in over the page. auto follows the screen */
export type SidebarLayout = 'auto' | 'expanded' | 'collapsed' | 'drawer';

/* auto: a drawer on phones, icons only on tablets and small laptops, the full sidebar from 1280px */
const DRAWER_QUERY = '(max-width: 767px)';
const COLLAPSED_QUERY = '(max-width: 1279px)';
const subscribe = (onChange: () => void) => {
  const queries = [DRAWER_QUERY, COLLAPSED_QUERY].map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener('change', onChange));
  return () => queries.forEach(query => query.removeEventListener('change', onChange));
};
const screenLayout = () =>
  window.matchMedia(DRAWER_QUERY).matches ? 'drawer' : window.matchMedia(COLLAPSED_QUERY).matches ? 'collapsed' : 'expanded';

/** The layout the sidebar has on this screen: the product shows its menu button when it is `drawer`. */
export function useSidebarLayout(layout: SidebarLayout = 'auto'): Exclude<SidebarLayout, 'auto'> {
  const fromScreen = useSyncExternalStore(subscribe, screenLayout, () => 'expanded' as const);
  return layout === 'auto' ? fromScreen : layout;
}

type NavState = {
  collapsed: boolean;
  current?: string;
  open: Set<string>;
  toggle: (id: string) => void;
  navigate: (item: SidebarItem, event?: MouseEvent<HTMLElement>) => void;
};
const SidebarContext = createContext<NavState>({ collapsed: false, open: new Set(), toggle: () => {}, navigate: () => {} });

/* ---- Rows ---- */

function ItemFace({ item, level, active }: { item: SidebarItem; level: 1 | 2; active: boolean }) {
  const { collapsed } = useContext(SidebarContext);
  if (collapsed) {
    return (
      <>
        {item.icon
          ? <Icon name={item.icon} size={20} className="grg-sidebar-item__icon" />
          // Collapsed rows need an icon; without one the first letter stands in
          : <span className="grg-sidebar-item__initial" aria-hidden="true">{item.label.slice(0, 1)}</span>}
        <span className="grg-sr-only">{item.badge ? `${item.label}, ${item.badge}` : item.label}</span>
        {item.badge && <span className="grg-sidebar-item__dot" aria-hidden="true" />}
      </>
    );
  }
  return (
    <>
      {level === 1 && item.icon && <Icon name={item.icon} size={20} className="grg-sidebar-item__icon" />}
      <span className="grg-sidebar-item__text">
        {item.apiMethod && <ApiIcon method={item.apiMethod} active={active} />}
        <span className="grg-sidebar-item__label">{item.label}</span>
        {item.badge && <Badge variant="light" size="sm" color="neutral" label={item.badge} leftIcon={null} rightIcon={null} />}
      </span>
      {item.items?.length ? <Icon name="direction-down" size={20} className="grg-sidebar-item__arrow" /> : null}
    </>
  );
}

function NavItem({ item, level }: { item: SidebarItem; level: 1 | 2 }) {
  const { collapsed, current, open, toggle, navigate } = useContext(SidebarContext);
  const listId = useId();
  const children = item.items ?? [];
  const isOpen = open.has(item.id);
  // A group shows the current page while it can't show the page itself: closed, or collapsed to an icon
  const active = item.id === current || (children.some(child => child.id === current) && (!isOpen || collapsed));
  const common = { className: 'grg-sidebar-item', 'data-level': level, 'data-active': active || undefined };
  const withTooltip = (control: ReactElement) => (
    <Tooltip title={item.label} side="right" purpose="repeat" disabled={!collapsed}>
      {control}
    </Tooltip>
  );

  if (!children.length) {
    return withTooltip(
      <a {...common} href={item.href} aria-current={item.id === current ? 'page' : undefined} onClick={event => navigate(item, event)}>
        <ItemFace item={item} level={level} active={active} />
      </a>,
    );
  }

  // Collapsed: the second-level pages open in a menu to the right
  if (collapsed) {
    const entries: DropdownMenuEntry[] = [
      { kind: 'section', label: item.label },
      ...children.map(child => ({ label: child.label, href: child.href, selected: child.id === current, onSelect: (event: SyntheticEvent) => navigate(child, event as MouseEvent<HTMLElement>) })),
    ];
    return (
      <DropdownMenu
        items={entries}
        aria-label={item.label}
        align="right-start"
        className="grg-sidebar__menu-host"
        trigger={props => withTooltip(
          <button type="button" {...common} {...props}>
            <ItemFace item={item} level={level} active={active} />
          </button>,
        )}
      />
    );
  }

  return (
    <>
      <button type="button" {...common} aria-expanded={isOpen} aria-controls={listId} onClick={() => toggle(item.id)}>
        <ItemFace item={item} level={level} active={active} />
      </button>
      <ul id={listId} className="grg-sidebar__list" hidden={!isOpen}>
        {children.map(child => <li key={child.id}><NavItem item={child} level={2} /></li>)}
      </ul>
    </>
  );
}

/** One row on its own, for documentation and custom layouts: a page, or a group that opens its pages */
export function SidebarNavigationItem({ item, current, collapsed = false, level = 1 }: { item: SidebarItem; current?: string; collapsed?: boolean; level?: 1 | 2 }) {
  return (
    <SidebarContext.Provider value={{ collapsed, current, open: new Set(), toggle: () => {}, navigate: () => {} }}>
      <div className="grg-sidebar" data-layout={collapsed ? 'collapsed' : 'expanded'} data-row>
        <NavItem item={item} level={level} />
      </div>
    </SidebarContext.Provider>
  );
}

function Section({ section }: { section: SidebarSection }) {
  const titleId = useId();
  return (
    <div className="grg-sidebar__section">
      {section.title && <p id={titleId} className="grg-sidebar__section-title">{section.title}</p>}
      <ul className="grg-sidebar__list" aria-labelledby={section.title ? titleId : undefined}>
        {section.items.map(item => <li key={item.id}><NavItem item={item} level={1} /></li>)}
      </ul>
    </div>
  );
}

/* ---- Header and footer cards ---- */

type CardProps = {
  /** A menu that opens from the card: other companies, or the account */
  menu?: DropdownMenuEntry[];
  /** The menu's name for screen readers */
  menuLabel?: string;
};

function Card({ kind, name, menu, menuLabel, children }: CardProps & { kind: 'header' | 'profile'; name: string; children: ReactNode }) {
  const { collapsed } = useContext(SidebarContext);
  const face = (props: object) => (
    <Tooltip title={name} side="right" purpose="repeat" disabled={!collapsed}>
      {menu
        ? <button type="button" className="grg-sidebar-card" data-kind={kind} {...props}>{children}</button>
        : <div className="grg-sidebar-card" data-kind={kind}>{children}</div>}
    </Tooltip>
  );
  if (!menu) return face({});
  return (
    <DropdownMenu
      items={menu}
      aria-label={menuLabel ?? name}
      // The company list opens under the card (beside it when collapsed); the account menu beside the card, upwards
      align={kind === 'profile' ? 'right-end' : collapsed ? 'right-start' : 'start'}
      width={240}
      className="grg-sidebar__menu-host"
      trigger={face}
    />
  );
}

/** Figma "Header card": the company, with a menu to switch to another one */
export type SidebarHeaderCardProps = CardProps & {
  /** Figma Company name */
  name: string;
  /** The company logo; a placeholder without it */
  logo?: string;
};

export function SidebarHeaderCard({ name, logo, menu, menuLabel = 'Switch company' }: SidebarHeaderCardProps) {
  const { collapsed } = useContext(SidebarContext);
  return (
    <Card kind="header" name={name} menu={menu} menuLabel={menuLabel}>
      <Avatar size={32} src={logo} name={name} shape="company" decorative />
      <span className={collapsed ? 'grg-sr-only' : 'grg-sidebar-card__name'}>{name}</span>
      {menu && !collapsed && <Icon name="expand-up-down-line" size={20} className="grg-sidebar-card__icon" />}
    </Card>
  );
}

/** Figma "User profile card": who is signed in, with the account menu */
export type SidebarProfileCardProps = CardProps & {
  name: string;
  email?: string;
  /** Their photo; a placeholder without it */
  photo?: string;
};

export function SidebarProfileCard({ name, email, photo, menu, menuLabel = 'Account' }: SidebarProfileCardProps) {
  const { collapsed } = useContext(SidebarContext);
  return (
    <Card kind="profile" name={name} menu={menu} menuLabel={menuLabel}>
      <Avatar size={32} src={photo} name={name} decorative />
      <span className={collapsed ? 'grg-sr-only' : 'grg-sidebar-card__text'}>
        <span className="grg-sidebar-card__name">{name}</span>
        {email && <span className="grg-sidebar-card__email">{email}</span>}
      </span>
      {menu && !collapsed && <Icon name="direction-right" size={20} className="grg-sidebar-card__icon" />}
    </Card>
  );
}

/* ---- Sidebar ---- */

export type SidebarNavigationProps = {
  /** The pages, in groups (Figma Navigation blocks inside Content) */
  sections: SidebarSection[];
  /** The id of the page people are on (Figma State = Active) */
  current?: string;
  /** A page was chosen. Links work on their own; a single-page app calls `event.preventDefault()` and routes */
  onNavigate?: (item: SidebarItem, event?: MouseEvent<HTMLElement>) => void;
  /** Figma Sidebar header: a SidebarHeaderCard */
  header?: ReactNode;
  /** Figma Feature cards: shown above the footer when expanded */
  featureCard?: ReactNode;
  /** Figma Sidebar footer: a SidebarProfileCard */
  footer?: ReactNode;
  /** Figma Expand / Collapsed, and a drawer for phones; auto follows the screen */
  layout?: SidebarLayout;
  /** Drawer: whether it is open (the product's menu button opens it) */
  drawerOpen?: boolean;
  /** Drawer: close it (the close button, Escape, a click outside, a chosen page) */
  onDrawerClose?: () => void;
  closeLabel?: string;
  /** The name of the navigation for screen readers */
  'aria-label'?: string;
  className?: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The app's main navigation on the left: the company, the pages in groups, an optional feature card and the account.
 * It collapses to icons and becomes a drawer on small screens. A plain list of links and disclosure buttons, so
 * screen readers announce site navigation (PrimeReact PanelMenu reads as a tree); PrimeReact gives the menus
 * (TieredMenu, through Dropdown Menu), the tooltips and the drawer (Sidebar).
 */
export function SidebarNavigation({
  sections, current, onNavigate, header, featureCard, footer, layout = 'auto', drawerOpen = false, onDrawerClose,
  closeLabel = 'Close menu', 'aria-label': label = 'Main', className = '',
}: SidebarNavigationProps) {
  const resolved = useSidebarLayout(layout);
  const groupOf = (id?: string) => sections.flatMap(section => section.items).find(item => item.items?.some(child => child.id === id))?.id;
  const [open, setOpen] = useState<Set<string>>(() => new Set([groupOf(current)].filter(Boolean) as string[]));
  const opener = useRef<HTMLElement | null>(null);

  // The drawer gives focus back to what opened it (the product's menu button) when it closes
  useEffect(() => {
    if (drawerOpen) {
      opener.current = document.activeElement as HTMLElement | null;
      return;
    }
    opener.current?.focus();
    opener.current = null;
  }, [drawerOpen]);

  // A page chosen elsewhere (a link in the content) opens its group
  useEffect(() => {
    const group = groupOf(current);
    if (group) setOpen(previous => (previous.has(group) ? previous : new Set(previous).add(group)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const state = (collapsed: boolean): NavState => ({
    collapsed,
    current,
    open,
    toggle: id => setOpen(previous => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    }),
    navigate: (item, event) => {
      onNavigate?.(item, event);
      if (resolved === 'drawer') onDrawerClose?.();
    },
  });

  const panel = (collapsed: boolean, closeIconRef?: RefObject<HTMLButtonElement | null>) => (
    <SidebarContext.Provider value={state(collapsed)}>
      <div className={`grg-sidebar ${className}`} data-layout={collapsed ? 'collapsed' : 'expanded'}>
        {closeIconRef && (
          <div className="grg-sidebar__bar">
            {/* PrimeReact moves focus to its close button on open: this one takes its place */}
            <ActionButton ref={closeIconRef} icon="remove" aria-label={closeLabel} onClick={onDrawerClose} />
          </div>
        )}
        {header && (
          <div className="grg-sidebar__header">
            {header}
            <hr className="grg-sidebar__divider" />
          </div>
        )}
        <nav className="grg-sidebar__content" aria-label={label}>
          {sections.map((section, index) => <Section key={section.title ?? index} section={section} />)}
        </nav>
        {featureCard && !collapsed && <div className="grg-sidebar__feature">{featureCard}</div>}
        {footer && (
          <div className="grg-sidebar__footer">
            <hr className="grg-sidebar__divider" />
            {footer}
          </div>
        )}
      </div>
    </SidebarContext.Provider>
  );

  if (resolved !== 'drawer') return panel(resolved === 'collapsed');

  /* PrimeReact Sidebar is the drawer: the overlay, Escape and the slide. It is a modal here, so it gets the dialog
     role and keeps Tab inside. */
  const trapTab = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element => !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return (
    <PrimeSidebar
      visible={drawerOpen}
      onHide={() => onDrawerClose?.()}
      position="left"
      modal
      blockScroll
      dismissable
      closeOnEscape
      showCloseIcon
      appendTo="self"
      content={({ closeIconRef }) => panel(false, closeIconRef as RefObject<HTMLButtonElement | null>)}
      pt={{
        mask: { className: 'grg-sidebar-mask' },
        root: { className: 'grg-sidebar-drawer', role: 'dialog', 'aria-modal': true, 'aria-label': label, onKeyDown: trapTab },
      } as object}
    />
  );
}
