import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccordionKeyValue, type AccordionKeyValueRow } from '../../components/Accordion/AccordionKeyValue';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Badge, type BadgeColor } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { Drawer } from '../../components/Drawer/Drawer';
import { Search } from '../../components/Search/Search';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { TextArea } from '../../components/TextArea/TextArea';
import { TransactionIcon, transactionColor, type TransactionType } from '../../components/TransactionIcon/TransactionIcon';
import { AppFrame, format, money, startAssets } from '../shared/AssetsApp';
import { Lead, LeadBox } from '../shared/lead';
import { PeriodPicker, pad, shift, startOf, type Range } from '../shared/period';
import cards from '../../assets/in-product/cards.png';

/* GRX Pay redesign, file "Tools", sections Transactions (1683:39530) and Transaction Details (1683:40743): the list
   with its filters, each transaction's details in a drawer (a page in Figma) and as a page, the comment on a
   withdrawal, and the empty page before verification. Test data only, around today's date. */

export type Status = 'Completed' | 'Processing' | 'Partially processed' | 'Suspended' | 'Arrested' | 'Cancelled' | 'Refunded';
/** The Figma status list; Refunded appears in the Figma table, so it is in the list too */
const STATUSES: Status[] = ['Completed', 'Processing', 'Partially processed', 'Suspended', 'Arrested', 'Cancelled', 'Refunded'];
const STATUS_COLOR: Record<Status, BadgeColor> = {
  Completed: 'success', Processing: 'warning', 'Partially processed': 'warning', Suspended: 'warning', Arrested: 'error', Cancelled: 'error', Refunded: 'neutral',
};
/** It didn't go through: the Transaction Icon turns red with a cross */
const failed = (status: Status) => status === 'Arrested' || status === 'Cancelled';

const KINDS: TransactionType[] = ['payment', 'withdrawal', 'deposit', 'exchange', 'cashback'];
const KIND_NAME: Record<TransactionType, string> = {
  payment: 'Invoice payment', withdrawal: 'Withdrawal', deposit: 'Deposit', exchange: 'Exchange', cashback: 'Referral cashback',
};

export type Transaction = {
  id: string; kind: TransactionType; status: Status; amount: number; code: string; createdAt: Date; completedAt: Date | null;
  network?: string; blockchainId?: string; fee: string; by?: string; comment?: string; invoiceId?: string; address?: string;
  risk?: string; tag?: string; to?: string; rate?: number; card?: string; expiry?: string; referral?: string;
};

const CURRENCIES = startAssets.map(a => ({ value: a.code, label: a.code, listLabel: a.code, coin: a.coin }));
const digits = (code: string) => startAssets.find(a => a.code === code)?.digits ?? 8;
const sum = (value: number, code: string) => `${digits(code) === 2 ? money(value) : format(value, digits(code))} ${code}`;
/** The amount, and for an exchange the currency it goes to, as in the Figma table */
const amountText = (t: Transaction) => (t.kind === 'exchange' ? `${sum(t.amount, t.code)} → ${t.to}` : sum(t.amount, t.code));
/** dd/mm/yy, hh:mm:ss in the table; dd/mm/yyyy, hh:mm:ss in the details (Figma) */
const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}, ${time(d)}`;
const long = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${time(d)}`;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000);
/** A repeatable test id in the shape of a UUID, and a blockchain hash */
const uuid = (seed: number) => {
  let value = seed * 7919 + 101;
  const hex = (len: number) => Array.from({ length: len }, () => { value = (value * 9301 + 49297) % 233280; return Math.floor((value / 233280) * 16).toString(16); }).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
};
const hash = (seed: number) => `0x${uuid(seed).replace(/-/g, '')}${uuid(seed + 50).replace(/-/g, '').slice(0, 32)}`;

