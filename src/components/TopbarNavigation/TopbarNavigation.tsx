import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { Icon, type IconName } from '../Icon/Icon';
import { InlineSelect, type InlineSelectOption } from '../InlineSelect/InlineSelect';
import { SidebarNavigation, SidebarProfileCard, type SidebarItem, type SidebarSection } from '../SidebarNavigation/SidebarNavigation';
import { ThemeSwitch } from '../Switch/Switch';
import { Tooltip } from '../Tooltip/Tooltip';
import './TopbarNavigation.css';

/* Figma page ❖ Navigation: "Topbar navigation" (773:64348), "Toolbar item" (761:15379), "Toolbar item button"
   (763:24356) and "Usage Guidelines" (775:64572); the mobile menu from "Examples" (771:56684). */

/** Figma Size: Desktop from 1024px, Tablet 768–1023px, Mobile under 768px. auto follows the screen */
export type TopbarLayout = 'auto' | 'desktop' | 'tablet' | 'mobile';

const MOBILE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(max-width: 1023px)';
const subscribe = (onChange: () => void) => {
  const queries = [MOBILE_QUERY, TABLET_QUERY].map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener('change', onChange));
  return () => queries.forEach(query => query.removeEventListener('change', onChange));
};
const screenLayout = () =>
  window.matchMedia(MOBILE_QUERY).matches ? 'mobile' : window.matchMedia(TABLET_QUERY).matches ? 'tablet' : 'desktop';

/** Figma Toolbar item button: an icon button on the right, such as Help, Settings or Notifications */
export type TopbarAction = {
  id: string;
  /** Its name, for screen readers and the tooltip; the row text in the mobile menu */
  label: string;
  icon: IconName;
  href?: string;
  onClick?: () => void;
  /** Figma Badge: a red dot, such as unread notifications; the text is read with the name ("new") */
  badge?: string;
  /** Stays in the bar on tablets and phones (Notifications); the others move into the menu */
  inBar?: boolean;
  /** Its own element in the bar instead of the plain button, such as a NotificationFeed with a TopbarButton as its
   *  trigger */
  element?: ReactNode;
};

export type TopbarNavigationProps = {
  /** Figma Type: `company` (Pay: the company card in the bar, the pages in Sidebar Navigation under it) or
   *  `navigation` (Exchange: the pages in the bar, no sidebar) */
  type?: 'company' | 'navigation';
  /** Figma Logo horizontal: the product's logo, usually a link to the home page */
  logo: ReactNode;
  /** Type company: a SidebarHeaderCard, to switch companies */
  company?: ReactNode;
  /** The pages: in the bar for type navigation (a group opens a menu, Figma Arrow); in the menu on tablets and phones */
  sections?: SidebarSection[];
  /** The id of the page people are on */
  current?: string;
  /** Figma Toolbar item · Leading icon: the pages' icons in the bar too. The Figma bars draw them off; the mobile
   *  menu always shows them */
  itemIcons?: boolean;
  /** A page was chosen. Links work on their own; a single-page app calls `event.preventDefault()` and routes */
  onNavigate?: (item: SidebarItem, event?: MouseEvent<HTMLElement>) => void;
  /** Figma Inline select (Type Icon): the language */
  language?: { value: string; options: InlineSelectOption[]; onChange: (value: string) => void; label?: string };
  /** The theme button in the bar, the Theme switch in the menu */
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** Figma Toolbar item buttons, after the theme button */
  actions?: TopbarAction[];
  /** Figma Avatar: who is signed in, with the account menu */
  account?: { name: string; email?: string; photo?: string; menu?: DropdownMenuEntry[] };
  /** Figma Size; auto follows the screen */
  layout?: TopbarLayout;
  /** The name of the pages for screen readers */
  'aria-label'?: string;
  menuLabel?: string;
  className?: string;
};

