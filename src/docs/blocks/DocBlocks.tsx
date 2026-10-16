import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './DocBlocks.css';

/* Building blocks for component docs pages (see instructions.md, "Component page"). */

const FIGMA_FILE = 'https://www.figma.com/design/r3E5XdifyoiiNeuj7mOjBk/';
export const figmaUrl = (node: string) => `${FIGMA_FILE}?node-id=${node}`;

const STATUS = {
  ready: 'Ready',
  'in-progress': 'In progress',
  draft: 'Draft',
} as const;

export type ComponentHeaderProps = {
  status: keyof typeof STATUS;
  /** Figma node of the component set, as in the URL: "73-3711" */
  figma: string;
  /** Figma node of the usage guidelines */
  guidelines?: string;
  /** The PrimeReact component it is built on */
  builtOn?: string;
  /** Other docs pages it shares parts with */
  related?: { label: string; href: string }[];
};

/** The line under a component's title: status, Figma links, what it is built on. */
export function ComponentHeader({ status, figma, guidelines, builtOn, related = [] }: ComponentHeaderProps) {
  return (
    <div className="sb-unstyled doc-header">
      <span className="doc-status" data-status={status}>{STATUS[status]}</span>
      <a className="doc-chip" href={figmaUrl(figma)} target="_blank" rel="noreferrer">
        Component in Figma <span aria-hidden="true">↗</span>
      </a>
      {guidelines && (
        <a className="doc-chip" href={figmaUrl(guidelines)} target="_blank" rel="noreferrer">
          Usage guidelines <span aria-hidden="true">↗</span>
        </a>
      )}
      {builtOn && <span className="doc-chip doc-chip--quiet">Built on {builtOn}</span>}
      {related.map(r => (
        <a key={r.href} className="doc-chip" href={r.href} target="_top">
          Uses {r.label}
        </a>
      ))}
    </div>
  );
}

