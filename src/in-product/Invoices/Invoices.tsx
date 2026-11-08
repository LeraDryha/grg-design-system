import { useId, useMemo, useState, type ReactNode } from 'react';
import { AccordionKeyValue } from '../../components/Accordion/AccordionKeyValue';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Badge, type BadgeColor } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { CompactSelect } from '../../components/CompactSelect/CompactSelect';
import { Drawer } from '../../components/Drawer/Drawer';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { Icon } from '../../components/Icon/Icon';
import { Input } from '../../components/Input/Input';
import { Modal } from '../../components/Modal/Modal';
import { Search } from '../../components/Search/Search';
import { Select } from '../../components/Select/Select';
import { SwitchLabel } from '../../components/SwitchLabel/SwitchLabel';
import { TabMenu } from '../../components/TabMenu/TabMenu';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import { TextArea } from '../../components/TextArea/TextArea';
import { AppFrame, money, startAssets } from '../shared/AssetsApp';
import { PeriodPicker, pad, shift, startOf, type Range } from '../shared/period';

/* GRX Pay redesign, sections Invoices tables (1676:55326) and Creating invoice (1676:58206): the list with its
   filters; creating an invoice in a drawer (it was a page in Figma), its result and its details in the same drawer,
   the details as a page too; deactivating a link. Test data only, around today's date. */

export type Status = 'Created' | 'Payment awaiting' | 'Paid' | 'Timeout' | 'Deactivated';
const STATUSES: Status[] = ['Created', 'Payment awaiting', 'Paid', 'Timeout', 'Deactivated'];
const STATUS_COLOR: Record<Status, BadgeColor> = { Created: 'warning', 'Payment awaiting': 'warning', Paid: 'success', Timeout: 'error', Deactivated: 'error' };
/** A link can be deactivated while nobody has paid it */
const active = (status: Status) => status === 'Created' || status === 'Payment awaiting';

type Operation = { at: Date; amount: string; network: string; status: 'Completed' | 'Processing' };
export type Invoice = {
  id: string; amount: number; currency: string; received: string; status: Status; createdAt: Date; createdBy: string;
  orderId?: string; category?: string; autoConvert: boolean; customer: string[]; operations: Operation[];
};

const CURRENCIES = startAssets.map(a => ({ value: a.code, label: `${a.name} (${a.code})`, listLabel: `${a.name} (${a.code})`, coin: a.coin }));
/** An invoice's amount: two decimals, the way prices are set; coins with more appear only in what was received */
const amountText = (value: number, code: string) => `${money(value)} ${code}`;
/** yyyy/mm/dd hh:mm:ss, as in Figma */
const stamp = (d: Date) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000);
/** A repeatable test id in the shape of a UUID */
const uuid = (seed: number) => {
  let value = seed * 7919 + 17;
  const hex = (len: number) => Array.from({ length: len }, () => { value = (value * 9301 + 49297) % 233280; return Math.floor((value / 233280) * 16).toString(16); }).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
};

const people = ['Rudy Kozey', 'Guadalupe Schimmel'];
export const startInvoices: Invoice[] = [
  [1237, 'EUR', 'Created', 1], [200, 'EUR', 'Created', 3], [25345, 'EUR', 'Payment awaiting', 6], [1237, 'EUR', 'Paid', 20, '0.29464091 BTC'],
  [320, 'EUR', 'Timeout', 30], [1237, 'EUR', 'Paid', 44, '1.65852492 ETH'], [800, 'USDT', 'Paid', 70, '800.00 USDT'], [1237, 'EUR', 'Deactivated', 96],
  [460, 'EUR', 'Paid', 140, '460.00 EUR'], [1237, 'EUR', 'Paid', 260, '0.29464091 BTC'], [95, 'USDC', 'Timeout', 400], [3100, 'EUR', 'Paid', 820, '1.59186493 ETH'],
].map(([amount, currency, status, hours, received], index) => ({
  id: uuid(index + 1), amount: amount as number, currency: currency as string, status: status as Status, createdAt: hoursAgo(hours as number),
  received: (received as string | undefined) ?? `0.00 ${currency}`, createdBy: people[index % 2], orderId: `RT-${1675 + index}-19${80 + index}`,
  autoConvert: index % 3 === 0, customer: ['First name', 'Last name', 'Email'],
  operations: status === 'Paid' ? [{ at: hoursAgo((hours as number) - 0.4), amount: received as string, network: (received as string).endsWith('BTC') ? 'Bitcoin' : (received as string).endsWith('EUR') ? 'SEPA' : 'Ethereum', status: 'Completed' }] : [],
}));