export type TopbarButtonProps = {
  action: Pick<TopbarAction, 'label' | 'icon' | 'href' | 'onClick' | 'badge'>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  pressed?: boolean;
  /** More attributes for the button, such as the ones a NotificationFeed trigger gives */
  buttonProps?: Record<string, unknown>;
};

/** Figma Toolbar item button: a 40px icon button of the top bar, with its name in a tooltip and an optional dot */
export function TopbarButton({ action, onClick, pressed, buttonProps }: TopbarButtonProps) {
  const name = action.badge ? `${action.label}, ${action.badge}` : action.label;
  const content = (
    <>
      <Icon name={action.icon} size={20} />
      {action.badge && <Badge variant="text" type="dot" size="xs" color="error" decorative className="grg-topbar-button__badge" />}
    </>
  );
  return (
    // No tooltip over the panel the button has opened
    <Tooltip title={action.label} side="bottom" purpose="repeat" disabled={buttonProps?.['aria-expanded'] === true}>
      {action.href
        ? <a className="grg-topbar-button" href={action.href} aria-label={name} onClick={onClick}>{content}</a>
        : <button type="button" className="grg-topbar-button" aria-label={name} aria-pressed={pressed} onClick={onClick ?? action.onClick} {...buttonProps}>{content}</button>}
    </Tooltip>
  );
}

/**
 * The bar at the top of an app: the logo, the pages or the company, the language, the theme, a few icon buttons and
 * the account. On tablets and phones the pages, the settings and the account move into a menu under the bar.
 * Plain links and buttons, like Sidebar Navigation (PrimeReact Menubar is an application menu, moved through with the
 * arrow keys); PrimeReact gives the menus, the language list and the tooltips.
 */