const people = ['Evelyn DuBuque', 'Rudy Kozey'];
type Seed = Partial<Transaction> & Pick<Transaction, 'kind' | 'status' | 'amount' | 'code' | 'fee'> & { hours: number; open?: boolean };
const seeds: Seed[] = [
  { kind: 'payment', status: 'Completed', amount: 0.065769, code: 'ETH', hours: 1, network: 'Ethereum', fee: '0 ETH' },
  { kind: 'deposit', status: 'Refunded', amount: 2.2219778, code: 'ETH', hours: 3, network: 'Ethereum', fee: '0.0021 ETH', risk: '82%' },
  { kind: 'withdrawal', status: 'Cancelled', amount: 5000, code: 'EUR', hours: 5, fee: '2.50 EUR', card: '4242 **** 4242', expiry: '12/31',
    comment: 'Cancelled at the customer’s request: the card was replaced. A new withdrawal goes to the new card.' },
  { kind: 'withdrawal', status: 'Processing', amount: 1.0005, code: 'ETH', hours: 8, open: true, network: 'Ethereum', fee: '0.0005 ETH' },
  { kind: 'exchange', status: 'Processing', amount: 0.03856091, code: 'ETH', to: 'EUR', hours: 12, open: true, fee: '—' },
  { kind: 'payment', status: 'Completed', amount: 0.0412, code: 'BTC', hours: 20, network: 'Bitcoin', fee: '0 BTC' },
  { kind: 'deposit', status: 'Completed', amount: 1200, code: 'USDT', hours: 26, network: 'Tron (TRC-20)', fee: '1.00 USDT', risk: '0%', tag: '3967575702' },
  { kind: 'cashback', status: 'Completed', amount: 12.4, code: 'EUR', hours: 40, fee: '0.00 EUR', referral: 'Northwind Studio' },
  { kind: 'withdrawal', status: 'Completed', amount: 0.25, code: 'BTC', hours: 52, network: 'Bitcoin', fee: '0.0001 BTC', comment: 'Monthly payout to the cold wallet.' },
  { kind: 'payment', status: 'Completed', amount: 460, code: 'USDC', hours: 70, network: 'Ethereum', fee: '0 USDC' },
  { kind: 'withdrawal', status: 'Arrested', amount: 3.2, code: 'ETH', hours: 90, network: 'Ethereum', fee: '0.0005 ETH' },
  { kind: 'withdrawal', status: 'Suspended', amount: 800, code: 'USDT', hours: 120, open: true, network: 'Tron (TRC-20)', fee: '1.00 USDT' },
  { kind: 'exchange', status: 'Completed', amount: 1.5, code: 'ETH', to: 'EUR', rate: 1947.48, hours: 150, fee: '14.61 EUR' },
  { kind: 'withdrawal', status: 'Partially processed', amount: 2000, code: 'EUR', hours: 200, open: true, fee: '2.50 EUR', card: '5555 **** 4444', expiry: '08/29' },
  { kind: 'deposit', status: 'Completed', amount: 0.004, code: 'LTC', hours: 300, network: 'Litecoin', fee: '0.00001 LTC', risk: '0%' },
  { kind: 'payment', status: 'Completed', amount: 0.29464091, code: 'BTC', hours: 420, network: 'Bitcoin', fee: '0 BTC' },
];
export const startTransactions: Transaction[] = seeds.map(({ hours, open, ...seed }, index) => ({
  id: uuid(index + 1),
  createdAt: hoursAgo(hours + 0.2),
  completedAt: open ? null : hoursAgo(hours),
  blockchainId: seed.network ? hash(index + 1) : undefined,
  by: seed.kind === 'withdrawal' ? people[index % 2] : undefined,
  invoiceId: seed.kind === 'payment' || seed.kind === 'exchange' ? uuid(index + 200) : undefined,
  address: seed.kind === 'payment' || seed.kind === 'deposit' ? `${seed.code === 'BTC' ? 'bc1q' : seed.code === 'USDT' ? 'TQ' : '0x'}${uuid(index + 400).replace(/-/g, '').slice(0, 26)}` : undefined,
  ...seed,
}));

/* ---- A transaction's details ---- */

