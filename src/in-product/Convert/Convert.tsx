import { useId, useRef, useState, type ReactNode } from 'react';
import { AccordionKeyValue } from '../../components/Accordion/AccordionKeyValue';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Button } from '../../components/Button/Button';
import { Chip } from '../../components/Chip/Chip';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { HintText } from '../../components/FormField/FormField';
import { Icon, type IconName } from '../../components/Icon/Icon';
import { Modal } from '../../components/Modal/Modal';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { AppFrame, AssetsPage, format, money, startAssets, type Asset } from '../shared/AssetsApp';

/* GRX Pay redesign, section Convert Assets (XDynk3v9BU5pStqaulzutE, 56:48832): from the Assets page through the
   amounts and the confirmation to the order, or to the failure screen. */

/** Figma: the popover beside the modal (Fee, Minimum, Maximum), here a card above the Convert button */
const FEE = 0.0025;
const LIMITS = { min: 0.86, max: 999999999999 };
/** Figma "There is not enough volume on the market": the market can take this much of a coin at once */
const MARKET: Record<string, number> = { 'eth>usdc': 1.45866 };
const PRESETS = [25, 50, 75, 100];

type Step = 'amounts' | 'confirm' | 'done' | 'failed';
type Side = 'from' | 'to';

/** Digits and one decimal point; a comma counts as the point */
const clean = (text: string) => text.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
const trim = (value: number, digits: number) => (value > 0 ? String(+value.toFixed(digits)) : '');

/** Figma "Currency input": From or To, the balance, a large amount and the coin to pick */
function CurrencyInput({ side, asset, assets, text, onText, onAsset, error, over }: {
  side: Side; asset: Asset; assets: Asset[]; text: string; onText: (text: string) => void; onAsset: (id: string) => void; error?: string; over?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  // The blue ring only for the keyboard: a text field matches :focus-visible after a click too
  useKeyboardNavigation(root);
  const label = side === 'from' ? 'From' : 'To';
  // Figma: thousands separated (2,334,455) while reading; plain digits while typing
  const shown = focused || !text ? text : format(Number(text), asset.digits) + (text.endsWith('.') ? '.' : '');
  return (
    <div ref={root} className="grg-ip-currency" data-invalid={error ? true : undefined}>
      <div className="grg-ip-currency__top">
        <label htmlFor={id}>{label}</label>
        <span data-over={over || undefined}>Balance: {format(asset.amount, asset.digits)}</span>
      </div>
      <div className="grg-ip-currency__row">
        <div className="grg-ip-currency__amount">
          {/* Figma: what leaves the balance has a minus, what arrives a plus */}
          <span className="grg-ip-currency__field" data-long={shown.length > 13 || undefined}>
            {text && <span aria-hidden="true">{side === 'from' ? '−' : '+'}</span>}
            <input id={id} inputMode="decimal" autoComplete="off" placeholder="0" value={shown}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined}
              aria-label={`${label}, ${asset.code}`} onChange={event => onText(clean(event.target.value))} />
          </span>
          {error && <HintText id={`${id}-error`} state="error" icon={false}>{error}</HintText>}
        </div>
        <CompactSelect type="coin" withText size="md" aria-label={`${label} currency`} value={asset.id} onChange={onAsset} searchable
          options={assets.map(item => ({ value: item.id, label: item.code, listLabel: `${item.name} (${item.code})`, coin: item.coin }))} />
      </div>
    </div>
  );
}

export type ConvertFlowProps = {
  /** Start inside the flow (for the step stories) */
  startAt?: Step;
  /** The amount already typed in From */
  startAmount?: string;
  /** The coin to receive when starting inside the flow */
  startTo?: string;
  /** Not a choice in the app: the demo of how a failed order looks */
  outcome?: 'success' | 'failure';
};

