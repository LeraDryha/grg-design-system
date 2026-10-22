import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { DataTable, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { ActionButton } from '../ActionButton/ActionButton';
import { Badge, type BadgeColor } from '../Badge/Badge';
import { Checkbox } from '../Checkbox/Checkbox';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import { Icon } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import './Table.css';

/* Figma page ❖ Table: "Table header cell" (1556:5408), "Table row cell" (1556:11439), "Cell text" (1556:11417),
   "Sorting icons" (1559:61007), "Table scroll indicator" (2203:15865) and the two "Usage Guidelines"
   (1559:41052, 1559:70411). */

/* ---- Cell text ---- */

export type TableTextProps = {
  /** Figma Cell title */
  title: ReactNode;
  /** Figma Cell description: a second line (Vertical) or after the title (Horizontal) */
  description?: ReactNode;
  /** Figma Badge after the title */
  badge?: { label: string; color?: BadgeColor };
  /** Figma Priority: Leading (medium weight, the row's name), Regular, Passive (softer) */
  priority?: 'leading' | 'regular' | 'passive';
  /** Figma Orientation */
  orientation?: 'vertical' | 'horizontal';
  /** A picture before the text: Transaction icon, coin, payment method, avatar, icon or file type */
  leading?: ReactNode;
};

/** Figma "Cell text": the title, a description and a badge; a long title ends with "…" and shows in full in a tooltip. */
export function TableText({ title, description, badge, priority = 'regular', orientation = 'vertical', leading }: TableTextProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const element = titleRef.current;
    if (!element) return;
    const check = () => setCut(element.scrollWidth > element.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [title]);
  return (
    <span className="grg-table-text" data-priority={priority} data-orientation={orientation}>
      {leading && <span className="grg-table-text__leading">{leading}</span>}
      <span className="grg-table-text__body">
        <span className="grg-table-text__top">
          <Tooltip title={typeof title === 'string' ? title : ''} side="top" purpose="repeat" disabled={!cut || typeof title !== 'string'}>
            <span ref={titleRef} className="grg-table-text__title">{title}</span>
          </Tooltip>
          {badge && <Badge variant="light" size="xs" color={badge.color ?? 'neutral'} label={badge.label} leftIcon={null} rightIcon={null} />}
          {description && orientation === 'horizontal' && <span className="grg-table-text__description">{description}</span>}
        </span>
        {description && orientation === 'vertical' && <span className="grg-table-text__description">{description}</span>}
      </span>
    </span>
  );
}

/* ---- Table ---- */

export type TableColumn<T> = {
  id: string;
  /** Figma Table header cell: the title */
  header: string;
  /** The cell: TableText, or any component (Status Badge, Progress Bar, Switch, buttons, an input) */
  cell: (row: T) => ReactNode;
  /** Makes the column sortable (Figma Sort): the value rows are sorted by */
  sortValue?: (row: T) => string | number;
  /** Figma Header cell · Actions: an info button with this text in a tooltip */
  info?: string;
  /** A fixed width, such as "var(--space-2000)"; other columns share the rest (Figma Fixed / Fill) */
  width?: string;
};

type SortState = { field?: string; order?: 1 | -1 | 0 | null };

export type TableProps<T> = {
  rows: T[];
  columns: TableColumn<T>[];
  /** A stable id for each row */
  rowKey: (row: T) => string;
  /** What a row is called, for screen readers: "Select …", "Open …" */
  rowLabel?: (row: T) => string;
  /** Figma Size: md-56, lg-64 (when a cell has a description) */
  size?: 'md' | 'lg';
  /** Figma Checkbox: a first column to select rows, with select-all in the header */
  selected?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Figma Actions: buttons for the row, in the last column, stuck to the right while the table scrolls */
  actions?: (row: T) => ReactNode;
  /** The whole row opens its details; a chevron ends the row */
  onRowOpen?: (row: T) => void;
  /** Or a page for each row */
  rowHref?: (row: T) => string;
  /** Rows on their way: grey placeholder rows */
  loading?: boolean;
  /** No rows (Figma Empty) */
  empty?: { title: string; subtitle?: string };
  /** A height: the table scrolls inside it and the header stays at the top */
  maxHeight?: string;
  /** What the table shows, for screen readers */
  'aria-label': string;
  className?: string;
};

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="checkbox"], [role="switch"], [role="button"]';

/**
 * Rows of data with sortable columns: transactions, orders, members. PrimeReact DataTable (unstyled) gives the table
 * roles, the sorting (with aria-sort) and the keyboard on the headers; the cells are the system's components. When it
 * is wider than its place it scrolls sideways: the selection and the first column stay on the left, the actions on
 * the right, with shadows, and arrows show what is hidden.
 */
