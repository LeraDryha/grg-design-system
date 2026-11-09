import { useState, type ReactNode } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { ImageCrop, cropImage, defaultCrop, type Crop } from '../../components/FileUpload/ImageCrop';
import { Modal, type ModalProps } from '../../components/Modal/Modal';
import { RadioGroup } from '../../components/Radio/Radio';
import { RadioLabel } from '../../components/RadioLabel/RadioLabel';
import { Search } from '../../components/Search/Search';
import { TabMenu } from '../../components/TabMenu/TabMenu';
import { TextArea } from '../../components/TextArea/TextArea';
import { AppFrame } from '../shared/AssetsApp';
import { pad } from '../shared/period';
import { useApiKeys } from './ApiKeys';
import { YOU, startMembers, type Member, type MembersState } from '../Members/Members';
import settingsImage from '../../assets/in-product/settings.png';
import verifyingImage from '../../assets/in-product/verification-in-progress.png';

/* GRX Pay redesign, file "Global Settings": Settings - empty (372:42877), the states before and during verification;
   Settings - Account (372:42976): the company's profile and logo (Upload photo flow, 372:79594), its owner and its
   contact for buyers. The other tabs (API key, Payment settings, Exchange rate) come next. Test data only. */

export type SettingsProps = {
  /** Verified: the settings. Not verified: they open after verification. Verifying: the documents are being checked */
  account?: 'verified' | 'not-verified' | 'verifying';
  /** Saving the owner or the contact fails, to show the error toast */
  failing?: boolean;
  /** The API key tab starts with a key, or with none (its empty state) */
  apiKeys?: 'none' | 'some';
  /** The tab open at first */
  tab?: 'account' | 'api';
};

const MB = 1024 * 1024;
const LOGO_TEXT = 'Your uploaded logo will be shown on the payment checkout';
const CONTACT_TEXT = 'Add a support link or any contact info. Buyers see it on the payment receipt';
const ERROR = 'Something went wrong, please try again';
const COMPANY_ID = '03d72e62-2530-4ff7-87e9-aa9839090e34';
const long = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

type Logo = { src: string; original: string; crop: Crop };
type View =
  | { kind: 'upload' } | { kind: 'crop'; src: string; crop: Crop } | { kind: 'edit-logo'; src: string; crop: Crop }
  | { kind: 'owner'; chosen: string | null; query: string } | { kind: 'confirm-owner'; chosen: string }
  | { kind: 'contact'; text: string; error?: string };

/** One part of the Account card: a title, a line under it, the value, and its button on the right (Figma) */
function Section({ title, text, action, children }: { title: string; text: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <section className="grg-ip-setting" aria-label={title}>
      <div className="grg-ip-setting__head">
        <span className="grg-ip-setting__text">
          <h2 className="grg-ip-setting__title">{title}</h2>
          <p className="grg-ip-setting__line">{text}</p>
        </span>
        {action}
      </div>
      {children && <div className="grg-ip-setting__value">{children}</div>}
    </section>
  );
}

/** The Settings page and its modal, for any app that holds it. An app that also shows Members passes one list to
 *  both, so a new owner shows there too */