/** The Assets page and the conversion, as one working flow. */
export function ConvertFlow({ startAt, startAmount = '', startTo = 'eur', outcome = 'success' }: ConvertFlowProps) {
  const [assets, setAssets] = useState(startAssets);
  const [step, setStep] = useState<Step | null>(startAt ?? null);
  const [fromId, setFromId] = useState('eth');
  const [toId, setToId] = useState(startTo);
  const [edited, setEdited] = useState<Side>('from');
  const [text, setText] = useState(startAmount);
  const [preset, setPreset] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const from = assets.find(item => item.id === fromId) ?? assets[0];
  const to = assets.find(item => item.id === toId) ?? assets[2];
  const rate = from.rate / to.rate;
  // Typed on one side, worked out on the other; the fee comes off what arrives
  const fromValue = edited === 'from' ? Number(text) || 0 : (Number(text) || 0) / (rate * (1 - FEE));
  const toValue = edited === 'to' ? Number(text) || 0 : fromValue * rate * (1 - FEE);
  const fromText = edited === 'from' ? text : trim(fromValue, from.digits);
  const toText = edited === 'to' ? text : trim(toValue, to.digits);
  const inEur = fromValue * from.rate;
  const market = MARKET[`${from.id}>${to.id}`];

  const over = fromValue > from.amount;
  const limit = fromValue > 0 && (inEur < LIMITS.min || inEur > LIMITS.max);
  const marketError = !over && market !== undefined && fromValue > market
    ? `There is not enough volume on the market to make an exchange. Available ${format(market)} ${from.code}` : undefined;
  const ready = fromValue > 0 && !over && !limit && !marketError;

  const type = (side: Side, value: string) => { setEdited(side); setText(value); setPreset(null); };
  const choose = (side: Side, id: string) => {
    // Picking the coin on the other side swaps them, so the pair is never the same coin twice
    const other = side === 'from' ? toId : fromId;
    if (id === other) { setFromId(toId); setToId(fromId); } else if (side === 'from') setFromId(id); else setToId(id);
  };
  const pick = (share: number) => {
    if (preset === share) { setPreset(null); setText(''); return; }
    setPreset(share);
    setEdited('from');
    setText(trim(from.amount * share / 100, from.digits));
  };
  const start = (asset: Asset) => {
    setFromId(asset.id);
    setToId(asset.id === 'eur' ? 'eth' : 'eur');
    setEdited('from');
    setText('');
    setPreset(null);
    setStep('amounts');
  };
  const submit = () => {
    if (outcome === 'failure') { setStep('failed'); return; }
    setAssets(list => list.map(item => item.id === from.id ? { ...item, amount: +(item.amount - fromValue).toFixed(item.digits) }
      : item.id === to.id ? { ...item, amount: +(item.amount + toValue).toFixed(item.digits) } : item));
    setStep('done');
  };
  const close = () => setStep(null);
  const amount = `${format(fromValue, from.digits)} ${from.code}`;

  type View = {
    title: string; description?: string; status?: 'success' | 'error'; statusIcon?: IconName; closable?: boolean; back?: () => void;
    action: { label: string; disabled?: boolean; onClick: () => void }; content?: ReactNode;
  };
  const views: Record<Step, View> = {
    amounts: {
      title: 'Convert',
      action: { label: 'Convert', disabled: !ready, onClick: () => setStep('confirm') },
      content: <>
        <AccordionKeyValue rows={[{ key: 'Rate', value: `1 ${from.code} = ${format(rate, to.digits)} ${to.code}` }]} />
        <div className="grg-ip-pair">
          <CurrencyInput side="from" asset={from} assets={assets} text={fromText} onText={value => type('from', value)} onAsset={id => choose('from', id)}
            over={over} error={over ? 'Over balance' : undefined} />
          {/* Figma: only a pointer from From to To; the coins are swapped with the selects */}
          <span className="grg-ip-pair__gap" aria-hidden="true"><span className="grg-ip-pair__arrow"><Icon name="arrow-down" size={20} /></span></span>
          <CurrencyInput side="to" asset={to} assets={assets} text={toText} onText={value => type('to', value)} onAsset={id => choose('to', id)} />
        </div>
        {marketError && <HintText state="error" icon={false}>{marketError}</HintText>}
        <div className="grg-ip-chips" role="group" aria-label="Share of the balance">
          {PRESETS.map(share => (
            <Chip key={share} label={share === 100 ? 'MAX' : `${share}%`} selectable selected={preset === share} onSelectedChange={() => pick(share)} />
          ))}
        </div>
        <div className="grg-ip-limits" data-invalid={limit || undefined}>
          <AccordionKeyValue rows={[
            { key: 'Fee', value: `${format(FEE * 100, 2)}%` },
            { key: 'Minimum', value: `${money(LIMITS.min)} EUR` },
            { key: 'Maximum', value: `${money(LIMITS.max)} EUR` },
          ]} />
        </div>
      </>,
    },
    confirm: {
      title: 'Confirmation',
      back: () => setStep('amounts'),
      action: { label: `Convert ~ ${amount}`, onClick: submit },
      content: <>
        <div className="grg-ip-receipt">
          <p className="grg-ip-receipt__lead">You're converting</p>
          <p className="grg-ip-receipt__amount">~ {amount}</p>
          <p className="grg-ip-receipt__gets">+{format(toValue, to.digits)} {to.code}</p>
        </div>
        <div className="grg-ip-box">
          <AccordionKeyValue rows={[
            { key: 'Rate', value: `1 ${from.code} = ${format(rate, to.digits)} ${to.code}` },
            { key: 'Fee', value: `${format(FEE * 100, 2)}%` },
            { key: 'Total amount', value: amount },
          ]} />
        </div>
      </>,
    },
    done: {
      title: 'Order successfully submitted', description: 'We have sent you an email with transaction details',
      status: 'success', statusIcon: 'check-circle-filled', closable: false,
      action: { label: 'Done', onClick: close },
    },
    failed: {
      title: 'Oops, the transaction failed',
      description: 'Please check your balance and limits. After that try again. If the error occurs again, please contact the support team.',
      status: 'error', statusIcon: 'remove-circle-filled', closable: false,
      action: { label: 'Done', onClick: close },
      content: <>
        <div className="grg-ip-box grg-ip-box--row">
          <span className="grg-ip-box__key">Support code</span>
          <span className="grg-ip-box__value">8876kjhgt789</span>
          <ActionButton icon={copied ? 'copy-check' : 'copy'} size="sm" aria-label={copied ? 'Copied' : 'Copy the support code'}
            onClick={() => { void navigator.clipboard?.writeText('8876kjhgt789').catch(() => undefined); setCopied(true); }} />
        </div>
        {/* No support page in this flow: the button stays, as in Figma, without a destination */}
        <Button variant="text" size="md" leftIcon="send" justified>Contact the support team</Button>
      </>,
    },
  };
  const view = step ? views[step] : undefined;

  return (
    <>
      <AppFrame>
        <AssetsPage assets={assets} inProgress={688621.79} onAction={{ convert: start }} />
      </AppFrame>

      {/* One modal for the whole conversion (Modal: "steps in one modal", never a modal from a modal): the header,
          the content and the action change with the step */}
      <Modal appendTo="self" visible={!!view} onHide={close} title={view?.title ?? ''} description={view?.description}
        status={view?.status} statusIcon={view?.statusIcon} closable={view?.closable ?? true} onBack={view?.back}
        footerType="fill" primaryAction={view?.action}>
        {view?.content}
      </Modal>
    </>
  );
}
