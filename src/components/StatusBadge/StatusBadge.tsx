import type { CSSProperties } from 'react';
import { icons, type IconName } from '../Icon/Icon';
import './StatusBadge.css';

export type StatusBadgeType = 'check' | 'pending' | 'remove' | 'error' | 'edit';

/** Figma Status badge: Check, Pending, Remove, Error and Icon (a pencil), each with its colour and icon. */
const ICON: Record<StatusBadgeType, IconName> = { check: 'check', pending: 'pending', remove: 'remove', error: 'minus', edit: 'pencil' };

/** What screen readers hear for each status, unless a label is given */
export const STATUS_LABEL: Record<StatusBadgeType, string> = {
  check: 'verified',
  pending: 'pending',
  remove: 'removed',
  error: 'error',
  edit: 'editable',
};

export type StatusBadgeProps = {
  /** Figma Type: Check, Pending, Remove, Error, Icon (pencil) → edit */
  type: StatusBadgeType;
  /** Figma Size: md-24, sm-20, xs-16, xxs-12, mini-8 (mini is a dot without an icon) */
  size?: 24 | 20 | 16 | 12 | 8;
  className?: string;
};

/**
 * Figma "Status badge" (154:1337): a small round mark at the corner of Avatar. Decorative: Avatar puts the
 * status into its own name. A 2px ring in the surface colour separates it from the picture.
 */
export function StatusBadge({ type, size = 24, className = '' }: StatusBadgeProps) {
  const style = { '--sb-icon': `url("${icons[ICON[type]]}")` } as CSSProperties;
  return (
    <span className={`grg-status-badge ${className}`} data-type={type} data-size={size} style={style} aria-hidden="true">
      {size > 8 && <span className="grg-status-badge__icon" />}
    </span>
  );
}
