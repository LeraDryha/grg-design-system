import type { CSSProperties, ReactNode } from 'react';

/* What an item is, at the top of its details: its icon, kind, amount and status, on its colour. In a drawer it is the
   tinted header (Drawer `lead` and `tint`); on a page, the same block as a tinted box. Figma had a coloured band above
   a card; Lera chose the tinted header (option A, 2026-11-09). */

export type LeadProps = {
  /** Transaction Icon (the kind's colour) or Featured Icon (the status's colour), size lg */
  icon: ReactNode;
  /** The kind, such as "Withdrawal" or "Invoice amount" */
  kind: string;
  amount: string;
  /** A line under the amount, such as "≈ 100.00 EUR" */
  sub?: string;
  /** The status Badge */
  badge: ReactNode;
};

export function Lead({ icon, kind, amount, sub, badge }: LeadProps) {
  return (
    <div className="grg-ip-lead">
      {icon}
      <span className="grg-ip-lead__text">
        <span className="grg-ip-lead__kind">{kind}</span>
        <span className="grg-ip-lead__amount">{amount}</span>
        {sub && <span className="grg-ip-lead__sub">{sub}</span>}
      </span>
      <span className="grg-ip-lead__badge">{badge}</span>
    </div>
  );
}

/** The lead on a page: a box in the item's colour (a colour token) */
export function LeadBox({ tint, ...lead }: LeadProps & { tint: string }) {
  return <div className="grg-ip-lead-box" style={{ '--ip-tint': tint } as CSSProperties}><Lead {...lead} /></div>;
}
