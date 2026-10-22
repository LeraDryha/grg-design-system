import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Table, TableText, type TableColumn } from './Table';
import { ActionButton } from '../ActionButton/ActionButton';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { CoinIcon } from '../CoinIcon/CoinIcon';
import { Link } from '../Link/Link';
import { Pagination } from '../Pagination/Pagination';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { SegmentControl } from '../SegmentControl/SegmentControl';
import { Switch } from '../Switch/Switch';
import { TransactionIcon } from '../TransactionIcon/TransactionIcon';
import rowFrame from '../../assets/design/table/table-row-cell.png';
import headerFrame from '../../assets/design/table/table-header-cell.png';
import textFrame from '../../assets/design/table/cell-text.png';
import scrollFrame from '../../assets/design/table/table-scroll-indicator.png';
import guidelinesFrame from '../../assets/design/table/table-guidelines.png';
import combiningFrame from '../../assets/design/table/table-combining.png';

/* ---- Assets (Figma example) ---- */
type Asset = { id: string; name: string; code: string; coin: 'ethereum-eth' | 'bitcoin-btc' | 'usd-coin-usdc' | 'tether-usdt'; amount: number; eur: number };
const assets: Asset[] = [
  { id: 'eth', name: 'Ethereum', code: 'ETH', coin: 'ethereum-eth', amount: 32223.78997582, eur: 62851873.23 },
  { id: 'btc', name: 'Bitcoin', code: 'BTC', coin: 'bitcoin-btc', amount: 78.91994642, eur: 4895016.18 },
  { id: 'usdt', name: 'Tether', code: 'USDT', coin: 'tether-usdt', amount: 940397.78, eur: 940397.78 },
  { id: 'usdc', name: 'USD Coin', code: 'USDC', coin: 'usd-coin-usdc', amount: 2381.947382, eur: 2060.17 },
];
const number = (value: number, digits = 8) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });
const assetColumns: TableColumn<Asset>[] = [
  {
    id: 'asset', header: 'Asset', sortValue: row => row.name,
    cell: row => <TableText priority="leading" orientation="horizontal" title={row.name} description={row.code} leading={<CoinIcon name={row.coin} size={24} />} />,
  },
  { id: 'amount', header: 'Amount', sortValue: row => row.amount, cell: row => <TableText title={number(row.amount)} /> },
  { id: 'eur', header: 'Equivalent amount', sortValue: row => row.eur, info: 'At today’s rate', cell: row => <TableText title={`${number(row.eur, 2)} EUR`} /> },
];

/* ---- Orders (Figma example) ---- */
type Order = { id: string; date: string; pair: string; side: 'Buy' | 'Sell'; quantity: string; price: number; execution: number; status: 'open' | 'completed' | 'declined' };
const orders: Order[] = Array.from({ length: 23 }, (_, index) => ({
  id: `order-${index + 1}`,
  date: `12/07/26, 22:${String(28 + (index % 30)).padStart(2, '0')}:07`,
  pair: index % 3 === 2 ? 'BTC / UAH' : 'WAVES / UAH',
  side: index % 3 === 2 ? 'Buy' : 'Sell',
  quantity: index % 3 === 2 ? '0.00650 BTC' : '3 WAVES',
  price: index % 3 === 2 ? 1645618.73 : 250 + index,
  execution: index % 5 === 0 ? 100 : index === 1 ? 46 : 0,
  status: index % 5 === 0 ? 'completed' : index % 7 === 0 ? 'declined' : 'open',
}));

