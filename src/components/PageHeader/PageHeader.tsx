import type { ReactNode } from 'react';
import { ActionButton } from '../ActionButton/ActionButton';
import './PageHeader.css';

export type PageHeaderProps = {
  /** The page's name: its only h1 */
  title: string;
  /** A page opened from a list (a transaction, an invoice): the arrow back to it, named for screen readers */
  back?: { label: string; onClick: () => void };
  /** Up to two buttons at the end: the main one last (Button md) */
  actions?: ReactNode;
  className?: string;
};

/**
 * The top of a page: its title, an arrow back when it was opened from a list, and its buttons at the end. One height
 * with buttons or without, so moving between pages nothing jumps. Tabs (Tab Menu) go right under it. Plain markup:
 * PrimeReact Toolbar would announce a toolbar and ask for the arrow keys, and this is a heading with buttons.
 */
export function PageHeader({ title, back, actions, className = '' }: PageHeaderProps) {
  return (
    <header className={`grg-page-header ${className}`}>
      <span className="grg-page-header__title-row">
        {back && <ActionButton icon="arrow-left" aria-label={back.label} onClick={back.onClick} />}
        <h1 className="grg-page-header__title">{title}</h1>
      </span>
      {actions && <span className="grg-page-header__actions">{actions}</span>}
    </header>
  );
}
