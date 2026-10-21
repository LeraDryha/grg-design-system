import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InputOtp, type InputOtpProps } from './InputOtp';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/input-otp/input-otp-component.png';
import cellsFrame from '../../assets/design/input-otp/input-otp-cells.png';
import guidelinesFrame from '../../assets/design/input-otp/input-otp-guidelines.png';

const cells = (canvasElement: HTMLElement) => Array.from(canvasElement.querySelectorAll<HTMLInputElement>('.grg-otp__cell'));
const codeOf = (canvasElement: HTMLElement) => cells(canvasElement).map(c => c.value).join('');

/* ---- The Figma example card: "Confirm your email" (a Modal in Figma; a plain card until Modal is built) ---- */

const card = {
  boxSizing: 'border-box',
  display: 'grid',
  justifyItems: 'center',
  gap: 'var(--space-1000)',
  // 440px, as the Figma Modal
  width: 'calc(var(--space-5000) * 2 + var(--space-1000))',
  maxWidth: '100%',
  padding: 'var(--space-800)',
  borderRadius: 'var(--radius-xl-16)',
  background: 'var(--surface-floating)',
  boxShadow: 'var(--shadow-md)',
  textAlign: 'center',
} as const;

function ConfirmCard({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <section style={card} aria-labelledby="confirm-title">
      <div style={{ display: 'grid', gap: 'var(--space-200)' }}>
        <h2 id="confirm-title" style={{ margin: 0, font: 'var(--typo-title-md-semibold)', color: 'var(--text-strong-1000)' }}>Confirm your email</h2>
        <p style={{ margin: 0, font: 'var(--typo-body-md-regular)', color: 'var(--text-subtle-700)' }}>
          We have sent you a 6-digit code to <strong style={{ font: 'var(--typo-body-md-semibold)', color: 'var(--text-strong-1000)' }}>imnewuser@gmail.com</strong>. Copy it into the inputs below.
        </p>
      </div>
      {children}
      {footer}
    </section>
  );
}

/** "Didn't receive the code?": a countdown first, then the resend button. Not in Figma (see Contributing/Tokens). */
function Resend({ after = 30 }: { after?: number }) {
  const [left, setLeft] = useState(after);
  const [sent, setSent] = useState('');
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  const time = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--space-800)', font: 'var(--typo-body-md-regular)', color: 'var(--text-soft-500)' }}>
      <span>Didn’t receive the code?</span>
      {left > 0 ? (
        <span style={{ paddingInline: 'var(--space-300)', fontVariantNumeric: 'tabular-nums' }}>Resend in {time}</span>
      ) : (
        <Button variant="text" size="sm" onClick={() => { setSent('A new code is on its way'); setLeft(after); }}>Click to resend</Button>
      )}
      <span className="grg-sr-only" role="status">{sent}</span>
    </div>
  );
}

/** Stands in for the product's check: after a short wait every code but `wrong` passes. */
function useCheck(wrong = '111111', delay = 800) {
  const [state, setState] = useState<'idle' | 'checking' | 'wrong' | 'confirmed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    state,
    check: (code: string) => {
      setState('checking');
      timer.current = setTimeout(() => setState(code === wrong ? 'wrong' : 'confirmed'), delay);
    },
    reset: () => setState('idle'),
  };
}

const meta = {
  title: 'Components/Input Otp',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: InputOtp,
  // The docs page is InputOtp.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'OTP Input', type: 'image', url: componentFrame },
      { name: 'OTP cells', type: 'image', url: cellsFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    label: 'Verification code',
    length: 6,
    characters: 'any',
    hint: 'This is a hint text to help user.',
    error: '',
    hintIcon: true,
    disabled: false,
    loading: false,
  },
  argTypes: {
    length: { control: { type: 'range', min: 4, max: 8, step: 1 } },
    characters: { control: 'inline-radio', options: ['any', 'digits'] },
    onValueChange: { action: 'value changed', control: false },
    onComplete: { action: 'completed', control: false },
  },
} satisfies Meta<typeof InputOtp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Type, paste or use the arrow keys. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** The Figma example: typing moves from cell to cell; the resend button appears after a countdown. */
export const ConfirmYourEmail: Story = {
  name: 'Confirm your email',
  render: function ConfirmYourEmail(args: InputOtpProps) {
    const { state, check, reset } = useCheck();
    return (
      <ConfirmCard footer={state === 'confirmed' ? <p role="status" style={{ margin: 0, font: 'var(--typo-body-md-semibold)', color: 'var(--success-base-600)' }}>Email confirmed</p> : <Resend />}>
        <InputOtp {...args} hint="" characters="digits" loading={state === 'checking'}
          onValueChange={reset} onComplete={check} />
      </ConfirmCard>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Resend in 0:\d\d/)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Click to resend' })).toBeNull();
    const [first, , , , fifth] = cells(canvasElement);
    await userEvent.click(first);
    await userEvent.keyboard('1234');
    await expect(fifth).toHaveFocus();
    // Digits only: a letter is ignored
    await userEvent.keyboard('a56');
    await expect(codeOf(canvasElement)).toBe('123456');
    await expect(await canvas.findByText('Email confirmed', {}, { timeout: 3000 })).toBeVisible();
  },
};