const meta = {
  title: 'Components/Table',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Table,
  // The docs page is Table.mdx
  parameters: {
    layout: 'padded',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Table row cell', type: 'image', url: rowFrame },
      { name: 'Table header cell', type: 'image', url: headerFrame },
      { name: 'Cell text', type: 'image', url: textFrame },
      { name: 'Table scroll indicator', type: 'image', url: scrollFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Combining items', type: 'image', url: combiningFrame },
    ],
  },
  args: { rows: assets as never[], columns: assetColumns as never[], rowKey: (row: Asset) => row.id, 'aria-label': 'Assets', size: 'md', loading: false } as never,
  argTypes: { rows: { control: false }, columns: { control: false } },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** The Figma Assets example: a coin, sortable amounts, and Convert / Deposit / Withdraw on the right. */
export const Assets: Story = {
  render: () => (
    <Table
      aria-label="Assets"
      rows={assets}
      rowKey={row => row.id}
      rowLabel={row => row.name}
      columns={assetColumns}
      actions={row => (
        <>
          <Button variant="text" size="xs">Convert</Button>
          <Button variant="text" size="xs" disabled={row.id === 'usdt'}>Deposit</Button>
          <Button variant="text" size="xs">Withdraw</Button>
        </>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amount = canvas.getByRole('columnheader', { name: /Amount/ });
    await userEvent.click(amount);
    await expect(amount).toHaveAttribute('aria-sort', 'ascending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Bitcoin');
    await userEvent.click(amount);
    await expect(amount).toHaveAttribute('aria-sort', 'descending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Tether');
    await userEvent.click(amount);
    await expect(amount).toHaveAttribute('aria-sort', 'none');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Ethereum');
  },
};

/** The Figma Orders example: a filter, statuses, the execution, rows that open their details, and pagination. */
export const Orders: Story = {
  // Known Figma contrast: Segment Control's unselected labels are 4.3:1 (see Segment Control)
  parameters: { a11y: { test: 'todo' } },
  render: function Orders() {
    const [status, setStatus] = useState('open');
    const [{ page, rows }, setPaging] = useState({ page: 1, rows: 10 });
    const [opened, setOpened] = useState('');
    const filtered = orders.filter(order => status === 'all' || order.status === status);
    const visible = filtered.slice((page - 1) * rows, page * rows);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)' }}>
        <SegmentControl aria-label="Orders" value={status} onChange={value => { setStatus(value); setPaging(state => ({ ...state, page: 1 })); }}
          segments={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Opened' }, { value: 'completed', label: 'Completed' }, { value: 'declined', label: 'Declined' }]} />
        <Table
          aria-label="Orders"
          rows={visible}
          rowKey={row => row.id}
          rowLabel={row => `${row.pair}, ${row.date}`}
          onRowOpen={row => setOpened(row.id)}
          columns={[
            { id: 'date', header: 'Date', sortValue: row => row.date, cell: row => <TableText priority="passive" title={row.date} /> },
            { id: 'pair', header: 'Pair', sortValue: row => row.pair, cell: row => <TableText priority="leading" title={row.pair} /> },
            { id: 'type', header: 'Type', cell: row => <Badge variant="light" size="sm" color={row.side === 'Buy' ? 'success' : 'error'} label={row.side} leftIcon={row.side === 'Buy' ? 'plus' : 'minus'} rightIcon={null} /> },
            { id: 'quantity', header: 'Quantity', cell: row => <TableText title={row.quantity} /> },
            { id: 'price', header: 'Price', sortValue: row => row.price, cell: row => <TableText title={`${number(row.price, 2)} UAH`} /> },
            { id: 'execution', header: 'Execution', cell: row => <div style={{ width: 'var(--space-2400)' }}><ProgressBar value={row.execution} aria-label={`Executed, ${row.pair}`} /></div> },
          ]}
        />
        <Pagination type="group" layout="desktop" totalRecords={filtered.length} page={page} rows={rows} onChange={setPaging} aria-label="Orders pages" />
        <p role="status" style={{ margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>{opened && `Opened ${opened}`}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getAllByRole('row')[1];
    await userEvent.click(within(firstRow).getByText('WAVES / UAH'));
    await expect(canvas.getByRole('status')).toHaveTextContent(/Opened order-/);
    await userEvent.click(canvas.getByRole('radio', { name: 'Completed' }));
    await expect(canvas.getAllByRole('row').length).toBeGreaterThan(1);
  },
};

type Member = { id: string; name: string; email: string; role: string; active: boolean };
const members: Member[] = [
  { id: 'm1', name: 'Rudy Kozey', email: 'rudy.kozey@northwind.io', role: 'Admin', active: true },
  { id: 'm2', name: 'Shelia Nicolas', email: 'shelia@northwind.io', role: 'Finance', active: true },
  { id: 'm3', name: 'Holly O’Kon', email: 'holly.okon.long.address@northwind-trading-company.io', role: 'Viewer', active: false },
];

/** Figma Checkbox: select rows, and all of them from the header; a switch in a row acts on its own. */
export const SelectRows: Story = {
  name: 'Select rows',
  render: function SelectRows() {
    const [selected, setSelected] = useState<string[]>([]);
    const [active, setActive] = useState<Record<string, boolean>>(Object.fromEntries(members.map(member => [member.id, member.active])));
    return (
      <div style={{ display: 'grid', gap: 'var(--space-300)' }}>
        <p style={{ margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-subtle-700)' }}>{selected.length} selected</p>
        <Table
          aria-label="Members"
          size="lg"
          rows={members}
          rowKey={row => row.id}
          rowLabel={row => row.name}
          selected={selected}
          onSelectionChange={setSelected}
          columns={[
            { id: 'name', header: 'Member', sortValue: row => row.name, cell: row => <TableText priority="leading" title={row.name} description={row.email} /> },
            { id: 'role', header: 'Role', cell: row => <TableText title={row.role} /> },
            { id: 'active', header: 'Active', cell: row => <Switch size="sm" aria-label={`Active, ${row.name}`} checked={active[row.id]} onChange={on => setActive(state => ({ ...state, [row.id]: on }))} /> },
          ]}
          actions={row => (
            <>
              <ActionButton icon="edit" size="sm" aria-label={`Edit ${row.name}`} />
              <ActionButton icon="trash" size="sm" color="red" aria-label={`Remove ${row.name}`} />
            </>
          )}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Shelia Nicolas' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select all rows' })).toBePartiallyChecked();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(canvas.getByText('3 selected')).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'Select Rudy Kozey' })).toBeChecked();
    const active = canvas.getByRole('switch', { name: 'Active, Holly O’Kon' });
    await userEvent.click(active);
    await expect(active).toBeChecked();
  },
};

type Merchant = { id: string; ref: string; merchant: string; name: string; code: string; email: string; country: string; account: string; created: string };
const merchants: Merchant[] = Array.from({ length: 6 }, (_, index) => ({
  id: `r${index}`,
  ref: `45936977-ef83-55${index}7-a127-e10${index}`,
  merchant: ['Crypto Proxy', 'Test', 'GRG Shop', 'Crypto Proxy', 'Test', 'Crypto Proxy'][index],
  name: ['Rudy Kozey', 'Shelia Nicolas', 'Holly O’Kon', 'Jeannette Medhurst', 'Jo Murazik', 'Tonya O’Conner'][index],
  code: 'N/A', email: 'N/A', country: 'N/A', account: 'No', created: '2026-03-29 16:37:02',
}));

/** Wider than its place: the selection and the first column stay on the left, the actions on the right, with
 *  shadows; the arrows show and scroll what is hidden. */
export const WideTable: Story = {
  name: 'Wide table',
  render: function WideTable() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div style={{ maxWidth: 'calc(var(--space-5000) * 3)' }}>
        <Table
          aria-label="Merchants"
          rows={merchants}
          rowKey={row => row.id}
          rowLabel={row => row.ref}
          selected={selected}
          onSelectionChange={setSelected}
          columns={[
            { id: 'ref', header: 'ID', cell: row => <Link href={`#${row.id}`} color="blue" size="sm">{row.ref.slice(0, 13)}…</Link> },
            { id: 'merchant', header: 'Merchant', cell: row => <TableText title={row.merchant} /> },
            { id: 'name', header: 'Name', cell: row => <TableText title={row.name} /> },
            { id: 'code', header: 'Code', cell: row => <TableText title={row.code} /> },
            { id: 'email', header: 'Email', cell: row => <TableText title={row.email} /> },
            { id: 'country', header: 'Country', cell: row => <TableText title={row.country} /> },
            { id: 'account', header: 'Has account', cell: row => <TableText title={row.account} /> },
            { id: 'created', header: 'Created at', cell: row => <TableText priority="passive" title={row.created} /> },
          ]}
          actions={row => <ActionButton icon="edit" size="sm" aria-label={`Edit ${row.ref}`} />}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const right = canvasElement.querySelector<HTMLButtonElement>('.grg-table__scroll[data-side="end"]');
    await waitFor(() => expect(right).not.toHaveAttribute('hidden'));
    right?.click();
    await waitFor(() => expect(canvasElement.querySelector('.grg-table')).toHaveAttribute('data-scroll-left'));
    await expect(canvas.getByRole('region', { name: 'Merchants, scrollable' })).toBeInTheDocument();
  },
};

