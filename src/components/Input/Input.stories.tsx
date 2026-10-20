import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Input, type InputProps } from './Input';
import { Button } from '../Button/Button';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { sampleCoins, sampleCountries } from './options';
import componentFrame from '../../assets/design/input/input-component.png';
import guidelinesFrame from '../../assets/design/input/input-guidelines.png';

const iconOptions = [null, ...baseIconNames];

/** A single field is 320px wide, as in Figma, with room for the floating label above. */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;
/** Fields one under another, with room for each floating label */
const form = { display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' } as const;

const meta = {
  title: 'Components/Input',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Input,
  // The docs page is Input.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    type: 'common',
    size: 'md',
    label: 'Email',
    floatingLabel: true,
    required: false,
    optional: false,
    hint: '',
    error: '',
    leftIcon: 'mail',
    rightIcon: null,
    unit: '',
    disabled: false,
  },
  argTypes: {
    type: { control: 'select', options: ['common', 'phone', 'website', 'card', 'amount', 'date', 'button'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    inputType: { control: 'select', options: [undefined, 'text', 'email', 'password', 'tel', 'url', 'search'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { null: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { null: 'none' } },
    action: { control: 'inline-radio', options: [undefined, 'copy', 'password'] },
    optional: { control: 'boolean' },
    countries: { control: false },
    coins: { control: false },
    onValueChange: { action: 'value changed', control: false },
    onCountryChange: { action: 'country changed', control: false },
    onCoinChange: { action: 'coin changed', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Click the field to see the label float. */
export const Playground: Story = { decorators: [field] };

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Sign in: an email field and a password with a reveal button, as in the Figma sign-up example. */
export const SignIn: Story = {
  name: 'Sign in',
  render: (args: InputProps) => (
    <div style={form}>
      <Input {...args} label="Email" inputType="email" autoComplete="email" />
      <Input {...args} type="button" label="Password" leftIcon={null} action="password" autoComplete="current-password" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'user@mail.com');
    const password = canvas.getByLabelText('Password');
    await userEvent.type(password, 'golden-ratio');
    await expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
    await expect(password).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  },
};

/** A wrong email: the error appears when the form is sent, replaces the hint and is read with the field. */
export const CheckAnEmail: Story = {
  name: 'Check an email',
  render: function CheckAnEmail(args: InputProps) {
    const [value, setValue] = useState('');
    const [sent, setSent] = useState(false);
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setSent(true);
    };
    return (
      <form onSubmit={submit} noValidate style={{ ...form, gap: 'var(--space-600)' }}>
        <Input
          {...args}
          label="Email"
          inputType="email"
          hint="We send the receipt to this address"
          error={sent && !valid ? 'Email address is invalid.' : ''}
          value={value}
          onValueChange={setValue}
        />
        <Button type="submit" variant="primary">Continue</Button>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText('Email');
    await userEvent.type(email, 'user2mail.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(await canvas.findByText('Email address is invalid.')).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription(/email address is invalid/i);
  },
};

/** Card and amount: the field formats what people type, so they don't have to. */
export const FormatAsYouType: Story = {
  name: 'Format as you type',
  render: function FormatAsYouType(args: InputProps) {
    const [coin, setCoin] = useState('USDC');
    return (
      <div style={form}>
        <Input {...args} type="card" label="Card number" leftIcon={null} paymentMethod="visa" />
        <Input {...args} type="amount" label="Amount" leftIcon={null} coins={sampleCoins} coin={coin} onCoinChange={setCoin} />
        <Input {...args} type="date" label="Due date" leftIcon={null} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByLabelText('Card number');
    await userEvent.type(card, '4242424242424242');
    await expect(card).toHaveValue('4242 4242 4242 4242');
    const amount = canvas.getByLabelText('Amount');
    await userEvent.type(amount, '12a.5.0');
    await expect(amount).toHaveValue('12.50');
    const date = canvas.getByLabelText('Due date');
    await userEvent.type(date, '12122025');
    await expect(date).toHaveValue('12 / 12 / 2025');
  },
};

/** A phone number: the country code is its own select, the number field takes digits only. */
export const PhoneNumber: Story = {
  name: 'Phone number',
  decorators: [field],
  render: function PhoneNumber(args: InputProps) {
    const [country, setCountry] = useState('BG');
    return <Input {...args} type="phone" label="Phone number" leftIcon={null} countries={sampleCountries} country={country} onCountryChange={setCountry} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Country code' })).toBeInTheDocument();
    const phone = canvas.getByLabelText('Phone number');
    await userEvent.type(phone, '678-76-45');
    await expect(phone).toHaveValue('6787645');
  },
};

/** A value to copy: a referral link that people can't edit, with a copy button. */
export const CopyAReferralLink: Story = {
  name: 'Copy a referral link',
  decorators: [field],
  args: { type: 'button', label: 'Referral link', leftIcon: undefined, action: 'copy', copyLabel: 'Copy referral link', readOnly: true, defaultValue: 'golden.ratio.com/r/ashley' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Copy referral link' })).toBeVisible();
    await expect(canvas.getByLabelText('Referral link')).toHaveAttribute('readonly');
  },
};

/** Not available right now: grey fill and text, no interaction. A hint says why. */
export const Unavailable: Story = {
  decorators: [field],
  // Known contrast note: the Figma disabled hint grey is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
  args: { disabled: true, defaultValue: 'user@mail.com', hint: 'Contact support to change your email' },
};

/** A parent form owns the value: typing and the clear button both update it. */
export const ControlledByAForm: Story = {
  name: 'Controlled by a form',
  render: function Controlled(args: InputProps) {
    const [value, setValue] = useState('');
    return (
      <div style={form}>
        <Input {...args} value={value} onChange={event => setValue(event.target.value)} />
        <output aria-label="Form value">{value || 'Empty'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'hi');
    await expect(canvas.getByLabelText('Form value')).toHaveTextContent('hi');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(canvas.getByLabelText('Form value')).toHaveTextContent('Empty');
  },
};

/* ---- Overview: types and sizes ---- */

const TYPES: { type: NonNullable<InputProps['type']>; caption: string; label: string; value: string; props?: Partial<InputProps> }[] = [
  { type: 'common', caption: 'Common', label: 'Email', value: 'user@mail.com', props: { leftIcon: 'mail' } },
  { type: 'phone', caption: 'Phone', label: 'Phone number', value: '6787645', props: { countries: sampleCountries } },
  { type: 'website', caption: 'Website', label: 'Website', value: 'golden.ratio.com' },
  { type: 'card', caption: 'Card', label: 'Card number', value: '4242 4242 4242 4242', props: { leftIcon: undefined, paymentMethod: 'mastercard' } },
  { type: 'amount', caption: 'Amount', label: 'Amount', value: '100.00', props: { coins: sampleCoins } },
  { type: 'date', caption: 'Date', label: 'Date', value: '12 / 12 / 2025', props: { rightIcon: undefined } },
  { type: 'button', caption: 'Button', label: 'Referral link', value: 'golden.ratio.com', props: { leftIcon: undefined, action: 'copy', copyLabel: 'Copy referral link' } },
];

/** The seven types from Figma, filled. */
export const Types: Story = {
  render: function Types(args: InputProps) {
    const [country, setCountry] = useState('BG');
    const [coin, setCoin] = useState('USDC');
    return (
      <div style={{ width: 320, paddingTop: 'var(--space-600)' }}>
        <Showcase column>
          {TYPES.map(t => (
            <Variant key={t.type} caption={t.caption}>
              <div style={{ width: '100%' }}>
                <Input {...args} leftIcon={null} {...t.props} type={t.type} label={t.label} defaultValue={t.value}
                  country={country} onCountryChange={setCountry} coin={coin} onCoinChange={setCoin} />
              </div>
            </Variant>
          ))}
        </Showcase>
      </div>
    );
  },
};

/** Card numbers with the payment method of each card, from Payment method icons. */
export const CardPaymentMethods: Story = {
  render: (args: InputProps) => (
    <div style={form}>
      {([
        ['visa', '4242 4242 4242 4242'],
        ['mastercard', '5555 5555 5555 4444'],
        ['amex', '3782 822463 10005'],
        ['discover', '6011 1111 1111 1117'],
        ['unionpay', '6200 0000 0000 0005'],
        ['jcb', '3530 1113 3330 0000'],
      ] as const).map(([method, number]) => (
        <Input key={method} {...args} type="card" leftIcon={null} label="Card number" paymentMethod={method} defaultValue={number} />
      ))}
    </div>
  ),
};

/** lg-44, md-40 and sm-32. Text and icons keep their size; only paddings and corners change. */
export const Sizes: Story = {
  render: (args: InputProps) => (
    <div style={{ width: 320, paddingTop: 'var(--space-600)' }}>
      <Showcase column>
        {(['lg', 'md', 'sm'] as const).map(size => (
          <Variant key={size} caption={{ lg: 'lg · 44px', md: 'md · 40px', sm: 'sm · 32px' }[size]}>
            <div style={{ width: '100%' }}><Input {...args} size={size} defaultValue="user@mail.com" /></div>
          </Variant>
        ))}
      </Showcase>
    </div>
  ),
};
