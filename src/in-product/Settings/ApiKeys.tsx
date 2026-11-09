import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { useMessages } from '../../components/Alert/Messages';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CheckboxLabel } from '../../components/CheckboxLabel/CheckboxLabel';
import { Chip } from '../../components/Chip/Chip';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import { Input } from '../../components/Input/Input';
import { Modal, type ModalProps } from '../../components/Modal/Modal';
import { MultiValueInput } from '../../components/MultiValueInput/MultiValueInput';
import { Table, TableText, type TableColumn } from '../../components/Table/Table';
import keyImage from '../../assets/in-product/api-key.png';

/* GRX Pay redesign, file "Global Settings", section Settings - API key (372:45298): no keys yet, Create API key with
   its permissions and IP white list, the keys once (with a QR code), the list with each key opening under its row,
   Delete and Delete all. Test keys only, made up in the browser. */

type Scope = 'deposit' | 'invoicing' | 'read' | 'withdrawal';
const SCOPES: { id: Scope; label: string; short: string; description: string }[] = [
  { id: 'deposit', label: 'Deposit', short: 'Deposit', description: 'Allows requesting a crypto address to add funds.' },
  { id: 'invoicing', label: 'Invoicing create', short: 'Invoicing', description: 'Enables the creation of new invoices.' },
  { id: 'read', label: 'Read', short: 'Read', description: 'Allows viewing of transactions, balances and invoices.' },
  { id: 'withdrawal', label: 'Withdrawal', short: 'Withdrawal', description: 'Allows withdrawals from your account to external accounts or wallets.' },
];

export type ApiKey = { id: string; name: string; scopes: Scope[]; ips: string[]; apiKey: string; publicKey: string; privateKey: string };

/** A random test key in the shape of a real one (base64 letters) */
const randomKey = (length: number) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...bytes)).slice(0, length);
};
const newKey = (name: string, scopes: Scope[], ips: string[]): ApiKey => ({
  id: randomKey(8), name, scopes, ips, apiKey: randomKey(40), publicKey: randomKey(44), privateKey: randomKey(88),
});

/** IPv4 (four numbers 0–255) or IPv6 (hex groups with colons, :: allowed once) */
const isIp = (value: string) => {
  const v4 = value.split('.');
  if (v4.length === 4) return v4.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
  if (!value.includes(':') || (value.match(/::/g) ?? []).length > 1) return false;
  const groups = value.split(':');
  return groups.length <= 8 && groups.every(group => /^[0-9a-f]{0,4}$/i.test(group)) && (value.includes('::') || groups.length === 8);
};

const startKeys = (): ApiKey[] => [
  { ...newKey('Online shop', ['deposit', 'invoicing'], ['201.195.88.21', '91.196.103.42', '71.196.103.49']) },
];

/** The QR code of a secret: black on white whatever the theme, so a camera reads it */
function Qr({ text, label }: { text: string; label: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    void QRCode.toDataURL(text, { margin: 1, width: 240, color: { dark: '#0a0a0a', light: '#ffffff' } }).then(setSrc);
  }, [text]);
  return <span className="grg-ip-qr">{src && <img src={src} alt={label} />}</span>;
}

type Draft = { id?: string; name: string; scopes: Scope[]; ips: string[] };
type View =
  | { kind: 'form'; draft: Draft } | { kind: 'ips'; draft: Draft; ips: string[]; error?: string }
  | { kind: 'created'; key: ApiKey } | { kind: 'delete'; key: ApiKey } | { kind: 'delete-all' };

