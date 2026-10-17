import { useState, type ComponentPropsWithoutRef } from 'react';
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
  /** Guidelines / Banner Alignment: Center (default) or Left-Center auto layout. */
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
  if (!(open ?? !dismissed)) return null;

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
    pt={{ root: { role, 'aria-live': props['aria-live'] ?? (role === 'alert' ? 'assertive' : 'polite'), 'aria-atomic': true } }}
    content={<>
      <div className="grg-banner__content">
        <div className="grg-banner__lead">
          <Icon name={ICON[status]} size={20} className="grg-banner__status-icon" />
          <span className="grg-banner__title">
            {statusLabel && <span className="grg-sr-only">{statusLabel}: </span>}
            {title}
          </span>
        </div>
        {description && <span className="grg-banner__description">{description}</span>}
        {action}
      </div>
      {closable && <ActionButton icon="remove" size="sm" className="grg-banner__close" aria-label={closeLabel} onClick={close} />}
    </>}
  />;
}
