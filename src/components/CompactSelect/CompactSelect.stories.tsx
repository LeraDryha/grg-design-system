import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { CompactSelect, type CompactSelectProps } from './CompactSelect';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';
import { sampleCoins, sampleCountries, sampleCurrencies, samplePayments } from '../Select/samples';

const meta = {
  title: 'Components/Compact Select',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: CompactSelect,
  // The docs page is CompactSelect.mdx
  parameters: { layout: 'centered' },
  args: { options: sampleCurrencies, defaultValue: 'USD', type: 'default', size: 'md', 'aria-label': 'Currency', invalid: false, disabled: false, searchable: false, previewState: 'default' },
  argTypes: {
    options: { control: false },
    type: { control: 'inline-radio', options: ['default', 'icon', 'country', 'coin'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof CompactSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-600)', minHeight: 300, alignContent: 'start' };
const SAMPLES = { default: sampleCurrencies, icon: samplePayments, country: sampleCountries, coin: sampleCoins };

/** Edit everything in Controls. Choosing a type also picks its sample options. */
export const Playground: Story = {
  render: (args: CompactSelectProps) => <div style={{ minHeight: 300 }}><CompactSelect {...args} options={SAMPLES[args.type ?? 'default']} /></div>,
};

/** Container, value and chevron. */
export const Anatomy: Story = {
  render: (args: CompactSelectProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-compact-select__box', side: 'left' },
        { n: 2, target: '.grg-compact-select__text', side: 'top' },
        { n: 3, target: '.grg-compact-select__trigger', side: 'right' },
      ]}
    >
      <CompactSelect {...args} />
    </AnatomyBlock>
  ),
};

/** Default (text), Icon, Country and Coin, from the left. */
export const Types: Story = {
  render: (args: CompactSelectProps) => (
    <div style={{ ...row, minHeight: 0 }}>
      <CompactSelect {...args} type="default" options={sampleCurrencies} aria-label="Currency" />
      <CompactSelect {...args} type="icon" options={samplePayments} defaultValue="rent" aria-label="Payment type" />
      <CompactSelect {...args} type="country" options={sampleCountries} defaultValue="BG" aria-label="Country" />
      <CompactSelect {...args} type="coin" options={sampleCoins} defaultValue="BTC" aria-label="Coin" />
    </div>
  ),
};

/** lg-44, md-40 and sm-32, from the left. */
export const Sizes: Story = {
  render: (args: CompactSelectProps) => (
    <div style={{ ...row, minHeight: 0 }}>
      {(['lg', 'md', 'sm'] as const).map(size => <CompactSelect key={size} {...args} size={size} type="country" options={sampleCountries} defaultValue="BG" aria-label="Country" />)}
    </div>
  ),
};

/* ---- States: one story each ---- */

/** At rest. */
export const Default: Story = {};

/** Pointer over the select: a light fill and a darker border. */
export const Hovered: Story = { args: { previewState: 'hover' } };

/** Open: the darkest border, the chevron points up. */
export const Active: Story = { args: { previewState: 'active' } };

/** Keyboard focus: system blue ring. */
export const Focused: Story = { args: { previewState: 'focus' } };

/** Red border: explain the problem next to the select. */
export const ErrorState: Story = { name: 'Error', args: { invalid: true } };

/** Not available: grey fill, no interaction. */
export const Disabled: Story = { args: { disabled: true } };

/** No value means no selection, even when the first option is available. */
export const EmptySelection: Story = { args: { defaultValue: null, placeholder: 'Currency' } };

/** An unavailable value never silently selects another option. */
export const MissingValue: Story = {
  render: function MissingValue(args: CompactSelectProps) {
    const [value, setValue] = useState('removed');
    return <CompactSelect {...args} value={value} onChange={setValue} />;
  },
};
