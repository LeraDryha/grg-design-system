import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsList, SettingsRow } from './SettingsRow';
import { Button } from '../Button/Button';
import { CoinIcon } from '../CoinIcon/CoinIcon';

/** A white card on the page's canvas, as in the product */
const card: Decorator = Story => (
  <div style={{ padding: 'var(--space-600)', background: 'var(--surface-canvas)' }}>
    <div style={{ borderRadius: 'var(--radius-xl-16)', background: 'var(--surface-base)', boxShadow: 'var(--shadow-xs)' }}>
      <Story />
    </div>
  </div>
);

const meta = {
  title: 'Components/Settings Row',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: SettingsRow,
  // The docs page is SettingsRow.mdx
  parameters: { layout: 'fullscreen' },
  decorators: [card],
  args: {
    title: 'Password', description: 'This password is used to sign in to your account', icon: 'lock', value: '••••••••••',
    action: <Button variant="secondary" size="sm">Change</Button>, layout: 'beside',
  },
  argTypes: { layout: { control: 'inline-radio', options: ['beside', 'below'] } },
} satisfies Meta<typeof SettingsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** Profile: short values on the half-way line, whatever the button. */
export const ShortValues: Story = {
  name: 'Short values',
  render: () => (
    <SettingsList>
      <SettingsRow icon="id-card" title="Name" description="Your full name, so we know how to address you" value="Guadalupe Schimmel"
        action={<Button variant="secondary" size="sm">Edit</Button>} />
      <SettingsRow icon="mail" title="Email" description="This email address is used to sign in to your account" value="g.schimmel@company.test" />
      <SettingsRow icon="gift" title="Referral accruals" description="You can choose in which currency you would like to get referral cashback."
        value={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-200)' }}><CoinIcon name="usd-coin-usdc" size={24} />USD Coin</span>}
        action={<Button variant="secondary" size="sm">Change</Button>} />
    </SettingsList>
  ),
  play: async ({ canvasElement }) => {
    // Every value starts on the same line, with a button in the row or without
    const lefts = Array.from(canvasElement.querySelectorAll('.grg-settings-row__value')).map(v => Math.round(v.getBoundingClientRect().left));
    await expect(new Set(lefts).size).toBe(1);
    await expect(within(canvasElement).getByRole('region', { name: 'Email' })).toHaveTextContent('g.schimmel@company.test');
  },
};

/** Something has to happen first: the note says what, and the button waits. */
export const WithANote: Story = {
  name: 'With a note',
  render: function WithANote() {
    const [fixed, setFixed] = useState(true);
    return (
      <SettingsList>
        <SettingsRow icon="chart-line" title="Fixed sum invoice" description="You receive the exact fiat amount, protected from market swings."
          value={fixed ? 'On' : undefined}
          action={fixed ? <Button variant="secondary" size="sm" onClick={() => setFixed(false)}>Turn off</Button> : <Button variant="primary" size="sm" onClick={() => setFixed(true)}>Turn on</Button>} />
        <SettingsRow icon="refresh" title="Auto-convert" description="All accepted crypto converts to one currency."
          note={fixed ? 'Turn off fixed sum invoice first' : undefined} value="EUR"
          action={<Button variant="secondary" size="sm" disabled={fixed}>Turn off</Button>} />
      </SettingsList>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const second = within(canvas.getByRole('region', { name: 'Auto-convert' }));
    await expect(second.getByRole('button', { name: 'Turn off' })).toBeDisabled();
    await userEvent.click(within(canvas.getByRole('region', { name: 'Fixed sum invoice' })).getByRole('button', { name: 'Turn off' }));
    await expect(second.getByRole('button', { name: 'Turn off' })).toBeEnabled();
    await expect(second.queryByText('Turn off fixed sum invoice first')).toBeNull();
  },
};

/** Long values go under the text, with a larger title: a support link, an owner with their address. */
export const LongValues: Story = {
  name: 'Long values',
  render: () => (
    <SettingsList>
      <SettingsRow layout="below" title="Company owner" description="Owner has full access to the company profile. Ownership is transferred in Members"
        action={<Button variant="secondary" size="sm">Open Members</Button>} value="Guadalupe Schimmel" />
      <SettingsRow layout="below" title="Company contact" description="Provide buyers with company contact details for payment-related matters at checkout"
        action={<Button variant="secondary" size="sm" aria-label="Edit contact">Edit</Button>} value="https://t.me/company_support" />
    </SettingsList>
  ),
};

/** The head of a card: a row without a value, the card's content under the line. */
export const CardHead: Story = {
  name: 'The head of a card',
  render: () => (
    <SettingsList>
      <SettingsRow layout="below" icon="chart-line" title="Settlement Report"
        description="All the transactions with applied fees. You’ll be able to access your download records for one week."
        action={<Button variant="primary" size="sm">Generate report</Button>} />
      <p style={{ margin: 0, padding: 'var(--space-800) var(--space-600)', font: 'var(--typo-body-md-regular)', color: 'var(--text-soft-500)' }}>The report history table goes here.</p>
    </SettingsList>
  ),
};
