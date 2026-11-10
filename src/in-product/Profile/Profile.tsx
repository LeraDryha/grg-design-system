import { useEffect, useState, type ReactNode } from 'react';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { MessagesProvider, useMessages } from '../../components/Alert/Messages';
import { Button } from '../../components/Button/Button';
import { FeaturedIcon } from '../../components/FeaturedIcon/FeaturedIcon';
import type { IconName } from '../../components/Icon/Icon';
import { Input } from '../../components/Input/Input';
import { InputOtp } from '../../components/InputOtp/InputOtp';
import { InteractionCard } from '../../components/InteractionCard/InteractionCard';
import { Link } from '../../components/Link/Link';
import { Modal, type ModalProps } from '../../components/Modal/Modal';
import { SwitchLabel } from '../../components/SwitchLabel/SwitchLabel';
import { TabMenu } from '../../components/TabMenu/TabMenu';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { AppFrame } from '../shared/AssetsApp';
import { AccountContext, DEFAULT_ACCOUNT, type AccountController } from '../shared/account';
import { Qr } from '../Settings/ApiKeys';
import type { Category } from '../Notifications/Notifications';

/* GRX Pay redesign, file "Global Settings": Profile - Main info (382:30009), Profile - Security (382:30678) and
   Profile - Notification (382:31965, version 1: the switches in the rows). The person signed in: the owner from
   Members. Two-factor authentication takes any 6 digits in this demo; 000000 is a wrong code, 111111 an expired one. */

export type ProfileTab = 'main' | 'security' | 'notifications';
/** Email and In app for each kind of notification; In app drives the bell */
export type NotificationPrefs = Record<'signin' | 'invoices' | 'withdrawals' | 'deposits' | 'referrals' | 'conversion', { email: boolean; inApp: boolean }>;
export const startPrefs = (): NotificationPrefs => ({
  signin: { email: true, inApp: true }, invoices: { email: true, inApp: true }, withdrawals: { email: true, inApp: true },
  deposits: { email: false, inApp: true }, referrals: { email: true, inApp: true }, conversion: { email: false, inApp: true },
});
/** What the bell shows: the In app switches by notification category */
export const inAppOf = (prefs: NotificationPrefs): Partial<Record<Category, boolean>> => ({
  signin: prefs.signin.inApp, invoices: prefs.invoices.inApp, withdrawals: prefs.withdrawals.inApp, deposits: prefs.deposits.inApp, conversion: prefs.conversion.inApp,
});

const PERSONAL: [keyof NotificationPrefs, string, string][] = [['signin', 'Sign-in', 'Each time someone signs in to your account.']];
const COMPANY: [keyof NotificationPrefs, string, string][] = [
  ['invoices', 'Account replenishment', 'When an invoice is paid.'],
  ['withdrawals', 'Account withdrawals', 'When a withdrawal is completed, held or cancelled.'],
  ['deposits', 'Funds deposit', 'When a deposit arrives.'],
  ['referrals', 'Referral accruals', 'When a referral cashback is credited.'],
  ['conversion', 'Auto-conversions', 'When crypto is converted automatically.'],
];

const ROLE_TEXT: Record<string, string> = {
  Owner: 'Has full access to the company profile and is the only one who can hand ownership on.',
  Admin: 'Has access to all features, except changing the owner.',
};

const PHONE_CODES = [
  { value: 'UA', label: '+380', listLabel: 'Ukraine +380', country: 'ua' },
  { value: 'PL', label: '+48', listLabel: 'Poland +48', country: 'pl' },
  { value: 'DE', label: '+49', listLabel: 'Germany +49', country: 'de' },
  { value: 'GB', label: '+44', listLabel: 'United Kingdom +44', country: 'gb' },
  { value: 'BG', label: '+359', listLabel: 'Bulgaria +359', country: 'bg' },
  { value: 'US', label: '+1', listLabel: 'United States +1', country: 'us' },
] as const;

/** A secret in the shape of an authenticator's (base32), made in the browser */
const newSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => 'abcdefghijklmnopqrstuvwxyz234567'[b % 32]).join('');

/** One row of a card: an icon, the title and its line, the value, the button (Figma) */
function Row({ icon, title, text, value, action }: { icon?: IconName; title: string; text: string; value?: ReactNode; action?: ReactNode }) {
  return (
    <section className="grg-ip-pay__row grg-ip-pay__row--info" aria-label={title}>
      <span className="grg-ip-pay__about">
        {icon && <FeaturedIcon type="neutral" size="md" icon={icon} />}
        <span className="grg-ip-setting__text">
          <h2 className="grg-ip-pay__title">{title}</h2>
          <p className="grg-ip-pay__text">{text}</p>
        </span>
      </span>
      <span className="grg-ip-pay__value">{value}</span>
      <span className="grg-ip-pay__action">{action}</span>
    </section>
  );
}