/* ---- The form's parts ---- */

/** A form section: a title, an Optional mark, a line under; the optional ones fold away */
function Section({ title, description, optional, open, onToggle, children }: {
  title: string; description: string; optional?: boolean; open?: boolean; onToggle?: () => void; children: ReactNode;
}) {
  const id = useId();
  const head = <>
    <span className="grg-ip-section__title">{title}</span>
    {optional && <Badge label="Optional" variant="light" size="sm" color="neutral" leftIcon={null} rightIcon={null} />}
  </>;
  return (
    <section className="grg-ip-section" aria-labelledby={`${id}-title`}>
      {onToggle ? (
        <h3 className="grg-ip-section__head" id={`${id}-title`}>
          <button type="button" className="grg-ip-section__toggle" aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
            {head}<Icon name={open ? 'direction-up' : 'direction-down'} size={20} />
          </button>
        </h3>
      ) : <h3 className="grg-ip-section__head" id={`${id}-title`}>{head}</h3>}
      {(open ?? true) && (
        <div id={`${id}-body`} className="grg-ip-section__body">
          <p className="grg-ip-section__description">{description}</p>
          {children}
        </div>
      )}
    </section>
  );
}

type Draft = {
  currency: string | null; amount: string; orderId: string; category: string; description: string; autoConvert: boolean;
  website: string; buttonText: string; fields: { name: string; on: boolean; custom?: boolean }[];
};
const emptyDraft = (): Draft => ({
  currency: 'USDC', amount: '', orderId: '', category: '', description: '', autoConvert: false, website: '', buttonText: '',
  fields: ['First name', 'Last name', 'Email', 'Address'].map(name => ({ name, on: false })),
});

/** Figma Customer details: the standard fields, the custom ones with edit and remove, and a new one typed in place
 *  (Figma opened a modal for it; a modal over a drawer breaks the rule, so it is a field in the drawer) */
function CustomerFields({ fields, onChange }: { fields: Draft['fields']; onChange: (fields: Draft['fields']) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState('');
  const save = () => {
    const value = name.trim();
    if (!value) return;
    onChange(editing === -1 ? [...fields, { name: value, on: true, custom: true }] : fields.map((f, i) => (i === editing ? { ...f, name: value } : f)));
    setEditing(null);
    setName('');
  };
  return (
    <>
      <div className="grg-ip-fields">
        {fields.map((field, index) => (
          <span key={index} className="grg-ip-fields__item">
            <CheckboxLabel label={field.name} checked={field.on} onChange={on => onChange(fields.map((f, i) => (i === index ? { ...f, on } : f)))} />
            {field.custom && <>
              <ActionButton icon="edit" size="sm" aria-label={`Edit ${field.name}`} onClick={() => { setEditing(index); setName(field.name); }} />
              <ActionButton icon="trash" size="sm" aria-label={`Remove ${field.name}`} onClick={() => onChange(fields.filter((_, i) => i !== index))} />
            </>}
          </span>
        ))}
      </div>
      {editing === null ? (
        <Button variant="text" size="sm" leftIcon="plus" className="grg-ip-fields__add" onClick={() => { setEditing(-1); setName(''); }}>Add custom field</Button>
      ) : (
        <div className="grg-ip-fields__new">
          <Input label="Field name" value={name} onValueChange={setName} autoFocus
            hint="A question or the information you want to ask for" onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); save(); } }} />
          <div className="grg-ip-fields__actions">
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!name.trim()} onClick={save}>{editing === -1 ? 'Add field' : 'Save'}</Button>
          </div>
        </div>
      )}
    </>
  );
}

