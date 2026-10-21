import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { Tooltip as PrimeTooltip } from 'primereact/tooltip';
import { Icon, type IconName } from '../Icon/Icon';
import { useOverlayTheme } from '../../hooks/useOverlayTheme';
import './Tooltip.css';

/* Figma page ❖ Tooltip: "Tooltip" (218:8460) and "Usage Guidelines" (801:2750). */

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export type TooltipProps = {
  /** The control the tooltip belongs to: one element that takes focus, such as a button or a link */
  children: ReactElement;
  /** Figma Edit title: the short text, or the title above a description */
  title: string;
  /** Figma Description (Details = On): one or two lines under the title */
  description?: string;
  /** Figma Left icon: a Base icon before the text; off when not set */
  icon?: IconName;
  /** Figma Color: White, or Black (Inverted). Black turns light in the dark theme */
  color?: 'white' | 'black';
  /** Where the tooltip opens from the control. Figma Side names the edge with the tip, the opposite one:
   *  Side = Bottom is a tooltip above (`top`), Side = Top one below (`bottom`) */
  side?: TooltipSide;
  /** Figma Side … left / … right: the tooltip lines up with the start or the end of the control, the tip near that end */
  align?: 'center' | 'start' | 'end';
  /** What the text is to screen readers: `description` (said after the control's name), `name` (the name of an
   *  icon-only control) or `repeat` (the control already says it, so it is skipped) */
  purpose?: 'description' | 'name' | 'repeat';
  /** No tooltip, such as when a sidebar is expanded and the label is visible */
  disabled?: boolean;
};

/* PrimeReact positions the tooltip with `my` (its own point) against `at` (the control's point) */
const ALIGN: Record<TooltipSide, Record<'start' | 'end', { my: string; at: string }>> = {
  top: { start: { my: 'left bottom', at: 'left top' }, end: { my: 'right bottom', at: 'right top' } },
  bottom: { start: { my: 'left top', at: 'left bottom' }, end: { my: 'right top', at: 'right bottom' } },
  left: { start: { my: 'right top', at: 'left top' }, end: { my: 'right bottom', at: 'left bottom' } },
  right: { start: { my: 'left top', at: 'right top' }, end: { my: 'left bottom', at: 'right bottom' } },
};

/**
 * A short text that appears next to a control on hover and on keyboard focus: the name of an icon button, or a
 * hint. PrimeReact Tooltip gives the positioning (it flips when there is no room); it hides its tooltip from screen
 * readers, so the text reaches them through the control itself (`purpose`).
 */
export function Tooltip({
  children, title, description, icon, color = 'white', side = 'top', align = 'center', purpose = 'description', disabled = false,
}: TooltipProps) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const theme = useOverlayTheme(anchor);

  // The control is the child: the tooltip opens on its own hover and focus, which don't bubble to a wrapper
  useEffect(() => setTarget((anchor.current?.firstElementChild as HTMLElement | null) ?? null), [children]);

  useEffect(() => {
    if (!target || disabled) return;
    const describedBy = target.getAttribute('aria-describedby');
    if (purpose === 'name') target.setAttribute('aria-label', title);
    const describe = purpose === 'description' || (purpose === 'name' && description);
    if (describe) target.setAttribute('aria-describedby', [describedBy, id].filter(Boolean).join(' '));
    return () => {
      if (purpose === 'name') target.removeAttribute('aria-label');
      if (describe) {
        if (describedBy) target.setAttribute('aria-describedby', describedBy);
        else target.removeAttribute('aria-describedby');
      }
    };
  }, [target, purpose, title, description, id, disabled]);

  /* Escape closes it (WCAG 1.4.13). PrimeReact's own closeOnEscape fails without its overlay stack, so the tooltip is
     closed the way PrimeReact closes it: as if the pointer and the focus had left; focus stays on the control. */
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!shown || !target) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      target.dispatchEvent(new MouseEvent('mouseleave'));
      target.dispatchEvent(new FocusEvent('blur'));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shown, target]);

  const spoken = purpose === 'description' ? [title, description].filter(Boolean).join('. ') : description;
  const position = align === 'center' ? undefined : ALIGN[side][align];

  return (
    <span ref={anchor} className="grg-tooltip-anchor">
      {children}
      {spoken && <span id={id} hidden>{spoken}</span>}
      {target && (
        <PrimeTooltip
          target={target}
          position={side}
          my={position?.my}
          at={position?.at}
          event="both"
          // Stays open while the pointer moves onto it (WCAG 1.4.13)
          autoHide={false}
          onShow={() => setShown(true)}
          onHide={() => setShown(false)}
          showDelay={150}
          disabled={disabled}
          pt={{
            root: ({ state }: { state: { position?: string } }) => ({
              className: 'grg-tooltip',
              'data-side': state.position,
              'data-align': align,
              'data-color': color,
              'data-details': description ? true : undefined,
              ...theme,
            }),
            arrow: { className: 'grg-tooltip__arrow' },
            text: { className: 'grg-tooltip__body' },
          } as object}
        >
          {icon && <Icon name={icon} size={16} className="grg-tooltip__icon" />}
          <span className="grg-tooltip__text">
            <span className="grg-tooltip__title">{title}</span>
            {description && <span className="grg-tooltip__description">{description}</span>}
          </span>
        </PrimeTooltip>
      )}
    </span>
  );
}
