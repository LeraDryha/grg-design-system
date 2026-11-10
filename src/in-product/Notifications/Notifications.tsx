import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { NotificationItem, type Notification } from '../../components/NotificationFeed/NotificationFeed';
import { TabMenu, type TabMenuItem } from '../../components/TabMenu/TabMenu';
import { TransactionIcon } from '../../components/TransactionIcon/TransactionIcon';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { AppFrame, money, startAssets } from '../shared/AssetsApp';
import { formatAmount } from '../../locale/format';
import { NotificationsContext, type NotificationsController } from '../shared/notifications';
import { startTransactions, useTransactions, type Transaction } from '../Transactions/Transactions';

/* GRX Pay redesign, file "Global Settings", section Notification (378:23294): the feed under the bell and the
   Notifications page, version 2 (each notification opens its details). The notifications come from the demo's own
   transactions, with a new sign-in and the verification; a new deposit arrives a few seconds after the app opens. */

export type Category = 'signin' | 'invoices' | 'deposits' | 'withdrawals' | 'conversion' | 'verification';
export type AppNotification = Notification & { category: Category; transaction?: Transaction };

const CATEGORIES: (TabMenuItem & { id: 'all' | Category })[] = [
  { id: 'all', label: 'All', picture: <TransactionIcon icon="grid-02" color="purple" size="sm" /> },
  { id: 'signin', label: 'Sign-in', picture: <TransactionIcon icon="login" color="pink" size="sm" /> },
  { id: 'invoices', label: 'Invoices', transaction: 'payment' },
  { id: 'deposits', label: 'Deposits', transaction: 'deposit' },
  { id: 'withdrawals', label: 'Withdrawals', transaction: 'withdrawal' },
  { id: 'conversion', label: 'Auto-conversion', transaction: 'exchange' },
  { id: 'verification', label: 'Verification', picture: <TransactionIcon icon="shield-check" color="red" size="sm" /> },
];

const amount = (t: Transaction) => formatAmount(t.amount, t.code);
/** The amount in EUR beside a crypto one, as the Dashboard shows it: the size at a glance */
const inEur = (t: Transaction) => {
  const rate = startAssets.find(a => a.code === t.code)?.rate;
  return t.code === 'EUR' || !rate ? '' : ` (≈ ${money(t.amount * rate)} EUR)`;
};
const short = (text?: string) => (text ? `${text.slice(0, 6)}…${text.slice(-4)}` : '');

