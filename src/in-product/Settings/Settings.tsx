import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { ImageCrop, cropImage, defaultCrop, type Crop } from '../../components/FileUpload/ImageCrop';
import { Modal, type ModalProps } from '../../components/Modal/Modal';
import { SettingsList, SettingsRow } from '../../components/SettingsRow/SettingsRow';
import { TabMenu } from '../../components/TabMenu/TabMenu';
import { TextArea } from '../../components/TextArea/TextArea';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { AppFrame } from '../shared/AssetsApp';
import { formatDateTime } from '../../locale/format';
import { useApiKeys } from './ApiKeys';
import { usePaymentSettings } from './PaymentSettings';
import { useExchangeRate } from './ExchangeRate';
import { YOU, personName, startMembers, type MembersState } from '../Members/Members';
import { useAccount } from '../shared/account';
import settingsImage from '../../assets/in-product/settings.png';
import verifyingImage from '../../assets/in-product/verification-in-progress.png';

/* GRX Pay redesign, file "Global Settings": Settings - empty (372:42877), the states before and during verification;
   Settings - Account (372:42976): the company's profile and logo (Upload photo flow, 372:79594), its owner and its
   contact for buyers; API key, Payment settings and Exchange rate in their own files. Test data only. */

export type SettingsProps = {
  /** Verified: the settings. Not verified: they open after verification. Verifying: the documents are being checked */
  account?: 'verified' | 'not-verified' | 'verifying';
  /** Saving the contact fails, to show the error toast */
  failing?: boolean;
  /** The API key tab starts with a key, or with none (its empty state) */
  apiKeys?: 'none' | 'some';
  /** The tab open at first */
  tab?: 'account' | 'api' | 'payments' | 'rates';
};

const MB = 1024 * 1024;
const LOGO_TEXT = 'Your uploaded logo will be shown on the payment checkout';
const CONTACT_TEXT = 'Add a support link or any contact info. Buyers see it on the payment receipt';
const ERROR = 'Something went wrong, please try again';
const COMPANY_ID = '03d72e62-2530-4ff7-87e9-aa9839090e34';
const long = (d: Date) => formatDateTime(d);

type Logo = { src: string; original: string; crop: Crop };
type View =
  | { kind: 'upload' } | { kind: 'crop'; src: string; crop: Crop } | { kind: 'edit-logo'; src: string; crop: Crop }
  | { kind: 'contact'; text: string; error?: string };

/** The Settings page and its modal, for any app that holds it. An app that also shows Members passes one list to
 *  both, so a new owner shows there too */
