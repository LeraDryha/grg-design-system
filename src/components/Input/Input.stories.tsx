import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Input, type InputProps } from './Input';
import { Button } from '../Button/Button';
import { icons } from '../Icon/Icon';
import { Anatomy as AnatomyBlock, StateMatrix } from '../../docs/blocks/DocBlocks';
import { paymentIcons, sampleCoins, sampleCountries } from './options';

const iconOptions = [null, ...Object.keys(icons)];

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
  { type: 'card', label: 'Card number', value: '4242 4242 4242 4242', props: { leftIcon: undefined, paymentIcon: paymentIcons.mastercard, paymentLabel: 'Mastercard' } },
  { type: 'amount', label: 'Amount', value: '100.00', props: { coins: sampleCoins } },
  { type: 'date', label: 'Date', value: '12 / 12 / 2025', props: { rightIcon: undefined } },
  { type: 'button', label: 'Referral link', value: 'golden.ratio.com', props: { leftIcon: undefined, action: 'copy', copyLabel: 'Copy referral link' } },
];

/** The seven types from Figma, filled. What each one is for is listed on the docs page. */
export const Types: Story = {
  render: (args: InputProps) => (
    <div style={column}>
      {TYPES.map(t => <Input key={t.type} {...args} leftIcon={null} {...t.props} type={t.type} label={t.label} defaultValue={t.value} />)}
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

/** Default, hovered, active (focused), error and disabled, each empty and filled. */
export const States: Story = {
  render: (args: InputProps) => (
    <StateMatrix
      columns={['Empty', 'Filled']}
      rows={[
        { label: 'Default', cells: [<Input {...args} />, <Input {...args} defaultValue="user@mail.com" />] },
        { label: 'Hovered', cells: [<Input {...args} previewState="hover" />, <Input {...args} previewState="hover" defaultValue="user@mail.com" />] },
        { label: 'Active', note: 'Focused', cells: [<Input {...args} previewState="focus" />, <Input {...args} previewState="focus" defaultValue="user@mail.com" />] },
        { label: 'Error', cells: [<Input {...args} error="This field is required" />, <Input {...args} error="Email address is invalid." defaultValue="user2mail.com" />] },
        { label: 'Disabled', cells: [<Input {...args} disabled />, <Input {...args} disabled defaultValue="user@mail.com" />] },
      ]}
    />
  ),
};

/** The label is the placeholder while the field is empty, floats on focus and stays while there is a value. */
export const FloatingLabel: Story = {
  render: (args: InputProps) => (
    <StateMatrix
      columns={['1. Empty', '2. Focused', '3. Filled']}
      cellWidth={220}
      rows={[{ label: 'Label', note: 'Takes no vertical space', cells: [<Input {...args} />, <Input {...args} previewState="focus" />, <Input {...args} defaultValue="user@mail.com" />] }]}
    />
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

const formStack: CSSProperties = { display: 'grid', gap: 'var(--space-1000)', width: 'min(360px, 100%)', paddingTop: 'var(--space-600)' };

/** The sign-up form from the Figma examples. Try it with the mobile viewport in the toolbar. */
export const SignUpExample: Story = {
  render: (args: InputProps) => (
    <form style={formStack} onSubmit={e => e.preventDefault()}>
      <Input {...args} type="common" label="Email" inputType="email" leftIcon="mail" autoComplete="email" />
      <Input {...args} type="phone" label="Phone number" leftIcon={null} countries={sampleCountries} autoComplete="tel-national" />
      <Input {...args} type="button" label="Password" leftIcon={null} action="password" autoComplete="new-password" />
      <Input {...args} type="button" label="Referral link" floatingLabel={false} leftIcon={undefined} action="copy" copyLabel="Copy referral link" defaultValue="golden.ratio.com" readOnly />
      <Button type="submit" size="lg" leftIcon={undefined} style={{ width: '100%' }}>Sign up</Button>
    </form>
  ),
};