/** The API key tab and its modal, for the Settings page */
export function useApiKeys({ start = 'some' }: { start?: 'none' | 'some' } = {}) {
  const [keys, setKeys] = useState<ApiKey[]>(() => (start === 'none' ? [] : startKeys()));
  const [view, setView] = useState<View | null>(null);
  const { toast } = useMessages();
  const close = () => setView(null);
  const create = () => setView({ kind: 'form', draft: { name: '', scopes: [], ips: [] } });

  const save = (draft: Draft) => {
    if (draft.id) {
      setKeys(list => list.map(k => (k.id === draft.id ? { ...k, name: draft.name.trim(), scopes: draft.scopes, ips: draft.ips } : k)));
      close();
      toast({ status: 'success', title: 'API key updated', duration: 3000 });
      return;
    }
    const key = newKey(draft.name.trim(), draft.scopes, draft.ips);
    setKeys(list => [...list, key]);
    setView({ kind: 'created', key });
  };

  const columns: TableColumn<ApiKey>[] = [
    { id: 'name', header: 'Key name', width: '28%', cell: row => (
      <TableText priority="leading" orientation="horizontal" title={row.name} leading={<FeaturedIcon type="warning" filled size="sm" icon="key" />} />
    ) },
    { id: 'public', header: 'Public key', width: '42%', cell: row => (
      <span className="grg-ip-copy">
        <TableText title={`${row.publicKey.slice(0, 32)}…`} />
        <ActionButton icon="copy" size="sm" aria-label={`Copy public key of ${row.name}`}
          onClick={() => { void navigator.clipboard?.writeText(row.publicKey).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
      </span>
    ) },
    { id: 'status', header: 'Status', cell: () => <Badge label="Active" variant="light" size="sm" color="success" leftIcon={null} rightIcon={null} /> },
  ];

  const tab = keys.length === 0 ? (
    <div className="grg-ip-surface grg-ip-waiting">
      <img className="grg-ip-waiting__image" src={keyImage} alt="" />
      <h2 className="grg-ip-waiting__title">API Key</h2>
      <p className="grg-ip-waiting__text">Integrate API Key to streamline your payment flow</p>
      <Button variant="primary" size="lg" onClick={create}>Create API key</Button>
    </div>
  ) : (
    <div className="grg-ip-surface grg-ip-surface--fit">
      <div className="grg-ip-setting">
        <div className="grg-ip-setting__head">
          <span className="grg-ip-keys__intro">
            <FeaturedIcon type="neutral" size="md" icon="key" />
            <span className="grg-ip-setting__text">
              <h2 className="grg-ip-setting__title">API Key</h2>
              <p className="grg-ip-setting__line">API keys allow you to perform automatic actions with your account using your own software</p>
            </span>
          </span>
          <Button variant="primary" size="sm" onClick={create}>Create API key</Button>
        </div>
      </div>
      <hr className="grg-ip-surface__divider" />
      <div className="grg-ip-setting">
        <div className="grg-ip-setting__head grg-ip-setting__head--center">
          <h2 className="grg-ip-setting__title">My API Keys</h2>
          <Button variant="text" size="sm" tone="destructive" onClick={() => setView({ kind: 'delete-all' })}>Delete all</Button>
        </div>
        <Table aria-label="My API keys" rows={keys} rowKey={row => row.id} rowLabel={row => row.name} columns={columns}
          actions={row => (
            <>
              <ActionButton icon="pencil" size="sm" aria-label={`Edit ${row.name}`}
                onClick={() => setView({ kind: 'form', draft: { id: row.id, name: row.name, scopes: row.scopes, ips: row.ips } })} />
              <ActionButton icon="trash" size="sm" color="red" aria-label={`Delete ${row.name}`} onClick={() => setView({ kind: 'delete', key: row })} />
            </>
          )}
          expansion={row => (
            <dl className="grg-ip-key-more">
              <dt>Allowed operations:</dt>
              <dd>{row.scopes.map(s => <Badge key={s} label={SCOPES.find(x => x.id === s)!.short} variant="light" size="sm" color="neutral" leftIcon={null} rightIcon={null} />)}</dd>
              <dt>IP white list:</dt>
              <dd>{row.ips.length ? row.ips.map(ip => <Badge key={ip} label={ip} variant="light" size="sm" color="neutral" leftIcon={null} rightIcon={null} />) : 'Any IP address'}</dd>
            </dl>
          )} />
      </div>
    </div>
  );

  /* ---- The modal: one at a time; the IP list is a step of the form, with Back ---- */
  let modal: Omit<ModalProps, 'lead' | 'tint'> | null = null;
  const base = { visible: true, onHide: close, appendTo: 'self' as const };
  if (view?.kind === 'form') {
    const { draft } = view;
    const set = (next: Partial<Draft>) => setView({ kind: 'form', draft: { ...draft, ...next } });
    const ready = draft.name.trim() !== '' && draft.scopes.length > 0;
    modal = { ...base, title: draft.id ? 'Edit API key' : 'Create API key', footerType: 'fill',
      primaryAction: { label: draft.id ? 'Save changes' : 'Create API key', disabled: !ready, onClick: () => save(draft) },
      children: <>
        <Input label="Key name" required value={draft.name} onValueChange={name => set({ name })} />
        <h3 className="grg-ip-keys__group">API Key permissions</h3>
        {SCOPES.map(scope => (
          <CheckboxLabel key={scope.id} flip label={scope.label} description={scope.description} checked={draft.scopes.includes(scope.id)}
            onChange={on => set({ scopes: on ? [...draft.scopes, scope.id] : draft.scopes.filter(s => s !== scope.id) })} />
        ))}
        <div className="grg-ip-keys__ips">
          <span className="grg-ip-keys__ips-head">
            IP White list
            <Button variant="text" size="sm" leftIcon={draft.ips.length ? 'pencil' : 'plus'} aria-label={draft.ips.length ? 'Edit IP white list' : 'Create IP white list'}
              onClick={() => setView({ kind: 'ips', draft, ips: draft.ips })}>{draft.ips.length ? 'Edit' : 'Create'}</Button>
          </span>
          {draft.ips.length > 0 && <span className="grg-ip-keys__chips">{draft.ips.map(ip => <Chip key={ip} label={ip} size="sm" variant="outlined" />)}</span>}
        </div>
      </> };
  } else if (view?.kind === 'ips') {
    const v = view;
    modal = { ...base, title: 'IP white list', description: 'To add an IP address to the white list, type it in and press Enter',
      onBack: () => setView({ kind: 'form', draft: v.draft }), footerType: 'fill',
      primaryAction: { label: 'Save list', onClick: () => setView({ kind: 'form', draft: { ...v.draft, ips: v.ips } }) },
      children: (
        <MultiValueInput label="IP address" value={v.ips} error={v.error} hint="IPv4 or IPv6, such as 201.195.88.21"
          // Only digits, dots, colons and hex letters can be typed; an address that isn't valid isn't added
          keyfilter={/[0-9a-fA-F.:]/}
          onChange={ips => {
            const wrong = ips.find(ip => !isIp(ip));
            setView({ ...v, ips: ips.filter(isIp), error: wrong ? `${wrong} isn’t a valid IP address` : undefined });
          }} />
      ) };
  } else if (view?.kind === 'created') {
    const { key } = view;
    modal = { ...base, title: 'The key has been successfully generated', description: 'Attention! Scan or rewrite the secret key and do not disclose it to untrusted persons!',
      footerType: 'fill', primaryAction: { label: 'Okay', onClick: close },
      children: <>
        <Qr text={key.privateKey} label={`QR code of the private key of ${key.name}`} />
        <Input type="button" label="API Key" leftIcon={null} readOnly value={key.apiKey} action="copy" copyLabel="Copy API key" />
        <Input type="button" label="Public Key" leftIcon={null} readOnly value={key.publicKey} action="copy" copyLabel="Copy public key" />
        <Input type="button" label="Private Key" leftIcon={null} readOnly value={key.privateKey} action="copy" copyLabel="Copy private key"
          hint="Shown only once: save it now" />
      </> };
  } else if (view?.kind === 'delete') {
    const { key } = view;
    modal = { ...base, title: 'Delete API key?', description: `Are you sure you want to delete the key: ${key.name}?`,
      status: 'error', statusIcon: 'remove-circle-filled', destructive: true, footerType: 'fill',
      primaryAction: { label: 'Delete', onClick: () => { setKeys(list => list.filter(k => k.id !== key.id)); close(); toast({ status: 'success', title: 'API key deleted', duration: 3000 }); } },
      secondaryAction: { label: 'Cancel', onClick: close } };
  } else if (view?.kind === 'delete-all') {
    modal = { ...base, title: 'Delete all API keys?', description: 'Are you sure you want to delete all company API keys?',
      status: 'error', statusIcon: 'remove-circle-filled', destructive: true, footerType: 'fill',
      primaryAction: { label: 'Delete', onClick: () => { setKeys([]); close(); toast({ status: 'success', title: 'All API keys deleted', duration: 3000 }); } },
      secondaryAction: { label: 'Cancel', onClick: close } };
  }

  return { tab, overlays: <Modal {...(modal ?? { ...base, visible: false, title: '' })} /> };
}