/** Figma properties next to the props that implement them. */
export function PropsMapping({ rows }: { rows: { figma: string; prop: string; values: string }[] }) {
  return (
    <table className="sb-unstyled doc-table">
      <thead>
        <tr>
          <th scope="col">Figma</th>
          <th scope="col">Prop</th>
          <th scope="col">Values</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.figma + r.prop}>
            <td>{r.figma}</td>
            <td><code>{r.prop}</code></td>
            <td>{r.values}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Do and don't, side by side. */
export function DoDont({ dos, donts }: { dos: ReactNode[]; donts: ReactNode[] }) {
  return (
    <div className="sb-unstyled doc-dodont">
      <section className="doc-dodont__col" data-kind="do">
        <h4>Use it for</h4>
        <ul>{dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
      </section>
      <section className="doc-dodont__col" data-kind="dont">
        <h4>Don’t use it for</h4>
        <ul>{donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
      </section>
    </div>
  );
}

/* ---- Canvas blocks, used inside stories ---- */

export type StateMatrixProps = {
  /** Column headings, such as Empty and Filled */
  columns: string[];
  rows: { label: string; note?: string; cells: ReactNode[] }[];
  /** Width of each cell; fields are 280px wide in the matrices */
  cellWidth?: number;
};

/**
 * A labelled grid of variants, like a component set on a Figma page:
 * column headings on top, a row label (and a short note) on the left.
 */
export function StateMatrix({ columns, rows, cellWidth = 280 }: StateMatrixProps) {
  return (
    <div className="doc-matrix" style={{ gridTemplateColumns: `minmax(120px, auto) repeat(${columns.length}, ${cellWidth}px)` }}>
      <span />
      {columns.map(c => <span key={c} className="doc-matrix__col">{c}</span>)}
      {rows.map(row => (
        <div key={row.label} className="doc-matrix__row" role="group" aria-label={row.label}>
          <span className="doc-matrix__label">
            {row.label}
            {row.note && <span className="doc-matrix__note">{row.note}</span>}
          </span>
          {row.cells.map((cell, i) => <div key={i} className="doc-matrix__cell">{cell}</div>)}
        </div>
      ))}
    </div>
  );
}

export type AnatomyMarker = {
  n: number;
  /** CSS selector inside the example */
  target: string;
  /** Where the number sits: above, below, left or right of the part */
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const DOT = 24; // badge size
const REACH = 28; // from the part to the row of badges
const SPACING = 32; // minimum distance between badges in a row
const KNEE = 8; // the leader turns this far from the badge

type Spot = { n: number; side: NonNullable<AnatomyMarker['side']>; ax: number; ay: number; bx: number; by: number };

/** Keeps badges in a row at least SPACING apart, in the order of their parts, centred on them. */
function spread(values: number[]) {
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const placed: number[] = [];
  order.forEach(([v], k) => placed.push(k === 0 ? v : Math.max(v, placed[k - 1] + SPACING)));
  const shift = values.reduce((a, b) => a + b, 0) / values.length - placed.reduce((a, b) => a + b, 0) / placed.length;
  const out = new Array<number>(values.length);
  order.forEach(([, i], k) => { out[i] = placed[k] + shift; });
  return out;
}

/**
 * A live example with numbered markers on its parts, like the anatomy in the Figma guidelines.
 * Only the numbers sit on the canvas; the page lists what each number is.
 * Badges line up in one row above, one below and one column on each side, evenly spaced;
 * positions are measured from the rendered component, so they follow the real layout.
 */
export function Anatomy({ markers, width = 320, children }: { markers: AnatomyMarker[]; width?: number | 'auto'; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [spots, setSpots] = useState<Spot[]>([]);

  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const measure = () => {
      const base = root.getBoundingClientRect();
      const anchors = markers.flatMap(m => {
        const el = root.querySelector(m.target);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        const side = m.side ?? 'top';
        const cx = r.left - base.left + r.width / 2;
        const cy = r.top - base.top + r.height / 2;
        const ax = side === 'left' ? r.left - base.left : side === 'right' ? r.right - base.left : cx;
        const ay = side === 'top' ? r.top - base.top : side === 'bottom' ? r.bottom - base.top : cy;
        return [{ n: m.n, side, ax, ay }];
      });
      const result: Spot[] = [];
      for (const side of ['top', 'bottom', 'left', 'right'] as const) {
        const group = anchors.filter(a => a.side === side);
        if (!group.length) continue;
        const horizontal = side === 'top' || side === 'bottom';
        const along = spread(group.map(a => (horizontal ? a.ax : a.ay)));
        const edge =
          side === 'top' ? Math.min(...group.map(a => a.ay)) - REACH - DOT / 2
          : side === 'bottom' ? Math.max(...group.map(a => a.ay)) + REACH + DOT / 2
          : side === 'left' ? Math.min(...group.map(a => a.ax)) - REACH - DOT / 2
          : Math.max(...group.map(a => a.ax)) + REACH + DOT / 2;
        group.forEach((a, i) => result.push({ ...a, bx: horizontal ? along[i] : edge, by: horizontal ? edge : along[i] }));
      }
      setSpots(result);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [markers]);

  // Orthogonal leaders: from the part straight out, then across to the badge
  const leader = (s: Spot) => {
    if (s.side === 'top' || s.side === 'bottom') {
      const knee = s.side === 'top' ? s.by + DOT / 2 + KNEE : s.by - DOT / 2 - KNEE;
      return `${s.ax},${s.ay} ${s.ax},${knee} ${s.bx},${knee} ${s.bx},${s.by}`;
    }
    const knee = s.side === 'left' ? s.bx + DOT / 2 + KNEE : s.bx - DOT / 2 - KNEE;
    return `${s.ax},${s.ay} ${knee},${s.ay} ${knee},${s.by} ${s.bx},${s.by}`;
  };

  return (
    <div className="doc-anatomy__stage" ref={stage} style={{ width: width === 'auto' ? 'max-content' : width }}>
      {children}
      <svg className="doc-anatomy__leaders" aria-hidden="true">
        {spots.map(s => <polyline key={s.n} points={leader(s)} />)}
      </svg>
      {spots.map(s => (
        <span key={s.n} className="doc-anatomy__dot" style={{ left: s.bx, top: s.by }} aria-hidden="true">{s.n}</span>
      ))}
    </div>
  );
}