export function TopbarNavigation({
  type = 'navigation', logo, company, sections = [], current, itemIcons = false, onNavigate, language, theme, onThemeChange, actions = [], account,
  layout = 'auto', 'aria-label': label = 'Main', menuLabel = 'Menu', className = '',
}: TopbarNavigationProps) {
  const fromScreen = useSyncExternalStore(subscribe, screenLayout, () => 'desktop' as const);
  const size = layout === 'auto' ? fromScreen : layout;
  const desktop = size === 'desktop';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const themeId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  // The menu belongs to tablets and phones: it closes when the screen grows
  useEffect(() => { if (desktop) setMenuOpen(false); }, [desktop]);

  // While the menu is open the page behind doesn't scroll, and Escape closes it, back on the menu button
  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add('grg-scroll-lock');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('grg-scroll-lock');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const themeAction: TopbarAction | undefined = theme && {
    id: 'theme',
    label: 'Dark theme',
    icon: theme === 'dark' ? 'light-mode' : 'night-mode',
  };

  const pages = sections.flatMap(section => section.items);
  const languageSelect = language && (
    <InlineSelect
      type="icon"
      aria-label={language.label ?? 'Language'}
      value={language.value}
      onChange={language.onChange}
      options={language.options.map(option => ({ icon: 'globe', ...option }))}
    />
  );
  const avatar = account && (
    <DropdownMenu
      items={account.menu ?? []}
      aria-label="Account"
      align="end"
      width={240}
      trigger={props => (
        <button type="button" className="grg-topbar-avatar" aria-label={account.name} {...props}>
          <Avatar size={32} src={account.photo} name={account.name} decorative />
        </button>
      )}
    />
  );

  /* ---- Desktop: everything in the bar ---- */
  if (desktop) {
    const navigationMenu = type === 'navigation' && pages.length > 0 && (
      <nav className="grg-topbar__nav" aria-label={label}>
        <ul className="grg-topbar__items">
          {pages.map(item => {
            const children = item.items ?? [];
            const active = item.id === current || children.some(child => child.id === current);
            const face = (
              <>
                {itemIcons && item.icon && <Icon name={item.icon} size={20} className="grg-topbar-item__icon" />}
                <span className="grg-topbar-item__label">{item.label}</span>
                {item.badge && <Badge variant="light" size="sm" color="neutral" label={item.badge} leftIcon={null} rightIcon={null} />}
                {children.length > 0 && <Icon name="direction-down" size={20} className="grg-topbar-item__arrow" />}
              </>
            );
            return (
              <li key={item.id}>
                {children.length ? (
                  <DropdownMenu
                    aria-label={item.label}
                    items={children.map(child => ({ label: child.label, href: child.href, icon: child.icon, selected: child.id === current, onSelect: event => onNavigate?.(child, event as MouseEvent<HTMLElement>) }))}
                    trigger={props => <button type="button" className="grg-topbar-item" data-active={active || undefined} {...props}>{face}</button>}
                  />
                ) : (
                  <a className="grg-topbar-item" href={item.href} data-active={active || undefined} aria-current={active ? 'page' : undefined} onClick={event => onNavigate?.(item, event)}>
                    {face}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
    return (
      <header className={`grg-topbar ${className}`} data-type={type} data-size="desktop">
        <div className="grg-topbar__start">
          <span className="grg-topbar__logo">{logo}</span>
          {type === 'company' ? company && <span className="grg-topbar__company">{company}</span> : navigationMenu}
        </div>
        <div className="grg-topbar__end">
          {languageSelect}
          <div className="grg-topbar__actions">
            {themeAction && <TopbarButton action={themeAction} pressed={theme === 'dark'} onClick={() => onThemeChange?.(theme === 'dark' ? 'light' : 'dark')} />}
            {actions.map(action => <Fragment key={action.id}>{action.element ?? <TopbarButton action={action} />}</Fragment>)}
          </div>
          {avatar}
        </div>
      </header>
    );
  }

  /* ---- Tablet and phone: the logo, the buttons that stay, and the menu ---- */
  const moved = actions.filter(action => !action.inBar);
  const menuSections: SidebarSection[] = [
    ...sections,
    ...(moved.length ? [{ divided: true, items: moved.map(action => ({ id: `action:${action.id}`, label: action.label, icon: action.icon, href: action.href })) }] : []),
  ];
  const choose = (item: SidebarItem, event?: MouseEvent<HTMLElement>) => {
    const action = moved.find(candidate => `action:${candidate.id}` === item.id);
    if (action) action.onClick?.();
    else onNavigate?.(item, event);
    setMenuOpen(false);
  };
  const extras = (theme || languageSelect) && (
    <div className="grg-topbar-menu__extras">
      {theme && (
        <div className="grg-topbar-menu__row">
          <Icon name="theme" size={20} className="grg-sidebar-item__icon" />
          <label className="grg-topbar-menu__row-label" htmlFor={themeId}>Theme</label>
          <ThemeSwitch id={themeId} theme={theme} onChange={onThemeChange} aria-label="Dark theme" />
        </div>
      )}
      {languageSelect && <div className="grg-topbar-menu__language">{languageSelect}</div>}
    </div>
  );

  return (
    <>
      <header className={`grg-topbar ${className}`} data-type={type} data-size={size}>
        <span className="grg-topbar__logo">{logo}</span>
        <div className="grg-topbar__actions">
          {!menuOpen && actions.filter(action => action.inBar).map(action => <Fragment key={action.id}>{action.element ?? <TopbarButton action={action} />}</Fragment>)}
          <button
            ref={menuButton}
            type="button"
            className="grg-topbar-button"
            aria-label={menuLabel}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen(open => !open)}
          >
            <Icon name={menuOpen ? 'remove' : 'menu-line-horizontal'} size={20} />
          </button>
        </div>
      </header>
      <div id={menuId} className="grg-topbar-menu" hidden={!menuOpen}>
        {menuOpen && (
          <SidebarNavigation
            layout="expanded"
            sections={menuSections}
            current={current}
            onNavigate={choose}
            header={company}
            contentEnd={extras}
            footer={account && <SidebarProfileCard name={account.name} email={account.email} photo={account.photo} menu={account.menu} menuPlacement="above" />}
            aria-label={label}
          />
        )}
      </div>
    </>
  );
}
