import { useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { Message as PrimeMessage } from 'primereact/message';
import { Button as PrimeButton } from 'primereact/button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Icon, type IconName } from '../Icon/Icon';
import { Link } from '../Link/Link';
import './Banner.css';

export const bannerStatuses = ['warning', 'error', 'success', 'info', 'neutral'] as const;
export type BannerStatus = typeof bannerStatuses[number];

/** Figma Banner (321:11577): a full-width message, separate from the compact Alert. */
export type BannerProps = Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'children' | 'role'> & {
  /** Figma Title: a short summary of the message. */
  title: string;
  /** Figma Description + Description2: present when enabled, with this editable text. */
  description?: string;
  /** Figma Status: Warning, Error, Success, Info, Neutral. */
  status?: BannerStatus;
  /** Figma Filled: On → muted status background; Off → Ghost, using bg-base-0. */
  filled?: boolean;
  /** Guidelines / Banner Alignment: Center (default) or Left-Center auto layout, for a banner on one line.
   *  Text that needs more than one line always uses the left-aligned long-text layout. */
  align?: 'center' | 'left';
  /** Figma Button: present when there is a label; a Link for navigation or a button for an action. */
  actionLabel?: string;
  /** Navigation destination. Without it, the action is a PrimeReact button. */
  actionHref?: string;
  /** A local action such as Retry, or an optional navigation callback. */
  onAction?: () => void;
  /** Figma Remove: show the trailing Action Button. */
  closable?: boolean;
  /** Accessible name for the icon-only dismissal control. */
  closeLabel?: string;
  /** Called on dismissal. The host can update visibility and restore focus if needed. */
  onClose?: () => void;
  /** Controlled visibility. Leave unset for a Banner that dismisses itself. */
  open?: boolean;
  /** Screen-reader prefix for the status; replace it to localise the announcement. */
  statusLabel?: string;
  /** Errors default to alert (assertive); other statuses use status (polite). Choose by urgency. */
  role?: 'status' | 'alert';
};

const ICON: Record<BannerStatus, IconName> = {
  warning: 'warning-error-filled', error: 'remove-circle-filled', success: 'check-circle-filled',
  info: 'information-circle-filled', neutral: 'diamond',
};
const SEVERITY = { warning: 'warn', error: 'error', success: 'success', info: 'info', neutral: 'secondary' } as const;
const STATUS_LABEL: Record<BannerStatus, string> = { warning: 'Warning', error: 'Error', success: 'Success', info: 'Information', neutral: 'Notice' };

/**
 * PrimeReact Message supplies the message root. Its content template composes our Link and Action
 * Button because Message has no action or dismissal slots. Root passthrough replaces Message's
 * fixed alert/polite pairing with matching role and announcement urgency. No timers or page positioning.
 */
export function Banner({
  title, description, status = 'warning', filled = false, align = 'center',
  actionLabel, actionHref, onAction, closable = true, closeLabel = 'Close banner', onClose, open,
  statusLabel = STATUS_LABEL[status], role = status === 'error' ? 'alert' : 'status', className = '', ...props
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [layout, setLayout] = useState<'line' | 'stack'>('line');
  const contentRef = useRef<HTMLDivElement>(null);
  const visible = open ?? !dismissed;

  // One line while the whole message fits; otherwise the long-text layout. The natural one-line width
  // is measured with the line layout forced for an instant, so the choice never flips back and forth.
  useLayoutEffect(() => {
    const content = contentRef.current;
    const root = content?.parentElement;
    if (!content || !root) return;
    function measure() {
      root!.dataset.measuring = '';
      const needed = content!.getBoundingClientRect().width;
      delete root!.dataset.measuring;
      const style = getComputedStyle(root!);
      const available = root!.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
      setLayout(needed > available + 0.5 ? 'stack' : 'line');
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [visible, title, description, actionLabel, statusLabel]);

  if (!visible) return null;

  function close() {
    if (open === undefined) setDismissed(true);
    onClose?.();
  }

  const action = actionLabel && (actionHref
    ? <Link size="sm" color="black" className="grg-banner__action" href={actionHref} onClick={onAction}>{actionLabel}</Link>
    : <PrimeButton unstyled type="button" className="grg-link grg-banner__action" data-size="sm" data-color="black" onClick={onAction}><span>{actionLabel}</span></PrimeButton>);

  return <PrimeMessage
    {...props}
    unstyled
    className={`grg-banner ${className}`}
    severity={SEVERITY[status]}
    data-status={status}
    data-filled={filled || undefined}
    data-align={align}
    data-layout={layout}
    pt={{ root: { role, 'aria-live': props['aria-live'] ?? (role === 'alert' ? 'assertive' : 'polite'), 'aria-atomic': true } }}
    content={<>
      <div ref={contentRef} className="grg-banner__content">
        <Icon name={ICON[status]} size={20} className="grg-banner__status-icon" />
        <p className="grg-banner__text">
          <span className="grg-banner__title">
            {statusLabel && <span className="grg-sr-only">{statusLabel}: </span>}
            {title}
          </span>
          {description && <>{' '}<span className="grg-banner__description">{description}</span></>}
        </p>
        {action}
      </div>
      {closable && <ActionButton icon="remove" size="sm" className="grg-banner__close" aria-label={closeLabel} onClick={close} />}
    </>}
  />;
}
