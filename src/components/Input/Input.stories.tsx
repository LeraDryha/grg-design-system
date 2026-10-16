import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { Input, type InputProps } from './Input';
import { Button } from '../Button/Button';
import { icons } from '../Icon/Icon';
import { paymentIcons, sampleCoins, sampleCountries } from './options';

const iconOptions = [null, ...Object.keys(icons)];

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'A text field with a label, an optional hint and extra information on the right (Key: Value).',
          '',
          '**The label is also the placeholder.** While the field is empty and not focused, the label sits inside it. ',
          'On focus it floats above and stays there while the field has a value; clearing the field brings it back inside. ',
          'The floating label takes no vertical space, so leave 22px above the field in layouts.',
          '',
          '**Types.** *Common*: plain text or numbers (name, city, comment). *Phone*: country code and number. ',
          '*Website*: a URL with a protocol prefix. *Card*: card number in groups of four, with the payment method. ',
          '*Amount*: a number with a currency. *Date*: DD / MM / YYYY. *Button*: text with an action, such as copying a referral link or revealing a password.',
        ].join('\n'),
      },
    },
  },
  decorators: [Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>],
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
    previewState: 'default',
  },
  argTypes: {
    type: { control: 'select', options: ['common', 'phone', 'website', 'card', 'amount', 'date', 'button'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    inputType: { control: 'select', options: [undefined, 'text', 'email', 'password', 'tel', 'url', 'search'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { null: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { null: 'none' } },
    action: { control: 'inline-radio', options: [undefined, 'copy', 'password'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'focus'] },
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
export const Playground: Story = {};

const stack = (gap = 'var(--space-1200)'): CSSProperties => ({ display: 'grid', gap, paddingTop: 'var(--space-200)' });

/** The seven types from Figma, filled as in the usage guidelines. */
export const Types: Story = {
  render: (args: InputProps) => (
    <div style={stack()}>
      <Input {...args} type="common" label="Email" leftIcon="mail" defaultValue="user@mail.com" />
      <Input {...args} type="phone" label="Phone number" leftIcon={null} countries={sampleCountries} defaultValue="6787645" />
      <Input {...args} type="website" label="Website" leftIcon={null} defaultValue="golden.ratio.com" />
      <Input {...args} type="card" label="Card number" leftIcon={undefined} paymentIcon={paymentIcons.mastercard} paymentLabel="Mastercard" defaultValue="4242 4242 4242 4242" />
      <Input {...args} type="amount" label="Amount" required leftIcon={null} coins={sampleCoins} defaultValue="100.00" />
      <Input {...args} type="date" label="Date" leftIcon={null} rightIcon={undefined} defaultValue="12 / 12 / 2025" />
      <Input {...args} type="button" label="Referral link" leftIcon={undefined} action="copy" copyLabel="Copy referral link" defaultValue="golden.ratio.com" />
    </div>
  ),
};

/** lg-44, md-40 and sm-32. Text and icons keep their size; only paddings and corners change. */
export const Sizes: Story = {
  render: (args: InputProps) => (
    <div style={stack()}>
      {(['lg', 'md', 'sm'] as const).map(size => <Input key={size} {...args} size={size} defaultValue="user@mail.com" />)}
    </div>
  ),
};

function Labeled({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-800)' }}>
      <span style={{ font: 'var(--typo-body-sm-semibold)', color: 'var(--text-soft-500)' }}>{title}</span>
      <div style={stack('var(--space-800)')}>{children}</div>
    </div>
  );
}

/** Default, hovered, active (focused), error and disabled, each empty and filled. */
export const States: Story = {
  render: (args: InputProps) => (
    <div style={stack('var(--space-800)')}>
      <Labeled title="Default">
        <Input {...args} />
        <Input {...args} defaultValue="user@mail.com" />
      </Labeled>
      <Labeled title="Hovered">
        <Input {...args} previewState="hover" />
        <Input {...args} previewState="hover" defaultValue="user@mail.com" />
      </Labeled>
      <Labeled title="Active">
        <Input {...args} previewState="focus" />
        <Input {...args} previewState="focus" defaultValue="user@mail.com" />
      </Labeled>
      <Labeled title="Error">
        <Input {...args} error="This field is required" />
        <Input {...args} error="Email address is invalid." defaultValue="user2mail.com" />
      </Labeled>
      <Labeled title="Disabled">
        <Input {...args} disabled />
        <Input {...args} disabled defaultValue="user@mail.com" />
      </Labeled>
    </div>
  ),
};

/** Every part on: label with asterisk, additional text and info, Key: Value on top, hint and value below. */
export const AllParts: Story = {
  args: {
    floatingLabel: false,
    required: true,
    optional: true,
    info: 'We send the receipt to this address.',
    topKey: 'Key',
    topValue: 'Value',
    hint: 'This is a hint text to help user.',
    bottomValue: 'Value',
    unit: 'USD',
    rightIcon: 'information',
  },
};

/** The password field from the sign-up example: Button type with a reveal action. */
export const Password: Story = {
  args: { type: 'button', label: 'Password', leftIcon: null, action: 'password', defaultValue: 'golden-ratio' },
};

/** The sign-up form from the Figma examples. */
export const SignUpExample: Story = {
  decorators: [Story => <div style={{ width: 360 }}><Story /></div>],
  render: (args: InputProps) => (
    <form style={stack('var(--space-1000)')} onSubmit={e => e.preventDefault()}>
      <Input {...args} type="common" label="Email" inputType="email" leftIcon="mail" autoComplete="email" />
      <Input {...args} type="phone" label="Phone number" leftIcon={null} countries={sampleCountries} autoComplete="tel-national" />
      <Input {...args} type="button" label="Password" leftIcon={null} action="password" autoComplete="new-password" />
      <Input {...args} type="button" label="Referral link" floatingLabel={false} leftIcon={undefined} action="copy" copyLabel="Copy referral link" defaultValue="golden.ratio.com" readOnly />
      <Button type="submit" size="lg" leftIcon={undefined} style={{ width: '100%' }}>Sign up</Button>
    </form>
  ),
};