/** Figma Empty: nothing matches. */
export const Empty: Story = {
  render: () => <Table aria-label="Merchants" rows={[] as Merchant[]} rowKey={row => row.id} columns={[{ id: 'ref', header: 'ID', cell: () => null }, { id: 'merchant', header: 'Merchant', cell: () => null }, { id: 'type', header: 'Type', cell: () => null }]} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No results found')).toBeInTheDocument();
  },
};

/** Rows on their way (not in Figma): PrimeReact Skeleton in the system colours. */
export const Loading: Story = {
  render: () => <Table aria-label="Assets" loading rows={[] as Asset[]} rowKey={row => row.id} columns={assetColumns} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
  },
};

/** A long text ends with "…" and shows in full in a tooltip. */
export const LongText: Story = {
  name: 'Long text',
  render: () => (
    <Table aria-label="Transactions" rows={[{ id: 't', note: 'Payout to the merchant wallet for the invoices of the whole of March, batch 3 of 4' }]} rowKey={row => row.id}
      columns={[
        { id: 'type', header: 'Type', cell: () => <TableText priority="leading" title="Withdrawal" leading={<TransactionIcon type="withdrawal" size="sm" />} /> },
        { id: 'note', header: 'Note', cell: row => <TableText title={row.note} /> },
      ]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText(/Payout to the merchant/));
    await expect(await within(document.body).findByRole('tooltip', { hidden: true })).toHaveTextContent(/batch 3 of 4/);
  },
};

