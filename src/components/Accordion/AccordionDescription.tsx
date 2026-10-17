import { AccordionKeyValue, type AccordionKeyValueRow } from './AccordionKeyValue';
import './AccordionDescription.css';

export type AccordionDescriptionProps = {
  /** Figma Description / Type: Text, key-value → text, key-value. */
  type?: 'text' | 'key-value';
  text?: string;
  rows?: readonly AccordionKeyValueRow[];
  /** Follows Accordion's Disabled state. */
  disabled?: boolean;
  className?: string;
};

/** Figma Description (151:13084): text or the Key-value component; fills the Accordion's content width. */
export function AccordionDescription({ type = 'text', text, rows = [], disabled = false, className = '' }: AccordionDescriptionProps) {
  return (
    <div className={`grg-accordion-description ${className}`} data-type={type} data-disabled={disabled || undefined} aria-disabled={disabled || undefined}>
      {type === 'key-value' ? <AccordionKeyValue rows={rows} disabled={disabled} /> : <p>{text}</p>}
    </div>
  );
}