function CreateForm({ draft, setDraft }: { draft: Draft; setDraft: (draft: Draft) => void }) {
  const [redirect, setRedirect] = useState(false);
  const [customer, setCustomer] = useState(true);
  const set = (part: Partial<Draft>) => setDraft({ ...draft, ...part });
  return (
    <>
      <Section title="Product info" description="Set up the product info">
        <div className="grg-ip-grid">
          <Select label="Currency" required type="coin" options={CURRENCIES} value={draft.currency} onChange={currency => set({ currency })} />
          <Input label="Amount" required value={draft.amount} unit={draft.currency ?? undefined}
            onValueChange={amount => set({ amount: amount.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1') })} inputMode="decimal" />
          <Input label="External order ID" value={draft.orderId} onValueChange={orderId => set({ orderId })} />
          <Input label="Product category" value={draft.category} onValueChange={category => set({ category })} />
        </div>
        <TextArea label="Product description" maxLength={1500} value={draft.description} onChange={event => set({ description: event.target.value })} />
        <SwitchLabel label="Auto-conversion" description="Payments turn into EUR as they arrive; the security deposit isn't converted"
          checked={draft.autoConvert} onChange={autoConvert => set({ autoConvert })} />
      </Section>
      <Section title="Redirect link" optional description="Redirect customers to your website" open={redirect} onToggle={() => setRedirect(!redirect)}>
        <div className="grg-ip-grid grg-ip-grid--one">
          <Input type="website" label="Website" value={draft.website} onValueChange={website => set({ website })}
            hint="Where the payment form sends people after the invoice is paid" />
          <Input label="Button text" value={draft.buttonText} onValueChange={buttonText => set({ buttonText })}
            hint="Not translated: keep it clear for all your customers" />
        </div>
      </Section>
      <Section title="Customer details" optional description="What buyers fill in on the payment page" open={customer} onToggle={() => setCustomer(!customer)}>
        <CustomerFields fields={draft.fields} onChange={fields => set({ fields })} />
      </Section>
    </>
  );
}

/* ---- An invoice: the result, the details, the operations ---- */

function PaymentLink({ invoice }: { invoice: Invoice }) {
  const { toast } = useMessages();
  const link = `https://pay.example.com/i/${invoice.id.slice(0, 18)}`;
  return (
    <div className="grg-ip-box grg-ip-box--row">
      <span className="grg-ip-link">
        <span className="grg-ip-link__key">Payment link</span>
        <span className="grg-ip-link__value">{link}</span>
      </span>
      <ActionButton icon="copy" size="sm" aria-label="Copy the payment link"
        onClick={() => { void navigator.clipboard?.writeText(link).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
    </div>
  );
}

function Summary({ invoice }: { invoice: Invoice }) {
  return (
    <div className="grg-ip-invoice">
      <span className="grg-ip-invoice__key">Invoice amount</span>
      <span className="grg-ip-invoice__amount">{amountText(invoice.amount, invoice.currency)}</span>
      <Badge label={invoice.status} variant="light" size="sm" color={STATUS_COLOR[invoice.status]} leftIcon={null} rightIcon={null} />
    </div>
  );
}

function Details({ invoice }: { invoice: Invoice }) {
  const paid = invoice.status === 'Paid';
  return (
    <>
      <Summary invoice={invoice} />
      <div className="grg-ip-grid">
        <div className="grg-ip-box"><span className="grg-ip-link__key">Received amount</span><span className="grg-ip-link__value">{invoice.received}</span></div>
        <div className="grg-ip-box"><span className="grg-ip-link__key">Amount left</span><span className="grg-ip-link__value">{paid ? `0.00 ${invoice.currency}` : amountText(invoice.amount, invoice.currency)}</span></div>
      </div>
      <PaymentLink invoice={invoice} />
      <AccordionKeyValue rows={[
        { key: 'Invoice ID', value: invoice.id },
        { key: 'Created at', value: stamp(invoice.createdAt) },
        { key: 'Created by', value: invoice.createdBy },
        { key: 'External order ID', value: invoice.orderId || '—' },
        { key: 'Invoice currency', value: invoice.currency },
        { key: 'Payment currency', value: paid ? invoice.received.split(' ').pop()! : '—' },
        { key: 'Auto-conversion', value: invoice.autoConvert ? 'On' : 'Off' },
        { key: 'Customer details', value: invoice.customer.length ? invoice.customer.join(', ') : '—' },
      ]} />
    </>
  );
}

function Operations({ invoice }: { invoice: Invoice }) {
  if (!invoice.operations.length) {
    return <div className="grg-ip-empty"><span className="grg-ip-empty__title">No operations yet</span><span>Payments for this invoice will appear here</span></div>;
  }
  return (
    <ul className="grg-ip-operations">
      {invoice.operations.map((op, index) => (
        <li key={index}>
          <span><span className="grg-ip-link__value">{op.amount}</span><span className="grg-ip-link__key">{stamp(op.at)} · {op.network}</span></span>
          <Badge label={op.status} variant="light" size="sm" color={op.status === 'Completed' ? 'success' : 'warning'} leftIcon={null} rightIcon={null} />
        </li>
      ))}
    </ul>
  );
}

/* ---- The list ---- */

function InvoicesTable({ invoices, onOpen, onDeactivate }: { invoices: Invoice[]; onOpen: (invoice: Invoice) => void; onDeactivate: (invoice: Invoice) => void }) {
  const { toast } = useMessages();
  const [query, setQuery] = useState('');
  const [currency, setCurrency] = useState('all');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState<Range | null>(null);
  const rows = invoices.filter(invoice => invoice.id.includes(query.trim().toLowerCase())
    && (currency === 'all' || invoice.currency === currency)
    && (status === 'all' || invoice.status === status)
    && (!period || (invoice.createdAt >= startOf(period[0]) && invoice.createdAt < shift(period[1], 1))));
  const columns: TableColumn<Invoice>[] = [
    { id: 'id', header: 'ID', width: '15%', cell: row => (
      <span className="grg-ip-copy">
        {/* Figma: the start of the ID; the copy button copies all of it */}
        <TableText title={`${row.id.slice(0, 11)}…`} />
        <ActionButton icon="copy" size="sm" aria-label={`Copy invoice ID ${row.id.slice(0, 8)}`}
          onClick={event => { event.stopPropagation(); void navigator.clipboard?.writeText(row.id).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
      </span>
    ) },
    { id: 'amount', header: 'Invoice amount', width: '14%', sortValue: row => row.amount, cell: row => <TableText title={amountText(row.amount, row.currency)} /> },
    { id: 'received', header: 'Received amount', width: '15%', cell: row => <TableText title={row.received} /> },
    { id: 'status', header: 'Status', width: '13%', cell: row => <Badge label={row.status} variant="light" size="sm" color={STATUS_COLOR[row.status]} leftIcon={null} rightIcon={null} /> },
    { id: 'created', header: 'Created at', width: '16%', sortValue: row => row.createdAt.getTime(), cell: row => <TableText title={stamp(row.createdAt)} /> },
    { id: 'by', header: 'Created by', cell: row => <TableText title={row.createdBy} /> },
  ];
  return (
    <div className="grg-ip-surface__section">
      <div className="grg-ip-toolbar">
        <Search size="sm" aria-label="Search invoices by ID" placeholder="Invoice ID" value={query} onChange={setQuery} className="grg-ip-toolbar__search" />
        <div className="grg-ip-toolbar__filters">
          <CompactSelect size="sm" aria-label="Invoice asset" value={currency} onChange={setCurrency}
            options={[{ value: 'all', label: 'All invoice assets' }, ...CURRENCIES.map(c => ({ ...c, label: c.value }))]} />
          <CompactSelect size="sm" aria-label="Status" value={status} onChange={setStatus}
            options={[{ value: 'all', label: 'All statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]} />
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>
      </div>
      <Table aria-label="Invoices" rows={rows} rowKey={row => row.id} rowLabel={row => `Invoice ${row.id.slice(0, 8)}, ${amountText(row.amount, row.currency)}`}
        columns={columns} onRowOpen={onOpen}
        actions={row => active(row.status) ? (
          <Button variant="text" size="xs" tone="destructive" onClick={event => { event.stopPropagation(); onDeactivate(row); }}
            aria-label={`Deactivate invoice ${row.id.slice(0, 8)}`}>Deactivate</Button>
        ) : null}
        empty={{ title: 'No invoices match these filters', subtitle: 'Try another asset, status or period' }} />
    </div>
  );
}

/* ---- The flow ---- */

type View = { kind: 'create' } | { kind: 'created'; id: string } | { kind: 'details'; id: string } | { kind: 'deactivate'; id: string };

export type InvoicesProps = {
  /** The account isn't verified yet, or its documents are being checked: invoices wait (the Figma empty states) */
  account?: 'verified' | 'not-verified' | 'verifying';
  /** Open with the Create invoice drawer */
  startCreating?: boolean;
};

/** The Invoices page with its drawer and modal, for any app that holds it (this page, the Dashboard's Create new invoice) */
export function useInvoices({ account = 'verified', startCreating = false }: InvoicesProps = {}) {
  const [invoices, setInvoices] = useState(startInvoices);
  const [view, setView] = useState<View | null>(startCreating ? { kind: 'create' } : null);
  const [draft, setDraft] = useState(emptyDraft);
  const [tab, setTab] = useState('details');
  const [page, setPage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Invoice | null>(null);
  const { toast } = useMessages();
  const find = (id: string) => invoices.find(i => i.id === id)!;

  const create = () => {
    setDraft(emptyDraft());
    setView({ kind: 'create' });
  };
  const submit = () => {
    const invoice: Invoice = {
      id: uuid(Date.now() % 100000), amount: Number(draft.amount), currency: draft.currency!, received: `0.00 ${draft.currency}`,
      status: 'Created', createdAt: new Date(), createdBy: people[0], orderId: draft.orderId, category: draft.category,
      autoConvert: draft.autoConvert, customer: draft.fields.filter(f => f.on).map(f => f.name), operations: [],
    };
    setInvoices(list => [invoice, ...list]);
    setView({ kind: 'created', id: invoice.id });
  };
  const deactivate = (id: string) => {
    setInvoices(list => list.map(i => (i.id === id ? { ...i, status: 'Deactivated' } : i)));
    toast({ status: 'success', title: 'Link deactivated', duration: 3000 });
  };
  const open = (invoice: Invoice) => { setTab('details'); setView({ kind: 'details', id: invoice.id }); };
  const close = () => setView(null);

  const valid = !!draft.currency && Number(draft.amount) > 0;
  const current = view && view.kind !== 'create' ? find(view.id) : null;
  const drawer = !view ? { title: '' } : view.kind === 'create' ? {
    title: 'Create invoice', size: 'sm' as const,
    content: <CreateForm draft={draft} setDraft={setDraft} />,
    primary: { label: 'Create invoice', disabled: !valid, onClick: submit }, secondary: { label: 'Cancel', onClick: close },
  } : view.kind === 'created' ? {
    title: 'Invoice created', description: 'Share the link with your customer', size: 'sm' as const,
    content: <><FeaturedIcon className="grg-ip-result-icon" type="success" icon="check-circle-filled" label="Created" /><Summary invoice={current!} /><PaymentLink invoice={current!} /></>,
    primary: { label: 'View invoice', onClick: () => open(current!) }, secondary: { label: 'Create another', onClick: create },
  } : view.kind === 'deactivate' ? {
    // Asked in the drawer: a modal over a drawer would break the rule
    title: 'Deactivate invoice link?', description: 'It won’t be possible to pay with a deactivated invoice link.', size: 'md' as const,
    content: <Summary invoice={current!} />, destructive: true,
    primary: { label: 'Deactivate', onClick: () => { deactivate(current!.id); setView({ kind: 'details', id: current!.id }); } },
    secondary: { label: 'Cancel', onClick: () => setView({ kind: 'details', id: current!.id }) },
  } : {
    title: 'Invoice details', size: 'md' as const,
    content: (
      <TabMenu aria-label="Invoice" value={tab} onChange={setTab}
        items={[{ id: 'details', label: 'Details' }, { id: 'operations', label: `Operations (${current!.operations.length})` }]}>
        {item => <div className="grg-ip-tab">{item.id === 'details' ? <Details invoice={current!} /> : <Operations invoice={current!} />}</div>}
      </TabMenu>
    ),
    extra: active(current!.status)
      ? <Button variant="text" size="md" tone="destructive" onClick={() => setView({ kind: 'deactivate', id: current!.id })}>Deactivate link</Button>
      : undefined,
    primary: { label: 'Open as a page', onClick: () => { setPage(current!.id); close(); } },
  };

  const pageInvoice = page ? find(page) : null;
  const content = account !== 'verified' ? (
    <main className="grg-ip-page">
      <h1 className="grg-ip-page__title">Invoices</h1>
      {/* Figma: a 3D picture above; here the system's Featured icon */}
      <div className="grg-ip-surface grg-ip-waiting">
        <FeaturedIcon size="lg" type={account === 'verifying' ? 'warning' : 'neutral'} icon={account === 'verifying' ? 'clock-circle-filled' : 'lock'} />
        <h2 className="grg-ip-waiting__title">{account === 'verifying' ? 'Verification in progress' : 'You can’t create an invoice yet'}</h2>
        <p className="grg-ip-waiting__text">{account === 'verifying' ? 'Please wait a little bit. We’ll let you know when it’s ready.' : 'This action will be available after successful verification'}</p>
        {account === 'not-verified' && <Button variant="primary" size="lg">Verify business</Button>}
      </div>
    </main>
  ) : pageInvoice ? (
    <main className="grg-ip-page">
      <div className="grg-ip-page__head">
        <span className="grg-ip-page__back">
          <ActionButton icon="arrow-left" aria-label="Back to invoices" onClick={() => setPage(null)} />
          <h1 className="grg-ip-page__title">Invoice details</h1>
        </span>
        {active(pageInvoice.status) && <Button variant="outline" tone="destructive" onClick={() => setConfirm(pageInvoice)}>Deactivate link</Button>}
      </div>
      <div className="grg-ip-invoice-page">
        <section className="grg-ip-card" aria-label="Invoice"><Details invoice={pageInvoice} /></section>
        <section className="grg-ip-card" aria-labelledby="operations-title">
          <h2 id="operations-title" className="grg-ip-card__title">Operations</h2>
          <Operations invoice={pageInvoice} />
        </section>
      </div>
    </main>
  ) : (
    <main className="grg-ip-page">
      <div className="grg-ip-page__head">
        <h1 className="grg-ip-page__title">Invoices</h1>
        <span className="grg-ip-page__actions">
          {/* No export in this demo: the button stays, as in Figma, without an action */}
          <Button variant="outline" leftIcon="download">Download</Button>
          <Button variant="primary" leftIcon="plus" onClick={create}>Create invoice</Button>
        </span>
      </div>
      <div className="grg-ip-surface">
        <InvoicesTable invoices={invoices} onOpen={open} onDeactivate={setConfirm} />
      </div>
    </main>
  );

  return {
    create,
    content,
    overlays: <>
      {/* One drawer for the whole task (Drawer: one task, one drawer): creating, its result, the details, deactivating */}
      <Drawer appendTo="self" visible={!!view} onHide={close} title={drawer.title} description={'description' in drawer ? drawer.description : undefined}
        size={'size' in drawer ? drawer.size : 'sm'} destructive={'destructive' in drawer ? drawer.destructive : false}
        footerType={'extra' in drawer && drawer.extra ? 'button' : 'basic'} footerExtra={'extra' in drawer ? drawer.extra : undefined}
        primaryAction={'primary' in drawer ? drawer.primary : undefined} secondaryAction={'secondary' in drawer ? drawer.secondary : undefined}>
        {'content' in drawer ? drawer.content : null}
      </Drawer>
      {/* From the list or the details page: the Figma confirmation modal */}
      <Modal appendTo="self" visible={!!confirm} onHide={() => setConfirm(null)} status="error" statusIcon="remove-circle-filled"
        title="Deactivate invoice link?" description="It won’t be possible to pay with a deactivated invoice link." destructive footerType="fill"
        primaryAction={{ label: 'Deactivate', onClick: () => { deactivate(confirm!.id); setConfirm(null); } }}
        secondaryAction={{ label: 'Cancel', onClick: () => setConfirm(null) }} />
    </>,
  };
}

function InvoicesApp(props: InvoicesProps) {
  const invoices = useInvoices(props);
  return <><AppFrame current="invoices">{invoices.content}</AppFrame>{invoices.overlays}</>;
}

/** The Invoices page, creating an invoice in a drawer, its details, deactivating a link: one working flow */
export function InvoicesFlow(props: InvoicesProps) {
  return <MessagesProvider appendTo="self"><InvoicesApp {...props} /></MessagesProvider>;
}
