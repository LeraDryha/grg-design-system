import type { ReactNode } from 'react';
import './AccordionKeyValue.css';

export type AccordionKeyValueRow = {
  /** Optional stable identifier when rows can change order. */
  id?: string;
  key: string;
  value: ReactNode;
};

export type AccordionKeyValueProps = {
  /** Figma Key-value / Rows 01–05: the row count comes from this array; it is not limited to five. */
  rows: readonly AccordionKeyValueRow[];
  disabled?: boolean;
  className?: string;
};

/** Figma Key-value (151:13111): a description list with left-aligned keys and right-aligned values. */
export function AccordionKeyValue({ rows, disabled = false, className = '' }: AccordionKeyValueProps) {
  return (
    <dl className={`grg-accordion-key-value ${className}`} data-disabled={disabled || undefined} aria-disabled={disabled || undefined}>
      {rows.map((row, index) => (
        <div className="grg-accordion-key-value__row" key={row.id ?? `${row.key}-${index}`}>
          <dt>{row.key}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
