import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Chip } from './Chip';
import { Input } from '../Input/Input';
import { Search } from '../Search/Search';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { baseIconNames } from '../../icons/names';
import componentFrame from '../../assets/design/chips/chips-component.png';
import guidelinesFrame from '../../assets/design/chips/chips-guidelines.png';
import behaviourFrame from '../../assets/design/chips/chips-behaviour.png';

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-200)' };
const stack: CSSProperties = { display: 'grid', gap: 'var(--space-300)', width: 'calc(var(--space-5000) + var(--space-2000))', maxWidth: '100%' };
const note: CSSProperties = { margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' };

const meta = {
  title: 'Components/Chips',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Chip,
  // The docs page is Chip.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Chips', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Assist, filter, input and suggestion', type: 'image', url: behaviourFrame },
    ],
  },
  args: { label: 'Chip', variant: 'filled', size: 'md', type: 'text', icon: 'check', removable: false, selectable: true, disabled: false },
  argTypes: {
    icon: { control: 'select', options: baseIconNames },
    variant: { control: 'inline-radio', options: ['filled', 'outlined'] },
    size: { control: 'inline-radio', options: ['md', 'sm', 'xs'] },
    type: { control: 'inline-radio', options: ['text', 'icon', 'avatar'] },
    selected: { control: 'boolean' },
    avatar: { control: 'object' },
    onClick: { control: false },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const currencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDT'];

/** Figma Filter chips: any number of currencies; a chosen chip gets a check. */
export const FilterByCurrency: Story = {
  name: 'Filter by currency',
  render: function FilterByCurrency() {
    const [chosen, setChosen] = useState(['USD', 'EUR', 'USDT']);
    return (
      <div style={stack}>
        <div style={row} role="group" aria-label="Currencies">
          {currencies.map(label => (
            <Chip key={label} label={label} selectable selected={chosen.includes(label)}
              onSelectedChange={on => setChosen(on ? [...chosen, label] : chosen.filter(value => value !== label))} />
          ))}
        </div>
        <p style={note} role="status">Showing {chosen.length ? currencies.filter(value => chosen.includes(value)).join(', ') : 'all currencies'}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btc = canvas.getByRole('checkbox', { name: 'BTC' });
    await expect(btc).not.toBeChecked();
    await userEvent.click(btc);
    await expect(btc).toBeChecked();
    await expect(canvas.getByRole('status')).toHaveTextContent('USD, EUR, BTC, USDT');
  },
};

/** The Figma pairing: a search field, and status filters under it. */
export const SearchTransactions: Story = {
  name: 'Search transactions',
  render: function SearchTransactions() {
    const [chosen, setChosen] = useState(['Completed', 'Pending']);
    return (
      <div style={stack}>
        <Search aria-label="Transaction ID" placeholder="Transaction ID" />
        <div style={row} role="group" aria-label="Status">
          {['Completed', 'Pending', 'Failed', 'Refunded'].map(label => (
            <Chip key={label} label={label} size="sm" selectable selected={chosen.includes(label)}
              onSelectedChange={on => setChosen(on ? [...chosen, label] : chosen.filter(value => value !== label))} />
          ))}
        </div>
      </div>
    );
  },
};

/** Figma Suggestion chips: a share of the balance fills the amount; the one in use is marked. */
export const ConvertPresets: Story = {
  name: 'Convert presets',
  render: function ConvertPresets() {
    const balance = 32223.78997582;
    const [share, setShare] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const pick = (value: number) => {
      const next = share === value ? null : value;
      setShare(next);
      setAmount(next === null ? '' : String(+(balance * next / 100).toFixed(8)));
    };
    return (
      <div style={stack}>
        <Input label="From" topKey="Balance" topValue={`${balance.toLocaleString('en-GB', { maximumFractionDigits: 8 })} ETH`} value={amount}
          onValueChange={value => { setAmount(value); setShare(null); }} />
        <div style={row} role="group" aria-label="Share of the balance">
          {[25, 50, 75, 100].map(value => (
            <Chip key={value} label={value === 100 ? 'MAX' : `${value}%`} selectable selected={share === value} onSelectedChange={() => pick(value)} />
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: '75%' }));
    await expect(canvas.getByRole<HTMLInputElement>('textbox', { name: /From/ }).value).toMatch(/^24167\.84248/);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'MAX' }));
    await expect(canvas.getByRole('checkbox', { name: '75%' })).not.toBeChecked();
  },
};

/** Figma Assist chips: a quick secondary action that names what it does, and says when it is done. */
export const ReceiptActions: Story = {
  name: 'Receipt actions',
  render: function ReceiptActions() {
    const [added, setAdded] = useState(false);
    return (
      <div style={row}>
        <Chip type="icon" icon={added ? 'check' : 'calendar'} variant="outlined" label={added ? 'Added to calendar' : 'Add to calendar'} onClick={() => setAdded(true)} />
        <Chip type="icon" icon="download" variant="outlined" label="Download receipt" onClick={() => undefined} />
        <Chip type="icon" icon="reload" variant="outlined" label="Retry payment" onClick={() => undefined} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add to calendar' }));
    await expect(canvas.getByRole('button', { name: 'Added to calendar' })).toBeInTheDocument();
  },
};

/** Figma Input chips on their own: values that can be removed. In a field, use Multi-value Input. */
export const RemovableValues: Story = {
  name: 'Removable values',
  render: function RemovableValues() {
    const [values, setValues] = useState(['Payman', 'Stripe', 'Crypto Processing']);
    return (
      <div style={row}>
        {values.map(value => (
          <Chip key={value} label={value} selectable={false} removable onRemove={() => { setValues(values.filter(item => item !== value)); return false; }} />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Stripe' }));
    await expect(canvas.queryByText('Stripe')).toBeNull();
    // Focus moves on to the next chip, or the previous one after the last
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove Crypto Processing' })).toHaveFocus());
    await userEvent.keyboard('{Delete}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove Payman' })).toHaveFocus());
  },
};

/** Unavailable: no action, no removal. */
export const Unavailable: Story = {
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <div style={row}>
      <Chip label="BTC" selectable disabled />
      <Chip label="Payman" selectable={false} removable disabled />
    </div>
  ),
};

/* ---- Overview ---- */

/** Figma Type: text, a leading icon or an avatar. */
export const Types: Story = {
  render: args => (
    <Showcase>
      <Variant caption="text"><Chip {...args} type="text" /></Variant>
      <Variant caption="icon"><Chip {...args} type="icon" /></Variant>
      <Variant caption="avatar"><Chip {...args} type="avatar" /></Variant>
    </Showcase>
  ),
  args: { selectable: false, removable: true },
};

/** Figma Style: Filled and Outlined, each also chosen. */
export const Styles: Story = {
  render: args => (
    <Showcase>
      <Variant caption="filled"><Chip {...args} variant="filled" /></Variant>
      <Variant caption="filled, chosen"><Chip {...args} variant="filled" selected /></Variant>
      <Variant caption="outlined"><Chip {...args} variant="outlined" /></Variant>
      <Variant caption="outlined, chosen"><Chip {...args} variant="outlined" selected /></Variant>
    </Showcase>
  ),
};

/** Figma Size: md-24, sm-20, xs-16. */
export const Sizes: Story = {
  render: args => (
    <Showcase>
      <Variant caption="md-24"><Chip {...args} size="md" /></Variant>
      <Variant caption="sm-20"><Chip {...args} size="sm" /></Variant>
      <Variant caption="xs-16"><Chip {...args} size="xs" /></Variant>
    </Showcase>
  ),
  args: { selectable: false, removable: true, type: 'icon' },
};