/** Only to read: no row opens, no chevron; nothing changes on press. */
export const ViewOnly: Story = {
  name: 'View only',
  render: () => <Table aria-label="Assets" rows={assets} rowKey={row => row.id} columns={assetColumns} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /^Open/ })).toBeNull();
    await expect(canvasElement.querySelector('[data-opens]')).toBeNull();
  },
};

/** Each row has its own page: the row and its chevron are a link (`rowHref`), so it opens in a new tab too. */
export const RowPages: Story = {
  name: 'Row pages',
  render: () => <Table aria-label="Merchants" rows={merchants.slice(0, 3)} rowKey={row => row.id} rowLabel={row => row.name} rowHref={row => `#merchant-${row.id}`}
    columns={[
      { id: 'name', header: 'Name', cell: row => <TableText priority="leading" title={row.name} description={row.merchant} /> },
      { id: 'created', header: 'Created at', cell: row => <TableText priority="passive" title={row.created} /> },
    ]} size="lg" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Open Rudy Kozey' })).toHaveAttribute('href', '#merchant-r0');
  },
};

/** With a height: the table scrolls inside it and the header stays at the top. */
export const StickyHeader: Story = {
  name: 'Sticky header',
  render: () => (
    <Table aria-label="Orders" maxHeight="calc(var(--space-5000) + var(--space-2000))" rows={orders} rowKey={row => row.id}
      columns={[
        { id: 'date', header: 'Date', cell: row => <TableText priority="passive" title={row.date} /> },
        { id: 'pair', header: 'Pair', cell: row => <TableText priority="leading" title={row.pair} /> },
        { id: 'price', header: 'Price', sortValue: row => row.price, cell: row => <TableText title={`${number(row.price, 2)} UAH`} /> },
      ]} />
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.grg-table')).toHaveAttribute('data-sticky-header');
  },
};

/* ---- Overview ---- */

type Kind = { id: string };
/** Figma Table row cell · Type: what a cell can hold. Every cell is a system component. */
export const CellTypes: Story = {
  name: 'Cell types',
  render: () => (
    <Table<Kind> aria-label="Cell types" size="lg" rows={[{ id: 'a' }]} rowKey={row => row.id}
      columns={[
        { id: 'text', header: 'Text', cell: () => <TableText priority="leading" title="Rudy Kozey" description="Admin" /> },
        { id: 'badge', header: 'Text + badge', cell: () => <TableText title="Invoice 1042" badge={{ label: 'New', color: 'info' }} /> },
        { id: 'icon', header: 'Transaction', cell: () => <TableText title="Deposit" description="12/07/26" leading={<TransactionIcon type="deposit" size="sm" />} /> },
        { id: 'coin', header: 'Coin', cell: () => <TableText orientation="horizontal" title="Bitcoin" description="BTC" leading={<CoinIcon name="bitcoin-btc" size={24} />} /> },
        { id: 'status', header: 'Status', cell: () => <Badge variant="light" size="sm" color="success" label="Completed" leftIcon={null} rightIcon={null} /> },
        { id: 'progress', header: 'Progress', cell: () => <div style={{ width: 'var(--space-2400)' }}><ProgressBar value={46} aria-label="Executed" /></div> },
        { id: 'switch', header: 'Switch', cell: () => <Switch size="sm" aria-label="Active" defaultChecked /> },
        { id: 'link', header: 'Link', cell: () => <Link href="#a" color="blue" size="sm">45936977-ef83</Link> },
      ]}
      actions={() => <ActionButton icon="edit" size="sm" aria-label="Edit" />}
    />
  ),
};
