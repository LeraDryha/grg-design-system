import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TransactionIcon, type TransactionIconProps, type TransactionType } from './TransactionIcon';
import { avatarColors } from '../Avatar/Avatar';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/transaction-icon/transaction-icon-component.png';

const types: TransactionType[] = ['deposit', 'withdrawal', 'payment', 'exchange'];

const meta = {
  title: 'Components/Transaction Icon',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: TransactionIcon,
  // The docs page is TransactionIcon.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { type: 'deposit', size: 'md' },
  argTypes: {
    type: { control: 'inline-radio', options: types },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'select', options: [undefined, ...baseIconNames] },
    color: { control: 'select', options: [undefined, ...avatarColors] },
  },
} satisfies Meta<typeof TransactionIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const rows: [TransactionType, string, string][] = [
  ['payment', 'Invoice payment', '0.065769 ETH'],
  ['deposit', 'Deposit', '9.9990001 ETH'],
  ['withdrawal', 'Withdrawal', '1.0005 ETH'],
  ['exchange', 'Exchange', 'ETH → EUR'],
];

/** In a list of transactions the type is written next to the icon, so the icon is decorative. */
export const InATransactionList: Story = {
  name: 'In a transaction list',
  render: (args: TransactionIconProps) => (
    <ul style={{ display: 'grid', gap: 'var(--space-300)', width: 'calc(var(--space-5000) + var(--space-2000))', margin: 0, padding: 0, listStyle: 'none', font: 'var(--typo-body-sm-regular)' }}>
      {rows.map(([type, label, amount]) => (
        <li key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
          <TransactionIcon {...args} type={type} size="sm" />
          <span style={{ flex: 1, color: 'var(--text-strong-1000)' }}>{label}</span>
          <span style={{ color: 'var(--text-subtle-700)' }}>{amount}</span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('img')).toHaveLength(0);
  },
};

/** A kind of transaction not in the list: any Base icon on any Additional colour. */
export const AnotherKind: Story = {
  name: 'Another kind',
  args: { icon: 'gift', color: 'pink', label: 'Referral reward', size: 'lg' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Referral reward' })).toBeInTheDocument();
  },
};

/* ---- Overview ---- */

/** The four kinds, in the three Figma sizes. */
export const TypesAndSizes: Story = {
  name: 'Types and sizes',
  render: (args: TransactionIconProps) => (
    <Showcase column>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Showcase key={size}>
          {types.map(type => (
            <Variant key={type} caption={`${type} · ${size === 'sm' ? 'sm-20' : size === 'md' ? 'md-24' : 'lg-48'}`}>
              <TransactionIcon {...args} type={type} size={size} />
            </Variant>
          ))}
        </Showcase>
      ))}
    </Showcase>
  ),
};
