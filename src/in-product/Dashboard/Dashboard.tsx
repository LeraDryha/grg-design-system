import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import { FeaturedIcon, type FeaturedIconType } from '../../components/FeaturedIcon/FeaturedIcon';
import { Link } from '../../components/Link/Link';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Modal } from '../../components/Modal/Modal';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { TransactionIcon } from '../../components/TransactionIcon/TransactionIcon';
import { formatAmount, formatDateTime } from '../../locale/format';
import type { IconName } from '../../components/Icon/Icon';
import { AppFrame, AssetsPage, money, startAssets, type Asset, type AppPage } from '../shared/AssetsApp';
import { useConvert } from '../Convert/Convert';
import { PeriodSelect, date, pad, periodName, shift, startOf, thisMonth, type Range } from '../shared/period';
import { useWithdrawEth } from '../WithdrawEth/WithdrawEth';
import { useInvoices } from '../Invoices/Invoices';
import { startMembers, useMembers } from '../Members/Members';
import { NotificationsPage, useNotifications } from '../Notifications/Notifications';
import { NotificationsContext } from '../shared/notifications';
import { AccountContext } from '../shared/account';
import { inAppOf, startPrefs, useAccountState, useProfile } from '../Profile/Profile';
import { useSettings } from '../Settings/Settings';
import { useReporting } from '../Reporting/Reporting';
import { KIND_NAME, STATUS_COLOR, amountText, failed, useTransactions, type Transaction } from '../Transactions/Transactions';
import keyImage from '../../assets/in-product/key.png';
import documentsImage from '../../assets/in-product/documents-warning.png';

/* GRX Pay redesign, section Dashboard - Verified: the balance and its shares, the successful payments over a period,
   the last transactions; a new account's empty dashboard, the notes on top and the verification modal.
   Test data only, around today's date: the same day always shows the same payments. */

/* ---- Successful payments ---- */

/** One point of the chart: its label on the axis, the date for the tooltip, the paid sum and the count; null is still to come */
type Point = { label: string; date: string; amount: number | null; count: number };

/** Repeatable test numbers: the same payments for the same day on every visit */
const seeded = (seed: number) => {
  let value = seed;
  return () => { value = (value * 9301 + 49297) % 233280; return value / 233280; };
};
const key = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

/** Test data for one day, or one hour of it: mostly a few payments, now and then none */
function paidOn(d: Date, hour?: number, empty = false) {
  if (empty) return { amount: 0, count: 0 };
  const random = seeded(key(d) * 31 + (hour ?? 99));
  random();
  const scale = hour === undefined ? 600 : 180;
  if (random() < 0.12) return { amount: 0, count: 0 };
  const count = 1 + Math.floor(random() * random() * 5);
  return { amount: +(count * (scale * 0.6 + random() * scale * 0.4)).toFixed(2), count };
}

/** The chart's points for a period: hours for one day, days up to two months, months beyond; what is still to come is null */
function points([from, to]: Range, empty: boolean): Point[] {
  const now = new Date();
  const days = Math.round((startOf(to).getTime() - startOf(from).getTime()) / 86400000) + 1;
  if (days === 1) {
    return Array.from({ length: 24 }, (_, hour) => {
      const at = new Date(from.getFullYear(), from.getMonth(), from.getDate(), hour);
      const paid = paidOn(from, hour, empty);
      return { label: String(hour), date: `${date(from)}, ${pad(hour)}:00`, amount: at <= now ? paid.amount : null, count: at <= now ? paid.count : 0 };
    });
  }
  if (days <= 62) {
    return Array.from({ length: days }, (_, i) => {
      const d = shift(from, i);
      const paid = paidOn(d, undefined, empty);
      const label = days <= 7 ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : String(d.getDate());
      return { label, date: date(d), amount: d <= now ? paid.amount : null, count: d <= now ? paid.count : 0 };
    });
  }
  // Longer periods: one point a month, the sum of its days
  const list: Point[] = [];
  for (let m = new Date(from.getFullYear(), from.getMonth(), 1); m <= to; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
    let amount = 0, count = 0;
    for (let d = new Date(Math.max(m.getTime(), startOf(from).getTime())); d.getMonth() === m.getMonth() && d <= to && d <= now; d = shift(d, 1)) {
      const paid = paidOn(d, undefined, empty); amount += paid.amount; count += paid.count;
    }
    const label = m.toLocaleDateString('en-GB', { month: 'short' });
    list.push({ label, date: m.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), amount: m <= now ? +amount.toFixed(2) : null, count });
  }
  return list;
}

/** The point for now: the current hour or day, or the last one of a past period */
const nowIndex = (list: Point[]) => list.reduce((last, point, index) => (point.amount === null ? last : index), 0);