function CopyValue({ value, label }: { value: string; label: string }) {
  const { toast } = useMessages();
  return (
    <span className="grg-ip-copy grg-ip-copy--end">
      <span className="grg-ip-copy__text" title={value}>{value}</span>
      <ActionButton icon="copy" size="sm" aria-label={`Copy ${label}`}
        onClick={() => { void navigator.clipboard?.writeText(value).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
    </span>
  );
}

/** The comment on a withdrawal: written and edited in place (Figma opened a modal; a modal over a drawer breaks the rule) */
function Comment({ value, onSave }: { value?: string; onSave: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const head = useRef<HTMLSpanElement>(null);
  const wasEditing = useRef(false);
  // Back from the field, focus returns to the edit button
  useEffect(() => {
    if (wasEditing.current && !editing) head.current?.querySelector('button')?.focus();
    wasEditing.current = editing;
  }, [editing]);
  if (editing) {
    return (
      <div className="grg-ip-comment">
        <TextArea label="Comment" floatingLabel={false} maxLength={1000} counter autoFocus value={text} onChange={event => setText(event.target.value)} />
        <div className="grg-ip-comment__actions">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { onSave(text.trim()); setEditing(false); }}>Save</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="grg-ip-comment">
      <span className="grg-ip-comment__head" ref={head}>
        Comment
        <ActionButton icon="pencil" size="sm" aria-label={value ? 'Edit comment' : 'Add comment'} onClick={() => { setText(value ?? ''); setEditing(true); }} />
      </span>
      {value && <p className="grg-ip-comment__text">{value}</p>}
    </div>
  );
}

/** The rows of each kind, in the Figma groups */
function groups(t: Transaction): AccordionKeyValueRow[][] {
  const id = { key: 'Transaction ID', value: <CopyValue value={t.id} label="transaction ID" /> };
  const chain = { key: 'Blockchain ID', value: t.blockchainId ? <CopyValue value={t.blockchainId} label="blockchain ID" /> : '—' };
  const network = { key: 'Network', value: t.network ?? '—' };
  const fee = { key: 'Fee', value: t.fee };
  switch (t.kind) {
    case 'payment':
      return [[id, { key: 'Invoice ID', value: <CopyValue value={t.invoiceId!} label="invoice ID" /> }, chain, network,
        { key: 'One-time wallet address', value: <CopyValue value={t.address!} label="wallet address" /> }], [fee]];
    case 'deposit':
      return [[id, { key: 'Risk score', value: t.risk ?? '—' }, chain, network, { key: 'Deposit address', value: <CopyValue value={t.address!} label="deposit address" /> },
        ...(t.tag ? [{ key: 'Destination tag', value: <CopyValue value={t.tag} label="destination tag" /> }] : [])], [fee]];
    case 'withdrawal':
      // A card withdrawal (EUR) has no blockchain: one group with the card
      return t.card
        ? [[id, { key: 'Withdrew by', value: t.by! }, fee, { key: 'Card number', value: t.card }, { key: 'Expiry date', value: t.expiry! }]]
        : [[id, chain, network], [{ key: 'Withdrew by', value: t.by! }, fee]];
    case 'exchange': {
      const received = t.rate ? t.amount * t.rate : null;
      const charged = parseFloat(t.fee) || 0;
      return [[{ key: 'ID', value: <CopyValue value={t.id} label="exchange ID" /> }, { key: 'Invoice ID', value: <CopyValue value={t.invoiceId!} label="invoice ID" /> },
        { key: 'Pair', value: `${t.code}/${t.to}` }, { key: 'Amount to exchange', value: sum(t.amount, t.code) },
        { key: 'Exchange rate', value: t.rate ? `1 ${t.code} = ${money(t.rate)} ${t.to}` : '—' },
        { key: 'Exchange amount', value: received ? `${money(received)} ${t.to}` : '—' }, fee,
        { key: 'Total', value: received ? `${money(received - charged)} ${t.to}` : '—' }]];
    }
    case 'cashback':
      return [[id, { key: 'Referral', value: t.referral! }, { key: 'Credited to', value: `${t.code} balance` }], [fee]];
  }
}

function Details({ transaction: t, onComment }: { transaction: Transaction; onComment: (value: string) => void }) {
  const list = groups(t);
  return (
    <>
      <div className="grg-ip-figures__pair">
        <div className="grg-ip-box"><span className="grg-ip-link__key">Created at</span><span className="grg-ip-link__value">{long(t.createdAt)}</span></div>
        <div className="grg-ip-box">
          <span className="grg-ip-link__key">{failed(t.status) ? 'Cancelled at' : 'Completed at'}</span>
          <span className="grg-ip-link__value">{t.completedAt ? long(t.completedAt) : '—'}</span>
        </div>
      </div>
      {list.map((rows, index) => (
        <div key={index} className="grg-ip-box grg-ip-figures">
          <AccordionKeyValue rows={rows} />
          {/* A withdrawal takes a comment, at the end of its last group */}
          {t.kind === 'withdrawal' && index === list.length - 1 && <Comment value={t.comment} onSave={onComment} />}
        </div>
      ))}
    </>
  );
}

/** The transaction's lead: its kind's colour and icon (red with a cross when it failed), the amount and the status */
const leadOf = (t: Transaction) => ({
  tint: `var(--add-${transactionColor({ type: t.kind, failed: failed(t.status) })}-50)`,
  icon: <TransactionIcon type={t.kind} failed={failed(t.status)} size="lg" />,
  kind: KIND_NAME[t.kind],
  amount: amountText(t),
  sub: t.code !== 'EUR' && t.kind !== 'exchange' ? `≈ ${money(t.amount * (startAssets.find(a => a.code === t.code)?.rate ?? 1))} EUR` : undefined,
  badge: <Badge label={t.status} variant="stroke" size="sm" color={STATUS_COLOR[t.status]} leftIcon={null} rightIcon={null} />,
});

/* ---- The list ---- */

function TransactionsTable({ transactions, onOpen }: { transactions: Transaction[]; onOpen: (transaction: Transaction) => void }) {
  const { toast } = useMessages();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [status, setStatus] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [period, setPeriod] = useState<Range | null>(null);
  const filtered = query.trim() !== '' || kind !== 'all' || status !== 'all' || currency !== 'all' || period !== null;
  const reset = () => { setQuery(''); setKind('all'); setStatus('all'); setCurrency('all'); setPeriod(null); };
  const q = query.trim().toLowerCase();
  const rows = transactions.filter(t => (!q || t.id.includes(q) || !!t.blockchainId?.toLowerCase().includes(q))
    && (kind === 'all' || t.kind === kind)
    && (status === 'all' || t.status === status)
    && (currency === 'all' || t.code === currency || t.to === currency)
    && (!period || (t.createdAt >= startOf(period[0]) && t.createdAt < shift(period[1], 1))));
  const columns: TableColumn<Transaction>[] = [
    { id: 'type', header: 'Type', width: '22%', cell: row => (
      <TableText priority="leading" orientation="horizontal" title={KIND_NAME[row.kind]} leading={<TransactionIcon type={row.kind} failed={failed(row.status)} size="sm" />} />
    ) },
    { id: 'completed', header: 'Completed at', width: '18%', sortValue: row => row.completedAt?.getTime() ?? 0, cell: row => <TableText title={row.completedAt ? short(row.completedAt) : '—'} /> },
    { id: 'id', header: 'ID', width: '22%', cell: row => (
      <span className="grg-ip-copy">
        {/* Figma: the start of the ID; the copy button copies all of it */}
        <TableText title={`${row.id.slice(0, 13)}…`} />
        <ActionButton icon="copy" size="sm" aria-label={`Copy ID of ${KIND_NAME[row.kind]} ${row.id.slice(0, 8)}`}
          onClick={event => { event.stopPropagation(); void navigator.clipboard?.writeText(row.id).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
      </span>
    ) },
    { id: 'amount', header: 'Amount', width: '22%', cell: row => <TableText title={amountText(row)} /> },
    { id: 'status', header: 'Status', cell: row => <Badge label={row.status} variant="light" size="sm" color={STATUS_COLOR[row.status]} leftIcon={null} rightIcon={null} /> },
  ];
  return (
    <div className="grg-ip-surface__section">
      {/* The search, the filters right after it, and Reset once anything is chosen (as on Invoices) */}
      <div className="grg-ip-toolbar">
        <Search size="sm" aria-label="Search transactions by ID or blockchain ID" placeholder="ID, Blockchain ID" value={query} onChange={setQuery} className="grg-ip-toolbar__search" />
        <div className="grg-ip-toolbar__filters">
          <CompactSelect size="sm" aria-label="Type" value={kind} onChange={setKind}
            options={[{ value: 'all', label: 'All types' }, ...KINDS.map(k => ({ value: k, label: KIND_NAME[k] }))]} />
          <CompactSelect size="sm" aria-label="Status" value={status} onChange={setStatus}
            options={[{ value: 'all', label: 'All statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]} />
          <CompactSelect size="sm" aria-label="Currency" value={currency} onChange={setCurrency}
            options={[{ value: 'all', label: 'All currencies' }, ...CURRENCIES]} />
          <PeriodPicker value={period} onChange={setPeriod} />
          {filtered && <Button variant="text" size="sm" leftIcon="reload" onClick={reset}>Reset</Button>}
        </div>
      </div>
      <Table aria-label="Transactions" rows={rows} rowKey={row => row.id} rowLabel={row => `${KIND_NAME[row.kind]}, ${amountText(row)}, ${row.status}`}
        columns={columns} onRowOpen={onOpen}
        empty={{ title: 'No transactions match these filters', subtitle: 'Try another type, status, currency or period, or reset them' }} />
    </div>
  );
}

/* ---- The flow ---- */

export type TransactionsProps = {
  /** Before verification: no transactions yet (the Figma empty state) */
  account?: 'verified' | 'not-verified';
};

/** The Transactions page with its drawer, for any app that holds it (this page, the Dashboard) */
export function useTransactions({ account = 'verified' }: TransactionsProps = {}) {
  const [transactions, setTransactions] = useState(startTransactions);
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState<string | null>(null);
  const { toast } = useMessages();
  const find = (id: string | null) => transactions.find(t => t.id === id) ?? null;
  const comment = (id: string) => (value: string) => {
    setTransactions(list => list.map(t => (t.id === id ? { ...t, comment: value || undefined } : t)));
    toast({ status: 'success', title: value ? 'Comment saved' : 'Comment removed', duration: 3000 });
  };
  const close = () => setOpen(null);
  const current = find(open);
  const shown = find(page);

  let content: ReactNode;
  if (account !== 'verified') {
    content = (
      <main className="grg-ip-page">
        <h1 className="grg-ip-page__title">Transactions</h1>
        <div className="grg-ip-surface grg-ip-waiting">
          <img className="grg-ip-waiting__image" src={cards} alt="" />
          <h2 className="grg-ip-waiting__title">You don’t have any transactions yet</h2>
          <p className="grg-ip-waiting__text">Transactions list will be available after successful verification</p>
          <Button variant="primary" size="lg" rightIcon="arrow-right">Verify business to get started</Button>
        </div>
      </main>
    );
  } else if (shown) {
    const { tint, ...lead } = leadOf(shown);
    content = (
      <main className="grg-ip-page">
        <div className="grg-ip-page__head">
          <span className="grg-ip-page__back">
            <ActionButton icon="arrow-left" aria-label="Back to transactions" onClick={() => setPage(null)} />
            <h1 className="grg-ip-page__title">Transaction details</h1>
          </span>
        </div>
        <div className="grg-ip-transaction-page">
          <section className="grg-ip-card" aria-label={`${lead.kind}, ${lead.amount}`}>
            <LeadBox tint={tint} {...lead} />
            <Details transaction={shown} onComment={comment(shown.id)} />
          </section>
        </div>
      </main>
    );
  } else {
    content = (
      <main className="grg-ip-page">
        <h1 className="grg-ip-page__title">Transactions</h1>
        <div className="grg-ip-surface">
          <TransactionsTable transactions={transactions} onOpen={t => setOpen(t.id)} />
        </div>
      </main>
    );
  }

  const lead = current ? leadOf(current) : null;
  return {
    content,
    overlays: (
      <Drawer appendTo="self" visible={!!current} onHide={close} title="Transaction details" size="md"
        tint={lead?.tint} lead={lead ? <Lead icon={lead.icon} kind={lead.kind} amount={lead.amount} sub={lead.sub} badge={lead.badge} /> : undefined}
        primaryAction={current ? { label: 'Open as a page', onClick: () => { setPage(current.id); close(); } } : undefined}>
        {current && <Details transaction={current} onComment={comment(current.id)} />}
      </Drawer>
    ),
  };
}

function TransactionsApp(props: TransactionsProps) {
  const transactions = useTransactions(props);
  return <><AppFrame current="transactions">{transactions.content}</AppFrame>{transactions.overlays}</>;
}

/** The Transactions page, a transaction's details in a drawer and as a page, the comment: one working flow */
export function TransactionsFlow(props: TransactionsProps) {
  return <MessagesProvider appendTo="self"><TransactionsApp {...props} /></MessagesProvider>;
}
