import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button/Button';
import { FeatureCard } from '../../components/FeatureCard/FeatureCard';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { CoinIcon, type CoinName } from '../../components/CoinIcon/CoinIcon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { InlineSelect } from '../../components/InlineSelect/InlineSelect';
import { SidebarHeaderCard, SidebarNavigation, type SidebarItem, type SidebarSection } from '../../components/SidebarNavigation/SidebarNavigation';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { NotificationFeed } from '../../components/NotificationFeed/NotificationFeed';
import { TopbarButton, TopbarNavigation } from '../../components/TopbarNavigation/TopbarNavigation';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { useNotificationsController } from './notifications';
import { useAccount } from './account';
import { useScreen } from './screen';
import { formatNumber } from '../../locale/format';
import marketImage from '../../assets/in-product/market.png';
import verifyingImage from '../../assets/in-product/verification-in-progress.png';
import '../in-product.css';

/** You, without a photo: the same initials in the bar and in the menu header */
const AVATAR = { initials: true, color: 'amber' } as const;

/* The app around every In product flow of the GRX Pay redesign (XDynk3v9BU5pStqaulzutE): the bar, the sidebar and
   the Assets page (52:7662). Test data only; the company is "Company". */

export type Asset = { id: string; name: string; code: string; coin: CoinName; amount: number; rate: number; digits: number };

/** Balances, and each asset's rate in EUR */
export const startAssets: Asset[] = [
  { id: 'eth', name: 'Ethereum', code: 'ETH', coin: 'ethereum-eth', amount: 32223.78997582, rate: 1947.48, digits: 8 },
  { id: 'btc', name: 'Bitcoin', code: 'BTC', coin: 'bitcoin-btc', amount: 78.91994642, rate: 62040.32, digits: 8 },
  { id: 'eur', name: 'Euro', code: 'EUR', coin: 'eur', amount: 940397.78, rate: 1, digits: 2 },
  { id: 'usdc', name: 'USD Coin', code: 'USDC', coin: 'usd-coin-usdc', amount: 2381.947382, rate: 0.865, digits: 6 },
  { id: 'usdt', name: 'Tether', code: 'USDT', coin: 'tether-usdt', amount: 12500.5, rate: 0.864, digits: 2 },
  { id: 'bch', name: 'Bitcoin Cash', code: 'BCH', coin: 'bitcoin-cash-bch', amount: 0, rate: 310.2, digits: 8 },
  { id: 'ltc', name: 'Litecoin', code: 'LTC', coin: 'litecoin-ltc', amount: 0.004, rate: 68.4, digits: 8 },
];

export const format = (value: number, digits = 8) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });
export const money = (value: number) => value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pages: SidebarSection[] = [{
  items: [
    { id: 'dashboard', label: 'Dashboard', href: '#dashboard', icon: 'grid-02' },
    { id: 'assets', label: 'Assets', href: '#assets', icon: 'coin' },
    { id: 'invoices', label: 'Invoices', href: '#invoices', icon: 'bill' },
    { id: 'transactions', label: 'Transactions', href: '#transactions', icon: 'reload' },
    { id: 'reporting', label: 'Reporting', href: '#reporting', icon: 'file-fill-in' },
  ],
}, {
  // The company, after a line: who works in it and how it is set up (the money pages come first)
  divided: true,
  items: [
    { id: 'members', label: 'Members', href: '#members', icon: 'users' },
    { id: 'settings', label: 'Settings', href: '#settings', icon: 'setting' },
  ],
}];

const logo = (
  <a href="#home" className="grg-ip-logo">
    <span aria-hidden="true" className="grg-ip-logo__mark">C</span>
    Company
  </a>
);

/** The pages in this demo; the others are in the menu but lead nowhere */
export type AppPage = 'dashboard' | 'assets' | 'invoices' | 'transactions' | 'members' | 'settings' | 'reporting' | 'notifications' | 'profile';
const built: string[] = ['dashboard', 'assets', 'invoices', 'transactions', 'members', 'settings', 'reporting'];

/** The bar on top; under it the sidebar and the page, or (`centred`) a single card in the middle, as at the end of a flow.
 *  `onNavigate` moves between the built pages; without it the menu stays on `current` */
