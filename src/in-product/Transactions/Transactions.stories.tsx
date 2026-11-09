import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TransactionsFlow } from './Transactions';
import { screen } from '../shared/screen';
import listFrame from '../../assets/design/in-product/transactions/1-list.png';
import typesFrame from '../../assets/design/in-product/transactions/2-types.png';
import statusesFrame from '../../assets/design/in-product/transactions/3-statuses.png';
import currenciesFrame from '../../assets/design/in-product/transactions/4-currencies.png';
import periodFrame from '../../assets/design/in-product/transactions/5-period.png';
import notVerifiedFrame from '../../assets/design/in-product/transactions/6-not-verified.png';
import paymentFrame from '../../assets/design/in-product/transactions/7-invoice-payment.png';
import withdrawalFrame from '../../assets/design/in-product/transactions/8-withdrawal.png';
import commentedFrame from '../../assets/design/in-product/transactions/9-withdrawal-comment.png';
import commentFrame from '../../assets/design/in-product/transactions/10-comment.png';
import depositFrame from '../../assets/design/in-product/transactions/11-deposit.png';
import exchangeFrame from '../../assets/design/in-product/transactions/12-exchange.png';
import cancelledFrame from '../../assets/design/in-product/transactions/13-cancelled.png';

export const frames: [string, string][] = [
  [listFrame, '1 · Transactions'], [typesFrame, '2 · Types'], [statusesFrame, '3 · Statuses'], [currenciesFrame, '4 · Currencies'],
  [periodFrame, '5 · Period'], [notVerifiedFrame, '6 · Not verified'], [paymentFrame, '7 · Invoice payment details'], [withdrawalFrame, '8 · Withdrawal details'],
  [commentedFrame, '9 · With a comment'], [commentFrame, '10 · The comment modal'], [depositFrame, '11 · Deposit details'], [exchangeFrame, '12 · Exchange details'],
  [cancelledFrame, '13 · A cancelled withdrawal'],
];

const meta = {
  title: 'In product/Transactions',
  tags: ['ready'],
  component: TransactionsFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
    // Known Figma contrast: soft text (text-soft-500) in the table is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof TransactionsFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: filter the list, open a transaction, comment on a withdrawal, open it as a page. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvasElement.querySelectorAll('.grg-ip-surface tbody tr');
    const pick = async (filter: string, option: string) => {
      await userEvent.click(canvasElement.querySelector<HTMLElement>(`[aria-label="${filter}"]`)!.closest('.grg-compact-select')!.querySelector<HTMLElement>('.grg-compact-select__box')!);
      await userEvent.click(await canvas.findByRole('option', { name: option }));
    };
    await step('Filters right after the search narrow the list; Reset brings it back', async () => {
      const all = rows().length;
      await pick('Type', 'Withdrawal');
      await waitFor(() => expect(rows().length).toBeLessThan(all));
      await pick('Status', 'Cancelled');
      await waitFor(() => expect(rows()).toHaveLength(1));
      await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
      await waitFor(() => expect(rows().length).toBe(all));
      await expect(canvas.queryByRole('button', { name: 'Reset' })).toBeNull();
    });
    await step('A withdrawal opens in the drawer, its colour and amount in the header', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^Open Withdrawal, 0\.25 BTC/ }));
      const drawer = await canvas.findByRole('dialog', { name: 'Transaction details' });
      const header = drawer.querySelector<HTMLElement>('.grg-modal-header')!;
      await expect(header).toHaveAttribute('data-tinted');
      await expect(within(header).getByText('0.25 BTC')).toBeInTheDocument();
      await expect(within(drawer).getByText('Monthly payout to the cold wallet.')).toBeInTheDocument();
    });
    await step('The comment is edited in place, without a modal', async () => {
      const drawer = within(canvas.getByRole('dialog'));
      await userEvent.click(drawer.getByRole('button', { name: 'Edit comment' }));
      const field = drawer.getByRole('textbox', { name: 'Comment' });
      await userEvent.clear(field);
      await userEvent.type(field, 'Payout for March');
      await userEvent.click(drawer.getByRole('button', { name: 'Save' }));
      await expect(await drawer.findByText('Payout for March')).toBeInTheDocument();
      await expect(canvas.getAllByRole('dialog')).toHaveLength(1);
      await waitFor(() => expect(drawer.getByRole('button', { name: 'Edit comment' })).toHaveFocus());
    });
    await step('Open as a page, then back to the list', async () => {
      await userEvent.click(within(canvas.getByRole('dialog')).getByRole('button', { name: 'Open as a page' }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await expect(canvas.getByRole('heading', { level: 1, name: 'Transaction details' })).toBeInTheDocument();
      await expect(canvas.getByText('Payout for March')).toBeInTheDocument();
      await userEvent.click(canvas.getByRole('button', { name: 'Back to transactions' }));
      await expect(await canvas.findByRole('heading', { level: 1, name: 'Transactions' })).toBeInTheDocument();
    });
  },
};

/** Before verification: no transactions yet, and the page says what to do. */
export const NotVerified: Story = { name: 'Not verified', args: { account: 'not-verified' } };