export function Table<T>({
  rows, columns, rowKey, rowLabel = row => rowKey(row), size = 'md', selected, onSelectionChange, actions, onRowOpen, rowHref,
  loading = false, empty = { title: 'No results found', subtitle: 'Try adjusting your search or filters' }, maxHeight,
  'aria-label': label, className = '',
}: TableProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<SortState>({});
  const [scroll, setScroll] = useState({ left: false, right: false });
  const [edges, setEdges] = useState({ start: 0, end: 0, crowded: false });
  const selectable = !!onSelectionChange;
  const opens = !!(onRowOpen || rowHref);

  const sorted = useMemo(() => {
    const column = columns.find(candidate => candidate.id === sort.field);
    if (!column?.sortValue || !sort.order) return rows;
    const value = column.sortValue;
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * (sort.order as number);
    });
  }, [rows, columns, sort]);

  /* Which sides have hidden columns, and where the scroll arrows go: after the columns stuck on the left, before
     the actions on the right */
  useLayoutEffect(() => {
    const wrapper = root.current?.querySelector<HTMLElement>('.grg-table__wrapper');
    if (!wrapper) return;
    const update = () => {
      const max = wrapper.scrollWidth - wrapper.clientWidth;
      setScroll({ left: wrapper.scrollLeft > 1, right: wrapper.scrollLeft < max - 1 });
      const starts = wrapper.querySelectorAll<HTMLElement>('th[data-sticky="start"]');
      const end = wrapper.querySelector<HTMLElement>('th[data-sticky="end"]');
      const last = starts[starts.length - 1];
      // Measured on screen: a stuck column's offsetLeft moves with the scroll
      const box = wrapper.getBoundingClientRect();
      const start = last ? last.getBoundingClientRect().right - box.left : 0;
      const width = end?.offsetWidth ?? 0;
      // On a narrow screen the stuck columns would cover the rest: then only the left ones stay
      const crowded = start + width > box.width * 0.6;
      setEdges({ start, end: crowded || !end ? 0 : box.right - end.getBoundingClientRect().left, crowded });
    };
    update();
    wrapper.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => {
      wrapper.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [rows.length, columns.length, loading]);

  const scrollBy = (direction: 1 | -1) => {
    const wrapper = root.current?.querySelector<HTMLElement>('.grg-table__wrapper');
    if (!wrapper) return;
    wrapper.scrollBy({ left: direction * (wrapper.clientWidth - edges.start - edges.end), behavior: 'smooth' });
  };

  const keys = rows.map(rowKey);
  const chosen = new Set(selected ?? []);
  const allChosen = keys.length > 0 && keys.every(key => chosen.has(key));
  const someChosen = keys.some(key => chosen.has(key));

  const open = (row: T, event?: MouseEvent<HTMLElement>) => {
    if (onRowOpen) onRowOpen(row);
    else if (rowHref && !event) window.location.assign(rowHref(row));
  };

  const cellPt = (sticky?: 'start' | 'end', extra?: Record<string, unknown>) => ({
    headerCell: { className: 'grg-table__head', 'data-sticky': sticky, ...extra },
    bodyCell: { className: 'grg-table__cell', 'data-sticky': sticky, ...extra },
    headerContent: { className: 'grg-table__head-content' },
    headerTitle: { className: 'grg-table__head-title' },
    sort: { className: 'grg-table__sort' },
  });

  const placeholder = Array.from({ length: 5 }, (_, index) => ({ __placeholder: index }) as unknown as T);
  const skeleton = () => <Skeleton pt={{ root: { className: 'grg-table__skeleton' } }} />;

  return (
    <div
      ref={root}
      className={`grg-table ${className}`}
      data-size={size}
      data-scroll-left={scroll.left || undefined}
      data-scroll-right={scroll.right || undefined}
      data-selectable={selectable || undefined}
      data-crowded={edges.crowded || undefined}
      data-sticky-header={maxHeight ? true : undefined}
      style={{ '--table-start-edge': `${edges.start}px`, '--table-end-edge': `${edges.end}px`, '--table-max-height': maxHeight } as CSSProperties}
    >
      <DataTable
        value={(loading ? placeholder : sorted) as never[]}
        // PrimeReact keeps a cell while its row data is the same; ours show outside state (checkboxes, switches)
        cellMemo={false}
        lazy
        removableSort
        sortField={sort.field}
        sortOrder={sort.order ?? null}
        onSort={(event: DataTableSortEvent) => setSort({ field: event.sortField, order: event.sortOrder as SortState['order'] })}
        sortIcon={({ sorted: isSorted, sortOrder }) => (
          <Icon name={!isSorted ? 'expand-up-down-line' : (sortOrder ?? 0) > 0 ? 'direction-up' : 'direction-down'} size={16} className="grg-table__sort-icon" />
        )}
        onRowClick={event => {
          if (!opens || loading) return;
          const target = event.originalEvent.target as HTMLElement;
          if (target.closest(INTERACTIVE)) return;
          const row = event.data as T;
          if (rowHref && !onRowOpen) {
            const link = (event.originalEvent.currentTarget as HTMLElement).querySelector<HTMLAnchorElement>('.grg-table__open');
            link?.click();
          } else open(row);
        }}
        emptyMessage={() => (
          <div className="grg-table__empty">
            <FeaturedIcon type="neutral" size="lg" icon="search" />
            <span className="grg-table__empty-title">{empty.title}</span>
            {empty.subtitle && <span className="grg-table__empty-subtitle">{empty.subtitle}</span>}
          </div>
        )}
        aria-label={label}
        aria-busy={loading || undefined}
        pt={{
          root: { className: 'grg-table__view' },
          wrapper: { className: 'grg-table__wrapper', tabIndex: 0, role: 'region', 'aria-label': `${label}, scrollable` },
          table: { className: 'grg-table__table', 'aria-label': label },
          thead: { className: 'grg-table__thead' },
          tbody: { className: 'grg-table__tbody' },
          bodyRow: { className: 'grg-table__row', 'data-opens': opens || undefined },
          emptyMessage: { className: 'grg-table__empty-row' },
        } as object}
      >
        {selectable && (
          <Column
            key="__select"
            header={(
              <Checkbox
                aria-label="Select all rows"
                checked={allChosen}
                indeterminate={someChosen && !allChosen}
                disabled={loading || !keys.length}
                onChange={on => onSelectionChange?.(on ? keys : [])}
              />
            )}
            body={(row: T) => loading ? skeleton() : (
              <Checkbox
                aria-label={`Select ${rowLabel(row)}`}
                checked={chosen.has(rowKey(row))}
                onChange={on => onSelectionChange?.(on ? [...chosen, rowKey(row)] : [...chosen].filter(key => key !== rowKey(row)))}
              />
            )}
            pt={cellPt('start', { 'data-select': true }) as object}
          />
        )}
        {columns.map((column, index) => (
          <Column
            key={column.id}
            field={column.id}
            sortable={!!column.sortValue}
            header={(
              <span className="grg-table__head-label">
                {column.header}
                {column.info && (
                  <Tooltip title={column.info} side="top" purpose="description">
                    <ActionButton icon="information-circle" size="xs" aria-label={`About ${column.header}`} />
                  </Tooltip>
                )}
              </span>
            )}
            body={(row: T) => loading ? skeleton() : column.cell(row)}
            style={column.width ? { width: column.width } : undefined}
            pt={cellPt(index === 0 ? 'start' : undefined, index === 0 ? { 'data-first': true } : undefined) as object}
          />
        ))}
        {opens && (
          <Column
            key="__open"
            header={<span className="grg-sr-only">Open</span>}
            body={(row: T) => loading ? null : rowHref && !onRowOpen ? (
              <a className="grg-table__open" href={rowHref(row)} aria-label={`Open ${rowLabel(row)}`}>
                <Icon name="direction-right" size={20} />
              </a>
            ) : (
              <button type="button" className="grg-table__open" aria-label={`Open ${rowLabel(row)}`} onClick={() => open(row)}>
                <Icon name="direction-right" size={20} />
              </button>
            )}
            pt={cellPt(actions ? undefined : 'end', { 'data-chevron': true }) as object}
          />
        )}
        {actions && (
          <Column
            key="__actions"
            header="Actions"
            body={(row: T) => loading ? skeleton() : <span className="grg-table__actions">{actions(row)}</span>}
            pt={cellPt('end', { 'data-actions': true }) as object}
          />
        )}
      </DataTable>
      <button type="button" className="grg-table__scroll" data-side="start" tabIndex={-1} aria-hidden="true" hidden={!scroll.left} onClick={() => scrollBy(-1)}>
        <Icon name="arrow-left" size={20} />
      </button>
      <button type="button" className="grg-table__scroll" data-side="end" tabIndex={-1} aria-hidden="true" hidden={!scroll.right} onClick={() => scrollBy(1)}>
        <Icon name="arrow-right" size={20} />
      </button>
    </div>
  );
}
