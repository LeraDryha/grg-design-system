import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AssetsFlow } from './Assets';
import { screen } from '../shared/screen';
import notVerifiedFrame from '../../assets/design/in-product/assets/1-not-verified.png';
import verifyingFrame from '../../assets/design/in-product/assets/2-verification-in-progress.png';
import assetsFrame from '../../assets/design/in-product/assets/3-assets.png';
import hideSmallFrame from '../../assets/design/in-product/assets/4-hide-small-balances.png';
import currencyFrame from '../../assets/design/in-product/assets/5-balance-currency.png';
import tooltipFrame from '../../assets/design/in-product/assets/6-withdrawal-in-progress-tooltip.png';

export const frames: [string, string][] = [
  [assetsFrame, '1 · Assets'], [currencyFrame, '2 · The balance in another currency'], [tooltipFrame, '3 · Withdrawal in progress, explained'],
  [hideSmallFrame, '4 · Small balances hidden'], [notVerifiedFrame, '5 · Before verification'], [verifyingFrame, '6 · Verification in progress'],
];

const meta = {
  title: 'In product/Assets',
  tags: ['ready'],
  component: AssetsFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
    // Known Figma contrast: soft text (text-soft-500) in the table is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof AssetsFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: the balance in another currency, small balances hidden, Convert and Withdraw from a row. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvasElement.querySelectorAll('.grg-ip-surface tbody tr');
    await step('The balance in EUR, then in BTC', async () => {
      await expect(canvas.getByText('68,604,664.10')).toBeInTheDocument();
      // A pointer presses the select's box, as on the Inline Select page
      await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-ip-balances .grg-inline-select__root')!);
      await userEvent.click(await canvas.findByRole('option', { name: 'BTC' }));
      await waitFor(() => expect(canvas.queryByText('68,604,664.10')).toBeNull());
      await expect(canvas.getByText(/^1,105\.8/)).toBeInTheDocument();
    });
    await step('Withdrawal in progress is explained by its info button', async () => {
      await expect(canvas.getByRole('button', { name: 'About withdrawal in progress' })).toBeInTheDocument();
    });
    await step('Small balances hide and come back', async () => {
      await expect(rows()).toHaveLength(7);
      await userEvent.click(canvas.getByRole('checkbox', { name: 'Hide small balances (less 1 EUR)' }));
      await expect(rows()).toHaveLength(5);
      await userEvent.click(canvas.getByRole('checkbox', { name: 'Hide small balances (less 1 EUR)' }));
      await expect(rows()).toHaveLength(7);
    });
    await step('Convert and Withdraw open from a row; an empty balance has them off', async () => {
      await expect(canvas.getByRole('button', { name: 'Convert BCH' })).toBeDisabled();
      await userEvent.click(canvas.getByRole('button', { name: 'Convert ETH' }));
      const convert = await canvas.findByRole('dialog', { name: 'Convert' });
      await userEvent.click(within(convert).getByRole('button', { name: /Close/ }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await userEvent.click(canvas.getByRole('button', { name: 'Withdraw ETH' }));
      await expect(await canvas.findByRole('dialog', { name: 'Withdraw ETH' })).toBeInTheDocument();
    });
  },
};

/** Before verification: the assets appear once the business is verified. */
export const NotVerified: Story = {
  name: 'Not verified',
  args: { account: 'not-verified' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'You don’t have assets yet' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Verify business to get started' })).toBeInTheDocument();
  },
};

/** While the documents are checked: nothing to do but wait, so no button. */
export const Verifying: Story = {
  name: 'Verification in progress',
  args: { account: 'verifying' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Verification in progress' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Verify business to get started' })).toBeNull();
  },
};
