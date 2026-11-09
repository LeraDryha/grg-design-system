import { useState, type ReactNode } from 'react';
import { useMessages } from '../../components/Alert/Messages';
import { Button } from '../../components/Button/Button';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import type { CoinName } from '../../icons/coin-names';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import type { IconName } from '../../components/Icon/Icon';
import { Modal, type ModalProps } from '../../components/Modal/Modal';
import { RadioGroup } from '../../components/Radio/Radio';
import { RadioLabel } from '../../components/RadioLabel/RadioLabel';

/* GRX Pay redesign, file "Global Settings", section Settings - Payment settings (372:46474): fixed sum invoice and
   auto-convert, each turned on with a currency and off after a question; the invoice fee, the referral currency and
   the payment coverage are shown, their Change buttons have no action in this demo. */

type Currency = 'usdc' | 'eur' | 'usd';
const CURRENCIES: { id: Currency; label: string; short: string; coin: CoinName }[] = [
  { id: 'usdc', label: 'USD Coin (USDC)', short: 'USD Coin', coin: 'usd-coin-usdc' },
  { id: 'eur', label: 'EUR', short: 'EUR', coin: 'eur' },
  { id: 'usd', label: 'USD', short: 'USD', coin: 'usd' },
];
const currency = (id: Currency) => CURRENCIES.find(c => c.id === id)!;
const Coin = ({ id }: { id: Currency }) => (
  <span className="grg-ip-pay__coin"><CoinIcon name={currency(id).coin} size={24} />{currency(id).short}</span>
);

type View = { kind: 'fixed-on' | 'convert-on'; chosen: Currency | null } | { kind: 'fixed-off' } | { kind: 'convert-off' };

/** One row of the card: an icon, the title and its text, the value, the button (Figma) */
function Row({ icon, title, text, note, value, action }: { icon: IconName; title: string; text: ReactNode; note?: string; value?: ReactNode; action: ReactNode }) {
  return (
    <section className="grg-ip-pay__row" aria-label={title}>
      <span className="grg-ip-pay__about">
        <FeaturedIcon type="neutral" size="md" icon={icon} />
        <span className="grg-ip-setting__text">
          <h2 className="grg-ip-pay__title">{title}</h2>
          <p className="grg-ip-pay__text">{text}</p>
          {note && <p className="grg-ip-pay__note">{note}</p>}
        </span>
      </span>
      <span className="grg-ip-pay__value">{value}</span>
      <span className="grg-ip-pay__action">{action}</span>
    </section>
  );
}

