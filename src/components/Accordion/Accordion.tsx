import { useId, useState, type ComponentPropsWithoutRef } from 'react';
import { Accordion as PrimeAccordion, AccordionTab } from 'primereact/accordion';
import { Icon, type IconName } from '../Icon/Icon';
import { AccordionDescription } from './AccordionDescription';
import type { AccordionKeyValueRow } from './AccordionKeyValue';
import './Accordion.css';

export type AccordionProps = Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'children'> & {
  /** Figma Edit title: the header that names the hidden content. */
  title: string;
  /** Figma Description / Type: Text or key-value. */
  descriptionType?: 'text' | 'key-value';
  /** The text inside the Description part. */
  description?: string;
  /** Figma Key-value / Rows: one row per entry, with no fixed limit. */
  rows?: readonly AccordionKeyValueRow[];
  /** Figma Flip icon: On → before, Off → after. Before replaces the leading icon. */
  chevronPosition?: 'before' | 'after';
  /** Figma Icon: null hides it; otherwise its Base icon name. Shown only with Chevron after. */
  icon?: IconName | null;
  /** Figma Expanded: On or Off. Leave unset for uncontrolled interaction. */
  expanded?: boolean;
  /** Initial Expanded state when `expanded` is unset. */
  defaultExpanded?: boolean;
  /** Called when the user opens or closes the panel. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Figma State: Disabled. Can remain expanded, as in the component set. */
  disabled?: boolean;
  /** The header's heading level within the surrounding page. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Static documentation preview of Figma Default, Hovered and Active, plus system keyboard focus. */
  previewState?: 'default' | 'hover' | 'active' | 'focus';
};

/**
 * Figma Accordion (151:13214), built on an unstyled PrimeReact Accordion and AccordionTab.
 * PrimeReact owns the trigger, keyboard interaction and ARIA connections. Templates use the existing
 * Base icons and the two Figma Description parts. Hidden content remains mounted so aria-controls
 * always resolves; the hidden attribute removes it and its descendants from layout and navigation.
 * Figma defines no motion, so the unstyled transition is immediate.
 */
export function Accordion({
  title,
  descriptionType = 'text',
  description,
  rows,
  chevronPosition = 'after',
  icon = 'help',
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  headingLevel = 3,
  previewState = 'default',
  id,
  className = '',
  ...props
}: AccordionProps) {
  const autoId = useId();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;

  return (
    <PrimeAccordion
      {...props}
      id={id ?? `grg-accordion-${autoId}`}
      className={`grg-accordion ${className}`}
      data-chevron-position={chevronPosition}
      data-preview-state={previewState === 'default' ? undefined : previewState}
      activeIndex={isExpanded ? 0 : null}
      onTabChange={event => {
        const next = event.index === 0;
        if (expanded === undefined) setInternalExpanded(next);
        onExpandedChange?.(next);
      }}
      expandIcon={<Icon name="direction-down" size={20} className="grg-accordion__chevron" />}
      collapseIcon={<Icon name="direction-up" size={20} className="grg-accordion__chevron" />}
      transitionOptions={{ timeout: 0, unmountOnExit: false }}
    >
      <AccordionTab
        disabled={disabled}
        headerTemplate={(
          <>
            {chevronPosition === 'after' && icon && <Icon name={icon} size={20} className="grg-accordion__leading-icon" />}
            <span className="grg-accordion__title">{title}</span>
          </>
        )}
        pt={{
          // Figma's Disabled state applies to the whole item, including an already-expanded description.
          root: { className: 'grg-accordion__item', 'data-expanded': isExpanded || undefined, 'data-disabled': disabled || undefined, 'aria-disabled': disabled || undefined },
          header: { className: 'grg-accordion__header', role: 'heading', 'aria-level': headingLevel },
          headerAction: { className: 'grg-accordion__toggle' },
          toggleableContent: { className: 'grg-accordion__panel', hidden: !isExpanded },
          content: { className: 'grg-accordion__content' },
        }}
      >
        <AccordionDescription type={descriptionType} text={description} rows={rows} disabled={disabled} />
      </AccordionTab>
    </PrimeAccordion>
  );
}
