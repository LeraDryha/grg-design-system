import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { WithdrawEthFlow } from './WithdrawEth';
import assetsFrame from '../../assets/design/in-product/withdraw-eth/0-assets.png';
import methodFrame from '../../assets/design/in-product/withdraw-eth/1-method.png';
import amountFrame from '../../assets/design/in-product/withdraw-eth/2-amount.png';
import amountLimitFrame from '../../assets/design/in-product/withdraw-eth/2b-amount-limit.png';
import commentFrame from '../../assets/design/in-product/withdraw-eth/3-comment.png';
import summaryFrame from '../../assets/design/in-product/withdraw-eth/4-summary.png';
import requisiteFrame from '../../assets/design/in-product/withdraw-eth/5-requisite.png';
import processingFrame from '../../assets/design/in-product/withdraw-eth/6-processing.png';
import progressFrame from '../../assets/design/in-product/withdraw-eth/7-in-progress.png';

/** A desktop screen; the transformed box keeps the modals inside it. On its own (full screen) it fills the window;
 *  on the docs page it is a 720px window into the app */
const screen: Decorator = (Story, { viewMode }) => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', minWidth: 960, height: viewMode === 'docs' ? 720 : '100vh' }}>
    <Story />
  </div>
);

const meta = {
  title: 'In product/Withdraw ETH',
  tags: ['ready'],
  component: WithdrawEthFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames of the flow (without the company's logos)
    design: [
      { name: '0 · Assets', type: 'image', url: assetsFrame },
      { name: '1 · Withdrawal method', type: 'image', url: methodFrame },
      { name: '2 · Amount', type: 'image', url: amountFrame },
      { name: '2 · Amount, the limit in the modal', type: 'image', url: amountLimitFrame },
      { name: '3 · Comment', type: 'image', url: commentFrame },
      { name: '4 · Withdrawal amount', type: 'image', url: summaryFrame },
      { name: '5 · Save requisite', type: 'image', url: requisiteFrame },
      { name: '6 · Payment processing', type: 'image', url: processingFrame },
      { name: '7 · Transaction in progress', type: 'image', url: progressFrame },
    ],
  },
} satisfies Meta<typeof WithdrawEthFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The flow to try: Withdraw on the Ethereum row, a method, the amount, a comment, the summary, the recipient, and
 *  the payment on its way; the balance goes down at the end. */
export const LiveFlow: Story = {
  name: 'Live flow',
  // Known Figma contrast: the card descriptions (text-soft-500 on bg-weak-100) are 4.3:1
  parameters: { a11y: { test: 'todo' } },
};

/** The same flow walked through by the test (not in the sidebar, so the live flow opens untouched) */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  // Known Figma contrast: the card descriptions (text-soft-500 on bg-weak-100) are 4.3:1
  parameters: { a11y: { test: 'todo' } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Withdraw on the Ethereum row', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Withdraw ETH' }));
      const dialog = await canvas.findByRole('dialog', { name: 'Withdraw ETH' });
      await userEvent.click(within(dialog).getByRole('button', { name: /^Test/ }));
    });
    await step('Too much, then 10 ETH', async () => {
      const dialog = await canvas.findByRole('dialog', { name: 'Withdraw ETH to Test' });
      const amount = within(dialog).getByRole('textbox', { name: 'Amount, ETH' });
      await userEvent.type(amount, '50000');
      await expect(within(dialog).getByText(/Not enough ETH/)).toBeInTheDocument();
      await expect(within(dialog).getByRole('button', { name: 'Continue' })).toBeDisabled();
      await userEvent.clear(amount);
      await userEvent.type(amount, '10');
      await expect(within(dialog).getByText('10 ETH')).toBeInTheDocument();
    });
    await step('A comment', async () => {
      await userEvent.click(within(await canvas.findByRole('dialog', { name: 'Withdraw ETH to Test' })).getByRole('button', { name: 'Add' }));
      const comment = await canvas.findByRole('dialog', { name: 'Comment' });
      await userEvent.type(within(comment).getByRole('textbox', { name: 'Comment' }), 'March payout');
      await userEvent.click(within(comment).getByRole('button', { name: 'Save' }));
      const amountDialog = await canvas.findByRole('dialog', { name: 'Withdraw ETH to Test' });
      await expect(within(amountDialog).getByText('March payout')).toBeInTheDocument();
      await userEvent.click(within(amountDialog).getByRole('button', { name: 'Continue' }));
    });
    await step('Save the recipient', async () => {
      const summary = await canvas.findByRole('dialog', { name: 'Withdrawal amount' });
      await userEvent.click(within(summary).getByRole('switch', { name: 'Save recipient' }));
      await userEvent.click(within(summary).getByRole('button', { name: 'Continue' }));
      const requisite = await canvas.findByRole('dialog', { name: 'Save Requisite' });
      await userEvent.type(within(requisite).getByRole('textbox', { name: /Recipient name/ }), 'Test wallet');
      await userEvent.click(within(requisite).getByRole('button', { name: 'Continue' }));
    });
    await step('On its way, and back to Assets', async () => {
      await canvas.findByRole('heading', { name: 'Payment processing' });
      await userEvent.click(canvas.getByRole('button', { name: 'Transaction details' }));
      await userEvent.click(await canvas.findByRole('button', { name: 'Okay' }));
      await waitFor(() => expect(canvas.getByText('32,213.78997582')).toBeInTheDocument());
    });
  },
};

/** The amount over the limits: the numbers turn red and the note under them says why. */
export const OverTheLimit: Story = {
  name: 'Over the limit',
  args: { startAt: 'amount', startAmount: '40000' },
  parameters: { a11y: { test: 'todo' } },
};

/** The last step: the payment is with the provider. */
export const TransactionInProgress: Story = {
  name: 'Transaction in progress',
  args: { startAt: 'progress', startAmount: '10' },
};
