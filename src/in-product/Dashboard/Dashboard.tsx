import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Badge, type BadgeColor } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import { FeaturedIcon, type FeaturedIconType } from '../../components/FeaturedIcon/FeaturedIcon';
import { Link } from '../../components/Link/Link';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Modal } from '../../components/Modal/Modal';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { TransactionIcon, type TransactionType } from '../../components/TransactionIcon/TransactionIcon';
import type { IconName } from '../../components/Icon/Icon';
import { AppFrame, AssetsPage, format, money, startAssets, type Asset, type AppPage } from '../shared/AssetsApp';
import { useConvert } from '../Convert/Convert';
import { useWithdrawEth } from '../WithdrawEth/WithdrawEth';
import keyImage from '../../assets/in-product/key.png';
import documentsImage from '../../assets/in-product/documents-warning.png';

/* GRX Pay redesign, section Dashboard - Verified: the balance and its shares, the successful payments over a period,
   the last transactions; a new account's empty dashboard, the notes on top and the verification modal.
   Test data only. "Today" is fixed (Thursday 23 April 2026, 14:00), so the charts and the tests stay the same. */

const TODAY = { year: 2026, month: 3, day: 23, hour: 14 };

/* ---- Successful payments ---- */

export type Period = 'today' | 'week' | 'month' | 'last-30' | 'last-month';
const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'last-month', label: 'Last month' },
];

/** One point of the chart: its label on the axis, the date for the tooltip, the paid sum and the count; null is still to come */
type Point = { label: string; date: string; amount: number | null; count: number };

/** Repeatable test numbers: the same payments on every visit */
const seeded = (seed: number) => {
  let value = seed;
  return () => { value = (value * 9301 + 49297) % 233280; return value / 233280; };
};
const pad = (n: number) => String(n).padStart(2, '0');
const date = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const day = (offset: number) => new Date(TODAY.year, TODAY.month, TODAY.day + offset);

function points(period: Period, empty: boolean): Point[] {
  const random = seeded({ today: 3, week: 7, month: 11, 'last-30': 13, 'last-month': 17 }[period]);
  const sum = (scale: number) => {
    if (empty) return { amount: 0, count: 0 };
    // Mostly a few payments a day, now and then none: a calm line with a few peaks
    const quiet = random() < 0.12;
    const count = quiet ? 0 : 1 + Math.floor(random() * random() * 5);
    return { amount: quiet ? 0 : +(count * (scale * 0.6 + random() * scale * 0.4)).toFixed(2), count };
  };
  if (period === 'today') {
    return Array.from({ length: 24 }, (_, hour) => {
      const now = hour <= TODAY.hour;
      const paid = sum(180);
      return { label: String(hour), date: `${date(day(0))}, ${pad(hour)}:00`, amount: now ? paid.amount : null, count: now ? paid.count : 0 };
    });
  }
  const days = period === 'week' ? Array.from({ length: 7 }, (_, i) => day(i - day(0).getDay() + 1))
    : period === 'month' ? Array.from({ length: 30 }, (_, i) => new Date(TODAY.year, TODAY.month, i + 1))
    : period === 'last-30' ? Array.from({ length: 30 }, (_, i) => day(i - 29))
    : Array.from({ length: 31 }, (_, i) => new Date(TODAY.year, TODAY.month - 1, i + 1));
  return days.map(d => {
    const now = d <= day(0);
    const paid = sum(period === 'week' ? 900 : 600);
    const label = period === 'week' ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : String(d.getDate());
    return { label, date: date(d), amount: now ? paid.amount : null, count: now ? paid.count : 0 };
  });
}

/** The point for now: the current hour or day, or the last one of a past period */
const nowIndex = (list: Point[]) => list.reduce((last, point, index) => (point.amount === null ? last : index), 0);