export function useSettings({ account = 'verified', failing = false, apiKeys = 'some', tab: startTab = 'account' }: SettingsProps = {}, shared?: MembersState) {
  const own = useState(startMembers);
  const [members, setMembers] = shared ?? own;
  const [logo, setLogo] = useState<Logo | null>(null);
  const [contact, setContact] = useState('https://t.me/company_support');
  const [view, setView] = useState<View | null>(null);
  const [tab, setTab] = useState<string>(startTab);
  const api = useApiKeys({ start: apiKeys });
  const { toast } = useMessages();
  const close = () => setView(null);
  const owner = members.find(m => m.role === 'Owner');
  const youOwn = owner?.email === YOU;
  const registered = members.find(m => m.email === YOU)?.addedAt ?? new Date();

  if (account !== 'verified') {
    const verifying = account === 'verifying';
    return {
      overlays: null,
      content: (
        <main className="grg-ip-page">
          <h1 className="grg-ip-page__title">Settings</h1>
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
  // Who can become the owner: confirmed members, not you and not someone still invited
  const candidates = members.filter((m: Member) => m.email !== YOU && !m.waiting && m.role !== 'Owner');
  const setOwner = (email: string) => {
    close();
    if (failing) { toast({ status: 'warning', title: ERROR, duration: 5000 }); return; }
    setMembers(list => list.map(m => (m.email === email ? { ...m, role: 'Owner' } : m.role === 'Owner' ? { ...m, role: 'Admin' } : m)));
    toast({ status: 'success', title: 'New owner is set successfully', duration: 5000 });
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

  /* ---- The Account tab ---- */
  const avatar = <Avatar size={120} shape="company" src={logo?.src} status="edit" decorative />;
  const accountTab = (
    <div className="grg-ip-surface grg-ip-surface--fit">
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
      <hr className="grg-ip-surface__divider" />
      <Section title="Company owner" text="Owner has full access to the company profile"
        // Only the owner hands ownership on: once it's someone else, the button is gone
        action={youOwn ? <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => setView({ kind: 'owner', chosen: null, query: '' })}>Change owner</Button> : undefined}>
        {owner?.email}
      </Section>
      <hr className="grg-ip-surface__divider" />
      <Section title="Company contact" text="Provide buyers with company contact details for payment-related matters at checkout"
        action={<Button variant="secondary" size="sm" leftIcon={contact ? 'pencil' : 'plus'} onClick={() => setView({ kind: 'contact', text: contact })}>{contact ? 'Edit contact' : 'Add contact'}</Button>}>
        {contact || undefined}
      </Section>
    </div>
  );

  const content = (
    <main className="grg-ip-page">
      <h1 className="grg-ip-page__title">Settings</h1>
      {/* The other tabs come with the next screens: shown, not available yet */}
      <TabMenu aria-label="Settings" value={tab} onChange={setTab} items={[
        { id: 'account', label: 'Account' },
        { id: 'api', label: 'API key' },
        { id: 'payments', label: 'Payment settings', disabled: true },
        { id: 'rates', label: 'Exchange rate', disabled: true },
      ]}>
        {item => (item.id === 'account' ? <div className="grg-ip-tab-panel">{accountTab}</div> : item.id === 'api' ? <div className="grg-ip-tab-panel">{api.tab}</div> : null)}
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
  } else if (view?.kind === 'owner') {
    const v = view;
    const q = v.query.trim().toLowerCase();
    const shown = candidates.filter(m => !q || m.email.includes(q));
    modal = { ...base, title: 'Change the owner', description: 'Choose a company user to set up as a company owner. The previous owner will be set up as an Admin.',
      footerType: 'fill', primaryAction: { label: 'Save changes', disabled: !v.chosen, onClick: () => setView({ kind: 'confirm-owner', chosen: v.chosen! }) },
      children: <>
        <Search size="md" aria-label="Search members by email" placeholder="Email" value={v.query} onChange={query => setView({ ...v, query })} />
        {shown.length ? (
          <RadioGroup label="Members" className="grg-ip-owner-list" value={v.chosen} onChange={chosen => setView({ ...v, chosen })}>
            {shown.map(m => <RadioLabel key={m.email} flip value={m.email} label={m.email} />)}
          </RadioGroup>
        ) : <p className="grg-ip-setting__line">No members with this email</p>}
      </> };
  } else if (view?.kind === 'confirm-owner') {
    const v = view;
    modal = { ...base, title: `Make ${v.chosen} the owner?`, description: 'You will become an Admin and won’t be able to change the owner again.',
      status: 'warning', statusIcon: 'warning-error-filled', onBack: () => setView({ kind: 'owner', chosen: v.chosen, query: '' }), footerType: 'fill',
      primaryAction: { label: 'Make owner', onClick: () => setOwner(v.chosen) }, secondaryAction: { label: 'Cancel', onClick: close } };
  } else if (view?.kind === 'contact') {
    const v = view;
    modal = { ...base, title: contact ? 'Edit contact' : 'Add contact', description: CONTACT_TEXT, footerType: 'fill',
      primaryAction: { label: 'Save', onClick: () => saveContact(v.text) },
      children: <TextArea label="Contact" floatingLabel={false} maxLength={200} counter autoFocus value={v.text} error={v.error}
        onChange={event => setView({ kind: 'contact', text: event.target.value })} /> };
  }

  return {
    content,
    overlays: <><Modal {...(modal ?? { ...base, visible: false, title: '' })} />{api.overlays}</>,
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