/** A transaction as its notification; what needs people (on hold, arrested, cancelled) carries a badge */
const fromTransaction = (t: Transaction): AppNotification | null => {
  const base = { id: `n-${t.id}`, date: t.completedAt ?? t.createdAt, transaction: t, href: `#notification-${t.id}` };
  const icon = (failed = false) => <TransactionIcon type={t.kind} failed={failed} size="sm" />;
  if (t.kind === 'deposit' && t.status === 'Completed') {
    return { ...base, category: 'deposits', icon: icon(), title: `${t.code} deposit successful`,
      description: `${amount(t)}${inEur(t)} has been received${t.network ? ` on ${t.network}` : ''}. Your balance has been updated.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Completed') {
    return { ...base, category: 'withdrawals', icon: icon(), title: `${t.code} withdrawal successful`,
      description: `${amount(t)}${inEur(t)} was sent ${t.card ? `to the card ${t.card}` : 'from your balance'}.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Suspended') {
    return { ...base, category: 'withdrawals', icon: icon(), badge: { label: 'Action needed', color: 'warning' }, title: `${t.code} withdrawal on hold`,
      description: `${amount(t)}${inEur(t)} is waiting for a check. Reply to our compliance team so we can send it.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Arrested') {
    return { ...base, category: 'withdrawals', icon: icon(true), badge: { label: 'Blocked', color: 'error' }, title: `${t.code} withdrawal blocked`,
      description: `${amount(t)}${inEur(t)} was stopped by the risk check. Contact support to release the funds.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Cancelled') {
    return { ...base, category: 'withdrawals', icon: icon(true), badge: { label: 'Cancelled', color: 'error' }, title: `${t.code} withdrawal cancelled`,
      description: `${amount(t)} is back on your balance.${t.comment ? ` ${t.comment}` : ''}` };
  }
  if (t.kind === 'payment' && t.status === 'Completed') {
    return { ...base, category: 'invoices', icon: icon(), title: `Invoice paid · ${amount(t)}`,
      description: `Invoice ${short(t.invoiceId)} was paid in full${inEur(t)}.` };
  }
  if (t.kind === 'exchange' && t.status === 'Completed') {
    return { ...base, category: 'conversion', icon: icon(), title: `Auto-conversion · ${t.code} → ${t.to}`,
      description: `${amount(t)} became ${t.rate ? `${money(t.amount * t.rate)} ${t.to}, at 1 ${t.code} = ${money(t.rate)} ${t.to}` : t.to}.` };
  }
  return null;
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000);
const signIn = (id: string, where: string, hours: number): AppNotification => ({
  id, category: 'signin', date: hoursAgo(hours), href: `#notification-${id}`, icon: <TransactionIcon icon="login" color="pink" size="sm" />,
  badge: { label: 'Security', color: 'warning' }, title: 'New sign-in to your account',
  description: `${where}. If this wasn’t you, we’ll end that session and you’ll change your password.`,
});

/** The notifications at the start: the newest three unread, as when someone comes back to the app, and the sign-in */
const startNotifications = (): AppNotification[] => {
  const list: AppNotification[] = [
    ...startTransactions.map(fromTransaction).filter((n): n is AppNotification => !!n),
    signIn('n-signin', 'Safari on macOS, Kyiv, Ukraine', 30),
    { id: 'n-verified', category: 'verification', date: hoursAgo(430), href: '#notification-verified', icon: <TransactionIcon icon="shield-check" color="red" size="sm" />,
      title: 'Business verified successfully', description: 'Your documents have been verified. All services are available for your company.' },
  ];
  // A sign-in waits for its answer, so it stays unread however old it is
  return list.sort((a, b) => b.date!.getTime() - a.date!.getTime()).map((n, index) => ({ ...n, unread: index < 3 || n.category === 'signin' }));
};

/** The deposit that arrives while the app is open */
const arriving = (): Transaction => ({
  id: 'b7e1c0d2-5a44-4e8f-a1c3-2f9d6e0b4a71', kind: 'deposit', status: 'Completed', amount: 0.5, code: 'ETH', createdAt: new Date(Date.now() - 60000),
  completedAt: new Date(), network: 'Ethereum', fee: '0.0004 ETH', risk: '0%',
  blockchainId: '0x9c41e2a7b05d4f18a3e6c92b7d0f5a1e84c3b6d29f07a5e1c8b4d3f2a6e9b017', address: '0x7a3d91c4e2b85f06d1a9c7e3b4f2',
});

/** The notifications of the app: read state, Mark all as read, the sign-in question, and what arrives while it is
 *  open: a deposit (the bell's dot) and a sign-in from a new device (also in the corner, as it matters).
 *  `onOpenTransaction` shows a transaction's details where the app can */
export function useNotifications({ onOpenTransaction, onViewAll, onSettings, inApp, arrive = true, none = false }: {
  onOpenTransaction?: (transaction: Transaction) => void; onViewAll?: () => void; onSettings?: () => void;
  /** The Profile's In app switches: a category switched off doesn't notify in the app */
  inApp?: Partial<Record<Category, boolean>>;
  arrive?: boolean;
  /** A new account: nothing yet, and nothing arrives */
  none?: boolean;
} = {}) {
  const [items, setItems] = useState<AppNotification[]>(() => (none ? [] : startNotifications()));
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const { notify, toast } = useMessages();
  // Read when something arrives: the switches may have changed since the app opened
  const inAppNow = useRef(inApp);
  inAppNow.current = inApp;
  const add = (n: AppNotification | null) => n && setItems(list => (list.some(x => x.id === n.id) ? list : [{ ...n, unread: true }, ...list]));
  useEffect(() => {
    if (!arrive || none) return;
    const deposit = window.setTimeout(() => add(fromTransaction(arriving())), 8000);
    const security = window.setTimeout(() => {
      add(signIn('n-signin-new', 'Chrome on Windows, Warsaw, Poland', 0));
      if (inAppNow.current?.signin === false) return;
      notify({ status: 'warning', title: 'New sign-in from Warsaw', description: 'Chrome on Windows, just now. Was it you?', actionLabel: 'Review', onAction: () => onViewAll?.() });
    }, 20000);
    return () => { window.clearTimeout(deposit); window.clearTimeout(security); };
    // Once, when the app opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrive, none]);
  const markRead = (id: string) => setItems(list => list.map(n => (n.id === id ? { ...n, unread: false } : n)));
  // A sign-in asks: It was me, or Not me (then the session ends); once answered, it is a plain notification
  const answer = (id: string, mine: boolean) => {
    setAnswered(set => new Set(set).add(id));
    markRead(id);
    toast(mine
      ? { status: 'success', title: 'Thanks, noted', duration: 3000 }
      : { status: 'success', title: 'That session is ended', description: 'Change your password to keep the account safe.', duration: 6000 });
  };
  const shown = items.filter(n => inApp?.[n.category] !== false).map(n => (n.category === 'signin' && n.unread && !answered.has(n.id)
    ? { ...n, secondaryAction: { label: 'It was me', onClick: () => answer(n.id, true) }, primaryAction: { label: 'Not me', onClick: () => answer(n.id, false) } }
    : n));
  const controller: NotificationsController = {
    items: shown,
    open: n => {
      markRead(n.id);
      const t = (n as AppNotification).transaction;
      if (t) onOpenTransaction?.(t);
    },
    markAllRead: () => setItems(list => list.map(n => ({ ...n, unread: false }))),
    viewAll: onViewAll,
    settings: onSettings,
  };
  return controller;
}

const EMPTY: Record<string, string> = {
  all: 'No notifications yet', signin: 'No sign-ins from new devices', invoices: 'No paid invoices yet', deposits: 'No deposits yet',
  withdrawals: 'No withdrawals yet', conversion: 'No auto-conversions yet', verification: 'Nothing about verification yet',
};

/** Today, Yesterday, Earlier this week, Earlier: a long list in the days people think in */
const dayGroup = (date: Date, now = new Date()) => {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(now) - day(date)) / 86400000);
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 7 ? 'Earlier this week' : 'Earlier';
};

/** The Notifications page (Figma version 2): the categories on the left, the list on the right; Hide read */
export function NotificationsPage({ controller }: { controller: NotificationsController }) {
  const [category, setCategory] = useState<string>('all');
  const [hideRead, setHideRead] = useState(false);
  const items = controller.items as AppNotification[];
  const unread = items.filter(n => n.unread).length;
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c.id, items.filter(n => n.unread && (c.id === 'all' || n.category === c.id)).length])), [items]);
  const list = (id: string): ReactNode => {
    const shown = items.filter(n => (id === 'all' || n.category === id) && (!hideRead || n.unread));
    if (!shown.length) {
      return (
        <div className="grg-ip-notes__empty">
          <FeaturedIcon type="neutral" size="lg" icon="notification" />
          <span className="grg-ip-waiting__title">{hideRead ? 'You don’t have new notifications' : EMPTY[id]}</span>
        </div>
      );
    }
    const groups = shown.reduce<[string, AppNotification[]][]>((all, n) => {
      const name = dayGroup(n.date!);
      const last = all[all.length - 1];
      if (last && last[0] === name) last[1].push(n); else all.push([name, [n]]);
      return all;
    }, []);
    return (
      <div className="grg-ip-notes__groups">
        {groups.map(([name, group]) => (
          <section key={name} className="grg-ip-notes__group" aria-label={name}>
            <h2 className="grg-ip-notes__day">{name}</h2>
            <ul className="grg-ip-notes__list">
              {group.map(n => (
                <li key={n.id}>
                  <NotificationItem notification={n} relativeDates onOpen={(item, event) => { event.preventDefault(); controller.open(item); }} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  };
  return (
    <main className="grg-ip-page">
      <PageHeader title="Notifications" actions={<>
        <CheckboxLabel label="Hide read" checked={hideRead} onChange={setHideRead} />
        <Button variant="outline" size="sm" leftIcon="check-circle" disabled={!unread} onClick={controller.markAllRead}>Mark all as read</Button>
        {/* The settings live in the Profile; where the app has no Profile, the button stays without an action */}
        <Button variant="outline" size="sm" leftIcon="setting" onClick={() => controller.settings?.()}>Manage notifications</Button>
      </>} />
      <div className="grg-ip-surface grg-ip-notes">
        <TabMenu orientation="vertical" aria-label="Notifications" value={category} onChange={setCategory}
          items={CATEGORIES.map(c => ({ ...c, badge: counts[c.id] || undefined }))}>
          {item => list(item.id)}
        </TabMenu>
      </div>
    </main>
  );
}

/** The app: Notifications, and Transactions, where a notification opens its transaction */
function NotificationsApp({ arrive = true }: { arrive?: boolean }) {
  const [page, setPage] = useState<'notifications' | 'transactions'>('notifications');
  const transactions = useTransactions();
  const controller = useNotifications({
    arrive,
    onOpenTransaction: t => { transactions.show(t); setPage('transactions'); },
    onViewAll: () => setPage('notifications'),
  });
  return (
    <NotificationsContext.Provider value={controller}>
      <AppFrame current={page === 'transactions' ? 'transactions' : 'notifications'}
        onNavigate={next => { if (next === 'transactions') setPage('transactions'); }}>
        {page === 'transactions' ? transactions.content : <NotificationsPage controller={controller} />}
      </AppFrame>
      {transactions.overlays}
    </NotificationsContext.Provider>
  );
}

/** The bell's feed and the Notifications page: open a notification, mark all as read, hide the read ones */
export function NotificationsFlow(props: { arrive?: boolean }) {
  return <MessagesProvider appendTo="self"><NotificationsApp {...props} /></MessagesProvider>;
}
