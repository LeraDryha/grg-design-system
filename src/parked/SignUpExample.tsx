import { Input } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { ActionButton } from '../components/ActionButton/ActionButton';
import { SocialButton } from './SocialButton/SocialButton';
import { sampleCountries } from '../components/Input/options';
import './SignUpExample.css';

/**
 * The sign-up popup from the Figma examples (node 824:16432), built from the system's components.
 * An example, not a component: the Modal itself is not built yet, so its frame is drawn here.
 */
export function SignUpExample() {
  return (
    <section className="ex-signup" aria-labelledby="ex-signup-title">
      <header className="ex-signup__header">
        <ActionButton className="ex-signup__back" icon="arrow-left" size="md" aria-label="Back" />
        <ActionButton className="ex-signup__close" icon="remove" size="md" aria-label="Close" />
        <h2 id="ex-signup-title" className="ex-signup__title">Sign up</h2>
        <p className="ex-signup__text">Accept crypto payments worldwide within seconds</p>
      </header>
      <form className="ex-signup__body" onSubmit={e => e.preventDefault()}>
        <Input type="common" size="lg" label="Email" inputType="email" leftIcon="mail" autoComplete="email" />
        <Input type="phone" size="lg" label="Phone number" leftIcon={null} countries={sampleCountries} autoComplete="tel-national" />
        <Input type="button" size="lg" label="Password" leftIcon={null} action="password" autoComplete="new-password" />
        <Input type="button" size="lg" label="Referral link" floatingLabel={false} action="copy" copyLabel="Copy referral link" defaultValue="golden.ratio.com" readOnly />
        <div className="ex-signup__actions">
          <Button type="submit" size="lg" className="ex-signup__wide">Sign up</Button>
          <span className="ex-signup__or">or</span>
          <div className="ex-signup__social">
            <SocialButton social="facebook" />
            <SocialButton social="google" />
            <SocialButton social="apple" />
          </div>
          <p className="ex-signup__terms">
            By signing up, you agree to the
            <Button variant="text" size="xs">Terms of Service</Button>
          </p>
          <p className="ex-signup__login">
            I already have an account?
            <Button variant="text" size="sm">Log in</Button>
          </p>
        </div>
      </form>
    </section>
  );
}
