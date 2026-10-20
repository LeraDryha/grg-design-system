import { useId } from 'react';
import { Checkbox, type CheckboxProps } from '../Checkbox/Checkbox';
import { Link } from '../Link/Link';
import { HintText } from '../FormField/FormField';
import './CheckboxLabel.css';

/** Figma "Checkbox label" (136:5147): Flip × Selected × Details, with Sublabel, Description and Link button. */
export type CheckboxLabelProps = Omit<CheckboxProps, 'aria-label' | 'aria-describedby'> & {
  /** The option (Figma Label, Body-md/Medium) */
  label: string;
  /** Short extra text after the label, such as "(Optional)" (Figma Sublabel) */
  sublabel?: string;
  /** A line under the label that explains the option (Figma Description) */
  description?: string;
  /** A link under the description, such as "Learn more" (Figma Link button) */
  link?: { label: string; href: string; external?: boolean };
  /** Figma Flip: the checkbox on the right, for lists where the text comes first */
  flip?: boolean;
  /** Error message under the label, such as "You need to accept the Terms to continue": the checkbox turns red
   *  and screen readers read the message with it. Not in Figma; the same Hint text as in Input and Select. */
  error?: string;
};

/**
 * A checkbox with its label, and optionally a sublabel, a description and a link, for forms and lists.
 * The whole label is clickable; the description is read with the checkbox.
 */
export function CheckboxLabel({ label, sublabel, description, link, flip = false, error, id: suppliedId, className = '', ...checkbox }: CheckboxLabelProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div
      className={`grg-checkbox-label ${className}`}
      data-flip={flip || undefined}
      data-size={checkbox.size ?? 'sm'}
      data-disabled={checkbox.disabled || undefined}
    >
      <span className="grg-checkbox-label__check">
        <Checkbox
          {...checkbox}
          id={id}
          invalid={!!error || checkbox.invalid}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
        />
      </span>
      <span className="grg-checkbox-label__content">
        <span className="grg-checkbox-label__text">
          <label className="grg-checkbox-label__title" htmlFor={id}>
            <span className="grg-checkbox-label__label">{label}</span>
            {sublabel && <span className="grg-checkbox-label__sublabel">{sublabel}</span>}
          </label>
          {description && <span className="grg-checkbox-label__description" id={descriptionId}>{description}</span>}
        </span>
        {error && (
          <HintText id={errorId} state="error">
            {error}
          </HintText>
        )}
        {link && (
          <Link className="grg-checkbox-label__link" href={link.href} external={link.external} color="blue" size="xs" disabled={checkbox.disabled}>
            {link.label}
          </Link>
        )}
      </span>
    </div>
  );
}
