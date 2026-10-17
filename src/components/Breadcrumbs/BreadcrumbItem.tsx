import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button as PrimeButton } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Icon, type IconName } from '../Icon/Icon';
import { useOverlayTheme } from './useOverlayTheme';
import './BreadcrumbItem.css';

export type BreadcrumbItemProps = {
  /** Figma Breadcrumb title: also the accessible name when Text is off. */
  label: string;
  /** Navigation destination. Ignored for the current page. */
  href?: string;
  /** Navigation callback; without href, renders a PrimeReact button. */
  onNavigate?: () => void;
  /** Figma Icon: a Base icon name when on (home by default); null when off. */
  icon?: IconName | null;
  /** Figma Text: show or hide the visible label while preserving its accessible name. */
  showLabel?: boolean;
  /** Figma State Current: the current page, with Medium text and aria-current. */
  current?: boolean;
  /** Figma Default, Hovered, Focused: static documentation only; live links follow interaction. */
  previewState?: 'default' | 'hover' | 'focus';
  className?: string;
};

/** The reusable Breadcrumb item. PrimeReact BreadCrumb uses it through its item template. */
export function BreadcrumbItem({ label, href, onNavigate, icon = 'home', showLabel = true, current = false, previewState = 'default', className = '' }: BreadcrumbItemProps) {
  const root = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<Tooltip>(null);
  const tooltipId = useId();
  const [truncated, setTruncated] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const themeProps = useOverlayTheme(root);
  // With both Figma switches off, retain a readable item instead of an unnamed, empty control.
  const visibleLabel = showLabel || !icon;

  useLayoutEffect(() => {
    const el = text.current;
    if (!el || !current || !visibleLabel) { setTruncated(false); return; }
    let active = true;
    const measure = () => { if (active) setTruncated(el.scrollWidth > el.clientWidth); };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure(); document.fonts?.ready.then(measure);
    return () => { active = false; observer.disconnect(); };
  }, [label, current, visibleLabel, icon]);

  useEffect(() => {
    if (!tooltipOpen) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !tooltip.current?.getElement()?.contains(target)) tooltip.current?.hide();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [tooltipOpen]);

  const content = <>
    {icon && <Icon name={icon} size={20} className="grg-breadcrumb-item__icon" />}
    {visibleLabel && <span ref={text} className="grg-breadcrumb-item__label">{label}</span>}
  </>;
  const common = { className: 'grg-breadcrumb-item__control', 'aria-label': !visibleLabel ? label : undefined };

  return <span ref={root} className={`grg-breadcrumb-item ${className}`} data-current={current || undefined} data-preview-state={previewState === 'default' ? undefined : previewState}>
    {current
      ? <span {...common} role={!visibleLabel ? 'img' : undefined} aria-current="page" tabIndex={truncated ? 0 : undefined}
          aria-describedby={truncated && tooltipOpen ? tooltipId : undefined}
          onClick={event => { if (truncated) tooltip.current?.show(event as unknown as Parameters<Tooltip['show']>[0]); }}
        >{content}</span>
      : href
        // PrimeReact has no Link control; native anchors preserve browser navigation features.
        ? <a {...common} href={href} onClick={onNavigate}>{content}</a>
        : onNavigate
          ? <PrimeButton {...common} unstyled type="button" onClick={onNavigate}>{content}</PrimeButton>
          : <span {...common} role={!visibleLabel ? 'img' : undefined}>{content}</span>}
    {current && truncated && <Tooltip
      ref={tooltip} id={tooltipId} target={root.current?.firstElementChild as HTMLElement}
      content={label} position="top" event="both" autoHide={false} closeOnEscape
      className="grg-breadcrumb-tooltip" onShow={() => setTooltipOpen(true)} onHide={() => setTooltipOpen(false)}
      // PrimeReact 10 marks a visible tooltip aria-hidden. Correct it and associate the trigger above.
      pt={{
        root: options => ({ 'aria-hidden': false, 'data-placement': options?.context.bottom ? 'bottom' : 'top', ...themeProps }),
        arrow: { className: 'grg-breadcrumb-tooltip__arrow' },
        text: { className: 'grg-breadcrumb-tooltip__text' },
      }}
    />}
  </span>;
}