export function AppFrame({ centred = false, current = 'assets', onNavigate, children }: {
  centred?: boolean; current?: AppPage; onNavigate?: (page: AppPage) => void; children: ReactNode;
}) {
  const [support, setSupport] = useState(true);
  const screenInfo = useScreen();
  const feed = useNotificationsController();
  const account = useAccount();
  const unread = feed?.items.filter(n => n.unread).length ?? 0;
  // The bell: the notification feed when the app gives its notifications, a plain button otherwise
  const bell = feed ? (
    <NotificationFeed notifications={feed.items} relativeDates settingsHref="#notification-settings" viewAllHref="#notifications"
      onOpen={(n, event) => { event.preventDefault(); feed.open(n); }} onMarkAllRead={feed.markAllRead}
      onViewAll={event => { event.preventDefault(); feed.viewAll?.(); }}
      onSettings={event => { event.preventDefault(); feed.settings?.(); }}
      empty={{ title: 'No notifications yet', subtitle: 'We’ll let you know when something happens.' }}
      trigger={props => <TopbarButton action={{ label: 'Notifications', icon: 'notification', badge: unread ? `${unread} unread` : undefined }} buttonProps={props} />} />
  ) : undefined;
  // A docs page shows a narrow window into the app: the sidebar collapsed; full screen follows the screen's width
  const docs = !!screenInfo?.docs;
  const navigate = (item: SidebarItem, event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    if (onNavigate && built.includes(item.id)) onNavigate(item.id as AppPage);
  };
  return (
    <div className="grg-ip-app">
      <TopbarNavigation type="company" layout={docs ? 'desktop' : 'auto'} logo={logo} sections={pages} current={current} onNavigate={navigate}
        company={<SidebarHeaderCard name="My Company" />}
        // Figma: the language and the theme in the bar. Only English in this demo; the theme switches Storybook's
        language={{ value: 'en', options: [{ value: 'en', label: 'EN' }], onChange: () => undefined, label: 'Language' }}
        theme={screenInfo?.theme} onThemeChange={screenInfo?.setTheme}
        actions={[{ id: 'notifications', label: 'Notifications', icon: 'notification', inBar: true, onClick: () => undefined, badge: unread ? `${unread} unread` : undefined, element: bell }, { id: 'help', label: 'Help', icon: 'help', href: '#help' }]}
        // The avatar's menu: who you are, your Profile, the company's Settings, Log out (no sign-out in this demo)
        // The bar's avatar and the menu header are the same picture
        account={{ name: account.name, email: account.email, avatar: AVATAR, menu: [
          { kind: 'header', label: account.name, description: account.email, avatar: AVATAR },
          { kind: 'divider' },
          { label: 'Profile', icon: 'user', onSelect: () => account.open?.('profile') },
          { label: 'Company settings', icon: 'setting', onSelect: () => account.open?.('settings') },
          { kind: 'divider' },
          { label: 'Log out', icon: 'out', onSelect: () => undefined },
        ] }} />
      {centred ? <main className="grg-ip-centre">{children}</main> : (
        <div className="grg-ip-body">
          <SidebarNavigation layout={docs ? 'collapsed' : 'auto'} sections={pages} current={current} onNavigate={navigate}
            featureCard={support ? <FeatureCard type="support" title="Need support?" description="Write to us any time: we answer within an hour." href="#support" onClose={() => setSupport(false)} /> : undefined} />
          {children}
        </div>
      )}
    </div>
  );
}

export type AssetAction = 'convert' | 'deposit' | 'withdraw';

/** Figma Assets: the currencies the balance can be shown in, with their rate in EUR */
const BALANCE_CURRENCIES = [
  { value: 'BTC', label: 'BTC', rate: 62040.32 },
  { value: 'ETH', label: 'ETH', rate: 1947.48 },
  { value: 'USDT', label: 'USDT', rate: 0.864 },
  { value: 'USD', label: 'USD', rate: 0.865 },
  { value: 'EUR', label: 'EUR', rate: 1 },
];

