import { useState } from 'react';
import { StatusBadge, STATUS_LABEL, type StatusBadgeType } from '../StatusBadge/StatusBadge';
import './Avatar.css';

/** The Additional colour groups an avatar can take (Figma "Shared colours") */
export const avatarColors = [
  'red', 'pink', 'orange', 'amber', 'yellow', 'pea', 'green', 'emerald', 'cyan', 'sky', 'blue', 'indigo', 'purple', 'fuchsia',
] as const;
export type AvatarColor = (typeof avatarColors)[number];

export const avatarSizes = [120, 96, 80, 64, 56, 48, 40, 32, 24, 20, 16] as const;
export type AvatarSize = (typeof avatarSizes)[number];

/** Figma "Avatar" (152:1467): Size × Image × Initials × Coloured × Company, with a Status badge. */
export type AvatarProps = {
  /** Figma Size, in px */
  size?: AvatarSize;
  /** Photo or logo (Figma Image = on). If it fails to load, the shape shows instead. */
  src?: string;
  /** Who or what it is: the accessible name, and the source of the initials */
  name?: string;
  /** Figma Initials: show the first letters of `name` instead of a shape (one letter at 16 and 20px) */
  initials?: boolean;
  /** The placeholder shape without a photo: a person, or a company (Figma Company) */
  shape?: 'user' | 'company';
  /** Figma Coloured: one Additional colour group; grey when not set */
  color?: AvatarColor;
  /** Figma Status: the badge at the bottom right. Not shown at 16 and 20px. */
  status?: StatusBadgeType;
  /** What screen readers hear for the status, such as "verified"; a default per status otherwise */
  statusLabel?: string;
  /** Hide it from screen readers when the name is written next to it, as in a list or a select */
  decorative?: boolean;
  className?: string;
};

/** Badge size for each avatar size (Figma guidelines: 120–80 → 24, 64–56 → 20, 48 → 16, 40–32 → 12, 24 → 8) */
const BADGE: Partial<Record<AvatarSize, 24 | 20 | 16 | 12 | 8>> = { 120: 24, 96: 24, 80: 24, 64: 20, 56: 20, 48: 16, 40: 12, 32: 12, 24: 8 };

const initialsOf = (name: string, size: AvatarSize) => {
  const words = name.replace(/^(mr|mrs|ms|miss|dr)\.?\s+/i, '').trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
  return (size <= 20 ? letters[0] : letters).toUpperCase();
};

/* Figma shapes on a 40px grid: a person (head and shoulders) and a company (two buildings) */
const SHAPES = {
  user: (
    <>
      <circle cx="20" cy="16" r="8" />
      <ellipse cx="20" cy="36" rx="14" ry="10" />
    </>
  ),
  company: (
    <>
      <path d="M26.34 40.83H30.56C31.58 40.83 32.42 34.68 32.42 33.65V24.65C32.42 22.25 32.74 20.12 30.46 19.36L26.84 18.15V33.65C26.84 34.33 26.66 40.28 26.34 40.83Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M22.53 8.43C23.73 8.02 24.98 8.92 24.98 10.19V41.66C24.98 42.69 24.14 43.52 23.12 43.52H10.10C9.07 43.52 8.24 42.69 8.24 41.66V17.21C8.24 14.81 9.77 12.68 12.05 11.92L22.53 8.43ZM14.75 23.35C14.19 23.35 13.75 23.80 13.75 24.35C13.75 24.90 14.19 25.35 14.75 25.35H18.47C19.02 25.35 19.47 24.90 19.47 24.35C19.47 23.80 19.02 23.35 18.47 23.35H14.75ZM14.75 17.77C14.19 17.77 13.75 18.22 13.75 18.77C13.75 19.32 14.19 19.77 14.75 19.77H18.47C19.02 19.77 19.47 19.32 19.47 18.77C19.47 18.22 19.02 17.77 18.47 17.77H14.75Z" />
    </>
  ),
};

/**
 * A picture of a person or a company: a photo, initials or a placeholder shape, with an optional status.
 * Named for screen readers when `name` is given ("Warren Fritsch, verified"), decorative otherwise.
 */
export function Avatar({ size = 40, src, name, initials = false, shape = 'user', color, status, statusLabel, decorative = false, className = '' }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const kind = src && !failed ? 'image' : initials && name ? 'initials' : 'shape';
  const badge = status ? BADGE[size] : undefined;
  const label = name && !decorative ? [name, status && badge ? statusLabel ?? STATUS_LABEL[status] : null].filter(Boolean).join(', ') : undefined;

  return (
    <span
      className={`grg-avatar ${className}`}
      data-size={size}
      data-kind={kind}
      data-color={color}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="grg-avatar__picture">
        {kind === 'image' && <img className="grg-avatar__image" src={src} alt="" onError={() => setFailed(true)} />}
        {kind === 'initials' && <span className="grg-avatar__initials">{initialsOf(name!, size)}</span>}
        {kind === 'shape' && (
          <svg className="grg-avatar__shape" viewBox="0 0 40 40" aria-hidden="true">
            {SHAPES[shape]}
          </svg>
        )}
      </span>
      {status && badge && <StatusBadge className="grg-avatar__status" type={status} size={badge} />}
    </span>
  );
}
