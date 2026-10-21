import { useId } from 'react';
import { ProgressBar as PrimeProgressBar } from 'primereact/progressbar';
import './ProgressBar.css';

/* Figma page ❖ Progress bar: "Progress bar" (656:21789), "Progress bar label" (657:21876), "Progress bar line"
   (656:21784) and "Usage Guidelines" (755:10138). */

export type ProgressBarProps = {
  /** How far along, 0–100 (Figma Percentage, any value here). Leave it out while the length is unknown: the bar moves */
  value?: number;
  /** Figma Progress bar line · Color: Primary, Success, Warning, Error, Blue */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Figma Label: what is progressing */
  label?: string;
  /** Figma Description: a hint under the bar */
  description?: string;
  /** Figma Type: where the value goes. none hides it */
  valuePosition?: 'right' | 'top' | 'bottom' | 'none';
  /** The value as text, such as "8 of 10 steps"; the percentage by default */
  valueText?: string;
  /** Name for a bar without a visible label, such as "Uploading invoice.pdf" */
  'aria-label'?: string;
  className?: string;
};

/**
 * Shows how far a task or a quantity has got: an upload, a filled profile, a used limit. PrimeReact ProgressBar
 * (unstyled) gives the progressbar role and the moving bar for an unknown length; the look is the Figma track and fill.
 */
export function ProgressBar({
  value, color = 'primary', label, description, valuePosition = 'right', valueText, 'aria-label': ariaLabel, className = '',
}: ProgressBarProps) {
  const id = useId();
  const unknown = value === undefined;
  const percent = unknown ? 0 : Math.max(0, Math.min(100, value));
  const text = unknown ? undefined : (valueText ?? `${Math.round(percent)}%`);
  const showValue = text !== undefined && valuePosition !== 'none';

  const bar = (
    <PrimeProgressBar
      value={unknown ? undefined : percent}
      mode={unknown ? 'indeterminate' : 'determinate'}
      showValue={false}
      aria-label={label ? undefined : ariaLabel}
      aria-labelledby={label ? `${id}-label` : undefined}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-valuetext={valueText}
      pt={{
        root: { className: 'grg-progress-bar__track', 'data-color': color, 'data-unknown': unknown || undefined },
        value: { className: 'grg-progress-bar__fill' },
        container: { className: 'grg-progress-bar__moving' },
      } as object}
    />
  );
  const valueElement = showValue && <span className="grg-progress-bar__value" aria-hidden="true">{text}</span>;

  return (
    <div className={`grg-progress-bar ${className}`} data-value-position={valuePosition}>
      {(label || (showValue && valuePosition === 'top')) && (
        <div className="grg-progress-bar__head">
          {label && <span className="grg-progress-bar__label" id={`${id}-label`}>{label}</span>}
          {valuePosition === 'top' && valueElement}
        </div>
      )}
      {valuePosition === 'right' ? <div className="grg-progress-bar__row">{bar}{valueElement}</div> : bar}
      {(description || (showValue && valuePosition === 'bottom')) && (
        <div className="grg-progress-bar__foot">
          {description && <span className="grg-progress-bar__description" id={`${id}-description`}>{description}</span>}
          {valuePosition === 'bottom' && valueElement}
        </div>
      )}
    </div>
  );
}
