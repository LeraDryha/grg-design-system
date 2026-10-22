import { useId, useRef, useState } from 'react';
import { Chip as PrimeChip } from 'primereact/chip';
import { Button as PrimeButton } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { ActionButton } from '../ActionButton/ActionButton';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { Icon, type IconName } from '../Icon/Icon';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import './Chip.css';

export type ChipProps = {
  /** The chip's visible and accessible label. */
  label: string;
  /** Figma Style: Filled or Outlined. */
  variant?: 'filled' | 'outlined';
  /** Figma Size: md-24, sm-20 or xs-16. */
  size?: 'md' | 'sm' | 'xs';
  /** Figma Type: Text, Leading icon or Avatar. */
  type?: 'text' | 'icon' | 'avatar';
  /** Base icon for Leading icon; check by default. */
  icon?: IconName;
  /** Existing Avatar configuration; size and decorative status are set by Chip. */
  avatar?: Omit<AvatarProps, 'size' | 'decorative' | 'status'>;
  /** Figma Remove: adds a separate remove action. */
  removable?: boolean;
  removeLabel?: string;
  /** Return false to keep the chip (for example, when the application owns its removal). */
  onRemove?: () => void | boolean;
  /** Assist/suggestion action. For filters, use selectable instead. */
  onClick?: () => void;
  /** Filter behavior: PrimeReact ToggleButton controls a boolean selection. */
  selectable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** PrimeReact Chip for tokens, Button for actions and ToggleButton for filters.
 * Chip itself has no disabled or selection API; sibling actions avoid nesting interactive controls. */
export function Chip({ label, variant = 'filled', size = 'md', type = 'text', icon = 'check', avatar,
  removable = false, removeLabel = `Remove ${label}`, onRemove, onClick, selectable = false,
  selected: controlled, defaultSelected = false, onSelectedChange, disabled = false,
  className = '',
}: ChipProps) {
  const id = useId();
  const chip = useRef<PrimeChip>(null);
  const root = useRef<HTMLSpanElement>(null);
  useKeyboardNavigation(root);
  const [local, setLocal] = useState(defaultSelected);
  const [visible, setVisible] = useState(true);
  const selected = selectable && (controlled ?? local);
  // Figma Filter chips: a chosen text chip gains a check, so the choice doesn't rest on colour alone
  const lead = type === 'avatar'
    ? <Avatar {...avatar} className={`grg-chip__avatar ${avatar?.className ?? ''}`} size={16} decorative />
    : type === 'icon' ? <Icon name={icon} size={12} className="grg-chip__icon" />
    : selected ? <Icon name="check" size={12} className="grg-chip__icon" /> : null;
  const content = <>{lead}<span className="grg-chip__label">{label}</span></>;
  const remove = () => {
    if (!disabled && onRemove?.() !== false) { chip.current?.setVisible(false); setVisible(false); }
  };
  const body = <>
        {selectable ? <ToggleButton unstyled className="grg-chip__toggle" checked={selected} disabled={disabled}
          onLabel={label} offLabel={label} onIcon={lead} offIcon={lead} aria-label={label}
          onChange={event => { if (controlled === undefined) setLocal(event.value); onSelectedChange?.(event.value); }}
          pt={{ root: { className: 'grg-chip__main' }, input: { className: 'grg-chip__checkbox' },
            box: { className: 'grg-chip__toggle-content' }, label: { className: 'grg-chip__label' } }}
        /> : onClick ? <PrimeButton unstyled type="button" className="grg-chip__main" disabled={disabled} onClick={onClick}>{content}</PrimeButton>
          : <span className="grg-chip__main">{content}</span>}
        {removable && <ActionButton icon="remove" size="xs" className="grg-chip__remove" aria-label={removeLabel}
          disabled={disabled} onClick={remove}
          onKeyDown={event => { if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); remove(); } }} />}
      </>;
  const shell = {
    className: 'grg-chip', 'data-size': size, 'data-variant': variant, 'data-type': type,
    'data-removable': removable || undefined, 'data-interactive': selectable || !!onClick || removable || undefined,
    'data-selected': selected || undefined, 'data-disabled': disabled || undefined,
    'aria-disabled': disabled || undefined,
  };
  if (!visible) return null;
  return <span ref={root} className={`grg-chip-scope ${className}`}>
    {selectable || onClick
      // PrimeChip replaces its root on prop changes. Keep the action's DOM stable so selection retains focus.
      ? <div {...shell}>{body}</div>
      : <PrimeChip ref={chip} id={id} unstyled label={label} {...shell}
          pt={{ root: { 'aria-label': undefined } }} template={body} />}
  </span>;
}
