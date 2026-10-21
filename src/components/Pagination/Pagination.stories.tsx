import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination, visiblePages, type PaginationProps } from './Pagination';
import { TransactionIcon } from '../TransactionIcon/TransactionIcon';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/pagination/pagination-component.png';
import cellFrame from '../../assets/design/pagination/pagination-cell.png';
import guidelinesFrame from '../../assets/design/pagination/pagination-guidelines.png';

/** The pagination with its page kept, as a list would keep it */
function Demo(props: Omit<PaginationProps, 'onChange'>) {
  const [state, setState] = useState({ page: props.page, rows: props.rows });
  return <Pagination {...props} {...state} onChange={setState} />;
}

const meta = {
  title: 'Components/Pagination',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Pagination,
  // The docs page is Pagination.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Pagination', type: 'image', url: componentFrame },
      { name: 'Pagination cell', type: 'image', url: cellFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { totalRecords: 320, page: 2, rows: 20, type: 'default', layout: 'desktop', onChange: () => {} },
  argTypes: {
    type: { control: 'inline-radio', options: ['default', 'group'] },
    layout: { control: 'inline-radio', options: ['auto', 'desktop', 'phone'] },
  },
  render: args => <Demo {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const transactions = Array.from({ length: 87 }, (_, index) => ({
  id: index + 1,
  type: (['deposit', 'withdrawal', 'payment', 'exchange'] as const)[index % 4],
  amount: `${((index * 37) % 900 / 100 + 0.1).toFixed(4)} ETH`,
}));

/** Figma Pagination group under a table: the counter, the pages and the page size. Changing the size keeps the
 *  first row on screen. */
export const UnderATable: Story = {
  name: 'Under a table',
  render: function UnderATable() {
    const [{ page, rows }, setState] = useState({ page: 1, rows: 10 });
    const visible = transactions.slice((page - 1) * rows, page * rows);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)', width: 'calc(var(--space-5000) * 4)', maxWidth: '100%' }}>
        <ul style={{ display: 'grid', gap: 'var(--space-200)', margin: 0, padding: 0, listStyle: 'none', font: 'var(--typo-body-sm-regular)' }}>
          {visible.map(row => (
            <li key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)', color: 'var(--text-strong-1000)' }}>
              <TransactionIcon type={row.type} size="sm" />
              <span style={{ flex: 1, textTransform: 'capitalize' }}>{row.type} #{row.id}</span>
              <span style={{ color: 'var(--text-subtle-700)' }}>{row.amount}</span>
            </li>
          ))}
        </ul>
        <Pagination type="group" layout="desktop" totalRecords={transactions.length} page={page} rows={rows} onChange={setState} aria-label="Transactions pages" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Showing 1–10 of 87')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByText('Showing 11–20 of 87')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Last page' }));
    await expect(canvas.getByText('Showing 81–87 of 87')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

/** Figma Truncation: the first and the last page stay, the current page keeps its neighbours, "…" stands for the rest. */
export const MovingThroughPages: Story = {
  name: 'Moving through pages',
  args: { totalRecords: 320, page: 1, rows: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'First page' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: /^3$|Page 3/ }));
    await expect(canvas.getByRole('button', { name: /^4$|Page 4/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /3/, current: 'page' })).toBeInTheDocument();
  },
};

/** One page: the pages disappear (guidelines); the group keeps its counter and page size, so the size can change back. */
export const OnePage: Story = {
  name: 'One page',
  args: { totalRecords: 8, page: 1, rows: 20, type: 'group' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Next page' })).toBeNull();
    await expect(canvas.getByText('Showing 1–8 of 8')).toBeInTheDocument();
  },
};

/** Phones: no First and Last; the counter and the page size above the pages. */
export const OnAPhone: Story = {
  name: 'On a phone',
  args: { type: 'group', layout: 'phone', page: 5 },
  render: args => <div style={{ width: 343, maxWidth: '100%' }}><Demo {...args} /></div>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'First page' })).toBeNull();
  },
};

/* ---- Overview ---- */

/** Figma Truncation, page by page, out of 16. */
export const Truncation: Story = {
  render: args => (
    <Showcase column>
      {[1, 2, 3, 5, 14, 15, 16].map(page => (
        <Variant key={page} caption={`page ${page} · ${visiblePages(page, 16).join(' ')}`}>
          <Pagination {...args} totalRecords={320} rows={20} page={page} aria-label={`Pagination, page ${page}`} />
        </Variant>
      ))}
    </Showcase>
  ),
};

/** Figma Type: Default and Pagination group. */
export const Types: Story = {
  render: args => (
    <Showcase column>
      <Variant caption="default"><Pagination {...args} type="default" aria-label="Default" /></Variant>
      <Variant caption="pagination group"><Pagination {...args} type="group" aria-label="Group" /></Variant>
    </Showcase>
  ),
};