export function useSettings({ account = 'verified', failing = false, apiKeys = 'some', tab: startTab = 'account' }: SettingsProps = {}, shared?: MembersState,
  /** Opens Members, where the owner hands ownership on; an app without Members leaves it out */
  onMembers?: () => void) {
  const own = useState(startMembers);
  const [members] = shared ?? own;
  const [logo, setLogo] = useState<Logo | null>(null);
  const [contact, setContact] = useState('https://t.me/company_support');
  const [view, setView] = useState<View | null>(null);
  const [tab, setTab] = useState<string>(startTab);
  const api = useApiKeys({ start: apiKeys });
  const payments = usePaymentSettings();
  const rates = useExchangeRate({ fixedSumOn: payments.fixedSumOn });
  const { toast } = useMessages();
  const close = () => setView(null);
  const owner = members.find(m => m.role === 'Owner');
  const you = useAccount();
  const registered = members.find(m => m.email === YOU)?.addedAt ?? new Date();

  if (account !== 'verified') {
    const verifying = account === 'verifying';
    return {
      overlays: null,
      content: (
        <main className="grg-ip-page">
          <PageHeader title="Settings" />
          <div className="grg-ip-surface grg-ip-waiting">
            <img className="grg-ip-waiting__image" src={verifying ? verifyingImage : settingsImage} alt="" />
            <h2 className="grg-ip-waiting__title">{verifying ? 'Verification in progress' : 'Company settings'}</h2>
            <p className="grg-ip-waiting__text">
              {verifying ? 'Please wait a little bit. We’ll let you know when it’s ready.' : 'Settings will be available after successful verification'}
            </p>
            {/* No verification in this demo: the button stays, as on Transactions, without an action */}
            {!verifying && <Button variant="primary" size="lg" rightIcon="arrow-right">Verify business to get started</Button>}
          </div>
        </main>
      ),
    };
  }

  /* ---- Actions ---- */
  const saveLogo = async (src: string, crop: Crop) => {
    setLogo({ src: await cropImage(src, crop), original: src, crop });
    close();
  };
  const removeLogo = () => {
    const removed = logo;
    setLogo(null);
    toast({ status: 'success', title: 'Logo removed', actionLabel: 'Undo', onAction: () => setLogo(removed) });
  };
  const saveContact = (text: string) => {
    const value = text.trim();
    if (!value && !contact) { setView({ kind: 'contact', text, error: 'Contact is a required field' }); return; }
    close();
    if (failing) { toast({ status: 'warning', title: ERROR, duration: 5000 }); return; }
    const title = !value ? 'Support contact removed' : contact ? 'Support contact edited successfully' : 'Support contact added successfully';
    setContact(value);
    toast({ status: 'success', title, duration: 5000 });
  };

  /* ---- The Company tab ---- */
  const avatar = <Avatar size={120} shape="company" src={logo?.src} status="edit" decorative />;
  const accountTab = (
    <SettingsList className="grg-ip-surface grg-ip-surface--fit">
      <div className="grg-ip-profile">
        {/* The avatar's container is the button; its edit badge stays a picture (Avatar rule) */}
        {logo ? (
          <DropdownMenu aria-label="Logo" width={160} items={[
            { label: 'Edit logo', onSelect: () => setView({ kind: 'edit-logo', src: logo.original, crop: logo.crop }) },
            { label: 'Remove', destructive: true, onSelect: removeLogo },
          ]} trigger={props => <button type="button" className="grg-avatar-button" aria-label="Logo" {...props}>{avatar}</button>} />
        ) : (
          <button type="button" className="grg-avatar-button" aria-label="Upload logo" onClick={() => setView({ kind: 'upload' })}>{avatar}</button>
        )}
        <div className="grg-ip-profile__text">
          <p className="grg-ip-profile__name">
            My Company
            <Badge label="Business verified" variant="light" size="md" color="success" leftIcon={null} rightIcon={null} />
          </p>
          <dl className="grg-ip-profile__facts">
            <dt>Registered</dt><dd>{long(registered)}</dd>
            <dt>Company ID</dt>
            <dd className="grg-ip-copy">
              <span>{COMPANY_ID}</span>
              <ActionButton icon="copy" size="sm" aria-label="Copy company ID"
                onClick={() => { void navigator.clipboard?.writeText(COMPANY_ID).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
            </dd>
          </dl>
        </div>
      </div>
      {/* Shown here, handed on in Members with the rest of the team's roles (after the audit) */}
      <SettingsRow layout="below" title="Company owner" description="Owner has full access to the company profile. Ownership is transferred in Members"
        action={onMembers ? <Button variant="secondary" size="sm" onClick={onMembers}>Open Members</Button> : undefined}
        // The name, the address under it (after the audit: the same as in Members)
        value={owner && <><span>{owner.email === YOU ? you.name : personName(owner.email, members)}</span><p className="grg-ip-setting__line">{owner.email}</p></>} />
      <SettingsRow layout="below" title="Company contact" description="Provide buyers with company contact details for payment-related matters at checkout"
        // A row's button is a short verb without an icon, as on Profile and Payment settings (after the audit)
        action={<Button variant="secondary" size="sm" aria-label={contact ? 'Edit contact' : 'Add contact'} onClick={() => setView({ kind: 'contact', text: contact })}>{contact ? 'Edit' : 'Add'}</Button>}
        value={contact || undefined} />
    </SettingsList>
  );

  const content = (
    <main className="grg-ip-page">
      <PageHeader title="Settings" />
      <TabMenu aria-label="Settings" value={tab} onChange={setTab} items={[
        { id: 'account', label: 'Company' },
        { id: 'api', label: 'API key' },
        { id: 'payments', label: 'Payment settings' },
        { id: 'rates', label: 'Exchange rate' },
      ]}>
        {item => (item.id === 'account' ? <div className="grg-ip-tab-panel">{accountTab}</div> : item.id === 'api' ? <div className="grg-ip-tab-panel">{api.tab}</div>
          : item.id === 'payments' ? <div className="grg-ip-tab-panel">{payments.tab}</div>
          : <div className="grg-ip-tab-panel">{rates.tab}</div>)}
      </TabMenu>
    </main>
  );

  /* ---- The modal: one at a time, its content follows the task ---- */
  let modal: Omit<ModalProps, 'lead' | 'tint'> | null = null;
  const base = { visible: true, onHide: close, appendTo: 'self' as const };
  if (view?.kind === 'upload') {
    modal = { ...base, title: 'Upload logo', description: LOGO_TEXT, children: (
      <FileUpload accept="image/png,image/jpeg,.svg" maxFileSize={5 * MB} hint="JPEG, JPG, PNG, SVG formats, up to 5 MB."
        onSelect={([file]) => setView({ kind: 'crop', src: URL.createObjectURL(file), crop: defaultCrop })} />
    ) };
  } else if (view?.kind === 'crop' || view?.kind === 'edit-logo') {
    const v = view;
    modal = { ...base, title: v.kind === 'crop' ? 'Upload logo' : 'Edit logo', description: LOGO_TEXT,
      onBack: v.kind === 'crop' ? () => setView({ kind: 'upload' }) : undefined, footerType: 'basic',
      primaryAction: { label: 'Save', onClick: () => { void saveLogo(v.src, v.crop); } }, secondaryAction: { label: 'Cancel', onClick: close },
      children: <ImageCrop src={v.src} label="Logo position" value={v.crop} onChange={crop => setView({ ...v, crop })} /> };
  } else if (view?.kind === 'contact') {
    const v = view;
    modal = { ...base, title: contact ? 'Edit contact' : 'Add contact', description: CONTACT_TEXT, footerType: 'fill',
      primaryAction: { label: 'Save', onClick: () => saveContact(v.text) },
      children: <TextArea label="Contact" floatingLabel={false} maxLength={200} counter autoFocus value={v.text} error={v.error}
        onChange={event => setView({ kind: 'contact', text: event.target.value })} /> };
  }

  return {
    content,
    overlays: <><Modal {...(modal ?? { ...base, visible: false, title: '' })} />{api.overlays}{payments.overlays}</>,
  };
}

function SettingsApp(props: SettingsProps) {
  const settings = useSettings(props);
  return <><AppFrame current="settings">{settings.content}</AppFrame>{settings.overlays}</>;
}

/** The Settings page: the company's logo, owner and contact; before verification and during it, its empty states */
export function SettingsFlow(props: SettingsProps) {
  return <MessagesProvider appendTo="self"><SettingsApp {...props} /></MessagesProvider>;
}