/** The code is checked as soon as the last cell is filled; a wrong one turns the row red until people correct it. */
export const WrongCode: Story = {
  name: 'Wrong code',
  render: function WrongCode(args: InputOtpProps) {
    const { state, check, reset } = useCheck('111111');
    return (
      <ConfirmCard footer={state === 'confirmed' ? <p role="status" style={{ margin: 0, font: 'var(--typo-body-md-semibold)', color: 'var(--success-base-600)' }}>Email confirmed</p> : <Resend after={0} />}>
        <InputOtp {...args} hint="" characters="digits" loading={state === 'checking'}
          error={state === 'wrong' ? 'The code is incorrect. Check the email and try again.' : ''}
          onValueChange={reset} onComplete={check} />
      </ConfirmCard>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = cells(canvasElement);
    await userEvent.click(row[0]);
    await userEvent.keyboard('111111');
    await expect(await canvas.findByText('The code is incorrect. Check the email and try again.', {}, { timeout: 3000 })).toBeVisible();
    await expect(row[0]).toHaveAttribute('aria-invalid', 'true');
    await expect(row[0]).toHaveAccessibleDescription(/the code is incorrect/i);
    // Focus is back in the last cell: typing over it checks the new code
    await waitFor(() => expect(row[5]).toHaveFocus());
    await userEvent.keyboard('2');
    await expect(canvas.queryByText(/the code is incorrect/i)).toBeNull();
    await expect(await canvas.findByText('Email confirmed', {}, { timeout: 3000 })).toBeVisible();
  },
};

/** The last cell is filled: the code is checked, the cells lock and a spinner turns under them. */
export const Verifying: Story = {
  render: (args: InputOtpProps) => (
    <ConfirmCard>
      <InputOtp {...args} hint="" characters="digits" defaultValue="123457" loading />
    </ConfirmCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Verifying code');
    await expect(canvas.getByRole('group', { name: 'Verification code' })).toHaveAttribute('aria-busy', 'true');
    const row = cells(canvasElement);
    await userEvent.click(row[2]);
    await userEvent.keyboard('9');
    await expect(codeOf(canvasElement)).toBe('123457');
  },
};

/** A code copied from an email or a message: pasted into any cell, it fills the whole row. Spaces and hyphens go. */
export const PasteACode: Story = {
  name: 'Paste a code',
  args: { characters: 'digits', hint: 'Paste the code from the message' },
  play: async ({ canvasElement }) => {
    const row = cells(canvasElement);
    await userEvent.click(row[3]);
    await userEvent.paste('482 913');
    await expect(codeOf(canvasElement)).toBe('482913');
    await waitFor(() => expect(row[5]).toHaveFocus());
    // One wrong character: click it and type over it; Delete clears a cell
    await userEvent.click(row[1]);
    await userEvent.keyboard('0');
    await expect(codeOf(canvasElement)).toBe('402913');
    await userEvent.keyboard('{Delete}');
    await expect(codeOf(canvasElement)).toBe('40913');
  },
};

/** On phones the keyboard offers the code from a new SMS or email; one tap fills every cell. */
export const CodeFromAMessage: Story = {
  name: 'Code from a message',
  args: { characters: 'digits', hint: 'The code is in the message we sent you' },
  play: async ({ canvasElement }) => {
    const row = cells(canvasElement);
    await expect(row[0]).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(row[0]).toHaveAttribute('inputmode', 'numeric');
    // What the phone does: it puts the whole code into the first cell
    await userEvent.click(row[0]);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(row[0], '731508');
    row[0].dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
    await waitFor(() => expect(codeOf(canvasElement)).toBe('731508'));
  },
};

/** Codes are not only numbers: a backup code takes letters and symbols too. */
export const LettersAndSymbols: Story = {
  name: 'Letters and symbols',
  args: { label: 'Backup code', length: 8, characters: 'any', hint: 'One of the backup codes you saved' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = cells(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Backup code' })).toBeVisible();
    await expect(row[0]).toHaveAccessibleName('Character 1 of 8');
    await userEvent.click(row[0]);
    await userEvent.keyboard('K7#p');
    await expect(row[4]).toHaveFocus();
    // Backspace in an empty cell steps back, a second one clears that cell; the arrows move without changing anything
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect(codeOf(canvasElement)).toBe('K7#');
    await expect(row[2]).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(row[1]).toHaveFocus();
  },
};

/** Not available yet: the account is locked for a while, the hint says why. */
export const Unavailable: Story = {
  // Known contrast note: the Figma disabled hint grey is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
  args: { disabled: true, defaultValue: '12', hint: 'Too many attempts. Try again in 10 minutes.' },
  play: async ({ canvasElement }) => {
    for (const cell of cells(canvasElement)) await expect(cell).toBeDisabled();
  },
};

/* ---- Overview: states and lengths ---- */

/** The Figma states that are props. Hovered and Active follow the pointer and focus: try them in any example. */
export const States: Story = {
  // Known contrast note: the Disabled hint, as in Unavailable
  parameters: { a11y: { test: 'todo' } },
  render: (args: InputOtpProps) => (
    <Showcase column>
      <Variant caption="Default · empty"><InputOtp {...args} label="Empty code" /></Variant>
      <Variant caption="Default · filled"><InputOtp {...args} label="Filled code" defaultValue="111111" /></Variant>
      <Variant caption="Error"><InputOtp {...args} label="Wrong code" defaultValue="111111" error="The code is incorrect." /></Variant>
      <Variant caption="Disabled"><InputOtp {...args} label="Unavailable code" defaultValue="111111" disabled /></Variant>
      <Variant caption="Loading"><InputOtp {...args} label="Checked code" defaultValue="111111" loading /></Variant>
    </Showcase>
  ),
};

/** 4 cells for a PIN, 6 for most codes (as in Figma), 8 for backup codes. */
export const Lengths: Story = {
  render: (args: InputOtpProps) => (
    <Showcase column>
      {[4, 6, 8].map(length => (
        <Variant key={length} caption={`${length} cells`}>
          <InputOtp {...args} label={`${length}-character code`} hint="" length={length} />
        </Variant>
      ))}
    </Showcase>
  ),
};
