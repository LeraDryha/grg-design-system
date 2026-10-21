import type { CSSProperties } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import './ProgressCircle.css';

/* Figma page ❖ Progress bar: "Circular progress bar" (659:4751) and its "Usage Guidelines" (756:12357). */

export type ProgressCircleProps = {
  /** How far along, 0–100 (Figma Percentage, any value here). Leave it out while the length is unknown: the ring turns */
  value?: number;
  /** Figma Size: lg-64, md-48, sm-32, xs-24 */
  size?: 'lg' | 'md' | 'sm' | 'xs';
  /** Figma Number: the percentage inside. xs-24 has no room for it */
  showValue?: boolean;
  /** What is progressing, for screen readers, such as "Profile complete" */
  'aria-label': string;
  className?: string;
};

/* Figma sizes: the ring's width and its stroke (lg 64/4, md 48/4, sm 32/3, xs 24/2) */
const STROKE = { lg: 4, md: 4, sm: 3, xs: 2 } as const;
const BOX = { lg: 64, md: 48, sm: 32, xs: 24 } as const;

/**
 * Progress as a ring with the percentage inside: steps of a short task, a filled profile. PrimeReact has only a
 * turning spinner (ProgressSpinner, used here for an unknown length), so the ring for a known value is drawn here,
 * with the same progressbar role.
 */
export function ProgressCircle({ value, size = 'md', showValue = true, 'aria-label': label, className = '' }: ProgressCircleProps) {
  if (value === undefined) {
    // PrimeReact draws a 40-unit ring in a 50-unit box: the box is cropped to the ring, and the stroke converted,
    // so the turning ring has the Figma size and stroke
    const stroke = (40 * STROKE[size]) / (BOX[size] - STROKE[size]);
    const start = 30 - stroke / 2;
    return (
      <ProgressSpinner
        strokeWidth={String(stroke)}
        aria-label={label}
        pt={{
          root: { className: `grg-progress-circle grg-progress-circle--turning ${className}`, 'data-size': size },
          spinner: { className: 'grg-progress-circle__svg', viewBox: `${start} ${start} ${40 + stroke} ${40 + stroke}` },
          circle: { className: 'grg-progress-circle__fill' },
        } as object}
      />
    );
  }
  const percent = Math.max(0, Math.min(100, value));
  // The ring is drawn in its own pixels so the stroke keeps the Figma width at every size
  const box = BOX[size];
  const radius = (box - STROKE[size]) / 2;
  const length = 2 * Math.PI * radius;
  return (
    <div
      className={`grg-progress-circle ${className}`}
      data-size={size}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      style={{ '--pc-length': length, '--pc-offset': length * (1 - percent / 100) } as CSSProperties}
    >
      <svg className="grg-progress-circle__svg" viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle className="grg-progress-circle__track" cx={box / 2} cy={box / 2} r={radius} strokeWidth={STROKE[size]} />
        <circle className="grg-progress-circle__fill" cx={box / 2} cy={box / 2} r={radius} strokeWidth={STROKE[size]} />
      </svg>
      {showValue && size !== 'xs' && <span className="grg-progress-circle__value" aria-hidden="true">{Math.round(percent)}%</span>}
    </div>
  );
}
