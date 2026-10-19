import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type Ref } from 'react';
import { BreadCrumb as PrimeBreadCrumb } from 'primereact/breadcrumb';
import { Button as PrimeButton } from 'primereact/button';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { BreadcrumbItem, type BreadcrumbItemProps } from './BreadcrumbItem';
import { Icon } from '../Icon/Icon';
import { useOverlayTheme } from '../../hooks/useOverlayTheme';
import './Breadcrumbs.css';

export type BreadcrumbEntry = Pick<BreadcrumbItemProps, 'label' | 'href' | 'icon' | 'showLabel'> & { id: string };
export type BreadcrumbsProps = Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'onSelect'> & {
  /** Figma Quantity: array length, from root to current page. The last item is always Current. */
  items: BreadcrumbEntry[];
  /** Guidelines: show up to four items, including the ellipsis; configurable for the content. Minimum 3. */
  maxVisibleItems?: number;
  /** Guidelines overflow behavior. Turn off only to inspect the uncollapsed Figma group variants. */
  collapse?: boolean;
  /** Accessible name of the ellipsis button and its dropdown. */
  overflowLabel?: string;
  /** Called when an ancestor is selected. Without href, that ancestor uses a PrimeReact button. */
  onNavigate?: (item: BreadcrumbEntry) => void;
};

/** A hierarchical path built on PrimeReact BreadCrumb, with the guidelines' Menu and Tooltip behavior. */
export function Breadcrumbs({ items, maxVisibleItems = 4, collapse = true, overflowLabel = 'Show hidden breadcrumb levels', onNavigate, className = '', 'aria-label': ariaLabel = 'Breadcrumbs', ...props }: BreadcrumbsProps) {
  const root = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLSpanElement>(null);
  const menu = useRef<Menu>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tailCount, setTailCount] = useState(items.length);
  const themeProps = useOverlayTheme(root);

  useEffect(() => {
    if (!menuOpen) return;
    // PrimeReact binds its outside-click listener after the enter transition. Handle early taps too.
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !menu.current?.getElement()?.contains(target)) menu.current?.hide(event as unknown as Parameters<Menu['hide']>[0]);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [menuOpen]);

  useLayoutEffect(() => {
    const host = root.current, measure = ruler.current;
    if (!host || !measure) return;
    let active = true;
    const update = () => {
      if (!active) return;
      if (!collapse || items.length < 3) { setTailCount(items.length); return; }
      const style = getComputedStyle(measure);
      // These resolve the same tokens used by the CSS; no parallel list of pixel constants.
      const unit = (name: string) => parseFloat(style.getPropertyValue(name));
      const maxWidth = unit('--space-5000'), separator = unit('--space-500') + unit('--space-150') * 2;
      const widths = Array.from(measure.children).map(n => n.getBoundingClientRect().width);
      const currentWidth = Math.min(widths.at(-1) ?? 0, maxWidth);
      const available = host.clientWidth;
      const ancestorTooWide = widths.slice(1, -1).some(w => w > maxWidth);
      const total = widths.slice(0, -1).reduce((sum, w) => sum + Math.min(w, maxWidth), currentWidth) + separator * (items.length - 1);
      const limit = Math.max(3, Math.floor(maxVisibleItems) || 4);
      if (items.length <= limit && !ancestorTooWide && total <= available) { setTailCount(items.length); return; }
      let tail = ancestorTooWide ? 1 : Math.min(items.length - 2, limit - 2);
      // Measure the actual ellipsis glyph with the same font as an ancestor.
      const canvas = document.createElement('canvas').getContext('2d');
      if (canvas) canvas.font = style.font;
      const ellipsis = canvas?.measureText('...').width ?? unit('--space-300');
      const visibleWidth = (count: number) => Math.min(widths[0] ?? 0, maxWidth) + ellipsis + widths.slice(-count, -1).reduce((sum, w) => sum + Math.min(w, maxWidth), currentWidth) + separator * (count + 1);
      while (tail > 1 && visibleWidth(tail) > available) tail -= 1;
      setTailCount(tail);
    };
    const observer = new ResizeObserver(update);
    observer.observe(host); observer.observe(measure);
    update(); document.fonts?.ready.then(update);
    return () => { active = false; observer.disconnect(); };
  }, [items, collapse, maxVisibleItems]);

  const hidden = tailCount < items.length ? items.slice(1, -tailCount) : [];
  const visible = hidden.length ? [items[0], null, ...items.slice(-tailCount)] : items;
  const menuItems: MenuItem[] = hidden.map(item => ({ id: `${menuId}-${item.id}`, label: item.label, url: item.href, command: () => onNavigate?.(item) }));
  const model: MenuItem[] = visible.map((item, index) => ({
    id: `${menuId}-visible-${item?.id ?? 'overflow'}`,
    className: index === visible.length - 1 ? 'grg-breadcrumbs__current' : undefined,
    template: () => item
      ? <BreadcrumbItem {...item} current={index === visible.length - 1} onNavigate={onNavigate ? () => onNavigate(item) : undefined} />
      : <PrimeButton unstyled type="button" className="grg-breadcrumbs__overflow" ref={trigger as unknown as Ref<PrimeButton>}
          aria-label={overflowLabel} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? `${menuId}_list` : undefined}
          onClick={event => menu.current?.toggle(event)}
          onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); menu.current?.show(event); } }}
        >...</PrimeButton>,
  }));

  return <div className="grg-breadcrumbs" ref={root}>
    <PrimeBreadCrumb {...props} unstyled className={`grg-breadcrumbs__nav ${className}`} aria-label={ariaLabel} model={model}
      separatorIcon={<Icon name="direction-right" size={20} />}
      pt={{ menu: { className: 'grg-breadcrumbs__list' }, menuitem: { className: 'grg-breadcrumbs__item' }, separator: { className: 'grg-breadcrumbs__separator', 'aria-hidden': true } }}
    />
    {hidden.length > 0 && <Menu ref={menu} id={menuId} unstyled popup model={menuItems}
      className="grg-breadcrumbs-menu" onShow={() => setMenuOpen(true)} onHide={event => {
        setMenuOpen(false);
        // PrimeReact's global Escape handler can bypass its list's focus restoration.
        if ('key' in event && event.key === 'Escape') trigger.current?.focus();
      }}
      pt={{ root: { ...themeProps }, menu: { className: 'grg-breadcrumbs-menu__list', 'aria-label': overflowLabel }, menuitem: { className: 'grg-breadcrumbs-menu__item' },
        // Menu binds selection on both content and its parent li. Keep a URL's command from firing twice.
        content: { onClick: event => event.stopPropagation() },
        action: { className: 'grg-breadcrumbs-menu__action' }, label: { className: 'grg-breadcrumbs-menu__label' } }}
    />}
    <span ref={ruler} className="grg-breadcrumbs__ruler" aria-hidden="true">{items.map(item => <span key={item.id}>
      {(item.icon === undefined || item.icon) && <Icon name={item.icon ?? 'home'} size={20} />}
      {(item.showLabel !== false || item.icon === null) && <span>{item.label}</span>}
    </span>)}</span>
  </div>;
}
