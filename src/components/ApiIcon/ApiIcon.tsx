import { Icon, type IconName } from '../Icon/Icon';
import './ApiIcon.css';

export type ApiMethod = 'post' | 'get' | 'delete' | 'patch' | 'put';

/** Figma Misc icons › "API icons" (1356:29600): Type × State × Text. */
export type ApiIconProps = {
  /** Figma Type: the HTTP method */
  method?: ApiMethod;
  /** Figma Text: the method name next to the arrow */
  text?: boolean;
  /** Figma State = Active: a deeper tint, for the selected endpoint */
  active?: boolean;
  /** Hide it from screen readers when the method is written next to it */
  decorative?: boolean;
  className?: string;
};

const ICON: Record<ApiMethod, IconName> = {
  post: 'arrow-up-right',
  get: 'arrow-down-left',
  delete: 'remove',
  patch: 'arrow-up-right',
  put: 'arrow-up-right',
};

/** The HTTP method of an API endpoint: a small coloured tile with an arrow, and the method name if there is room. */
export function ApiIcon({ method = 'post', text = false, active = false, decorative = false, className = '' }: ApiIconProps) {
  const name = method.toUpperCase();
  return (
    <span
      className={`grg-api-icon ${className}`}
      data-method={method}
      data-text={text || undefined}
      data-active={active || undefined}
      role={text || decorative ? undefined : 'img'}
      aria-label={text || decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      <Icon name={ICON[method]} size={20} />
      {text && <span className="grg-api-icon__text">{name}</span>}
    </span>
  );
}
