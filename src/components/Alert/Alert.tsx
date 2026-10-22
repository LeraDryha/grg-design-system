import { useState, type ComponentPropsWithoutRef } from 'react';
import { Message as PrimeMessage } from 'primereact/message';
import { Button as PrimeButton } from 'primereact/button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Icon, type IconName } from '../Icon/Icon';
import { Link } from '../Link/Link';
import './Alert.css';

export const alertStatuses = ['warning', 'error', 'success', 'info', 'neutral'] as const;
export type AlertStatus = typeof alertStatuses[number];

/** Figma "Alert, Notification & Toast" (149:19579): the same message body in inline and floating contexts. */
export type AlertProps = Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'children' | 'role'> & {
  /** Figma Title: say what happened, in a short sentence. */
  title: string;
  /** Figma Description = On when present. Descriptions use sm-20, the only described size in Figma. */
  description?: string;
  /** Figma Status: Warning, Error, Success, Info, Neutral. */
  status?: AlertStatus;
  /** Figma Size: xs-16 → xs, sm-20 → sm (text and icon size, not container height). */
  size?: 'xs' | 'sm';
  /** Figma Filled: On gives the status a soft background; Off uses surface-floating. */
  filled?: boolean;
  /** Figma Status icon: show the status-specific Base icon. */
  statusIcon?: boolean;
  /** Guidelines / Elevation: off for an inline Alert; on for a floating Notification or Toast. */
  elevated?: boolean;
  /** Figma Button: present when there is a label. Uses a link for navigation, a button for an action. */
  actionLabel?: string;
  /** Destination for a navigation action. Without it, the action is a PrimeReact button. */
  actionHref?: string;
  /** A local action, such as Undo or Retry. */
  onAction?: () => void;
  /** Figma Close: show the Action Button. */
  closable?: boolean;
  /** Accessible name of the Close action. */
  closeLabel?: string;
  /** Called when Close is pressed. With uncontrolled visibility, the message also hides itself. */
  onClose?: () => void;
  /** Controlled visibility. Leave unset for a message that dismisses itself. */
  open?: boolean;
  /** Screen-reader prefix for the status; localise or replace the default words if needed. */
  statusLabel?: string;
  /** Errors default to alert (assertive); other statuses use status (polite). Choose by urgency. */
  role?: 'alert' | 'status';
};

const ICON: Record<AlertStatus, IconName> = {
  warning: 'warning-error-filled',
  error: 'remove-circle-filled',
  success: 'check-circle-filled',
  info: 'information-circle-filled',
  neutral: 'diamond',
};
const SEVERITY = { warning: 'warn', error: 'error', success: 'success', info: 'info', neutral: 'secondary' } as const;
const STATUS_LABEL: Record<AlertStatus, string> = { warning: 'Warning', error: 'Error', success: 'Success', info: 'Information', neutral: 'Notice' };

/**
 * PrimeReact Message (unstyled), composed with the system's Base icons, Link and Action Button.
 * Message has no dismissal or action slot. Its content template supplies those parts, and root
 * passthrough corrects its fixed alert/polite combination so the live region matches urgency.
 * The message itself never goes by itself: placement, stacking and a Toast's timer are MessagesProvider's.
 */
export function Alert({
  title,
  description,
  status = 'warning',
  size = 'xs',
  filled = false,
  statusIcon = true,
  elevated = false,
  actionLabel,
  actionHref,
  onAction,
  closable = true,
  closeLabel = 'Close message',
  onClose,
  open,
  statusLabel = STATUS_LABEL[status],
  role = status === 'error' ? 'alert' : 'status',
  className = '',
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!(open ?? !dismissed)) return null;

  // Figma has 30 variants: xs has no Description=On. A description always uses sm typography.
  const actualSize = description ? 'sm' : size;
  const iconSize = actualSize === 'sm' ? 20 : 16;

  function close() {
    if (open === undefined) setDismissed(true);
    onClose?.();
  }

  const action = actionLabel && (actionHref ? (
    <Link className="grg-alert__action" size={actualSize} href={actionHref} onClick={onAction}>
      {actionLabel}
    </Link>
  ) : (
    // The Figma "Link button" appearance is shared with Link, while a local action needs button semantics.
    <PrimeButton type="button" className="grg-link grg-alert__action" data-size={actualSize} data-color="black" onClick={onAction}>
      <span>{actionLabel}</span>
    </PrimeButton>
  ));

  return (
    <PrimeMessage
      {...props}
      className={`grg-alert ${className}`}
      severity={SEVERITY[status]}
      data-status={status}
      data-size={actualSize}
      data-filled={filled || undefined}
      data-elevated={elevated || undefined}
      data-description={!!description || undefined}
      pt={{ root: { role, 'aria-live': props['aria-live'] ?? (role === 'alert' ? 'assertive' : 'polite'), 'aria-atomic': true } }}
      content={(
        <>
          {statusIcon && <Icon name={ICON[status]} size={iconSize} className="grg-alert__status-icon" />}
          <div className="grg-alert__content">
            <div className="grg-alert__text">
              <span className="grg-alert__title">
                {statusLabel && <span className="grg-sr-only">{statusLabel}: </span>}
                {title}
              </span>
              {description && <span className="grg-alert__description">{description}</span>}
            </div>
            {action}
          </div>
          {closable && <ActionButton icon="remove" size={actualSize} className="grg-alert__close" aria-label={closeLabel} onClick={close} />}
        </>
      )}
    />
  );
}
