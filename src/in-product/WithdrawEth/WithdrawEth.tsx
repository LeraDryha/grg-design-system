import { useEffect, useId, useMemo, useRef, useState, type MouseEvent } from 'react';
import { AccordionKeyValue } from '../../components/Accordion/AccordionKeyValue';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { CoinIcon, type CoinName } from '../../components/CoinIcon/CoinIcon';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { Input } from '../../components/Input/Input';
import { InteractionCard } from '../../components/InteractionCard/InteractionCard';
import { Modal, ModalFooter, ModalHeader, ModalPanel } from '../../components/Modal/Modal';
import { ProgressCircle } from '../../components/ProgressCircle/ProgressCircle';
import { SidebarHeaderCard, SidebarNavigation, type SidebarItem, type SidebarSection } from '../../components/SidebarNavigation/SidebarNavigation';
import { Switch } from '../../components/Switch/Switch';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { TextArea } from '../../components/TextArea/TextArea';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { TopbarNavigation } from '../../components/TopbarNavigation/TopbarNavigation';
import { Icon } from '../../components/Icon/Icon';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import '../in-product.css';

/* GRX Pay redesign, section Withdraw (XDynk3v9BU5pStqaulzutE, 63:58899): the Ethereum flow, from the Assets page to
   "Transaction in progress". Test data only; the company is "Company". */

type Asset = { id: string; name: string; code: string; coin: CoinName; amount: number; rate: number; digits: number };
const startAssets: Asset[] = [
  { id: 'eth', name: 'Ethereum', code: 'ETH', coin: 'ethereum-eth', amount: 32223.78997582, rate: 1950.47, digits: 8 },
  { id: 'btc', name: 'Bitcoin', code: 'BTC', coin: 'bitcoin-btc', amount: 78.91994642, rate: 62025.04, digits: 8 },
  { id: 'usdt', name: 'Tether', code: 'USDT', coin: 'tether-usdt', amount: 940397.78, rate: 0.92, digits: 2 },
  { id: 'usdc', name: 'USD Coin', code: 'USDC', coin: 'usd-coin-usdc', amount: 2381.947382, rate: 0.865, digits: 6 },
  { id: 'bch', name: 'Bitcoin Cash', code: 'BCH', coin: 'bitcoin-cash-bch', amount: 0, rate: 310.2, digits: 8 },
  { id: 'ltc', name: 'Litecoin', code: 'LTC', coin: 'litecoin-ltc', amount: 0.004, rate: 68.4, digits: 8 },
];

/** Figma "Select withdrawal method": the fee of each method, in the coin */
const methods = (code: string) => [
  { id: 'test', title: 'Test', fee: 0, feeText: 'Fee 0%' },
  { id: 'wallet', title: `${code} Wallet`, fee: 0.0005, feeText: `Fee 0.0005 ${code}` },
];
/** The limit that sat in a popover beside the modal in Figma, now a card in the modal */
const LIMITS = { max: 99999999.9 };

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

const format = (value: number, digits = 8) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });
const money = (value: number) => value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const logo = (
  <a href="#home" className="grg-ip-logo">
    <span aria-hidden="true" className="grg-ip-logo__mark">C</span>
    Company
  </a>
);

type Step = 'method' | 'amount' | 'comment' | 'summary' | 'requisite' | 'processing' | 'progress';

/** The big amount: typed straight into the middle of the modal, the coin after it, the fee (or what is wrong) under it. */
function AmountField({ value, onChange, code, fee, error }: { value: string; onChange: (value: string) => void; code: string; fee: number; error?: string }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  // The blue ring only for the keyboard: a text field matches :focus-visible after a click too
  useKeyboardNavigation(root);
  return (
    <div ref={root} className="grg-ip-amount" data-invalid={error ? true : undefined}>
      <label className="grg-ip-amount__field" htmlFor={id}>
        <input
          id={id}
          className="grg-ip-amount__input"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          aria-label={`Amount, ${code}`}
          aria-describedby={`${id}-note`}
          aria-invalid={error ? true : undefined}
          style={{ width: `${Math.max(1, value.length)}ch` }}
          onChange={event => {
            // Digits and one decimal point; a comma counts as the point
            const next = event.target.value.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
            onChange(next);
          }}
        />
        <span className="grg-ip-amount__code">{code}</span>
      </label>
      <p id={`${id}-note`} className="grg-ip-amount__note" aria-live="polite">
        {error ?? `Fee ${format(fee)} ${code}`}
      </p>
    </div>
  );
}

export type WithdrawFlowProps = {
  /** Start inside the flow (for the step stories) */
  startAt?: Step;
  /** The amount already typed when starting at a later step */
  startAmount?: string;
};

