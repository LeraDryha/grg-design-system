import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Input, type InputProps } from './Input';
import { baseIconNames } from '../../icons/names';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';
import { sampleCoins, sampleCountries } from './options';

const iconOptions = [null, ...baseIconNames];

/** A single field is 320px wide, as in Figma, with room for the floating label above. */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;

const meta = {
  title: 'Components/Input',
  component: Input,
  // The docs page is Input.mdx
  parameters: { layout: 'centered' },
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
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
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

/** Every part of the field, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  args: {
    floatingLabel: false,
    required: true,
    optional: true,
    info: 'We send the receipt to this address.',
    placeholder: 'Placeholder',
    leftIcon: null,
    topKey: 'Key',
    topValue: 'Value',
    hint: 'This is a hint text to help user.',
    bottomValue: 'Value',
  },
  render: (args: InputProps) => (
    <AnatomyBlock
      markers={[
        { n: 1, target: '.grg-input__box', side: 'right' },
        { n: 2, target: '.grg-field-label__name', side: 'top' },
        { n: 3, target: '.grg-field-label__star', side: 'top' },
        { n: 4, target: '.grg-field-label__extra', side: 'top' },
        { n: 5, target: '.grg-field-label__info', side: 'top' },
        { n: 6, target: '.grg-input__control', side: 'left' },
        { n: 7, target: '.grg-hint .grg-icon', side: 'bottom' },
        { n: 8, target: '.grg-hint > span:last-child', side: 'bottom' },
        { n: 9, target: '.grg-field__top .grg-key-value', side: 'top' },
        { n: 10, target: '.grg-field__bottom .grg-key-value', side: 'bottom' },
      ]}
    >
      <Input {...args} />
    </AnatomyBlock>
  ),
};

/** Fields one under another, with room for each floating label */
const column: CSSProperties = { display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' };

const TYPES: { type: NonNullable<InputProps['type']>; label: string; value: string; props?: Partial<InputProps> }[] = [
  { type: 'common', label: 'Email', value: 'user@mail.com', props: { leftIcon: 'mail' } },
  { type: 'phone', label: 'Phone number', value: '6787645', props: { countries: sampleCountries } },
  { type: 'website', label: 'Website', value: 'golden.ratio.com' },
  { type: 'card', label: 'Card number', value: '4242 4242 4242 4242', props: { leftIcon: undefined, paymentMethod: 'mastercard' } },
  { type: 'amount', label: 'Amount', value: '100.00', props: { coins: sampleCoins } },
  { type: 'date', label: 'Date', value: '12 / 12 / 2025', props: { rightIcon: undefined } },
  { type: 'button', label: 'Referral link', value: 'golden.ratio.com', props: { leftIcon: undefined, action: 'copy', copyLabel: 'Copy referral link' } },
];

/** The seven types from Figma, filled. What each one is for is listed on the docs page. */
export const Types: Story = {
  render: function Types(args: InputProps) {
    const [country, setCountry] = useState('BG');
    const [coin, setCoin] = useState('USDC');
    return <div style={column}>
      {TYPES.map(t => <Input key={t.type} {...args} leftIcon={null} {...t.props} type={t.type} label={t.label} defaultValue={t.value}
        country={country} onCountryChange={setCountry} coin={coin} onCoinChange={setCoin} />)}
    </div>;
  },
};

/** Card numbers with the payment method of each card, from Payment method icons. */
export const CardPaymentMethods: Story = {
  render: (args: InputProps) => (
    <div style={column}>
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

/** lg-44, md-40 and sm-32, from the top. Text and icons keep their size; only paddings and corners change. */
export const Sizes: Story = {
  render: (args: InputProps) => (
    <div style={column}>
      {(['lg', 'md', 'sm'] as const).map(size => <Input key={size} {...args} size={size} defaultValue="user@mail.com" />)}
    </div>
  ),
};

/* ---- States: one story each, as is usual in Storybook ---- */

/** Empty: the label sits inside as the placeholder. */
export const Default: Story = { decorators: [field] };

/** With a value: the label stays above. */
export const Filled: Story = { decorators: [field], args: { defaultValue: 'user@mail.com' } };

/** Pointer over the field: a light fill and a darker border. */
export const Hovered: Story = { decorators: [field], args: { previewState: 'hover', defaultValue: 'user@mail.com' } };

/** Focused: the darkest border, the label floats and turns dark, a clear button appears when there is a value. */
export const Active: Story = { decorators: [field], args: { previewState: 'active', defaultValue: 'user@mail.com' } };

/** Keyboard focus: system blue ring. */
export const Focused: Story = { decorators: [field], args: { previewState: 'focus', defaultValue: 'user@mail.com' } };

/** Red border and message; the message replaces the hint. */
export const ErrorState: Story = { name: 'Error', decorators: [field], args: { error: 'Email address is invalid.', defaultValue: 'user2mail.com' } };

/** Not available: grey fill and text, no interaction. */
export const Disabled: Story = { decorators: [field], args: { disabled: true, defaultValue: 'user@mail.com' } };

/** Empty, focused, filled. What happens at each step is described on the docs page. */
export const FloatingLabel: Story = {
  render: (args: InputProps) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--space-800)', paddingTop: 'var(--space-600)' }}>
      <Input {...args} />
      <Input {...args} previewState="focus" />
      <Input {...args} defaultValue="user@mail.com" />
    </div>
  ),
};

/** Every part on, with the label always above. */
export const AllParts: Story = {
  decorators: [field],
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
  decorators: [field],
  args: { type: 'button', label: 'Password', leftIcon: null, action: 'password', defaultValue: 'golden-ratio' },
};

/** The form receives ordinary React change events, including the clear action. */
export const Controlled: Story = {
  render: function Controlled(args: InputProps) {
    const [value, setValue] = useState('');
    return <div style={column}>
      <Input {...args} value={value} onChange={event => setValue(event.target.value)} />
      <output aria-label="Form value">{value || 'Empty'}</output>
    </div>;
  },
};

/** Readable and selectable, without editing or clearing. */
export const ReadOnly: Story = { decorators: [field], args: { readOnly: true, defaultValue: 'user@mail.com' } };
