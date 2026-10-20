import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { InlineSelect, type InlineSelectProps } from './InlineSelect';
import { Input } from '../Input/Input';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { sampleCoins as amountCoins, sampleCountries as phoneCodes } from '../Input/options';
import { samplePayments } from '../Select/samples';
import componentFrame from '../../assets/design/inline-select/inline-select-component.png';

/** Room for the open list inside the example card */
const withList: Decorator = Story => <div style={{ minHeight: 340, paddingTop: 'var(--space-200)' }}><Story /></div>;
const SAMPLES = { country: phoneCodes, coin: amountCoins, icon: samplePayments.map(o => ({ ...o, label: o.label.split(' ')[0] })) };

const meta = {
  title: 'Components/Inline Select',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: InlineSelect,
  // The docs page is InlineSelect.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma component as an image (the company's file isn't linked publicly; Figma has no guidelines page)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { options: phoneCodes, defaultValue: 'BG', type: 'country', 'aria-label': 'Country code', searchable: false, disabled: false },
  argTypes: {
    options: { control: false },
    type: { control: 'inline-radio', options: ['country', 'coin', 'icon'] },
    onChange: { action: 'changed', control: false },
  },
} satisfies Meta<typeof InlineSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. */
export const Playground: Story = {
  decorators: [withList],
  render: (args: InlineSelectProps) => <InlineSelect {...args} options={SAMPLES[args.type ?? 'country']} />,
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Inside fields: the country code of a phone number and the coin of an amount, in Input. */
export const InsideAField: Story = {
  name: 'Inside a field',
  decorators: [withList],
  render: function InsideAField() {
    const [country, setCountry] = useState('BG');
    const [coin, setCoin] = useState('USDC');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' }}>
        <Input type="phone" label="Phone number" defaultValue="6787645" countries={phoneCodes} country={country} onCountryChange={setCountry} />
        <Input type="amount" label="Amount" defaultValue="100.00" coins={amountCoins} coin={coin} onCoinChange={setCoin} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Country code' })).toBeInTheDocument();
    await expect(canvas.getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
  },
};

/** The language of the page, in a header: the content follows the choice. */
export const SwitchTheLanguage: Story = {
  name: 'Switch the language',
  decorators: [withList],
  render: function SwitchTheLanguage() {
    const [language, setLanguage] = useState('uk');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-600)' }}>
        <InlineSelect type="icon" aria-label="Language" value={language} onChange={setLanguage}
          options={[{ value: 'uk', label: 'Українська', icon: 'globe' }, { value: 'en', label: 'English', icon: 'globe' }]} />
        <p lang={language} style={{ margin: 0, font: 'var(--typo-body-md-regular)', color: 'var(--text-strong-1000)' }}>
          {language === 'uk' ? 'Вітаємо у вашому кабінеті' : 'Welcome to your account'}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-inline-select__root')!);
    await userEvent.click(await canvas.findByRole('option', { name: 'English' }));
    await waitFor(() => expect(canvas.getByText('Welcome to your account')).toBeVisible());
  },
};

/** All country codes: a long list with a search row. */
export const SearchTheCodes: Story = {
  name: 'Search the codes',
  decorators: [withList],
  args: { searchable: true, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-inline-select__root')!);
    const search = await canvas.findByRole('textbox', { name: /search/i });
    await userEvent.type(search, 'ukr');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith('UA'));
  },
};

/** A value that is no longer available: the select shows its empty state, never another option. */
export const ARemovedValue: Story = {
  name: 'A removed value',
  args: { onChange: fn() },
  render: function ARemovedValue(args: InlineSelectProps) {
    const [value, setValue] = useState('removed');
    return <InlineSelect {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />;
  },
  play: async ({ args }) => {
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Not available, with its field: grey text, a faded picture and a grey chevron. */
export const Unavailable: Story = { args: { disabled: true } };

/* ---- Overview ---- */

/** Country, Coin and Icon. */
export const Types: Story = {
  render: (args: InlineSelectProps) => (
    <Showcase>
      <Variant caption="Country"><InlineSelect {...args} type="country" options={phoneCodes} aria-label="Country code" /></Variant>
      <Variant caption="Coin"><InlineSelect {...args} type="coin" options={amountCoins} defaultValue="USDC" aria-label="Currency" /></Variant>
      <Variant caption="Icon"><InlineSelect {...args} type="icon" options={SAMPLES.icon} defaultValue="rent" aria-label="Payment type" /></Variant>
    </Showcase>
  ),
};
