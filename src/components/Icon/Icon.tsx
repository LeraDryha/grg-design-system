import type { CSSProperties } from 'react';
import calendar from '../../icons/calendar.svg';
import card from '../../icons/card.svg';
import chevronDown from '../../icons/chevron-down.svg';
import copy from '../../icons/copy.svg';
import eye from '../../icons/eye.svg';
import eyeDisable from '../../icons/eye-disable.svg';
import information from '../../icons/information.svg';
import informationCircle from '../../icons/information-circle.svg';
import link from '../../icons/link.svg';
import loading from '../../icons/loading.svg';
import mail from '../../icons/mail.svg';
import plus from '../../icons/plus.svg';
import remove from '../../icons/remove.svg';
import warningError from '../../icons/warning-error.svg';
import './Icon.css';

/** Icons exported from the Figma "Base icons" page, under their Figma names. Add a file to src/icons and a line here. */
export const icons = {
  calendar,
  card,
  'chevron-down': chevronDown,
  copy,
  eye,
  'eye-disable': eyeDisable,
  information,
  'information-circle': informationCircle,
  link,
  loading,
  mail,
  plus,
  remove,
  'warning-error': warningError,
} as const;
export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
  /** Size in px; Figma uses 16, 20 and 24 */
  size?: 16 | 20 | 24;
  className?: string;
};

/**
 * Single-colour icon drawn as a CSS mask, so its colour follows `currentColor`
 * and the parent's token, in both themes. Decorative: the parent carries the accessible name.
 */
export function Icon({ name, size = 20, className = '' }: IconProps) {
  const style = { '--icon-src': `url("${icons[name]}")`, '--icon-size': `${size}px` } as CSSProperties;
  return <span className={`grg-icon ${className}`} style={style} aria-hidden="true" />;
}
