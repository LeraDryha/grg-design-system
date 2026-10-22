import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { InteractionCard, InteractionTile } from './InteractionCard';
import { ModalPanel } from '../Modal/Modal';
import { PaymentIcon } from '../PaymentIcon/PaymentIcon';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import cardFrame from '../../assets/design/interaction-card/interaction-card-card.png';
import tileFrame from '../../assets/design/interaction-card/interaction-card-tile.png';
import exampleFrame from '../../assets/design/interaction-card/interaction-card-example.png';

const list: CSSProperties = { display: 'grid', gap: 'var(--space-200)', width: 'calc(var(--space-5000) * 2 - var(--space-600))', maxWidth: '100%' };
const tiles: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-400)' };
const note: CSSProperties = { margin: 0, font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' };

const meta = {
  title: 'Components/Interaction Card',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: InteractionCard,
  // The docs page is InteractionCard.mdx
  parameters: {
    layout: 'centered',
    // Known Figma contrast: the description (text-soft-500) on the card (bg-weak-100) is 4.3:1
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Card', type: 'image', url: cardFrame },
      { name: 'Interaction card', type: 'image', url: tileFrame },
      { name: 'Example: withdraw', type: 'image', url: exampleFrame },
    ],
    a11y: { test: 'todo' },
  },
  args: { type: 'icon', title: 'Card title here!', description: 'Card description here!', badge: { label: 'Verified' }, disabled: false, onClick: () => undefined },
  argTypes: {
    type: { control: 'inline-radio', options: ['icon', 'base-icon', 'currency'] },
    onClick: { control: false },
    leading: { control: false },
  },
  render: args => <div style={list}><InteractionCard {...args} /></div>,
} satisfies Meta<typeof InteractionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const methods = [
  { id: 'sepa', title: 'SEPA Transfer', fee: 'Fee 0%', logo: 'sepa' },
  { id: 'card', title: 'Visa, Mastercard', fee: 'Fee 1.50 EUR + 1.5%', logo: 'visa' },
  { id: 'sepa-instant', title: 'SEPA Instant', fee: 'Fee 3.00 EUR + 0.3%', logo: 'sepa' },
] as const;

/** From the Withdraw flow: each method is a card that leads to the next step. */
export const ChooseAWithdrawalMethod: Story = {
  name: 'Choose a withdrawal method',
  render: function ChooseAWithdrawalMethod() {
    const [chosen, setChosen] = useState('');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-300)' }}>
        <ModalPanel title="Withdraw EUR" description="Select withdrawal method" onClose={() => undefined}>
          <div style={{ display: 'grid', gap: 'var(--space-200)' }}>
            {methods.map(method => (
              <InteractionCard key={method.id} title={method.title} description={method.fee}
                leading={<PaymentIcon method={method.logo} size={32} />} onClick={() => setChosen(method.title)} />
            ))}
            <InteractionCard type="icon" icon="wallet" title="ZEN Wallet" description="Unavailable on weekends" disabled onClick={() => setChosen('ZEN Wallet')} />
          </div>
        </ModalPanel>
        <p style={note} role="status">{chosen && `Next: withdraw to ${chosen}`}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Visa, Mastercard/ }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Next: withdraw to Visa, Mastercard');
    await expect(canvas.getByRole('button', { name: /ZEN Wallet/ })).toBeDisabled();
  },
};

/** Figma Currency: a coin to pick, with its balance. */
export const ChooseACurrency: Story = {
  name: 'Choose a currency',
  render: function ChooseACurrency() {
    const [coin, setCoin] = useState('');
    return (
      <div style={list}>
        <InteractionCard type="currency" coin="ethereum-eth" title="Ethereum" amount="32,223.79 ETH" onClick={() => setCoin('Ethereum')} />
        <InteractionCard type="currency" coin="bitcoin-btc" title="Bitcoin" amount="78.92 BTC" onClick={() => setCoin('Bitcoin')} />
        <InteractionCard type="currency" coin="tether-usdt" title="Tether" amount="940,397.78 USDT" onClick={() => setCoin('Tether')} />
        <p style={note} role="status">{coin && `Convert from ${coin}`}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Bitcoin/ }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Convert from Bitcoin');
  },
};

/** Without an action the card is a plain row: no hover, no Tab stop. */
export const Balances: Story = {
  render: () => (
    <div style={list}>
      <InteractionCard type="currency" coin="ethereum-eth" title="Ethereum" amount="32,223.79 ETH" />
      <InteractionCard type="currency" coin="usd-coin-usdc" title="USD Coin" amount="2,381.95 USDC" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

/** Figma Interaction card: the companies to switch between, the current one outlined, and a tile to add one. */
export const ChooseACompany: Story = {
  name: 'Choose a company',
  render: function ChooseACompany() {
    const [current, setCurrent] = useState('northwind');
    return (
      <div style={tiles} role="group" aria-label="Companies">
        <InteractionTile title="Northwind" subtitle="3 members" badge={{ label: 'Verified' }} selected={current === 'northwind'} onClick={() => setCurrent('northwind')} />
        <InteractionTile title="Blue Harbour" subtitle="1 member" badge={{ label: 'Pending', color: 'neutral' }} selected={current === 'harbour'} onClick={() => setCurrent('harbour')} />
        <InteractionTile filled={false} title="Create company" onClick={() => undefined} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const harbour = canvas.getByRole('button', { name: /Blue Harbour/ });
    await expect(harbour).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(harbour);
    await expect(harbour).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: /Northwind/ })).toHaveAttribute('aria-pressed', 'false');
  },
};

/* ---- Overview ---- */

/** Figma Card · Type. */
export const Types: Story = {
  render: args => (
    <Showcase column>
      <Variant caption="icon"><div style={list}><InteractionCard {...args} type="icon" /></div></Variant>
      <Variant caption="base-icon"><div style={list}><InteractionCard {...args} type="base-icon" /></div></Variant>
      <Variant caption="currency"><div style={list}><InteractionCard {...args} type="currency" title="Currency" amount="Amount" /></div></Variant>
    </Showcase>
  ),
};

/** Figma Interaction card · Filled and State Active. */
export const Tiles: Story = {
  render: () => (
    <Showcase>
      <Variant caption="filled"><InteractionTile title="Title" subtitle="Subtitles" badge={{ label: 'Verified' }} onClick={() => undefined} /></Variant>
      <Variant caption="filled, chosen"><InteractionTile title="Title" subtitle="Subtitles" badge={{ label: 'Verified' }} selected onClick={() => undefined} /></Variant>
      <Variant caption="create"><InteractionTile filled={false} title="Create company" onClick={() => undefined} /></Variant>
    </Showcase>
  ),
};