/** A countdown before Click to resend shows, as in the Input Otp examples */
function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft(l => l - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);
  return { left, restart: () => setLeft(seconds) };
}

function Resend({ what, onResend }: { what: string; onResend: () => void }) {
  const { left, restart } = useCountdown(30);
  return (
    <span className="grg-ip-resend">
      Didn’t receive the {what}?
      {left > 0
        ? <span className="grg-ip-resend__wait">Resend in 0:{String(left).padStart(2, '0')}</span>
        : <Button variant="text" size="sm" onClick={() => { onResend(); restart(); }}>Click to resend</Button>}
    </span>
  );
}

type TwoFa = { method: 'google'; secret: string } | { method: 'sms'; phone: string } | null;
type View =
  | { kind: 'name'; first: string; last: string } | { kind: 'password' } | { kind: 'password-sent' }
  | { kind: 'choose' } | { kind: 'google'; secret: string; code: string; error?: string }
  | { kind: 'sms-phone'; country: string; number: string; error?: string } | { kind: 'sms-code'; phone: string; code: string; error?: string }
  | { kind: 'off'; code: string; error?: string };

/** The Profile page and its modal, for any app that holds it. `account` is the signed-in person and how to rename them */
export function useProfile({ account, setName, prefs, setPrefs, tab: startTab = 'main' }: {
  account: AccountController; setName: (name: string) => void;
  prefs: NotificationPrefs; setPrefs: (prefs: NotificationPrefs) => void; tab?: ProfileTab;
}) {
  const [tab, setTab] = useState<string>(startTab);
  const [twoFa, setTwoFa] = useState<TwoFa>(null);
  const [view, setView] = useState<View | null>(null);
  const { toast } = useMessages();
  const close = () => setView(null);
  const [first, ...rest] = account.name.split(' ');

  const turnedOn = (next: TwoFa) => {
    setTwoFa(next);
    close();
    // A result that needs no answer: a toast (the Modal rule), with the Figma advice
    toast({ status: 'success', title: 'Two-factor authentication is on', description: 'Keep it on: turning it off lowers the security of your account.', duration: 6000 });
  };
  const codeError = (code: string) => (code === '000000' ? 'Wrong code. Check the code and try again.' : code === '111111' ? 'This code has expired. Send a new one.' : undefined);

  /* ---- The tabs ---- */
  const main = (
    <div className="grg-ip-surface grg-ip-surface--fit">
      <Row icon="id-card" title="Name" text="Your full name, so we know how to address you" value={account.name}
        action={<Button variant="secondary" size="sm" onClick={() => setView({ kind: 'name', first, last: rest.join(' ') })}>Edit</Button>} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="mail" title="Email" text="This email address is used to sign in to your account" value={account.email} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="lock" title="Password" text="This password is used to sign in to your account" value={<span aria-label="Password hidden">••••••••••</span>}
        action={<Button variant="secondary" size="sm" onClick={() => setView({ kind: 'password' })}>Change</Button>} />
      <hr className="grg-ip-surface__divider" />
      <Row icon="user" title="Role" text="Your role in the company" value={(
        <span className="grg-ip-role">
          {account.role}
          <Tooltip title={ROLE_TEXT[account.role] ?? ''} side="top" purpose="description">
            <ActionButton icon="information-circle" size="xs" color="blue" aria-label={`About the ${account.role} role`} />
          </Tooltip>
        </span>
      )} />
    </div>
  );
  const security = (
    <div className="grg-ip-surface grg-ip-surface--fit">
      <Row icon="shield-check" title="Two-factor authentication (2FA)"
        text="Use Google Authenticator or SMS to protect your account. While 2FA is off, the codes for signing in, withdrawals and API keys come to your email."
        value={twoFa && <span className="grg-ip-on">{twoFa.method === 'google' ? 'Google Authenticator' : `SMS · ${twoFa.phone}`}</span>}
        action={twoFa
          ? <Button variant="secondary" size="sm" onClick={() => setView({ kind: 'off', code: '' })}>Turn off</Button>
          : <Button variant="primary" size="sm" onClick={() => setView({ kind: 'choose' })}>Turn on</Button>} />
    </div>
  );
  const switches = (list: typeof COMPANY) => list.map(([key, title, text]) => (
    <section key={key} className="grg-ip-pref" aria-label={title}>
      <span className="grg-ip-setting__text">
        <h3 className="grg-ip-pay__title">{title}</h3>
        <p className="grg-ip-pay__text">{text}</p>
      </span>
      <span className="grg-ip-pref__switches">
        <SwitchLabel label="Email" checked={prefs[key].email} onChange={email => setPrefs({ ...prefs, [key]: { ...prefs[key], email } })} />
        <SwitchLabel label="In app" checked={prefs[key].inApp} onChange={inApp => setPrefs({ ...prefs, [key]: { ...prefs[key], inApp } })} />
      </span>
    </section>
  ));
  const notifications = (
    <div className="grg-ip-prefs">
      <div className="grg-ip-surface grg-ip-surface--fit">
        <h2 className="grg-ip-prefs__title">Personal</h2>
        {switches(PERSONAL)}
      </div>
      <div className="grg-ip-surface grg-ip-surface--fit">
        <h2 className="grg-ip-prefs__title">My Company</h2>
        {switches(COMPANY)}
      </div>
    </div>
  );

  const content = (
    <main className="grg-ip-page">
      <h1 className="grg-ip-page__title">Profile</h1>
      <TabMenu aria-label="Profile" value={tab} onChange={setTab}
        items={[{ id: 'main', label: 'Main info' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }]}>
        {item => <div className="grg-ip-tab-panel">{item.id === 'main' ? main : item.id === 'security' ? security : notifications}</div>}
      </TabMenu>
    </main>
  );

  /* ---- The modal: one at a time, its content follows the task ---- */
  let modal: Omit<ModalProps, 'lead' | 'tint'> | null = null;
  const base = { visible: true, onHide: close, appendTo: 'self' as const, footerType: 'fill' as const };
  if (view?.kind === 'name') {
    const v = view;
    const next = `${v.first.trim()} ${v.last.trim()}`.trim();
    modal = { ...base, title: 'Edit name', description: 'Your name as the team and our support see it',
      primaryAction: { label: 'Save changes', disabled: !v.first.trim() || !v.last.trim() || next === account.name, onClick: () => { setName(next); close(); toast({ status: 'success', title: 'Name updated', duration: 3000 }); } },
      children: <>
        <Input label="First name" required value={v.first} onValueChange={value => setView({ ...v, first: value })} />
        <Input label="Last name" required value={v.last} onValueChange={value => setView({ ...v, last: value })} />
      </> };
  } else if (view?.kind === 'password') {
    modal = { ...base, title: 'Change password',
      description: <>To change your password, follow the link we send to <strong>{account.email}</strong></>,
      primaryAction: { label: 'Send link', onClick: () => setView({ kind: 'password-sent' }) },
      // No support flow in this demo: the button stays without an action
      secondaryAction: { label: 'I don’t have access to this email', onClick: () => undefined } };
  } else if (view?.kind === 'password-sent') {
    modal = { ...base, title: 'Check your email', status: 'neutral', statusIcon: 'mail',
      description: <>We have sent you a link to change your password to <strong>{account.email}</strong></>,
      primaryAction: { label: 'Okay', onClick: close },
      children: <Resend what="email" onResend={() => toast({ status: 'success', title: 'Link sent again', duration: 3000 })} /> };
  } else if (view?.kind === 'choose') {
    modal = { ...base, title: 'Choose the 2FA method', description: 'Get your codes from Google Authenticator or by SMS. You can change the method later.',
      children: <>
        <InteractionCard type="icon" icon="key" title="Google Authenticator" badge={{ label: 'Recommended', color: 'success' }}
          onClick={() => setView({ kind: 'google', secret: newSecret(), code: '' })} />
        <InteractionCard type="icon" icon="mail" title="SMS" onClick={() => setView({ kind: 'sms-phone', country: 'UA', number: '' })} />
      </> };
  } else if (view?.kind === 'google') {
    const v = view;
    const secret = v.secret.toUpperCase().match(/.{1,4}/g)!.join(' ');
    modal = { ...base, title: 'Turn on 2FA', description: <>Scan the QR code in the <strong>Google Authenticator</strong> app</>,
      onBack: () => setView({ kind: 'choose' }),
      primaryAction: { label: 'Confirm', disabled: v.code.length < 6, onClick: () => {
        const error = codeError(v.code);
        if (error) setView({ ...v, error }); else turnedOn({ method: 'google', secret: v.secret });
      } },
      children: <>
        <div className="grg-ip-qr-box">
          <Qr text={`otpauth://totp/Company:${account.email}?secret=${v.secret.toUpperCase()}&issuer=Company`} label="QR code for Google Authenticator" />
          <span className="grg-ip-qr-box__key">Secret code</span>
          <span className="grg-ip-copy">
            <span className="grg-ip-qr-box__secret">{secret}</span>
            <ActionButton icon="copy" size="sm" aria-label="Copy the secret code"
              onClick={() => { void navigator.clipboard?.writeText(v.secret.toUpperCase()).catch(() => undefined); toast({ status: 'success', title: 'Copied', duration: 3000 }); }} />
          </span>
        </div>
        {/* Figma: a caption over the code, which takes the modal's width */}
        <div className="grg-ip-otp-code">
          <p className="grg-ip-otp-code__caption" aria-hidden="true">Enter your 2FA verification code</p>
          <InputOtp label="Enter your 2FA verification code" characters="digits" fill autoFocus value={v.code} error={v.error}
            onValueChange={code => setView({ ...v, code, error: undefined })} />
        </div>
      </> };
  } else if (view?.kind === 'sms-phone') {
    const v = view;
    const code = PHONE_CODES.find(c => c.value === v.country)!.label;
    modal = { ...base, title: 'Turn on 2FA', description: <>Enter the phone number for your sign-in and confirmation codes by <strong>SMS</strong></>,
      onBack: () => setView({ kind: 'choose' }),
      primaryAction: { label: 'Confirm', onClick: () => {
        const digits = v.number.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 12) setView({ ...v, error: 'Enter a valid phone number' });
        else setView({ kind: 'sms-code', phone: `${code} ${v.number.trim()}`, code: '' });
      } },
      children: <Input type="phone" label="Phone number" leftIcon={null} countries={[...PHONE_CODES]} country={v.country} error={v.error}
        onCountryChange={country => setView({ ...v, country, error: undefined })} value={v.number} onValueChange={number => setView({ ...v, number, error: undefined })} /> };
  } else if (view?.kind === 'sms-code') {
    const v = view;
    modal = { ...base, title: 'Turn on 2FA', description: <>Enter the code we sent to <strong>{v.phone}</strong></>,
      onBack: () => setView({ kind: 'sms-phone', country: 'UA', number: v.phone.split(' ').slice(1).join(' ') }),
      primaryAction: { label: 'Confirm', disabled: v.code.length < 6, onClick: () => {
        const error = codeError(v.code);
        if (error) setView({ ...v, error }); else turnedOn({ method: 'sms', phone: v.phone });
      } },
      children: <>
        <InputOtp label="SMS code" characters="digits" fill autoFocus value={v.code} error={v.error} onValueChange={code => setView({ ...v, code, error: undefined })} />
        <Resend what="code" onResend={() => { setView({ ...v, code: '', error: undefined }); toast({ status: 'success', title: 'A new code is sent', duration: 3000 }); }} />
      </> };
  } else if (view?.kind === 'off') {
    const v = view;
    modal = { ...base, title: 'Turn off 2FA', description: 'For your security, confirm with your 2FA code that it is you.',
      primaryAction: { label: 'Confirm', disabled: v.code.length < 6, onClick: () => {
        const error = codeError(v.code);
        if (error) { setView({ ...v, error }); return; }
        setTwoFa(null);
        close();
        toast({ status: 'success', title: 'Two-factor authentication is off', duration: 3000 });
      } },
      children: <>
        <InputOtp label="2FA code" characters="digits" fill autoFocus value={v.code} error={v.error} onValueChange={code => setView({ ...v, code, error: undefined })} />
        <span className="grg-ip-resend">Don’t have access to the code? <Link href="#2fa-help" size="sm" color="black">See instructions</Link></span>
      </> };
  }

  return { content, open: (to: ProfileTab) => setTab(to), overlays: <Modal {...(modal ?? { ...base, visible: false, title: '' })} /> };
}

/** The signed-in person and their name, for an app with the Profile */
export function useAccountState(onOpen?: AccountController['open']) {
  const [name, setName] = useState(DEFAULT_ACCOUNT.name);
  const account: AccountController = { ...DEFAULT_ACCOUNT, name, open: onOpen };
  return { account, setName };
}

function ProfileApp({ tab }: { tab?: ProfileTab }) {
  const { account, setName } = useAccountState(() => undefined);
  const [prefs, setPrefs] = useState(startPrefs);
  const profile = useProfile({ account, setName, prefs, setPrefs, tab });
  return (
    <AccountContext.Provider value={{ ...account, open: page => { if (page === 'profile') profile.open('main'); } }}>
      <AppFrame current="profile">{profile.content}</AppFrame>
      {profile.overlays}
    </AccountContext.Provider>
  );
}

/** The Profile: your name and password, two-factor authentication, and which notifications you get */
export function ProfileFlow(props: { tab?: ProfileTab }) {
  return <MessagesProvider appendTo="self"><ProfileApp {...props} /></MessagesProvider>;
}
