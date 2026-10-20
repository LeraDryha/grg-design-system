import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Filter, type FilterProps, type FilterValue } from './Filter';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { sampleCurrencies, sampleMerchants, sampleStatuses, sampleTypes } from './samples';
import componentFrame from '../../assets/design/filter/filter-component.png';
import guidelinesFrame from '../../assets/design/filter/filter-guidelines.png';
import behaviourFrame from '../../assets/design/filter/filter-behaviour.png';

/** Room for the open list under the filter */
const withList: Decorator = Story => <div style={{ minHeight: 420, minWidth: 320 }}><Story /></div>;

const meta = {
  title: 'Components/Filter',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Filter,
  // The docs page is Filter.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Behaviour', type: 'image', url: behaviourFrame },
    ],
  },
  args: { label: 'Merchant', type: 'single', options: sampleMerchants, size: 'md', disabled: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple', 'date'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    options: { control: false },
    searchable: { control: 'boolean' },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens the filter's list, as a click on the filter does */
const openFilter = async (canvasElement: HTMLElement, index = 0) => {
  await userEvent.click(canvasElement.querySelectorAll<HTMLElement>('.grg-filter__trigger')[index]);
};
/** Clicks a row of the open list by its text, as a pointer does */
const choose = async (canvasElement: HTMLElement, text: string) => {
  const option = await within(canvasElement).findByRole('option', { name: new RegExp(text, 'i') });
  await userEvent.click(option);
};

/** Edit everything in Controls. */
export const Playground: Story = { decorators: [withList] };

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** One merchant: the filter keeps its label, shows the value and gets a clear button. */
export const ChooseOneMerchant: Story = {
  name: 'Choose one merchant',
  decorators: [withList],
  args: { searchable: true, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await openFilter(canvasElement);
    await userEvent.type(await canvas.findByRole('textbox', { name: /search/i }), 'proxy');
    await choose(canvasElement, 'Crypto Proxy');
    await expect(args.onChange).toHaveBeenCalledWith('crypto-proxy');
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveAccessibleName('Merchant: Crypto Proxy'));
    await expect(canvas.getByRole('button', { name: 'Clear Merchant filter' })).toBeVisible();
  },
};

/** Several merchants: each tick applies at once, the list stays open, and the filter shows how many. */
export const ChooseSeveral: Story = {
  name: 'Choose several',
  decorators: [withList],
  args: { type: 'multiple', searchable: true, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await openFilter(canvasElement);
    await choose(canvasElement, 'Corefy');
    await choose(canvasElement, 'Crypto Proxy');
    await expect(args.onChange).toHaveBeenLastCalledWith(['corefy', 'crypto-proxy']);
    // Still open after two ticks
    await expect(canvas.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveAccessibleName('Merchant: 2 selected, Corefy, Crypto Proxy'));
    await expect(canvasElement.querySelector('.grg-filter')).toHaveAttribute('data-applied', 'multi');
  },
};

/** A status: the chosen one shows as a status Badge; several show a count. No search in a short list. */
export const FilterByStatus: Story = {
  name: 'Filter by status',
  decorators: [withList],
  args: { label: 'Status', options: sampleStatuses },
  // Known contrast note: the Figma Warning badge (Passive) is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openFilter(canvasElement);
    await expect(canvas.queryByRole('textbox', { name: /search/i })).toBeNull();
    await choose(canvasElement, 'Active');
    await waitFor(() => expect(canvasElement.querySelector('.grg-filter .grg-badge')).toHaveTextContent('Active'));
  },
};

/** A long value: cut with an ellipsis at 264px; the tooltip and screen readers get it in full. */
export const ALongValue: Story = {
  name: 'A long value',
  args: { defaultValue: 'international-crypto-settlement-provider' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox')).toHaveAccessibleName('Merchant: International Crypto Settlement Provider');
    const value = canvasElement.querySelector<HTMLElement>('.grg-filter__value')!;
    await waitFor(() => expect(value.scrollWidth).toBeGreaterThan(value.clientWidth));
  },
};