function PaymentsChart({ list, period }: { list: Point[]; period: Period }) {
  const [active, setActive] = useState<number | null>(null);
  const now = nowIndex(list);
  const shown = active ?? now;
  const max = Math.max(...list.map(point => point.amount ?? 0), 1);
  // Up to 85% of the height, so the highest point has room under the top
  const y = (amount: number) => 100 - (amount / max) * 85;
  const line = list.flatMap((point, index) => (point.amount === null ? [] : [`${index + 0.5},${y(point.amount)}`])).join(' ');
  const position = (index: number) => `${((index + 0.5) / list.length) * 100}%`;
  const label = (point: Point) => `${point.date}: ${money(point.amount ?? 0)} EUR, ${point.count} ${point.count === 1 ? 'transaction' : 'transactions'}`;
  const period_ = PERIODS.find(item => item.value === period)?.label ?? '';

  // One Tab stop; the arrow keys move through the points (a roving tab index)
  // On the plot, not the buttons: Tooltip takes over its control's own key handler
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = Number((event.target as HTMLElement).dataset.point);
    if (Number.isNaN(index)) return;
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1
      : event.key === 'Home' ? 0 : event.key === 'End' ? now : null;
    if (next === null) return;
    event.preventDefault();
    const target = Math.max(0, Math.min(now, next));
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-point="${target}"]`)?.focus();
  };

  return (
    <div className="grg-ip-chart" role="group" aria-label={`Successful payments, ${period_}`} onMouseLeave={() => setActive(null)}>
      <div className="grg-ip-chart__plot" onKeyDown={move}>
        <span className="grg-ip-chart__grid" aria-hidden="true" />
        <span className="grg-ip-chart__now" style={{ left: position(shown) }} aria-hidden="true" />
        <svg className="grg-ip-chart__line" viewBox={`0 0 ${list.length} 100`} preserveAspectRatio="none" aria-hidden="true">
          <polyline points={line} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="grg-ip-chart__marker" style={{ left: position(shown), top: `${y(list[shown].amount ?? 0)}%` }} aria-hidden="true" />
        {list.map((point, index) => point.amount === null ? null : (
          // From the point down to the axis: the tooltip opens beside the point, as in Figma
          <Tooltip key={`${period}-${index}`} title={`${money(point.amount)} EUR`}
            description={`${point.count} ${point.count === 1 ? 'transaction' : 'transactions'} · ${point.date}`}
            color="white" side="right" align="start" purpose="repeat">
            <button type="button" className="grg-ip-chart__point" data-point={index} aria-label={label(point)}
              tabIndex={index === now ? 0 : -1}
              style={{ left: `${(index / list.length) * 100}%`, width: `${100 / list.length}%`, top: `${y(point.amount)}%` }}
              onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onBlur={() => setActive(null)}
            />
          </Tooltip>
        ))}
      </div>
      <div className="grg-ip-chart__axis" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }}>
        {list.map((point, index) => <span key={index} data-now={index === now || undefined}>{point.label}</span>)}
      </div>
    </div>
  );
}

const SUMMARY: { key: 'paid' | 'pending' | 'timeout'; label: string; type: FeaturedIconType; icon: IconName }[] = [
  { key: 'paid', label: 'Paid', type: 'success', icon: 'check-circle-filled' },
  { key: 'pending', label: 'Pending', type: 'warning', icon: 'clock-circle-filled' },
  { key: 'timeout', label: 'Timeout', type: 'error', icon: 'clock-circle-filled' },
];

function PaymentsCard({ empty }: { empty: boolean }) {
  const [period, setPeriod] = useState<Period>('month');
  const list = useMemo(() => points(period, empty), [period, empty]);
  const paid = list.reduce((sum, point) => sum + (point.amount ?? 0), 0);
  // Test data: what is still waiting and what timed out are small shares of the paid sum
  const totals = { paid, pending: empty ? 0 : +(paid * 0.04).toFixed(2), timeout: empty ? 0 : +(paid * 0.02).toFixed(2) };
  return (
    <section className="grg-ip-card grg-ip-card--payments" aria-labelledby="payments-title">
      <div className="grg-ip-card__head">
        <div>
          <h2 id="payments-title" className="grg-ip-card__title">Successful payments</h2>
          <p className="grg-ip-card__value">{money(paid)} EUR</p>
        </div>
        <div className="grg-ip-card__tools">
          <CompactSelect size="sm" aria-label="Period" options={PERIODS} value={period} onChange={value => setPeriod(value as Period)} />
          {/* No invoices page in this demo: the button and View all stay, as in Figma, without a destination */}
          <Button variant="primary" size="sm" leftIcon="plus">Create new invoice</Button>
          <Link size="sm" color="black">View all</Link>
        </div>
      </div>
      <PaymentsChart list={list} period={period} />
      <ul className="grg-ip-summary">
        {SUMMARY.map(item => (
          <li key={item.key}>
            <FeaturedIcon size="sm" type={empty ? 'neutral' : item.type} icon={item.icon} />
            <span>
              <span className="grg-ip-summary__key">{item.label}</span>
              <span className="grg-ip-summary__value">{money(totals[item.key])} EUR</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Total balance ---- */

/** ← → (Home, End) move focus along a row of buttons marked data-part, one Tab stop for the whole row */
const moveAlong = (event: KeyboardEvent<HTMLDivElement>) => {
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-part]'));
  const index = buttons.indexOf(event.target as HTMLButtonElement);
  const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
  if (index < 0 || next === null) return;
  event.preventDefault();
  const target = buttons[Math.max(0, Math.min(buttons.length - 1, next))];
  buttons.forEach(button => { button.tabIndex = button === target ? 0 : -1; });
  target.focus();
};

const SHARE_COLORS = ['var(--success-base-600)', 'var(--warning-base-600)', 'var(--info-base-600)'];
const share = (part: number, total: number) => {
  const value = (part / total) * 100;
  return value > 0 && value < 0.1 ? '<0.1%' : `${value.toFixed(1).replace(/\.0$/, '')}%`;
};

function BalanceCard({ assets, onAction, onViewAll }: {
  assets: Asset[];
  onAction: { convert: (asset: Asset) => void; withdraw: (asset: Asset) => void };
  onViewAll: () => void;
}) {
  const value = (asset: Asset) => asset.amount * asset.rate;
  const total = assets.reduce((sum, asset) => sum + value(asset), 0);
  // Figma: four assets, the largest first; the bar colours the three largest, the rest grey
  const sorted = [...assets].filter(asset => value(asset) > 0).sort((a, b) => value(b) - value(a));
  const rows = sorted.slice(0, 4);
  const rest = sorted.slice(SHARE_COLORS.length);
  const restValue = rest.reduce((sum, asset) => sum + value(asset), 0);
  const parts = [
    ...sorted.slice(0, SHARE_COLORS.length).map((asset, index) => ({
      id: asset.id, name: asset.name, coin: asset.coin, value: value(asset), color: SHARE_COLORS[index],
      rows: [{ key: 'Amount:', value: `${money(value(asset))} EUR` }, { key: 'Balance:', value: `${format(asset.amount, asset.digits)} ${asset.code}` }],
    })),
    ...(restValue > 0 ? [{
      id: 'rest', name: 'Other assets', coin: undefined, value: restValue, color: 'var(--bg-soft-200)',
      rows: [{ key: 'Amount:', value: `${money(restValue)} EUR` }, { key: 'Assets:', value: rest.map(asset => asset.code).join(', ') }],
    }] : []),
  ];
  return (
    <section className="grg-ip-card grg-ip-card--balance" aria-labelledby="balance-title">
      <div className="grg-ip-card__head">
        <div>
          <h2 id="balance-title" className="grg-ip-card__title">Total balance</h2>
          <p className="grg-ip-card__value">{money(total)} EUR</p>
        </div>
        <Link size="sm" color="black" href="#assets" onClick={event => { event.preventDefault(); onViewAll(); }}>View all</Link>
      </div>
      {/* The tooltips need a control that takes focus: one Tab stop, ← → move along the parts (as on the chart) */}
      {total > 0 ? (
        <div className="grg-ip-shares" role="group" aria-label="Shares of the balance" onKeyDown={moveAlong}>
          {parts.map((part, index) => (
            <Tooltip key={part.id} title={part.name} value={share(part.value, total)} leading={part.coin && <CoinIcon name={part.coin} size={20} />}
              rows={part.rows} color="white" side="top" purpose="description">
              <button type="button" className="grg-ip-shares__part" data-part={index} tabIndex={index === 0 ? 0 : -1} aria-label={part.name}
                style={{ flexGrow: part.value, background: part.color }} />
            </Tooltip>
          ))}
        </div>
      ) : <div className="grg-ip-shares" aria-hidden="true" />}
      {rows.length ? (
        <ul className="grg-ip-holdings">
          {rows.map(asset => (
            <li key={asset.id}>
              <CoinIcon name={asset.coin} size={24} />
              <span className="grg-ip-holdings__name">
                <span>{asset.name} <span className="grg-ip-holdings__code">{asset.code}</span></span>
                <span className="grg-ip-holdings__share">{share(value(asset), total)}</span>
              </span>
              <span className="grg-ip-holdings__amount">
                <span>{money(value(asset))} EUR</span>
                {asset.code !== 'EUR' && <span className="grg-ip-holdings__share">= {format(asset.amount, asset.digits)} {asset.code}</span>}
              </span>
              <DropdownMenu aria-label={`${asset.name} actions`} align="end" width={160}
                items={[
                  { label: 'Convert', onSelect: () => onAction.convert(asset) },
                  // Deposit comes later; Withdraw works for ether in this demo
                  { label: 'Deposit', disabled: true },
                  { label: 'Withdraw', disabled: asset.id !== 'eth', onSelect: () => onAction.withdraw(asset) },
                ]}
                trigger={props => <ActionButton {...props} icon="menu-circle-vertical-01" size="sm" aria-label={`${asset.name} actions`} />} />
            </li>
          ))}
        </ul>
      ) : <p className="grg-ip-card__empty">You don't have any assets yet</p>}
    </section>
  );
}

/* ---- Notes on top of the balance ---- */

export type Note = 'integrate-the-key' | 'verify-documents';
const NOTES: Record<Note, { title: string; text: string; action: string; image: string }> = {
  'integrate-the-key': { title: 'Integrate the key to your website', text: 'Automate the crypto payments', action: 'Integrate the key', image: keyImage },
  'verify-documents': { title: 'Verify your documents', text: 'Your documents require re-verification', action: 'Complete verification', image: documentsImage },
};

function NoteCard({ note, onClose }: { note: Note; onClose: () => void }) {
  const { title, text, action, image } = NOTES[note];
  return (
    <section className="grg-ip-card grg-ip-note" aria-label={title}>
      <div className="grg-ip-note__text">
        <h2 className="grg-ip-card__title">{title}</h2>
        <p>{text}</p>
        {/* No settings pages in this demo: the button stays without a destination */}
        <Button variant="secondary" size="sm" rightIcon="arrow-right">{action}</Button>
      </div>
      <img className="grg-ip-note__image" src={image} alt="" />
      <ActionButton className="grg-ip-note__close" icon="remove" size="sm" aria-label={`Close: ${title}`} onClick={onClose} />
    </section>
  );
}

/* ---- Last transactions ---- */

type Status = 'Completed' | 'Refunded' | 'Cancelled' | 'Processing';
type Transaction = { id: string; type: TransactionType; name: string; at: string; amount: string; status: Status };
const STATUS_COLOR: Record<Status, BadgeColor> = { Completed: 'success', Refunded: 'neutral', Cancelled: 'error', Processing: 'warning' };

export const transactions: Transaction[] = [
  { id: '4f4eef79-0976-4226-a141-e0ef893b5521', type: 'payment', name: 'Invoice Payment', at: '23/04/26, 13:52:07', amount: '0.065769 ETH', status: 'Completed' },
  { id: '9b2c41d0-5e7a-4c3f-8d16-2a7e90c1b4f8', type: 'deposit', name: 'Deposit', at: '23/04/26, 11:08:44', amount: '2.2219778 ETH', status: 'Refunded' },
  { id: 'c71a0e5b-34d2-4f89-b0a6-91e3d27f5c02', type: 'withdrawal', name: 'Withdrawal', at: '22/04/26, 18:30:12', amount: '0.5 BTC', status: 'Cancelled' },
  { id: '2d8f6a13-b7c4-4e05-9a2d-6f1c08e3b7a9', type: 'withdrawal', name: 'Withdrawal', at: '22/04/26, 16:02:55', amount: '1,250.00 EUR', status: 'Processing' },
  { id: 'e5a9c2f7-1b38-4d6e-a40c-7d2b95f8e163', type: 'exchange', name: 'Exchange', at: '21/04/26, 09:47:31', amount: 'ETH → EUR', status: 'Processing' },
  { id: '0f3b7d82-6c19-4a5e-b2f4-83a6e1d90c57', type: 'payment', name: 'Invoice Payment', at: '20/04/26, 22:28:07', amount: '0.0412 BTC', status: 'Completed' },
];

/** dd/mm/yy, hh:mm:ss → a number that sorts in time order */
const when = (at: string) => { const [d, m, y, rest] = at.split(/[/, ]+/); return Number(`${y}${m}${d}${rest.replace(/:/g, '')}`); };

function TransactionsCard({ rows }: { rows: Transaction[] }) {
  const { toast } = useMessages();
  const copy = (id: string) => {
    void navigator.clipboard?.writeText(id).catch(() => undefined);
    toast({ status: 'success', title: 'Copied', duration: 3000 });
  };
  const columns: TableColumn<Transaction>[] = [
    { id: 'type', header: 'Type', width: '24%', cell: row => (
      <TableText priority="leading" orientation="horizontal" title={row.name}
        // Figma: a cancelled one shows a red cross
        leading={row.status === 'Cancelled' ? <TransactionIcon icon="remove" color="red" size="md" /> : <TransactionIcon type={row.type} size="md" />} />
    ) },
    { id: 'at', header: 'Completed at', width: '20%', sortValue: row => when(row.at), cell: row => <TableText title={row.at} /> },
    { id: 'id', header: 'ID', width: '24%', cell: row => (
      <span className="grg-ip-copy">
        <TableText title={row.id} />
        <ActionButton icon="copy" size="sm" aria-label={`Copy ID of ${row.name}, ${row.at}`} onClick={() => copy(row.id)} />
      </span>
    ) },
    { id: 'amount', header: 'Amount', width: '18%', cell: row => <TableText title={row.amount} /> },
    { id: 'status', header: 'Status', cell: row => <Badge label={row.status} variant="light" size="sm" color={STATUS_COLOR[row.status]} leftIcon={null} rightIcon={null} /> },
  ];
  return (
    <section className="grg-ip-card grg-ip-card--transactions" aria-labelledby="transactions-title">
      <div className="grg-ip-card__head">
        <h2 id="transactions-title" className="grg-ip-card__title">Last transactions</h2>
        <Link size="sm" color="black">View all</Link>
      </div>
      <Table aria-label="Last transactions" rows={rows} rowKey={row => row.id} rowLabel={row => `${row.name}, ${row.at}`} columns={columns}
        empty={{ title: 'You don’t have transactions yet' }} />
    </section>
  );
}

/* ---- The page and the app ---- */

export type DashboardFlowProps = {
  /** A new account: no assets, no payments, no transactions */
  empty?: boolean;
  /** A note on top of the balance */
  note?: Note;
  /** Opens with "Business verified successfully" */
  verified?: boolean;
};

/** The Dashboard and the Assets page, with Convert and Withdraw: the app as one working flow */
export function DashboardFlow({ empty = false, note, verified = false }: DashboardFlowProps) {
  const [assets, setAssets] = useState(() => (empty ? startAssets.map(asset => ({ ...asset, amount: 0 })) : startAssets));
  const [page, setPage] = useState<AppPage>('dashboard');
  const [shownNote, setShownNote] = useState(note);
  const [welcome, setWelcome] = useState(verified);
  const convert = useConvert({ assets, setAssets });
  const withdraw = useWithdrawEth({ assets, setAssets });

  let content: ReactNode = withdraw.outside;
  if (!content && page === 'assets') {
    content = <AssetsPage assets={assets} inProgress={withdraw.inProgress} onAction={{ convert: convert.start, withdraw: row => withdraw.start(row.id) }} />;
  }
  if (!content) {
    content = (
      <main className="grg-ip-page">
        <h1 className="grg-ip-page__title">Dashboard</h1>
        <div className="grg-ip-dashboard">
          <div className="grg-ip-dashboard__side">
            {shownNote && <NoteCard note={shownNote} onClose={() => setShownNote(undefined)} />}
            <BalanceCard assets={assets} onViewAll={() => setPage('assets')}
              onAction={{ convert: convert.start, withdraw: asset => withdraw.start(asset.id) }} />
          </div>
          <PaymentsCard empty={empty} />
          <TransactionsCard rows={empty ? [] : transactions} />
        </div>
      </main>
    );
  }

  return (
    <MessagesProvider appendTo="self">
      <AppFrame centred={!!withdraw.outside} current={page} onNavigate={setPage}>{content}</AppFrame>
      {convert.modal}
      {withdraw.modal}
      {/* Figma: a picture above the title; the Modal has a Featured icon there, see "Decided while building it" */}
      <Modal appendTo="self" visible={welcome} onHide={() => setWelcome(false)} status="success" statusIcon="medal-star"
        title="Business verified successfully" description="Your documents have been successfully verified. All services are available for your company."
        closable={false} footerType="fill" primaryAction={{ label: 'Okay', onClick: () => setWelcome(false) }} />
    </MessagesProvider>
  );
}