/** The Assets page and the withdrawal, as one working flow. */
export function WithdrawEthFlow({ startAt, startAmount = '' }: WithdrawFlowProps) {
  const [assets, setAssets] = useState(startAssets);
  const [inProgress, setInProgress] = useState(688621.79);
  const [hideSmall, setHideSmall] = useState(false);
  const [assetId, setAssetId] = useState('eth');
  const [step, setStep] = useState<Step | null>(startAt ?? null);
  const [methodId, setMethodId] = useState('test');
  const [amount, setAmount] = useState(startAmount);
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState('');
  const [saveRecipient, setSaveRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [operation] = useState(() => '78cfd052-27b7-4612-a1b3-5c0c5abcbe6a');

  const asset = assets.find(item => item.id === assetId) ?? assets[0];
  const method = methods(asset.code).find(item => item.id === methodId) ?? methods(asset.code)[0];
  const value = Number(amount) || 0;
  const total = value + method.fee;
  const largest = Math.max(0, Math.min(asset.amount - method.fee, LIMITS.max));
  const error = !amount || value === 0 ? undefined
    : value > LIMITS.max ? `More than the maximum, ${format(LIMITS.max)} ${asset.code}`
    : total > asset.amount ? `Not enough ${asset.code}: ${format(asset.amount, asset.digits)} available`
    : undefined;
  const ready = value > 0 && !error;

  /* "Payment processing" turns into "Transaction in progress" once the provider has the payment */
  useEffect(() => {
    if (step !== 'processing') return;
    const timer = window.setTimeout(() => setStep('progress'), 2500);
    return () => window.clearTimeout(timer);
  }, [step]);

  const start = (id: string) => {
    setAssetId(id);
    setMethodId('test');
    setAmount('');
    setComment('');
    setSaveRecipient(false);
    setRecipientName('');
    setStep('method');
  };
  const finish = () => {
    setAssets(list => list.map(item => item.id === asset.id ? { ...item, amount: +(item.amount - total).toFixed(asset.digits) } : item));
    setInProgress(sum => sum + total * asset.rate);
    setStep(null);
  };
  const close = () => setStep(null);

  const rows = useMemo(() => assets.filter(item => !hideSmall || item.amount * item.rate >= 1), [assets, hideSmall]);
  const estimated = assets.reduce((sum, item) => sum + item.amount * item.rate, 0);
  const columns: TableColumn<Asset>[] = [
    // Fixed shares: the columns keep their width when rows are hidden or sorted
    { id: 'asset', header: 'Asset', width: '32%', sortValue: row => row.name, cell: row => <TableText priority="leading" orientation="horizontal" title={row.name} description={row.code} leading={<CoinIcon name={row.coin} size={24} />} /> },
    { id: 'amount', header: 'Amount', width: '24%', sortValue: row => row.amount, cell: row => <TableText title={format(row.amount, row.digits)} /> },
    { id: 'eur', header: 'Equivalent amount', width: '24%', sortValue: row => row.amount * row.rate, cell: row => <TableText title={`${money(row.amount * row.rate)} EUR`} /> },
  ];

  const navigate = (_item: SidebarItem, event?: MouseEvent<HTMLElement>) => event?.preventDefault();
  const outside = step === 'processing' || step === 'progress';

  return (
    <div className="grg-ip-app">
      <TopbarNavigation type="company" layout="desktop" logo={logo}
        company={<SidebarHeaderCard name="My Company" />}
        actions={[{ id: 'notifications', label: 'Notifications', icon: 'notification', inBar: true, onClick: () => undefined }, { id: 'help', label: 'Help', icon: 'help', href: '#help' }]}
        account={{ name: 'Guadalupe Schimmel', email: 'g.schimmel@company.test' }} />
      {outside ? (
        <main className="grg-ip-centre">
          {step === 'processing' ? (
            /* Figma: the spinner above the header, so the panel is put together from its parts */
            <section className="grg-modal grg-ip-processing" data-size="sm" data-height="auto" data-layout="desktop" aria-labelledby="processing-title">
              <div className="grg-ip-spinner"><ProgressCircle size="sm" aria-label="Processing" /></div>
              <ModalHeader title="Payment processing" titleId="processing-title"
                description="We are currently processing your payment. We will keep you updated on the payment status." />
              <div className="grg-modal__content">
                <div className="grg-ip-box">
                  <AccordionKeyValue rows={[
                    { key: 'Operation number', value: `${operation.slice(0, 18)}…` },
                    { key: 'Provider', value: method.title },
                    { key: 'Payment date', value: '09/04/2026, 11:49:26' },
                    { key: 'Payment amount', value: `${format(total)} ${asset.code}` },
                  ]} />
                </div>
              </div>
              <ModalFooter type="fill" primary={{ label: 'Transaction details', onClick: () => setStep('progress') }} />
            </section>
          ) : (
            <ModalPanel status="warning" statusIcon="clock-circle-filled" title="Transaction in progress"
              description="This operation may take some time. We will let you know as soon as the transaction is completed."
              footerType="fill" primaryAction={{ label: 'Okay', onClick: finish }} secondaryAction={{ label: 'Transaction details', onClick: finish }} />
          )}
        </main>
      ) : (
        <div className="grg-ip-body">
          <SidebarNavigation layout="expanded" sections={pages} current="assets" onNavigate={navigate} />
          <main className="grg-ip-page">
            <h1 className="grg-ip-page__title">Assets</h1>
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
            <CheckboxLabel label="Hide small balances (less 1 EUR)" checked={hideSmall} onChange={setHideSmall} />
            <Table aria-label="Assets" rows={rows} rowKey={row => row.id} rowLabel={row => row.name} columns={columns}
              actions={row => (
                <>
                  <Button variant="text" size="xs">Convert</Button>
                  <Button variant="text" size="xs">Deposit</Button>
                  <Button variant="text" size="xs" disabled={row.amount === 0} onClick={() => start(row.id)} aria-label={`Withdraw ${row.code}`}>Withdraw</Button>
                </>
              )} />
          </main>
        </div>
      )}

      <Modal appendTo="self" visible={step === 'method'} onHide={close} title={`Withdraw ${asset.code}`} description="Select withdrawal method">
        <div className="grg-ip-stack">
          {methods(asset.code).map(item => (
            <InteractionCard key={item.id} type="icon" icon="wallet" title={item.title} description={item.feeText}
              onClick={() => { setMethodId(item.id); setStep('amount'); }} />
          ))}
        </div>
      </Modal>

      <Modal appendTo="self" visible={step === 'amount'} onHide={close} onBack={() => setStep('method')}
        title={`Withdraw ${asset.code} to ${method.title}`} description={`${format(asset.amount, asset.digits)} ${asset.code} available`}
        footerType="fill" primaryAction={{ label: 'Continue', disabled: !ready, onClick: () => setStep('summary') }}>
        <AmountField value={amount} onChange={setAmount} code={asset.code} fee={method.fee} error={error} />
        <div className="grg-ip-presets">
          <Button variant="secondary" size="xs" onClick={() => setAmount(String(+largest.toFixed(asset.digits)))}>MAX</Button>
        </div>
        {/* Figma: the limit card, moved here from the popover beside the modal */}
        <div className="grg-ip-limits" data-invalid={value > LIMITS.max || undefined}>
          <AccordionKeyValue rows={[{ key: 'Maximum', value: `${format(LIMITS.max)} ${asset.code}` }]} />
        </div>
        <div className="grg-ip-box">
          <AccordionKeyValue rows={[{ key: 'Recipient', value: method.title }, { key: 'Total amount', value: `${format(ready ? total : 0)} ${asset.code}` }]} />
        </div>
        <div className="grg-ip-comment">
          <div className="grg-ip-comment__head">
            <span>Comment</span>
            <Button variant="text" size="sm" leftIcon={comment ? 'edit' : 'plus'} onClick={() => { setDraft(comment); setStep('comment'); }}>{comment ? 'Edit' : 'Add'}</Button>
          </div>
          {comment && <p className="grg-ip-comment__text">{comment}</p>}
        </div>
      </Modal>

      <Modal appendTo="self" visible={step === 'comment'} onHide={close} onBack={() => setStep('amount')} title="Comment"
        footerType="fill" primaryAction={{ label: 'Save', onClick: () => { setComment(draft.trim()); setStep('amount'); } }}>
        <TextArea label="Comment" value={draft} onValueChange={setDraft} counter maxLength={1000} />
      </Modal>

      <Modal appendTo="self" visible={step === 'summary'} onHide={close} onBack={() => setStep('amount')} title="Withdrawal amount"
        footerType="fill" primaryAction={{ label: 'Continue', onClick: () => setStep(saveRecipient ? 'requisite' : 'processing') }}>
        <p className="grg-ip-amount__total">{format(value)} {asset.code}</p>
        <div className="grg-ip-box">
          <AccordionKeyValue rows={[{ key: 'Fee', value: `${format(method.fee)} ${asset.code}` }, { key: 'Total amount', value: `${format(total)} ${asset.code}` }]} />
        </div>
        <div className="grg-ip-box grg-ip-box--row">
          <FeaturedIcon type="primary" size="sm" filled={false} icon="user" />
          <span className="grg-ip-box__label" aria-hidden="true">Save recipient</span>
          <Switch aria-label="Save recipient" checked={saveRecipient} onChange={setSaveRecipient} />
        </div>
      </Modal>

      <Modal appendTo="self" visible={step === 'requisite'} onHide={close} onBack={() => setStep('summary')} title="Save Requisite"
        footerType="fill" primaryAction={{ label: 'Continue', disabled: !recipientName.trim(), onClick: () => setStep('processing') }}>
        <Input label="Recipient name" required size="lg" value={recipientName} onValueChange={setRecipientName} />
      </Modal>
    </div>
  );
}
