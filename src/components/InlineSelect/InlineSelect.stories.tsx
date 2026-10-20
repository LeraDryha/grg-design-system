import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { InlineSelect, type InlineSelectProps } from './InlineSelect';
import { Input } from '../Input/Input';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';
import { sampleCoins as amountCoins, sampleCountries as phoneCodes } from '../Input/options';
import { samplePayments } from '../Select/samples';

const meta = {
  title: 'Components/Inline Select',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: InlineSelect,
  // The docs page is InlineSelect.mdx
  parameters: { layout: 'centered' },
  args: { options: phoneCodes, defaultValue: 'BG', type: 'country', 'aria-label': 'Country code', searchable: false, disabled: false },
  argTypes: {
    options: { control: false },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    type: { control: 'inline-radio', options: ['country', 'coin', 'icon'] },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof InlineSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-1000)' };
const SAMPLES = { country: phoneCodes, coin: amountCoins, icon: samplePayments.map(o => ({ ...o, label: o.label.split(' ')[0] })) };

/** Edit everything in Controls. */
export const Playground: Story = {
  render: (args: InlineSelectProps) => <div style={{ minHeight: 300, paddingTop: 'var(--space-200)' }}><InlineSelect {...args} options={SAMPLES[args.type ?? 'country']} /></div>,
};

/** Picture, value and chevron. */
export const Anatomy: Story = {
  render: (args: InlineSelectProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-inline-select__image', side: 'top' },
        { n: 2, target: '.grg-inline-select__value > span', side: 'bottom' },
        { n: 3, target: '.grg-inline-select__trigger', side: 'right' },
      ]}
    >
      <InlineSelect {...args} />
    </AnatomyBlock>
  ),
};

/** Country, Coin and Icon, from the left. */
export const Types: Story = {
  render: (args: InlineSelectProps) => (
    <div style={row}>
      <InlineSelect {...args} type="country" options={phoneCodes} aria-label="Country code" />
      <InlineSelect {...args} type="coin" options={amountCoins} defaultValue="USDC" aria-label="Currency" />
      <InlineSelect {...args} type="icon" options={SAMPLES.icon} defaultValue="rent" aria-label="Payment type" />
    </div>
  ),
};

/** Where it lives: the country code of a phone number and the coin of an amount, in Input. */
export const InFields: Story = {
  render: function InFields() {
    const [country, setCountry] = useState('BG');
    const [coin, setCoin] = useState('USDC');
    return (
    <div style={{ display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' }}>
      <Input type="phone" label="Phone number" defaultValue="6787645" countries={phoneCodes} country={country} onCountryChange={setCountry} />
      <Input type="amount" label="Amount" defaultValue="100.00" coins={amountCoins} coin={coin} onCoinChange={setCoin} />
    </div>
  );
  },
};

/* ---- States ---- */

/** At rest. */
export const Default: Story = {};

/** Pointer over it: the chevron gets darker. */
export const Hovered: Story = { args: { previewState: 'hover' } };

/** Open: the darkest chevron. */
export const Active: Story = { args: { previewState: 'active' } };

/** Keyboard focus is separate from the open state. */
export const Focused: Story = { args: { previewState: 'focus' } };

/** Not available: grey text, picture and chevron. */
export const Disabled: Story = { args: { disabled: true } };

/** A header uses the application's current language and updates its content on selection. */
export const HeaderLanguage: Story = {
  render: function HeaderLanguage() {
    const [language, setLanguage] = useState('uk');
    return <div style={{ display: 'grid', gap: 'var(--space-600)' }}>
      <InlineSelect type="icon" aria-label="Language" value={language} onChange={setLanguage}
        options={[{ value: 'uk', label: 'Українська', icon: 'globe' }, { value: 'en', label: 'English', icon: 'globe' }]} />
      <p lang={language}>{language === 'uk' ? 'Вітаємо у вашому кабінеті' : 'Welcome to your account'}</p>
    </div>;
  },
};

export const EmptySelection: Story = { args: { defaultValue: null, placeholder: 'Country code' } };
export const MissingValue: Story = {
  render: function MissingValue(args: InlineSelectProps) {
    const [value, setValue] = useState('removed');
    return <InlineSelect {...args} value={value} onChange={setValue} />;
  },
};
