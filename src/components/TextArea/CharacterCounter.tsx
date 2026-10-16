import { Icon } from '../Icon/Icon';
import './CharacterCounter.css';

export type CharacterCounterProps = {
  /** Characters typed */
  count: number;
  /** The limit; without it only the count is shown */
  max?: number;
  /** Figma State: Default, Error (over the limit), Disabled */
  state?: 'default' | 'error' | 'disabled';
  /** The resize handle after the count (Figma "16/resize"); decorative, the field itself is resized */
  resizeIcon?: boolean;
  id?: string;
};

/**
 * Figma "Character counter" (203:20411): the count and the limit at the bottom right of Text Area.
 * Screen readers hear "153 of 200 characters"; the field points at it with aria-describedby, so it is read
 * with the field and not on every keystroke.
 */
export function CharacterCounter({ count, max, state = 'default', resizeIcon = true, id }: CharacterCounterProps) {
  return (
    // aria-disabled marks the grey text as part of a disabled field (exempt from contrast rules)
    <span className="grg-counter" data-state={state} id={id} aria-disabled={state === 'disabled' || undefined}>
      <span aria-hidden="true">{max === undefined ? count : `${count}/${max}`}</span>
      <span className="grg-sr-only">{max === undefined ? `${count} characters` : `${count} of ${max} characters`}</span>
      {resizeIcon && <Icon name="resize" size={16} />}
    </span>
  );
}
