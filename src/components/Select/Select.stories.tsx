import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Button } from '../Button/Button';
import { Select, type SelectProps } from './Select';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';
import { sampleCoins, sampleCountries, samplePaymentMethods, samplePayments, sampleUsers } from './samples';

/** A single field is 320px wide, as in Figma, with room for the floating label above. */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;
/** Room under the field for the open list */
const withList: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)', minHeight: 360 }}><Story /></div>;

/** Opens the list once the story is shown */
const openList = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  canvasElement.querySelector<HTMLElement>('.grg-select__box')?.click();
};

const meta = {
  title: 'Components/Select',
  component: Select,
  // The docs page is Select.mdx
  parameters: { layout: 'centered' },
  args: {
    options: samplePayments,
    type: 'common',
    size: 'md',
    label: 'Select payment',
    floatingLabel: true,
    required: false,
    optional: false,
    hint: '',
    error: '',
    icon: true,
    searchable: false,
    disabled: false,
    previewState: 'default',
  },
  argTypes: {
    options: { control: false },
    type: { control: 'select', options: ['common', 'country', 'user', 'payment', 'coin'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    optional: { control: 'boolean' },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLES = { common: samplePayments, country: sampleCountries, user: sampleUsers, payment: samplePaymentMethods, coin: sampleCoins };

/** Edit everything in Controls. Choosing a type also picks its sample options. */
export const Playground: Story = {
  decorators: [withList],
  render: (args: SelectProps) => <Select {...args} options={SAMPLES[args.type ?? 'common']} />,
};

/** Every part of the field, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  args: {
    floatingLabel: false,
    placeholder: 'Placeholder',
    required: true,
    optional: true,
    info: 'The payment type sets the tax rules.',
    hint: 'This is a hint text to help user.',
  },
  render: (args: SelectProps) => (
    <AnatomyBlock
      markers={[
        { n: 1, target: '.grg-select__box', side: 'right' },
        { n: 2, target: '.grg-field-label__name', side: 'top' },
        { n: 3, target: '.grg-field-label__star', side: 'top' },
        { n: 4, target: '.grg-field-label__extra', side: 'top' },
        { n: 5, target: '.grg-field-label__info', side: 'top' },
        { n: 6, target: '.grg-select__text', side: 'bottom' },
        { n: 7, target: '.grg-hint .grg-icon', side: 'bottom' },
        { n: 8, target: '.grg-hint > span:last-child', side: 'bottom' },
        { n: 9, target: '.grg-select__icon', side: 'left' },
        { n: 10, target: '.grg-select__trigger', side: 'top' },
      ]}
    >
      <Select {...args} />
    </AnatomyBlock>
  ),
};

/** Fields one under another, with room for each label */
const column: CSSProperties = { display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' };

/** Common, Country, User, Payment method and Coin, filled, from the top. */
export const Types: Story = {
  render: (args: SelectProps) => (
    <div style={column}>
      <Select {...args} type="common" label="Select payment" options={samplePayments} defaultValue="utility" />
      <Select {...args} type="country" label="Select country" options={sampleCountries} defaultValue="BG" />
      <Select {...args} type="user" label="Select user" options={sampleUsers} defaultValue="brad-zemlak" />
      <Select {...args} type="payment" label="Select payment method" options={samplePaymentMethods} defaultValue="mastercard" />
      <Select {...args} type="coin" label="Select currency" options={sampleCoins} defaultValue="BTC" />
    </div>
  ),
};

/** lg-44, md-40 and sm-32, from the top. Only the paddings and corners change. */
export const Sizes: Story = {
  render: (args: SelectProps) => (
    <div style={column}>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Select key={size} {...args} size={size} type="coin" label="Select a currency" options={sampleCoins} defaultValue="BTC" />
      ))}
    </div>
  ),
};

/** The open list: a search row for long lists, a check on the chosen option. */
export const OpenList: Story = {
  decorators: [withList],
  args: { type: 'country', label: 'Select country', options: sampleCountries, defaultValue: 'BG', searchable: true },
  parameters: { docs: { story: { autoplay: true } } },
  play: openList,
};

/* ---- States: one story each, as is usual in Storybook ---- */

/** Empty: the label sits inside as the placeholder. */
export const Default: Story = { decorators: [field] };

/** A parent can clear a controlled selection with null, matching PrimeReact Dropdown. */
export const Controlled: Story = {
  decorators: [withList],
  render: function Controlled(args) {
    const [value, setValue] = useState<string | null>(null);
    return <div style={{ display: 'grid', gap: 'var(--space-400)' }}>
      <Select {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />
      <Button onClick={() => setValue(null)}>Clear selection</Button>
      <output aria-live="polite">Selected: {value ?? 'None'}</output>
    </div>;
  },
};

/** With a value: the label stays above. */
export const Filled: Story = { decorators: [field], args: { defaultValue: 'utility' } };

/** Pointer over the field: a light fill and a darker border. */
export const Hovered: Story = { decorators: [field], args: { previewState: 'hover', defaultValue: 'utility' } };

/** Focused or open: the darkest border, the label floats and turns dark. */
export const Active: Story = { decorators: [field], args: { previewState: 'active', defaultValue: 'utility' } };

/** Keyboard focus: system blue ring. */
export const Focused: Story = { decorators: [field], args: { previewState: 'focus', defaultValue: 'utility' } };

/** Red border and message; the message replaces the hint. */
export const ErrorState: Story = { name: 'Error', decorators: [field], args: { required: true, error: 'Choose a payment type' } };

/** Not available: grey fill and text, no interaction. */
export const Disabled: Story = { decorators: [field], args: { disabled: true, defaultValue: 'utility' } };

/** Empty, focused, filled. What happens at each step is described on the docs page. */
export const FloatingLabel: Story = {
  render: (args: SelectProps) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--space-800)', paddingTop: 'var(--space-600)' }}>
      <Select {...args} />
      <Select {...args} previewState="focus" />
      <Select {...args} defaultValue="utility" />
    </div>
  ),
};
