import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Search, type SearchProps } from './Search';
import { TransactionIcon, type TransactionType } from '../TransactionIcon/TransactionIcon';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/search/search-component.png';
import guidelinesFrame from '../../assets/design/search/search-guidelines.png';

const width = { width: 'calc(var(--space-5000) + var(--space-2000) + var(--space-1000))', maxWidth: '100%' } as const;

const meta = {
  title: 'Components/Search',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Search,
  // The docs page is Search.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { size: 'md', placeholder: 'Search', 'aria-label': 'Search', disabled: false, loading: false },
  argTypes: { size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] } },
  render: args => <div style={width}><Search {...args} /></div>,
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const transactions: [TransactionType, string, string][] = [
  ['deposit', 'Bitcoin deposit', '0.0042 BTC'],
  ['withdrawal', 'Ethereum withdrawal', '1.0005 ETH'],
  ['payment', 'Invoice #1042 paid', '250 USDT'],
  ['exchange', 'Bitcoin to Euro', '0.01 BTC → 590 EUR'],
  ['deposit', 'Tether deposit', '1,000 USDT'],
];

/** The list narrows as people type, after a short pause. Escape or × clears it and shows everything again. */
export const FilterTransactions: Story = {
  name: 'Filter transactions',
  render: function FilterTransactions() {
    const [query, setQuery] = useState('');
    const found = transactions.filter(([, title]) => title.toLowerCase().includes(query.toLowerCase()));
    return (
      <div style={{ ...width, display: 'grid', gap: 'var(--space-400)' }}>
        <Search aria-label="Search transactions" placeholder="Search transactions" onSearch={setQuery} />
        <p role="status" style={{ margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>
          {found.length ? `${found.length} of ${transactions.length} transactions` : `Nothing found for “${query}”`}
        </p>
        <ul style={{ display: 'grid', gap: 'var(--space-200)', margin: 0, padding: 0, listStyle: 'none', font: 'var(--typo-body-sm-regular)' }}>
          {found.map(([type, title, amount]) => (
            <li key={title} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)', color: 'var(--text-strong-1000)' }}>
              <TransactionIcon type={type} size="sm" />
              <span style={{ flex: 1 }}>{title}</span>
              <span style={{ color: 'var(--text-subtle-700)' }}>{amount}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('searchbox', { name: 'Search transactions' });
    await userEvent.type(field, 'bitcoin');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('2 of 5 transactions'));
    await userEvent.type(field, 'x');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Nothing found for “bitcoinx”'));
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('5 of 5 transactions');
  },
};

/** Results that take a moment: a small ring in place of × while they load. */
export const SearchingTheServer: Story = {
  name: 'Searching the server',
  render: function SearchingTheServer() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const search = (query: string) => {
      if (!query) return setResult('');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResult(`3 invoices match “${query}”`);
      }, 600);
    };
    return (
      <div style={{ ...width, display: 'grid', gap: 'var(--space-300)' }}>
        <Search aria-label="Search invoices" placeholder="Invoice number or customer" hint="Press Enter to search" searchDelay={0} loading={loading} onSearch={search} />
        <p role="status" style={{ margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-subtle-700)' }}>{result}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search invoices' }), 'Acme{Enter}');
    await expect(await canvas.findByRole('progressbar', { name: 'Searching' })).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('3 invoices match “Acme”'));
    await expect(canvas.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  },
};

/** Unavailable until there is something to search, with the reason in the hint. */
export const Unavailable: Story = {
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  args: { disabled: true, hint: 'Add your first transaction to search them', 'aria-label': 'Search transactions' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('searchbox')).toBeDisabled();
  },
};

/* ---- Overview ---- */

/** Figma Size, empty and with text (the clear button). Hover, typing and focus come from the pointer and the keyboard. */
export const Sizes: Story = {
  render: (args: SearchProps) => (
    <Showcase column>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Showcase key={size}>
          <Variant caption={`${size === 'lg' ? 'lg-44' : size === 'md' ? 'md-40' : 'sm-32'} · empty`}><div style={width}><Search {...args} size={size} aria-label={`${size} empty`} /></div></Variant>
          <Variant caption="with text"><div style={width}><Search {...args} size={size} defaultValue="Bitcoin" aria-label={`${size} filled`} /></div></Variant>
        </Showcase>
      ))}
    </Showcase>
  ),
};
