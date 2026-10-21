import { useId } from 'react';
import { Radio, type RadioProps } from '../Radio/Radio';
import { Link } from '../Link/Link';
import '../CheckboxLabel/CheckboxLabel.css';

/** Figma "Radio label" (136:11176): Flip × Selected × Details, with Sublabel, Description and Link button. */
export type RadioLabelProps = Omit<RadioProps, 'aria-label' | 'aria-describedby'> & {
  /** The option (Figma Label, Body-md/Medium) */
  label: string;
  /** Short extra text after the label, such as "(Free)" (Figma Sublabel) */
  sublabel?: string;
  /** A line under the label that explains the option (Figma Description) */
  description?: string;
  /** A link under the description, such as "Compare plans" (Figma Link button) */
  link?: { label: string; href: string; external?: boolean };
  /** Figma Flip: the radio on the right, for lists where the text comes first */
  flip?: boolean;
};

/**
 * A radio with its label, and optionally a sublabel, a description and a link. The same layout as Checkbox Label:
 * the whole label is clickable and the description is read with the radio.
 */
export function RadioLabel({ label, sublabel, description, link, flip = false, id: suppliedId, className = '', ...radio }: RadioLabelProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <div className={`grg-checkbox-label grg-radio-label ${className}`} data-flip={flip || undefined} data-disabled={radio.disabled || undefined}>
      <span className="grg-checkbox-label__check">
        <Radio {...radio} id={id} aria-describedby={descriptionId} />
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
          <Link className="grg-checkbox-label__link" href={link.href} external={link.external} color="blue" size="xs" disabled={radio.disabled}>
            {link.label}
          </Link>
        )}
      </span>
    </div>
  );
}
