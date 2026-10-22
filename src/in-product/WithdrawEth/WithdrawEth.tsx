import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AccordionKeyValue } from '../../components/Accordion/AccordionKeyValue';
import { Button } from '../../components/Button/Button';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { Input } from '../../components/Input/Input';
import { InteractionCard } from '../../components/InteractionCard/InteractionCard';
import { Modal, ModalFooter, ModalHeader, ModalPanel } from '../../components/Modal/Modal';
import { ProgressCircle } from '../../components/ProgressCircle/ProgressCircle';
import { Switch } from '../../components/Switch/Switch';
import { TextArea } from '../../components/TextArea/TextArea';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { AppFrame, AssetsPage, format, startAssets } from '../shared/AssetsApp';

/* GRX Pay redesign, section Withdraw (XDynk3v9BU5pStqaulzutE, 63:58899): the Ethereum flow, from the Assets page to
   "Transaction in progress". Test data only; the company is "Company". */

/** Figma "Select withdrawal method": the fee of each method, in the coin */
const methods = (code: string) => [
  { id: 'test', title: 'Test', fee: 0, feeText: 'Fee 0%' },
  { id: 'wallet', title: `${code} Wallet`, fee: 0.0005, feeText: `Fee 0.0005 ${code}` },
];
/** The limit that sat in a popover beside the modal in Figma, now a card in the modal */
const LIMITS = { max: 99999999.9 };

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

  const outside = step === 'processing' || step === 'progress';

  type View = { title: string; description?: string; back?: () => void; action?: { label: string; disabled?: boolean; onClick: () => void }; content: ReactNode };
  const views: Partial<Record<Step, View>> = {
    method: {
      title: `Withdraw ${asset.code}`,
      description: 'Select withdrawal method',
      content: methods(asset.code).map(item => (
        <InteractionCard key={item.id} type="icon" icon="wallet" title={item.title} description={item.feeText}
          onClick={() => { setMethodId(item.id); setStep('amount'); }} />
      )),
    },
    amount: {
      title: `Withdraw ${asset.code} to ${method.title}`,
      description: `${format(asset.amount, asset.digits)} ${asset.code} available`,
      back: () => setStep('method'),
      action: { label: 'Continue', disabled: !ready, onClick: () => setStep('summary') },
      content: <>
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
      </>,
    },
    comment: {
      title: 'Comment',
      back: () => setStep('amount'),
      action: { label: 'Save', onClick: () => { setComment(draft.trim()); setStep('amount'); } },
      content: <TextArea label="Comment" value={draft} onValueChange={setDraft} counter maxLength={1000} />,
    },
    summary: {
      title: 'Withdrawal amount',
      back: () => setStep('amount'),
      action: { label: 'Continue', onClick: () => setStep(saveRecipient ? 'requisite' : 'processing') },
      content: <>
        <p className="grg-ip-amount__total">{format(value)} {asset.code}</p>
        <div className="grg-ip-box">
          <AccordionKeyValue rows={[{ key: 'Fee', value: `${format(method.fee)} ${asset.code}` }, { key: 'Total amount', value: `${format(total)} ${asset.code}` }]} />
        </div>
        <div className="grg-ip-box grg-ip-box--row">
          <FeaturedIcon type="primary" size="sm" filled={false} icon="user" />
          <span className="grg-ip-box__label" aria-hidden="true">Save recipient</span>
          <Switch aria-label="Save recipient" checked={saveRecipient} onChange={setSaveRecipient} />
        </div>
      </>,
    },
    requisite: {
      title: 'Save Requisite',
      back: () => setStep('summary'),
      action: { label: 'Continue', disabled: !recipientName.trim(), onClick: () => setStep('processing') },
      content: <Input label="Recipient name" required size="lg" value={recipientName} onValueChange={setRecipientName} />,
    },
  };
  const view = step && !outside ? views[step] : undefined;

  return (
    <>
      <AppFrame centred={outside}>
      {outside ? (
        <>
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
        </>
      ) : (
        <AssetsPage assets={assets} inProgress={inProgress} onAction={{ withdraw: row => start(row.id) }} />
      )}
      </AppFrame>

      {/* One modal for the whole withdrawal (Modal: "steps in one modal", never a modal from a modal): the title,
          the back arrow, the content and the action change with the step */}
      <Modal appendTo="self" visible={!!view} onHide={close} title={view?.title ?? ''} description={view?.description}
        onBack={view?.back} footerType="fill" primaryAction={view?.action}>
        {view?.content}
      </Modal>
    </>
  );
}
