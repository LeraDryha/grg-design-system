import { Fragment, useSyncExternalStore } from 'react';
import { Paginator, type PaginatorPageLinksOptions } from 'primereact/paginator';
import { CompactSelect } from '../CompactSelect/CompactSelect';
import { Icon } from '../Icon/Icon';
import './Pagination.css';

/* Figma page ❖ Pagination: "Pagination" (630:37034), "Pagination cell" (608:4909), "Usage Guidelines" (630:37035). */

const PHONE_QUERY = '(max-width: 479px)';
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/**
 * The page numbers to show, as the guidelines' Truncation says: the first and the last page, the current one with its
 * neighbours, and the first three or last three near the ends. A gap of a single page shows that page instead of "…".
 */
export function visiblePages(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 2) [2, 3].forEach(page => pages.add(page));
  if (current >= total - 1) [total - 2, total - 1].forEach(page => pages.add(page));
  const sorted = [...pages].filter(page => page >= 1 && page <= total).sort((a, b) => a - b);
  // A gap of exactly one page: show it rather than an ellipsis that hides a single number
  for (let index = 1; index < sorted.length; index++) {
    if (sorted[index] - sorted[index - 1] === 2) sorted.splice(index, 0, sorted[index - 1] + 1);
  }
  return sorted;
}

export type PaginationProps = {
  /** How many items there are in all */
  totalRecords: number;
  /** The current page, from 1 */
  page: number;
  /** Items on a page */
  rows: number;
  /** A page or the page size was chosen */
  onChange: (change: { page: number; rows: number }) => void;
  /** Figma Type: Default (the pages) or Pagination group (with the results counter and the page size) */
  type?: 'default' | 'group';
  /** The page sizes to choose from (Figma page size selector) */
  rowsOptions?: number[];
  /** Phones (under 480px) hide First and Last and put the counter and the page size above the pages. auto follows the screen */
  layout?: 'auto' | 'desktop' | 'phone';
  /** The name of the navigation for screen readers */
  'aria-label'?: string;
  className?: string;
};

/**
 * Moves through a long list page by page: Previous and Next, First and Last, the page numbers, and in the group the
 * results counter and the page size. PrimeReact Paginator gives the controls and their names; the numbers follow the
 * Figma truncation (PrimeReact shows a sliding window without the ends).
 */
export function Pagination({
  totalRecords, page, rows, onChange, type = 'default', rowsOptions = [10, 20, 50, 100], layout = 'auto',
  'aria-label': label = 'Pagination', className = '',
}: PaginationProps) {
  const phoneScreen = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const phone = layout === 'auto' ? phoneScreen : layout === 'phone';
  const totalPages = Math.max(1, Math.ceil(totalRecords / rows));
  const current = Math.min(Math.max(page, 1), totalPages);
  const first = (current - 1) * rows;
  const shown = visiblePages(current, totalPages);

  // Each page link PrimeReact gives is kept or dropped; an ellipsis goes before a page that follows a gap
  const pageLink = (options: PaginatorPageLinksOptions) => {
    const number = options.page + 1;
    const index = shown.indexOf(number);
    if (index < 0) return null;
    const gap = index > 0 && shown[index - 1] !== number - 1;
    return (
      <Fragment>
        {gap && <span className="grg-pagination__gap" aria-hidden="true">…</span>}
        {options.element}
      </Fragment>
    );
  };

  const arrow = (name: 'direction-left' | 'direction-right' | 'direction-double-left' | 'direction-double-right') => <Icon name={name} size={20} />;
  const controls = totalPages > 1 && (
    <Paginator
      first={first}
      rows={rows}
      totalRecords={totalRecords}
      pageLinkSize={totalPages}
      onPageChange={event => onChange({ page: event.page + 1, rows: event.rows })}
      template={{
        layout: phone ? 'PrevPageLink PageLinks NextPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
        PageLinks: pageLink,
      }}
      firstPageLinkIcon={arrow('direction-double-left')}
      prevPageLinkIcon={arrow('direction-left')}
      nextPageLinkIcon={arrow('direction-right')}
      lastPageLinkIcon={arrow('direction-double-right')}
      pt={{
        root: { className: 'grg-pagination__controls' },
        pages: { className: 'grg-pagination__pages' },
        firstPageButton: { className: 'grg-pagination__arrow', 'aria-label': 'First page' },
        prevPageButton: { className: 'grg-pagination__arrow', 'aria-label': 'Previous page' },
        nextPageButton: { className: 'grg-pagination__arrow', 'aria-label': 'Next page' },
        lastPageButton: { className: 'grg-pagination__arrow', 'aria-label': 'Last page' },
        pageButton: ({ context }: { context: { active: boolean } }) => ({
          className: 'grg-pagination__cell',
          'aria-current': context.active ? 'page' : undefined,
        }),
      } as object}
    />
  );

  const last = Math.min(first + rows, totalRecords);
  const counter = type === 'group' && (
    <p className="grg-pagination__counter" aria-live="polite">
      {totalRecords ? `Showing ${(first + 1).toLocaleString()}–${last.toLocaleString()} of ${totalRecords.toLocaleString()}` : 'No results'}
    </p>
  );
  const sizes = type === 'group' && (
    <CompactSelect
      size="sm"
      aria-label="Rows per page"
      value={String(rows)}
      options={rowsOptions.map(option => ({ value: String(option), label: String(option) }))}
      // The first item on screen stays on screen: the page becomes the one that holds it
      onChange={value => onChange({ page: Math.floor(first / Number(value)) + 1, rows: Number(value) })}
      className="grg-pagination__size"
    />
  );

  // One page: no page controls (guidelines); the group keeps its counter and page size, so the size can change back
  if (!controls && type === 'default') return null;
  return (
    <nav className={`grg-pagination ${className}`} aria-label={label} data-type={type} data-phone={phone || undefined}>
      {counter}
      {controls}
      {sizes}
    </nav>
  );
}
