import './StepperDot.css';

/** Figma "Stepper dot" (326:6369): Size × Active. */
export type StepperDotProps = {
  /** Number of steps. Figma shows 4; 2 to 8 */
  steps?: number;
  /** The current step, from 1 (Figma Active 01–04): drawn as a long bar */
  current?: number;
  /** Figma Size: sm-8px (in a Modal footer), xs-4px (compact places such as cards) */
  size?: 'sm' | 'xs';
  /** What screen readers hear; {current} and {steps} are replaced */
  label?: string;
  className?: string;
};

/**
 * Shows where people are in a short sequence, such as onboarding steps. It only shows the step:
 * the buttons next to it move between steps. PrimeReact has no counterpart (its Stepper is a full
 * step-by-step panel), so this is a plain element with the step as text for screen readers.
 */
export function StepperDot({ steps = 4, current = 1, size = 'sm', label = 'Step {current} of {steps}', className = '' }: StepperDotProps) {
  const active = Math.min(Math.max(current, 1), steps);
  return (
    <span className={`grg-stepper-dot ${className}`} data-size={size}>
      {Array.from({ length: steps }, (_, index) => (
        <span key={index} className="grg-stepper-dot__dot" data-active={index + 1 === active || undefined} aria-hidden="true" />
      ))}
      <span className="grg-sr-only">{label.replace('{current}', String(active)).replace('{steps}', String(steps))}</span>
    </span>
  );
}
