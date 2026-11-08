import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DashboardFlow } from './Dashboard';
import { screen } from '../shared/screen';
import tooltipsFrame from '../../assets/design/in-product/dashboard/1-tooltips.png';
import periodFrame from '../../assets/design/in-product/dashboard/2-period.png';
import menuFrame from '../../assets/design/in-product/dashboard/3-asset-menu.png';
import hoverFrame from '../../assets/design/in-product/dashboard/4-row-hover.png';
import emptyFrame from '../../assets/design/in-product/dashboard/5-empty.png';
import keyFrame from '../../assets/design/in-product/dashboard/6-integrate-the-key.png';
import documentsFrame from '../../assets/design/in-product/dashboard/7-verify-documents.png';
import verifiedFrame from '../../assets/design/in-product/dashboard/8-business-verified.png';

const meta = {
  title: 'In product/Dashboard',
  tags: ['ready'],
  component: DashboardFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: [
      { name: '1 · Tooltips', type: 'image', url: tooltipsFrame },
      { name: '2 · Time period', type: 'image', url: periodFrame },
      { name: '3 · Asset menu', type: 'image', url: menuFrame },
      { name: '4 · Row hover', type: 'image', url: hoverFrame },
      { name: '5 · Empty', type: 'image', url: emptyFrame },
      { name: '6 · Integrate the key', type: 'image', url: keyFrame },
      { name: '7 · Verify your documents', type: 'image', url: documentsFrame },
      { name: '8 · Business verified', type: 'image', url: verifiedFrame },
    ],
    // Known Figma contrast: soft text (text-soft-500) under the amounts and on the axis is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof DashboardFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The dashboard to try: the shares of the balance, the payments over a period, the asset menu, the transactions. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('The balance is the Assets total, the largest asset first', async () => {
      await expect(canvas.getByText('68,604,664.10 EUR')).toBeInTheDocument();
      const first = canvasElement.querySelector('.grg-ip-holdings li')!;
      await expect(first).toHaveTextContent(/Ethereum.*91\.5%/);
    });
    await step('A period changes the chart', async () => {
      await expect(canvas.getByRole('group', { name: 'Successful payments, This month' })).toBeInTheDocument();
      const select = () => canvasElement.querySelector<HTMLElement>('.grg-ip-card--payments .grg-compact-select__box')!;
      await userEvent.click(select());
      await userEvent.click(await canvas.findByRole('option', { name: 'This week' }));
      await expect(await canvas.findByRole('group', { name: 'Successful payments, This week' })).toBeInTheDocument();
      // Custom period… opens the calendar under the select; Escape closes it
      await userEvent.click(select());
      await userEvent.click(await canvas.findByRole('option', { name: 'Custom period…' }));
      await expect(await canvas.findByRole('dialog', { name: 'Choose a period' })).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Choose a period' })).toBeNull());
    });
    await step('The arrow keys move through the points', async () => {
      const now = canvasElement.querySelector<HTMLButtonElement>('.grg-ip-chart__point[tabindex="0"]')!;
      now.focus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect(document.activeElement).toHaveAttribute('data-point', String(Number(now.dataset.point) - 1));
    });
    await step('Copy an ID: a Toast says Copied', async () => {
      await userEvent.click(canvas.getAllByRole('button', { name: /^Copy ID of/ })[0]);
      await expect(await canvas.findByText('Copied')).toBeInTheDocument();
    });
    await step('Convert from the asset menu, then back to the dashboard', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Ethereum actions' }));
      await expect(await canvas.findByRole('menuitem', { name: 'Deposit' })).toHaveAttribute('aria-disabled', 'true');
      // A pointer presses the row's text, once the menu has opened
      await userEvent.click(within(canvas.getByRole('menuitem', { name: 'Convert' })).getByText('Convert'));
      const dialog = await canvas.findByRole('dialog', { name: 'Convert' });
      await userEvent.click(within(dialog).getByRole('button', { name: /Close/ }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    });
    await step('View all goes to the Assets page; the menu comes back', async () => {
      await userEvent.click(canvas.getAllByRole('link', { name: 'View all' })[0]);
      await expect(await canvas.findByRole('heading', { name: 'Assets', level: 1 })).toBeInTheDocument();
      await userEvent.click(canvas.getByRole('link', { name: 'Dashboard' }));
      await expect(await canvas.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
    });
  },
};

/** A new account: nothing to show yet, and every part says so. */
export const NewAccount: Story = {
  name: 'New account',
  args: { empty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("You don't have any assets yet")).toBeInTheDocument();
    await expect(canvas.getByText('You don’t have transactions yet')).toBeInTheDocument();
  },
};

/** The next step for a verified business, with a way to put it away. */
export const IntegrateTheKey: Story = {
  name: 'Integrate the key',
  args: { empty: true, note: 'integrate-the-key' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close: Integrate the key to your website' }));
    await expect(canvas.queryByRole('region', { name: 'Integrate the key to your website' })).toBeNull();
  },
};

/** The documents need checking again. */
export const VerifyDocuments: Story = {
  name: 'Verify your documents',
  args: { empty: true, note: 'verify-documents' },
};

/** The moment the business is verified: one modal, then the dashboard with the next step. */
export const BusinessVerified: Story = {
  name: 'Business verified',
  args: { empty: true, note: 'integrate-the-key', verified: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Business verified successfully' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Okay' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};