/** Figma Assets: the balances on one white surface, the filter and the table under a line. Each flow wires its own action. */
export function AssetsPage({ assets, inProgress, onAction, account = 'verified' }: {
  assets: Asset[];
  inProgress: number;
  onAction: Partial<Record<AssetAction, (asset: Asset) => void>>;
  /** Before verification and while the documents are checked: the Figma empty states */
  account?: 'verified' | 'not-verified' | 'verifying';
}) {
  const [hideSmall, setHideSmall] = useState(false);
  const rows = useMemo(() => assets.filter(item => !hideSmall || item.amount * item.rate >= 1), [assets, hideSmall]);
  const estimated = assets.reduce((sum, item) => sum + item.amount * item.rate, 0);
  // Figma: the balance in a currency of your choice (an Inline select by the number); rates are the demo's, in EUR
  const [shownIn, setShownIn] = useState('EUR');
  const inShown = (eur: number) => formatNumber(eur / (BALANCE_CURRENCIES.find(c => c.value === shownIn)?.rate ?? 1), shownIn);
  const columns: TableColumn<Asset>[] = [
    // Fixed shares: the columns keep their width when rows are hidden or sorted
    // Figma: three equal columns, the actions after them
    { id: 'asset', header: 'Asset', width: '26%', sortValue: row => row.name, cell: row => <TableText priority="leading" orientation="horizontal" title={row.name} description={row.code} leading={<CoinIcon name={row.coin} size={24} />} /> },
    { id: 'amount', header: 'Amount', width: '26%', sortValue: row => row.amount, cell: row => <TableText priority="passive" title={formatNumber(row.amount, row.code)} /> },
    { id: 'eur', header: 'Equivalent amount', width: '26%', sortValue: row => row.amount * row.rate, cell: row => <TableText priority="passive" title={`${money(row.amount * row.rate)} EUR`} /> },
  ];
  if (account !== 'verified') {
    const verifying = account === 'verifying';
    return (
      <main className="grg-ip-page">
        <PageHeader title="Assets" />
        <div className="grg-ip-surface grg-ip-waiting">
          <img className="grg-ip-waiting__image" src={verifying ? verifyingImage : marketImage} alt="" />
          <h2 className="grg-ip-waiting__title">{verifying ? 'Verification in progress' : 'You don’t have assets yet'}</h2>
          <p className="grg-ip-waiting__text">{verifying ? 'Please wait a little bit. We’ll let you know when it’s ready.' : 'Assets list will be available after successful verification'}</p>
          {/* No verification in this demo: the button stays, as on Transactions, without an action */}
          {!verifying && <Button variant="primary" size="lg" rightIcon="arrow-right">Verify business to get started</Button>}
        </div>
      </main>
    );
  }
  const action = (kind: AssetAction, label: string, row: Asset) => (
    <Button variant="text" size="xs" disabled={kind !== 'deposit' && row.amount === 0} onClick={onAction[kind] ? () => onAction[kind]?.(row) : undefined}
      aria-label={`${label} ${row.code}`}>{label}</Button>
  );
  return (
    <main className="grg-ip-page">
      <PageHeader title="Assets" />
      {/* Figma: the page content on one white surface; the balances above a line; the filter and the table under it */}
      <div className="grg-ip-surface">
        <div className="grg-ip-surface__top">
          <div className="grg-ip-balances">
            <div>
              <p className="grg-ip-balances__key grg-ip-balances__key--strong">Estimated balance</p>
              <p className="grg-ip-balances__value">
                <span className="grg-ip-balances__number">{inShown(estimated)}</span>
                <InlineSelect aria-label="Show the balance in" options={BALANCE_CURRENCIES} value={shownIn} onChange={setShownIn} />
              </p>
            </div>
            <div>
              <p className="grg-ip-balances__key">
                Withdrawal in progress
                {/* Figma: a blue info button with the text in a tooltip */}
                <Tooltip title="Temporarily reserved amount of assets for withdrawal." side="top" purpose="description">
                  <ActionButton icon="information-circle" size="xs" color="blue" aria-label="About withdrawal in progress" />
                </Tooltip>
              </p>
              <p className="grg-ip-balances__small">{inShown(inProgress)} {shownIn}</p>
            </div>
          </div>
        </div>
        <hr className="grg-ip-surface__divider" />
        <div className="grg-ip-surface__section">
          <CheckboxLabel label="Hide small balances (less 1 EUR)" checked={hideSmall} onChange={setHideSmall} />
          <Table aria-label="Assets" rows={rows} rowKey={row => row.id} rowLabel={row => row.name} columns={columns}
            actions={row => <>{action('convert', 'Convert', row)}{action('deposit', 'Deposit', row)}{action('withdraw', 'Withdraw', row)}</>} />
        </div>
      </div>
    </main>
  );
}
