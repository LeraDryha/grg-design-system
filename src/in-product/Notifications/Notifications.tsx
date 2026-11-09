import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MessagesProvider } from '../../components/Alert/Messages';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { NotificationItem, type Notification } from '../../components/NotificationFeed/NotificationFeed';
import { TabMenu, type TabMenuItem } from '../../components/TabMenu/TabMenu';
import { TransactionIcon } from '../../components/TransactionIcon/TransactionIcon';
import { AppFrame, format } from '../shared/AssetsApp';
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

const amount = (t: Transaction) => `${format(t.amount, 8)} ${t.code}`;

/** A transaction as its notification, in the Figma words; the others don't notify */
const fromTransaction = (t: Transaction): AppNotification | null => {
  const base = { id: `n-${t.id}`, date: t.completedAt ?? t.createdAt, transaction: t, href: `#notification-${t.id}` };
  const icon = (failed = false) => <TransactionIcon type={t.kind} failed={failed} size="sm" />;
  if (t.kind === 'deposit' && t.status === 'Completed') {
    return { ...base, category: 'deposits', icon: icon(), title: `${t.code} deposit successful`,
      description: `The deposit of ${amount(t)} has been received. Your balance has been successfully updated.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Completed') {
    return { ...base, category: 'withdrawals', icon: icon(), title: `${t.code} withdrawal successful`,
      description: `You have successfully withdrawn ${amount(t)}. If you do not recognize this activity, please contact us.` };
  }
  if (t.kind === 'withdrawal' && t.status === 'Cancelled') {
    return { ...base, category: 'withdrawals', icon: icon(true), title: `${t.code} withdrawal cancelled`,
      description: `Your withdrawal of ${amount(t)} was cancelled. The funds are back on your balance.` };
  }
  if (t.kind === 'payment' && t.status === 'Completed') {
    return { ...base, category: 'invoices', icon: icon(), title: 'You have received a payment',
      description: `You have received a payment of ${amount(t)} for an invoice.` };
  }
  if (t.kind === 'exchange' && t.status === 'Completed') {
    return { ...base, category: 'conversion', icon: icon(), title: 'Auto-conversion completed',
      description: `${amount(t)} was converted to ${t.to}${t.rate ? ` at 1 ${t.code} = ${t.rate} ${t.to}` : ''}.` };
  }
  return null;
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000);

/** The notifications at the start: the newest three unread, as when someone comes back to the app */
const startNotifications = (): AppNotification[] => {
  const list: AppNotification[] = [
    ...startTransactions.map(fromTransaction).filter((n): n is AppNotification => !!n),
    { id: 'n-signin', category: 'signin', date: hoursAgo(30), href: '#notification-signin', icon: <TransactionIcon icon="login" color="pink" size="sm" />,
      title: 'New sign-in to your account', description: 'Safari on macOS, Kyiv, Ukraine. If this wasn’t you, change your password and contact us.' },
    { id: 'n-verified', category: 'verification', date: hoursAgo(430), href: '#notification-verified', icon: <TransactionIcon icon="shield-check" color="red" size="sm" />,
      title: 'Business verified successfully', description: 'Your documents have been verified. All services are available for your company.' },
  ];
  return list.sort((a, b) => b.date!.getTime() - a.date!.getTime()).map((n, index) => ({ ...n, unread: index < 3 }));
};

/** The deposit that arrives while the app is open */
const arriving = (): Transaction => ({
  id: 'b7e1c0d2-5a44-4e8f-a1c3-2f9d6e0b4a71', kind: 'deposit', status: 'Completed', amount: 0.5, code: 'ETH', createdAt: new Date(Date.now() - 60000),
  completedAt: new Date(), network: 'Ethereum', fee: '0.0004 ETH', risk: '0%',
  blockchainId: '0x9c41e2a7b05d4f18a3e6c92b7d0f5a1e84c3b6d29f07a5e1c8b4d3f2a6e9b017', address: '0x7a3d91c4e2b85f06d1a9c7e3b4f2',
});

/** The notifications of the app: read state, Mark all as read, and a new deposit a few seconds after it opens.
 *  `onOpenTransaction` shows a transaction's details where the app can */
export function useNotifications({ onOpenTransaction, onViewAll, arrive = true, none = false }: {
  onOpenTransaction?: (transaction: Transaction) => void; onViewAll?: () => void; arrive?: boolean;
  /** A new account: nothing yet, and nothing arrives */
  none?: boolean;
} = {}) {
  const [items, setItems] = useState(() => (none ? [] : startNotifications()));
  useEffect(() => {
    if (!arrive || none) return;
    const timer = window.setTimeout(() => {
      const n = fromTransaction(arriving());
      if (n) setItems(list => (list.some(x => x.id === n.id) ? list : [{ ...n, unread: true }, ...list]));
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [arrive, none]);
  const markRead = (id: string) => setItems(list => list.map(n => (n.id === id ? { ...n, unread: false } : n)));
  const controller: NotificationsController = {
    items,
    open: n => {
      markRead(n.id);
      const t = (n as AppNotification).transaction;
      if (t) onOpenTransaction?.(t);
    },
    markAllRead: () => setItems(list => list.map(n => ({ ...n, unread: false }))),
    viewAll: onViewAll,
  };
  return controller;
}

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
          <span className="grg-ip-waiting__title">{hideRead ? 'You don’t have new notifications' : 'No notifications here yet'}</span>
        </div>
      );
    }
    return (
      <ul className="grg-ip-notes__list">
        {shown.map(n => (
          <li key={n.id}><NotificationItem notification={n} onOpen={(item, event) => { event.preventDefault(); controller.open(item); }} /></li>
        ))}
      </ul>
    );
  };
  return (
    <main className="grg-ip-page">
      <div className="grg-ip-page__head">
        <h1 className="grg-ip-page__title">Notifications</h1>
        <span className="grg-ip-page__actions">
          <CheckboxLabel label="Hide read" checked={hideRead} onChange={setHideRead} />
          <Button variant="outline" size="sm" leftIcon="check-circle" disabled={!unread} onClick={controller.markAllRead}>Mark all as read</Button>
          {/* The settings will live in the profile, not built yet: the button stays without an action */}
          <Button variant="outline" size="sm" leftIcon="setting">Manage notifications</Button>
        </span>
      </div>
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
