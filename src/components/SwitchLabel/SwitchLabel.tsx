import { useId } from 'react';
import { Switch, type SwitchProps } from '../Switch/Switch';
import { Link } from '../Link/Link';
import '../CheckboxLabel/CheckboxLabel.css';

/** Figma "Switch label" (696:43421): Flip × Selected × Details, with Sublabel, Description and Link button. */
export type SwitchLabelProps = Omit<SwitchProps, 'aria-label' | 'aria-describedby'> & {
  /** The setting (Figma Label, Body-md/Medium) */
  label: string;
  /** Short extra text after the label, such as "(Recommended)" (Figma Sublabel) */
  sublabel?: string;
  /** A line under the label that says what the setting does (Figma Description) */
  description?: string;
  /** A link under the description, such as "Learn more" (Figma Link button) */
  link?: { label: string; href: string; external?: boolean };
  /** Figma Flip: the switch on the right, for settings lists where the text comes first */
  flip?: boolean;
};

/**
 * A switch with its label, and optionally a sublabel, a description and a link. The same layout as Checkbox Label:
 * the whole label is clickable and the description is read with the switch.
 */
export function SwitchLabel({ label, sublabel, description, link, flip = false, id: suppliedId, className = '', size = 'sm', ...props }: SwitchLabelProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <div className={`grg-checkbox-label grg-switch-label ${className}`} data-flip={flip || undefined} data-disabled={props.disabled || undefined}>
      <span className="grg-checkbox-label__check">
        <Switch {...props} size={size} id={id} aria-describedby={descriptionId} />
      </span>
      <span className="grg-checkbox-label__content">
        <span className="grg-checkbox-label__text">
          <label className="grg-checkbox-label__title" htmlFor={id}>
            <span className="grg-checkbox-label__label">{label}</span>
            {sublabel && <span className="grg-checkbox-label__sublabel">{sublabel}</span>}
          </label>
          {description && <span className="grg-checkbox-label__description" id={descriptionId}>{description}</span>}
        </span>
        {link && (
          <Link className="grg-checkbox-label__link" href={link.href} external={link.external} color="blue" size="xs" disabled={props.disabled}>
            {link.label}
          </Link>
        )}
      </span>
    </div>
  );
}
