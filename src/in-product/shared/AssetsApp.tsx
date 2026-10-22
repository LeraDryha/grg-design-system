import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { CoinIcon, type CoinName } from '../../components/CoinIcon/CoinIcon';
import { Icon } from '../../components/Icon/Icon';
import { SidebarHeaderCard, SidebarNavigation, type SidebarItem, type SidebarSection } from '../../components/SidebarNavigation/SidebarNavigation';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { TopbarNavigation } from '../../components/TopbarNavigation/TopbarNavigation';
import '../in-product.css';

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
    { id: 'payouts', label: 'Mass payouts', href: '#payouts', icon: 'money-profit' },
    { id: 'transactions', label: 'Transactions', href: '#transactions', icon: 'reload' },
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

/** The bar on top; under it the sidebar and the page, or (`centred`) a single card in the middle, as at the end of a flow */
export function AppFrame({ centred = false, children }: { centred?: boolean; children: ReactNode }) {
  const navigate = (_item: SidebarItem, event?: MouseEvent<HTMLElement>) => event?.preventDefault();
  return (
    <div className="grg-ip-app">
      <TopbarNavigation type="company" layout="desktop" logo={logo}
        company={<SidebarHeaderCard name="My Company" />}
        actions={[{ id: 'notifications', label: 'Notifications', icon: 'notification', inBar: true, onClick: () => undefined }, { id: 'help', label: 'Help', icon: 'help', href: '#help' }]}
        account={{ name: 'Guadalupe Schimmel', email: 'g.schimmel@company.test' }} />
      {centred ? <main className="grg-ip-centre">{children}</main> : (
        <div className="grg-ip-body">
          <SidebarNavigation layout="expanded" sections={pages} current="assets" onNavigate={navigate} />
          {children}
        </div>
      )}
    </div>
  );
}

export type AssetAction = 'convert' | 'deposit' | 'withdraw';

/** Figma Assets: the balances on one white surface, the filter and the table under a line. Each flow wires its own action. */
export function AssetsPage({ assets, inProgress, onAction }: {
  assets: Asset[];
  inProgress: number;
  onAction: Partial<Record<AssetAction, (asset: Asset) => void>>;
}) {
  const [hideSmall, setHideSmall] = useState(false);
  const rows = useMemo(() => assets.filter(item => !hideSmall || item.amount * item.rate >= 1), [assets, hideSmall]);
  const estimated = assets.reduce((sum, item) => sum + item.amount * item.rate, 0);
  const columns: TableColumn<Asset>[] = [
    // Fixed shares: the columns keep their width when rows are hidden or sorted
    { id: 'asset', header: 'Asset', width: '32%', sortValue: row => row.name, cell: row => <TableText priority="leading" orientation="horizontal" title={row.name} description={row.code} leading={<CoinIcon name={row.coin} size={24} />} /> },
    { id: 'amount', header: 'Amount', width: '24%', sortValue: row => row.amount, cell: row => <TableText title={format(row.amount, row.digits)} /> },
    { id: 'eur', header: 'Equivalent amount', width: '24%', sortValue: row => row.amount * row.rate, cell: row => <TableText title={`${money(row.amount * row.rate)} EUR`} /> },
  ];
  const action = (kind: AssetAction, label: string, row: Asset) => (
    <Button variant="text" size="xs" disabled={kind !== 'deposit' && row.amount === 0} onClick={onAction[kind] ? () => onAction[kind]?.(row) : undefined}
      aria-label={`${label} ${row.code}`}>{label}</Button>
  );
  return (
    <main className="grg-ip-page">
      <h1 className="grg-ip-page__title">Assets</h1>
      {/* Figma: the page content on one white surface; the balances above a line; the filter and the table under it */}
      <div className="grg-ip-surface">
        <div className="grg-ip-surface__top">
          <div className="grg-ip-balances">
            <div>
              <p className="grg-ip-balances__key">Estimated balance</p>
              <p className="grg-ip-balances__value"><span>{money(estimated)}</span> EUR</p>
            </div>
            <div>
              <p className="grg-ip-balances__key">
                Withdrawal in progress
                <Tooltip title="Sent, not yet confirmed by the network" side="top">
                  <span className="grg-ip-info" tabIndex={0} aria-label="About withdrawals in progress"><Icon name="information-circle" size={16} /></span>
                </Tooltip>
              </p>
              <p className="grg-ip-balances__small">{money(inProgress)} EUR</p>
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
