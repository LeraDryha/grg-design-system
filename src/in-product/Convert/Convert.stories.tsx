import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ConvertFlow } from './Convert';
import { screen } from '../shared/screen';
import convertFrame from '../../assets/design/in-product/convert/1-convert.png';
import overFrame from '../../assets/design/in-product/convert/2-over-balance.png';
import marketFrame from '../../assets/design/in-product/convert/3-market.png';
import presetFrame from '../../assets/design/in-product/convert/4-preset.png';
import receiveFrame from '../../assets/design/in-product/convert/5-you-receive.png';
import confirmFrame from '../../assets/design/in-product/convert/6-confirmation.png';
import successFrame from '../../assets/design/in-product/convert/7-success.png';
import failedFrame from '../../assets/design/in-product/convert/8-failed.png';

const meta = {
  title: 'In product/Convert',
  tags: ['ready'],
  component: ConvertFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames of the flow (without the company's logos)
    design: [
      { name: '1 · Convert, the limits in a popover', type: 'image', url: convertFrame },
      { name: '2 · Over balance', type: 'image', url: overFrame },
      { name: '3 · Not enough on the market', type: 'image', url: marketFrame },
      { name: '4 · 75% of the balance', type: 'image', url: presetFrame },
      { name: '5 · You receive', type: 'image', url: receiveFrame },
      { name: '6 · Confirmation', type: 'image', url: confirmFrame },
      { name: '7 · Order submitted', type: 'image', url: successFrame },
      { name: '8 · The transaction failed', type: 'image', url: failedFrame },
    ],
    // Known Figma contrast: soft text (text-soft-500) on the grey boxes (bg-weak-100) is 4.3:1
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof ConvertFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The flow to try: Convert on a row, an amount in either field, the confirmation, the order. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The same flow walked through by the test (not in the sidebar, so the live flow opens untouched) */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Convert on the Ethereum row', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Convert ETH' }));
    });
    const dialog = within(await canvas.findByRole('dialog', { name: 'Convert' }));
    await step('The coin list stays under its field while searching', async () => {
      const field = canvasElement.querySelector<HTMLElement>('.grg-modal .grg-compact-select__box')!;
      await userEvent.click(field);
      const search = await dialog.findByRole('textbox', { name: /Search/ });
      await userEvent.type(search, 'bit');
      const panel = canvasElement.querySelector<HTMLElement>('.grg-modal .grg-dropdown')!;
      await waitFor(() => expect(Math.abs(panel.getBoundingClientRect().left - field.getBoundingClientRect().left)).toBeLessThan(2));
      // Under the field, or over it when the screen has no room below: never on top of it
      const list = panel.getBoundingClientRect();
      const box = field.getBoundingClientRect();
      await expect(list.top >= box.bottom || list.bottom <= box.top).toBe(true);
      await userEvent.keyboard('{Escape}');
    });
    await step('Too much, then 75% of the balance', async () => {
      await userEvent.type(dialog.getByRole('textbox', { name: 'From, ETH' }), '50000');
      await expect(dialog.getByText('Over balance')).toBeInTheDocument();
      await expect(dialog.getByRole('button', { name: 'Convert' })).toBeDisabled();
      await userEvent.click(dialog.getByRole('checkbox', { name: '75%' }));
      await expect((dialog.getByRole('textbox', { name: 'From, ETH' }) as HTMLInputElement).value).toMatch(/^24,167\.8424818/);
    });
    await step('Exactly 2,000 EUR to receive', async () => {
      const to = dialog.getByRole('textbox', { name: 'To, EUR' });
      await userEvent.clear(to);
      await userEvent.type(to, '2000');
      await expect(dialog.getByRole('checkbox', { name: '75%' })).not.toBeChecked();
      await expect((dialog.getByRole('textbox', { name: 'From, ETH' }) as HTMLInputElement).value).toMatch(/^1\.02/);
      await userEvent.click(dialog.getByRole('button', { name: 'Convert' }));
    });
    await step('Confirm, and the balances change', async () => {
      const confirm = within(await canvas.findByRole('dialog', { name: 'Confirmation' }));
      await expect(confirm.getByText('+2,000 EUR')).toBeInTheDocument();
      await userEvent.click(confirm.getByRole('button', { name: /^Convert ~/ }));
      await userEvent.click(within(await canvas.findByRole('dialog', { name: 'Order successfully submitted' })).getByRole('button', { name: 'Done' }));
      await waitFor(() => expect(canvas.getByText('942,397.78')).toBeInTheDocument());
    });
  },
};

/** Figma "There is not enough volume on the market": ETH to USDC, more than the market can take. */
export const NotEnoughOnTheMarket: Story = {
  name: 'Not enough on the market',
  render: () => <ConvertFlow startAt="amounts" startAmount="2" startTo="usdc" />,
};

/** The other ending: the order fails, with a support code to copy. */
export const WhenItFails: Story = {
  name: 'When it fails',
  args: { outcome: 'failure', startAt: 'failed' },
};
