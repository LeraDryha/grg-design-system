import { Button } from '../../components/Button/Button';
import { AppFrame } from '../shared/AssetsApp';
import settingsImage from '../../assets/in-product/settings.png';
import verifyingImage from '../../assets/in-product/verification-in-progress.png';

/* GRX Pay redesign, file "Global Settings", section Settings - empty (372:42877): the Settings page before the
   business is verified, and while it is being verified. The settings themselves come in the next sections. */

export type SettingsProps = {
  /** Not verified: settings open after verification. Verifying: the documents are being checked */
  account?: 'not-verified' | 'verifying';
};

/** The Settings page, for any app that holds it */
export function useSettings({ account = 'not-verified' }: SettingsProps = {}) {
  const verifying = account === 'verifying';
  return {
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

/** The Settings page before verification and during it */
export function SettingsFlow(props: SettingsProps) {
  const settings = useSettings(props);
  return <AppFrame current="settings">{settings.content}</AppFrame>;
}