function PaymentsChart({ list, period }: { list: Point[]; period: string }) {
  const [active, setActive] = useState<number | null>(null);
  const now = nowIndex(list);
  const shown = active ?? now;
  const max = Math.max(...list.map(point => point.amount ?? 0), 1);
  // Up to 85% of the height, so the highest point has room under the top
  const y = (amount: number) => 100 - (amount / max) * 85;
  const line = list.flatMap((point, index) => (point.amount === null ? [] : [`${index + 0.5},${y(point.amount)}`])).join(' ');
  const position = (index: number) => `${((index + 0.5) / list.length) * 100}%`;
  const label = (point: Point) => `${point.date}: ${money(point.amount ?? 0)} EUR, ${point.count} ${point.count === 1 ? 'transaction' : 'transactions'}`;

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
    <div className="grg-ip-chart" role="group" aria-label={`Successful payments, ${period}`} onMouseLeave={() => setActive(null)}>
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
  const [period, setPeriod] = useState<Range>(thisMonth);
  const list = useMemo(() => points(period, empty), [period, empty]);
  const name = periodName(period);
  const paid = list.reduce((sum, point) => sum + (point.amount ?? 0), 0);
  // Test data: what is still waiting and what timed out are small shares of the paid sum
  const totals = { paid, pending: empty ? 0 : +(paid * 0.04).toFixed(2), timeout: empty ? 0 : +(paid * 0.02).toFixed(2) };
  return (
    <section className="grg-ip-card grg-ip-card--payments" aria-labelledby="payments-title">
      {/* The title row: the title on the left, the period and View all on the right; the sum under it */}
      <div className="grg-ip-card__head">
        <h2 id="payments-title" className="grg-ip-card__title">Successful payments</h2>
        <div className="grg-ip-card__tools">
          <PeriodSelect value={period} onChange={next => setPeriod(next ?? thisMonth())} />
          {/* No payments page in this demo: View all stays, as in Figma, without a destination */}
          <Link size="sm" color="black">View all</Link>
        </div>
      </div>
      <p className="grg-ip-card__value grg-ip-card__value--under">{money(paid)} EUR</p>
      <PaymentsChart list={list} period={name} />
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
      rows: [{ key: 'Amount:', value: `${money(value(asset))} EUR` }, { key: 'Balance:', value: formatAmount(asset.amount, asset.code) }],
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
                {asset.code !== 'EUR' && <span className="grg-ip-holdings__share">= {formatAmount(asset.amount, asset.code)}</span>}
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

/** The newest transactions from the Transactions page itself, so a row here is the same record there */
function TransactionsCard({ rows, onOpen, onViewAll }: { rows: Transaction[]; onOpen: (row: Transaction) => void; onViewAll: () => void }) {
  const { toast } = useMessages();
  const copy = (id: string) => {
    void navigator.clipboard?.writeText(id).catch(() => undefined);
    toast({ status: 'success', title: 'Copied', duration: 3000 });
  };
  const at = (row: Transaction) => (row.completedAt ? formatDateTime(row.completedAt) : '—');
  const columns: TableColumn<Transaction>[] = [
    { id: 'type', header: 'Type', width: '24%', cell: row => (
      <TableText priority="leading" orientation="horizontal" title={KIND_NAME[row.kind]}
        // Figma: a cancelled one shows a red cross
        leading={<TransactionIcon type={row.kind} failed={failed(row.status)} size="md" />} />
    ) },
    { id: 'at', header: 'Completed at', width: '20%', sortValue: row => row.completedAt?.getTime() ?? 0, cell: row => <TableText title={at(row)} /> },
    { id: 'id', header: 'ID', width: '24%', cell: row => (
      <span className="grg-ip-copy">
        <TableText title={row.id} />
        <ActionButton icon="copy" size="sm" aria-label={`Copy ID of ${KIND_NAME[row.kind]} ${row.id.slice(0, 8)}`}
          onClick={event => { event.stopPropagation(); copy(row.id); }} />
      </span>
    ) },
    { id: 'amount', header: 'Amount', width: '18%', cell: row => <TableText title={amountText(row)} /> },
    { id: 'status', header: 'Status', cell: row => <Badge label={row.status} variant="light" size="sm" color={STATUS_COLOR[row.status]} leftIcon={null} rightIcon={null} /> },
  ];
  return (
    <section className="grg-ip-card grg-ip-card--transactions" aria-labelledby="transactions-title">
      <div className="grg-ip-card__head">
        <h2 id="transactions-title" className="grg-ip-card__title">Last transactions</h2>
        <Link size="sm" color="black" href="#transactions" onClick={event => { event.preventDefault(); onViewAll(); }}>View all</Link>
      </div>
      <Table aria-label="Last transactions" rows={rows} rowKey={row => row.id} rowLabel={row => `${KIND_NAME[row.kind]}, ${amountText(row)}, ${row.status}`}
        columns={columns} onRowOpen={onOpen} empty={{ title: 'You don’t have transactions yet' }} />
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

/** The app behind the Dashboard: its pages, flows and messages (DashboardFlow gives it the Toast area) */
function DashboardApp({ empty = false, note, verified = false }: DashboardFlowProps) {
  const [assets, setAssets] = useState(() => (empty ? startAssets.map(asset => ({ ...asset, amount: 0 })) : startAssets));
  const [page, setPage] = useState<AppPage>('dashboard');
  const [shownNote, setShownNote] = useState(note);
  const [welcome, setWelcome] = useState(verified);
  const convert = useConvert({ assets, setAssets });
  const withdraw = useWithdrawEth({ assets, setAssets });
  const transactionsPage = useTransactions({ account: empty ? 'not-verified' : 'verified' });
  const invoices = useInvoices({ onViewTransaction: transaction => { transactionsPage.show(transaction); setPage('transactions'); } });

  // One team for Members and Settings: a new owner shows on both
  const team = useState(startMembers);
  const membersPage = useMembers(team);
  const settingsPage = useSettings({ account: empty ? 'not-verified' : 'verified' }, team);
  const reportingPage = useReporting({ account: empty ? 'not-verified' : 'verified' });
  // You: the avatar's menu opens the Profile or the company's Settings; the Profile's In app switches drive the bell
  const [prefs, setPrefs] = useState(startPrefs);
  const { account, setName } = useAccountState(to => setPage(to));
  const profilePage = useProfile({ account, setName, prefs, setPrefs });
  // The bell: a notification opens its transaction; View all opens the Notifications page; its settings, the Profile's
  const notifications = useNotifications({
    none: empty, inApp: inAppOf(prefs),
    onOpenTransaction: t => { transactionsPage.show(t); setPage('transactions'); },
    onViewAll: () => setPage('notifications'),
    onSettings: () => { profilePage.open('notifications'); setPage('profile'); },
  });

  let content: ReactNode = withdraw.outside;
  if (!content && page === 'invoices') content = invoices.content;
  if (!content && page === 'transactions') content = transactionsPage.content;
  if (!content && page === 'members') content = membersPage.content;
  if (!content && page === 'settings') content = settingsPage.content;
  if (!content && page === 'reporting') content = reportingPage.content;
  if (!content && page === 'notifications') content = <NotificationsPage controller={notifications} />;
  if (!content && page === 'profile') content = profilePage.content;
  if (!content && page === 'assets') {
    content = <AssetsPage assets={assets} inProgress={withdraw.inProgress} onAction={{ convert: convert.start, withdraw: row => withdraw.start(row.id) }} />;
  }
  if (!content) {
    content = (
      <main className="grg-ip-page">
        {/* The page's main action next to its title (in Figma it sat in the payments card) */}
        <div className="grg-ip-page__head">
          <h1 className="grg-ip-page__title">Dashboard</h1>
          {/* The same drawer as on the Invoices page */}
          <Button variant="primary" size="md" leftIcon="plus" onClick={invoices.create}>Create invoice</Button>
        </div>
        <div className="grg-ip-dashboard">
          <div className="grg-ip-dashboard__side">
            {shownNote && <NoteCard note={shownNote} onClose={() => setShownNote(undefined)} />}
            <BalanceCard assets={assets} onViewAll={() => setPage('assets')}
              onAction={{ convert: convert.start, withdraw: asset => withdraw.start(asset.id) }} />
          </div>
          <PaymentsCard empty={empty} />
          <TransactionsCard rows={empty ? [] : transactionsPage.transactions.slice(0, 6)} onViewAll={() => setPage('transactions')}
            onOpen={t => { transactionsPage.show(t); setPage('transactions'); }} />
        </div>
      </main>
    );
  }

  return (
    <AccountContext.Provider value={account}>
    <NotificationsContext.Provider value={notifications}>
      <AppFrame centred={!!withdraw.outside} current={page} onNavigate={setPage}>{content}</AppFrame>
      {convert.modal}
      {withdraw.modal}
      {invoices.overlays}
      {transactionsPage.overlays}
      {membersPage.overlays}
      {settingsPage.overlays}
      {reportingPage.overlays}
      {profilePage.overlays}
      {/* Figma: a picture above the title; the Modal has a Featured icon there, see "Decided while building it" */}
      <Modal appendTo="self" visible={welcome} onHide={() => setWelcome(false)} status="success" statusIcon="medal-star"
        title="Business verified successfully" description="Your documents have been successfully verified. All services are available for your company."
        closable={false} footerType="fill" primaryAction={{ label: 'Okay', onClick: () => setWelcome(false) }} />
    </NotificationsContext.Provider>
    </AccountContext.Provider>
  );
}

/** The Dashboard, the Assets and Invoices pages, Convert, Withdraw and Create invoice: the app as one working flow */
export function DashboardFlow(props: DashboardFlowProps) {
  return <MessagesProvider appendTo="self"><DashboardApp {...props} /></MessagesProvider>;
}