/** The Payment settings tab and its modal, for the Settings page */
export function usePaymentSettings() {
  const [fixed, setFixed] = useState<Currency | null>(null);
  const [convert, setConvert] = useState<Currency | null>(null);
  const [view, setView] = useState<View | null>(null);
  const { toast } = useMessages();
  const close = () => setView(null);
  const done = (title: string) => { close(); toast({ status: 'success', title, duration: 5000 }); };
  // A fixed sum is paid out after auto-conversion: it turns auto-convert on in the same currency
  const turnOnFixed = (c: Currency) => {
    setFixed(c);
    setConvert(c);
    done(convert ? 'Fixed sum invoice was turned on successfully' : 'Fixed sum invoice and auto-convert were turned on successfully');
  };
  const change = <Button variant="secondary" size="sm">Change</Button>;

  const tab = (
    <div className="grg-ip-surface grg-ip-surface--fit">
      <Row icon="chart-line" title="Fixed sum invoice"
        text="Fixed sum invoice ensures you receive the exact fiat amount for your transactions, protecting you from crypto market fluctuations."
        value={fixed ? <Coin id={fixed} /> : undefined}
        action={fixed
          ? <Button variant="secondary" size="sm" onClick={() => setView({ kind: 'fixed-off' })}>Turn off</Button>
          : <Button variant="primary" size="sm" onClick={() => setView({ kind: 'fixed-on', chosen: null })}>Turn on</Button>} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="refresh" title="Auto-convert"
        text="When auto-conversion is enabled, the number of payment currencies might reduce for your clients."
        // Fixed sum depends on it: off only after fixed sum is off, and the row says why (the Switch and Button rule)
        note={fixed ? 'Turn off fixed sum invoice first' : undefined}
        value={convert ? <Coin id={convert} /> : undefined}
        action={convert
          ? <Button variant="secondary" size="sm" disabled={!!fixed} onClick={() => setView({ kind: 'convert-off' })}>Turn off</Button>
          : <Button variant="primary" size="sm" onClick={() => setView({ kind: 'convert-on', chosen: null })}>Turn on</Button>} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="percentage" title="Invoice fee" text="You can choose whether the invoice fee is paid by you (the merchant) or passed on to the customer."
        value="Merchant (Me)" action={change} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="gift" title="Referral accruals" text="You can choose in which currency you would like to get referral cashback."
        value={<Coin id="usdc" />} action={change} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="pie-chart" title="Payment coverage"
        text={<>The payment percentage that needs to be paid to be considered completed. For example, with a 5% setting, a $100 item is fully paid if the customer transfers $95 in crypto. Please note that <strong>if the fixed sum invoice option is enabled, these payments will not be covered.</strong></>}
        value="3%" action={change} />
    </div>
  );

  let modal: Omit<ModalProps, 'lead' | 'tint'> | null = null;
  const base = { visible: true, onHide: close, appendTo: 'self' as const, footerType: 'fill' as const };
  if (view?.kind === 'fixed-on' || view?.kind === 'convert-on') {
    const v = view;
    const fixedSum = v.kind === 'fixed-on';
    modal = { ...base, title: fixedSum ? 'Turn on Fixed sum invoice' : 'Turn on auto-convert',
      description: fixedSum
        ? 'When enabled, this setting ensures you receive the exact amount after auto-conversion, protecting you from price volatility'
        : 'Choose a currency to which all accepted crypto will automatically convert. Auto-convert may take additional time for transaction settling.',
      // Nothing is chosen at first: Turn on waits for a currency
      primaryAction: { label: 'Turn on', disabled: !v.chosen, onClick: () => {
        if (fixedSum) turnOnFixed(v.chosen!);
        else { setConvert(v.chosen); done('Auto-convert was turned on successfully'); }
      } },
      children: (
        <RadioGroup label="Currency" labelHidden className="grg-ip-choices" value={v.chosen} onChange={chosen => setView({ ...v, chosen: chosen as Currency })}>
          {CURRENCIES.map(c => <RadioLabel key={c.id} flip value={c.id} label={c.label} picture={<CoinIcon name={c.coin} size={20} />} />)}
        </RadioGroup>
      ) };
  } else if (view?.kind === 'fixed-off') {
    modal = { ...base, title: 'Turn off fixed sum invoice?', status: 'warning', statusIcon: 'warning-error-filled',
      description: <>Are you sure that you want to turn off fixed sum invoice? It won’t affect auto-conversion and <strong>you will have the opportunity to adjust the exchange rate</strong> to manage volatility on the Exchange rate tab.</>,
      primaryAction: { label: 'Turn off', onClick: () => { setFixed(null); done('Fixed sum invoice was turned off successfully'); } },
      secondaryAction: { label: 'Cancel', onClick: close } };
  } else if (view?.kind === 'convert-off') {
    modal = { ...base, title: 'Turn off auto-convert?', status: 'warning', statusIcon: 'warning-error-filled',
      description: 'Are you sure that you want to turn off auto-convert?',
      primaryAction: { label: 'Turn off', onClick: () => { setConvert(null); done('Auto-convert was turned off successfully'); } },
      secondaryAction: { label: 'Cancel', onClick: close } };
  }

  return { tab, overlays: <Modal {...(modal ?? { ...base, visible: false, title: '' })} /> };
}
