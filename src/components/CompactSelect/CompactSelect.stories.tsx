import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CompactSelect, type CompactSelectProps } from './CompactSelect';
import { Input } from '../Input/Input';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { sampleCoins, sampleCountries, sampleCurrencies, samplePayments } from '../Select/samples';
import componentFrame from '../../assets/design/compact-select/compact-select-component.png';

/** Room for the open list inside the example card */
const withList: Decorator = Story => <div style={{ minHeight: 360 }}><Story /></div>;
const SAMPLES = { default: sampleCurrencies, icon: samplePayments, country: sampleCountries, coin: sampleCoins };

const meta = {
  title: 'Components/Compact Select',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: CompactSelect,
  // The docs page is CompactSelect.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma component as an image (the company's file isn't linked publicly; Figma has no guidelines page)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { options: sampleCurrencies, defaultValue: 'USD', type: 'default', size: 'md', 'aria-label': 'Currency', invalid: false, disabled: false, searchable: false },
  argTypes: {
    options: { control: false },
    type: { control: 'inline-radio', options: ['default', 'icon', 'country', 'coin'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof CompactSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Choosing a type also picks its sample options. */
export const Playground: Story = {
  decorators: [withList],
  render: (args: CompactSelectProps) => <CompactSelect {...args} options={SAMPLES[args.type ?? 'default']} />,
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A currency next to an amount: the meaning is clear from the field beside it, so there's no label. */
export const CurrencyNextToAnAmount: Story = {
  name: 'Currency next to an amount',
  decorators: [withList],
  render: (args: CompactSelectProps) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-200)', width: 340, paddingTop: 'var(--space-600)' }}>
      <div style={{ flex: 1 }}><Input label="Amount" leftIcon={null} inputMode="decimal" defaultValue="120.00" /></div>
      <CompactSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard only: Tab to the select (past the amount and its clear button), ↓ opens the list, ↓ moves, Enter chooses
    const select = canvas.getByRole('combobox', { name: 'Currency' });
    for (let i = 0; i < 4 && document.activeElement !== select; i++) await userEvent.tab();
    await expect(select).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(canvasElement.querySelector('.grg-compact-select__text')).toHaveTextContent('EUR'));
  },
};

/** A country by its flag, with a search row for the long list. */
export const PickACountry: Story = {
  name: 'Pick a country',
  decorators: [withList],
  args: { type: 'country', options: sampleCountries, defaultValue: 'BG', 'aria-label': 'Country', searchable: true, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-compact-select__box')!);
    await userEvent.type(await canvas.findByRole('textbox', { name: /search/i }), 'pol');
    await userEvent.click(await canvas.findByRole('option', { name: /poland/i }));
    await expect(args.onChange).toHaveBeenCalledWith('PL');
  },
};

/** A value that is no longer available: the select shows its empty state, never another option. */
export const ARemovedValue: Story = {
  name: 'A removed value',
  args: { onChange: fn() },
  render: function ARemovedValue(args: CompactSelectProps) {
    const [value, setValue] = useState('removed');
    return <CompactSelect {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />;
  },
  play: async ({ args, canvasElement }) => {
    await expect(canvasElement.querySelector('.grg-compact-select__text')).toHaveTextContent('Select');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** A wrong choice: a red border, and the reason written next to the select (it has no hint of its own). */
export const ExplainAnError: Story = {
  name: 'Explain an error',
  render: (args: CompactSelectProps) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
      <CompactSelect {...args} defaultValue="CNY" invalid aria-describedby="currency-error" />
      <span id="currency-error" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--error-base-600)' }}>This account can't receive CNY</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Currency' });
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription("This account can't receive CNY");
  },
};

/** Not available right now: grey fill and chevron, no interaction. */
export const Unavailable: Story = { args: { disabled: true } };

/* ---- Overview ---- */

/** Default (text), Icon, Country and Coin. */
export const Types: Story = {
  render: (args: CompactSelectProps) => (
    <Showcase>
      <Variant caption="Default"><CompactSelect {...args} type="default" options={sampleCurrencies} aria-label="Currency" /></Variant>
      <Variant caption="Icon"><CompactSelect {...args} type="icon" options={samplePayments} defaultValue="rent" aria-label="Payment type" /></Variant>
      <Variant caption="Country"><CompactSelect {...args} type="country" options={sampleCountries} defaultValue="BG" aria-label="Country" /></Variant>
      <Variant caption="Coin"><CompactSelect {...args} type="coin" options={sampleCoins} defaultValue="BTC" aria-label="Coin" /></Variant>
    </Showcase>
  ),
};

/** lg-44, md-40 and sm-32. */
export const Sizes: Story = {
  render: (args: CompactSelectProps) => (
    <Showcase>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Variant key={size} caption={{ lg: 'lg · 44px', md: 'md · 40px', sm: 'sm · 32px' }[size]}>
          <CompactSelect {...args} size={size} type="country" options={sampleCountries} defaultValue="BG" aria-label="Country" />
        </Variant>
      ))}
    </Showcase>
  ),
};
