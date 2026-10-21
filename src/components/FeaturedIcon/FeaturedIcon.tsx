import { Icon, type IconName } from '../Icon/Icon';
import './FeaturedIcon.css';

export type FeaturedIconType = 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'primary';

/** Figma "Featured icon" (329:14075): Type × Size × Filled. */
export type FeaturedIconProps = {
  /** Figma Type: the four statuses, Neutral (grey) and Primary (gold) */
  type?: FeaturedIconType;
  /** Figma Size: lg-48, md-40, sm-32 */
  size?: 'lg' | 'md' | 'sm';
  /** Figma Filled: On is a soft colour tile, Off a white tile with a coloured border */
  filled?: boolean;
  /** Base icon in the tile. Each status has its own; Neutral and Primary show `mail` until another is given */
  icon?: IconName;
  /** What the icon means, for screen readers, when nothing next to it says so (such as "Success"). Without it the icon is decorative. */
  label?: string;
  className?: string;
};

const DEFAULT_ICON: Record<FeaturedIconType, IconName> = {
  success: 'check-circle-filled',
  info: 'information-circle-filled',
  warning: 'warning-error-filled',
  error: 'remove-circle-filled',
  neutral: 'mail',
  primary: 'mail',
};

const ICON_SIZE = { lg: 32, md: 24, sm: 20 } as const;

/** A Base icon on a rounded tile: the status or the subject of a Modal, an empty state or a notice. Not interactive. */
export function FeaturedIcon({ type = 'success', size = 'lg', filled = true, icon, label, className = '' }: FeaturedIconProps) {
  return (
    <span
      className={`grg-featured-icon ${className}`}
      data-type={type}
      data-size={size}
      data-filled={filled || undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon name={icon ?? DEFAULT_ICON[type]} size={ICON_SIZE[size]} />
    </span>
  );
}
