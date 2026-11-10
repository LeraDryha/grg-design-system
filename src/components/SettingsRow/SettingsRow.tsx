import { useId, type ReactNode } from 'react';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import type { IconName } from '../Icon/Icon';
import './SettingsRow.css';

export type SettingsRowProps = {
  title: string;
  /** What the setting does, under the title */
  description?: ReactNode;
  /** A Featured Icon (neutral, md) before the text */
  icon?: IconName;
  /** The current value: a name, an address, a currency, "On" */
  value?: ReactNode;
  /** Why the button is off, or what to do first: "Turn off fixed sum invoice first" */
  note?: string;
  /** Usually one button with a short verb: Edit, Change, Turn on (Button sm). Two when the row is the head of a card */
  action?: ReactNode;
  /** beside: the value on the half-way line, the button at the end (short values, as on Profile).
   *  below: a larger title, the button by it, the value under the text (long values, or the head of a card) */
  layout?: 'beside' | 'below';
  /** The title's heading level: h2 in a card on a page, h3 inside a titled group */
  headingLevel?: 2 | 3;
  className?: string;
};

/**
 * One setting: what it is, its value and the button that changes it. Settings List stacks rows in a card with a line
 * between them. Designed in code from the In product pages (Profile, Payment settings, Settings, Reporting), so they
 * line up the same everywhere. Plain markup: PrimeReact has no such part.
 */
export function SettingsRow({ title, description, icon, value, note, action, layout = 'beside', headingLevel = 2, className = '' }: SettingsRowProps) {
  const titleId = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const hasValue = value !== undefined && value !== null && value !== false && value !== '';
  return (
    <section className={`grg-settings-row ${className}`} data-layout={layout} aria-labelledby={titleId}>
      <span className="grg-settings-row__about">
        {icon && <FeaturedIcon type="neutral" size="md" icon={icon} />}
        <span className="grg-settings-row__text">
          <Heading id={titleId} className="grg-settings-row__title">{title}</Heading>
          {description && <p className="grg-settings-row__description">{description}</p>}
          {note && <p className="grg-settings-row__note">{note}</p>}
        </span>
      </span>
      {hasValue && <div className="grg-settings-row__value">{value}</div>}
      {action && <span className="grg-settings-row__action">{action}</span>}
    </section>
  );
}

/** A card's rows with a line between them; anything else in the card (a table under its head) gets the line too */
export function SettingsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grg-settings-list ${className}`}>{children}</div>;
}