/** Clear with the keyboard: Tab reaches the clear button after the filter; focus returns to the filter. */
export const ClearWithTheKeyboard: Story = {
  name: 'Clear with the keyboard',
  args: { defaultValue: 'corefy', onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('combobox')).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Clear Merchant filter' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith(null);
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveFocus());
    await expect(canvas.queryByRole('button', { name: 'Clear Merchant filter' })).toBeNull();
  },
};

/** A period: the date filter opens Date Picker; the preset's name, or the dates, show once applied. */
export const FilterByDate: Story = {
  name: 'Filter by date',
  decorators: [Story => <div style={{ minHeight: 480, minWidth: 820 }}><Story /></div>],
  args: { label: 'Created date', type: 'date', options: undefined, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Created date' }));
    const calendar = within(await canvas.findByRole('dialog'));
    await userEvent.click(calendar.getByRole('option', { name: 'Last 30 days' }));
    await userEvent.click(calendar.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await expect(canvas.getByRole('button', { name: /Created date\s*:\s*Last 30 days/ })).toHaveFocus();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/** A filter bar over a table: several filters and the text button Reset, which clears them all. */
export const AFilterBar: Story = {
  name: 'A filter bar',
  render: function AFilterBar(args: FilterProps) {
    const empty: Record<string, FilterValue> = { created: null, merchant: null, type: null, status: null, currency: [] };
    const [filters, setFilters] = useState<Record<string, FilterValue>>({ ...empty, type: 'trading', currency: ['BTC', 'USDT'] });
    const set = (key: string) => (value: FilterValue) => setFilters(f => ({ ...f, [key]: value }));
    const any = Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v != null));
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-200)', minHeight: 440, alignContent: 'flex-start' }}>
        <Filter {...args} size="sm" label="Created date" type="date" value={filters.created} onChange={set('created')} />
        <Filter {...args} size="sm" label="Merchant" type="multiple" options={sampleMerchants} searchable value={filters.merchant} onChange={set('merchant')} />
        <Filter {...args} size="sm" label="Type" options={sampleTypes} value={filters.type} onChange={set('type')} />
        <Filter {...args} size="sm" label="Status" options={sampleStatuses} value={filters.status} onChange={set('status')} />
        <Filter {...args} size="sm" label="Currency" type="multiple" options={sampleCurrencies} value={filters.currency} onChange={set('currency')} />
        <Button variant="text" size="sm" leftIcon={undefined} disabled={!any} onClick={() => setFilters(empty)}>Reset</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('.grg-filter:not([data-applied="none"])')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvasElement.querySelectorAll('.grg-filter:not([data-applied="none"])')).toHaveLength(0);
    await expect(canvas.getByRole('button', { name: 'Reset' })).toBeDisabled();
  },
};

/** Not available right now. */
export const Unavailable: Story = {
  args: { disabled: true, defaultValue: 'corefy' },
  // Known contrast note: the Figma disabled text grey is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
};

/* ---- Overview ---- */

/** None, Single and Multi (Figma Applied). */
export const Applied: Story = {
  render: (args: FilterProps) => (
    <Showcase>
      <Variant caption="None"><Filter {...args} /></Variant>
      <Variant caption="Single"><Filter {...args} defaultValue="crypto-proxy" /></Variant>
      <Variant caption="Multi"><Filter {...args} type="multiple" defaultValue={['corefy', 'crypto-proxy']} /></Variant>
      <Variant caption="Status"><Filter {...args} label="Status" options={sampleStatuses} defaultValue="active" /></Variant>
    </Showcase>
  ),
};

/** lg-44, md-40 and sm-32. */
export const Sizes: Story = {
  render: (args: FilterProps) => (
    <Showcase>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Variant key={size} caption={{ lg: 'lg · 44px', md: 'md · 40px', sm: 'sm · 32px' }[size]}>
          <Filter {...args} size={size} label="Type" type="multiple" options={sampleTypes} defaultValue={['deposit', 'trading']} />
        </Variant>
      ))}
    </Showcase>
  ),
};

