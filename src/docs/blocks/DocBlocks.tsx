import type { ReactNode } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import './DocBlocks.css';

/* Building blocks for component docs pages (see instructions.md, "Component page"). */

const STATUS = {
  ready: 'Ready',
  'in-progress': 'In progress',
  draft: 'Draft',
} as const;

type Status = keyof typeof STATUS;

export type ComponentHeaderProps = {
  /** Pages with stories take the status from the stories' tags (one source, also shown in the sidebar) */
  status?: Status;
  /** Figma node of the component set, as in the URL: "73-3711". For maintainers only: the design file belongs
   *  to the company and is never linked from the public Storybook. Its frames are shown in the Design tab. */
  figma: string;
  /** Figma node of the usage guidelines (maintainers only, not linked) */
  guidelines?: string;
  /** The page's stories have a Design tab with the Figma frames */
  designTab?: boolean;
  /** The PrimeReact component it is built on */
  builtOn?: string;
  /** Other docs pages: parts it uses, or related components to see */
  related?: { label: string; href: string; relation?: 'Uses' | 'See also' }[];
};

/** Tags of the stories a docs page belongs to; none on a page without stories */
function useMetaTags(): string[] {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const of = useOf('meta');
    return of.type === 'meta' ? of.preparedMeta.tags ?? [] : [];
  } catch {
    return [];
  }
}

/** The line under a component's title: status, where the design lives, what it is built on. */
export function ComponentHeader({ status: given, designTab = false, builtOn, related = [] }: ComponentHeaderProps) {
  const tags = useMetaTags();
  const status = given ?? (Object.keys(STATUS) as Status[]).find(s => tags.includes(s)) ?? 'draft';
  return (
    <div className="sb-unstyled doc-header">
      <span className="doc-status" data-status={status}>{STATUS[status]}</span>
      <span className="doc-chip doc-chip--quiet">Designed in Figma{designTab ? ': see the Design tab of each story' : ''}</span>
      {builtOn && <span className="doc-chip doc-chip--quiet">Built on {builtOn}</span>}
      {related.map(r => (
        <a key={r.href} className="doc-chip" href={r.href} target="_top">
          {r.relation ?? 'Uses'} {r.label}
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

/** Overview stories (types, sizes, colours): the variants side by side, each with a quiet caption under it. */
export function Showcase({ children, column = false }: { children: ReactNode; column?: boolean }) {
  return <div className="doc-showcase" data-column={column || undefined}>{children}</div>;
}

export function Variant({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="doc-variant">
      <div className="doc-variant__stage">{children}</div>
      <figcaption className="doc-variant__caption">{caption}</figcaption>
    </figure>
  );
}
