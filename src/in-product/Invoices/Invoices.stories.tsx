import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InvoicesFlow } from './Invoices';
import { screen } from '../shared/screen';
import listFrame from '../../assets/design/in-product/invoices/1-list.png';
import periodFrame from '../../assets/design/in-product/invoices/2-custom-period.png';
import createFrame from '../../assets/design/in-product/invoices/3-create-empty.png';
import filledFrame from '../../assets/design/in-product/invoices/4-create-filled.png';
import fieldFrame from '../../assets/design/in-product/invoices/5-custom-field.png';
import deactivateFrame from '../../assets/design/in-product/invoices/6-deactivate.png';
import notVerifiedFrame from '../../assets/design/in-product/invoices/7-not-verified.png';
import verifyingFrame from '../../assets/design/in-product/invoices/8-verifying.png';

const meta = {
  title: 'In product/Invoices',
  tags: ['ready'],
  component: InvoicesFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: [
      { name: '1 · Invoices', type: 'image', url: listFrame },
      { name: '2 · A custom period', type: 'image', url: periodFrame },
      { name: '3 · Create invoice (a page in Figma)', type: 'image', url: createFrame },
      { name: '4 · Required fields filled', type: 'image', url: filledFrame },
      { name: '5 · Add custom field', type: 'image', url: fieldFrame },
      { name: '6 · Deactivate', type: 'image', url: deactivateFrame },
      { name: '7 · Not verified', type: 'image', url: notVerifiedFrame },
      { name: '8 · Verification in progress', type: 'image', url: verifyingFrame },
    ],
    // Known Figma contrast: soft text (text-soft-500) in the table and the form is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof InvoicesFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: filter the list, create an invoice, open one, deactivate a link. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvasElement.querySelectorAll('.grg-ip-surface tbody tr');
    await step('A status filter narrows the list', async () => {
      const all = rows().length;
      await userEvent.click(canvasElement.querySelector<HTMLElement>('[aria-label="Status"]')!.closest('.grg-compact-select')!.querySelector<HTMLElement>('.grg-compact-select__box')!);
      await userEvent.click(await canvas.findByRole('option', { name: 'Paid' }));
      await waitFor(() => expect(rows().length).toBeLessThan(all));
      await userEvent.click(canvasElement.querySelector<HTMLElement>('[aria-label="Status"]')!.closest('.grg-compact-select')!.querySelector<HTMLElement>('.grg-compact-select__box')!);
      await userEvent.click(await canvas.findByRole('option', { name: 'All statuses' }));
    });
    await step('Create an invoice in the drawer; the result and the link stay in it', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Create invoice' }));
      const drawer = within(await canvas.findByRole('dialog', { name: 'Create invoice' }));
      await expect(drawer.getByRole('button', { name: 'Create invoice' })).toBeDisabled();
      await userEvent.type(drawer.getByRole('textbox', { name: /Amount/ }), '1000');
      // A custom field, typed in the drawer
      await userEvent.click(drawer.getByRole('button', { name: 'Add custom field' }));
      await userEvent.type(drawer.getByRole('textbox', { name: 'Field name' }), 'Nickname');
      await userEvent.click(drawer.getByRole('button', { name: 'Add field' }));
      await expect(drawer.getByRole('checkbox', { name: 'Nickname' })).toBeChecked();
      await userEvent.click(drawer.getByRole('button', { name: 'Create invoice' }));
      const created = within(await canvas.findByRole('dialog', { name: 'Invoice created' }));
      await expect(created.getByText('1,000.00 USDC')).toBeInTheDocument();
      await expect(canvas.getAllByRole('dialog')).toHaveLength(1);
      await userEvent.click(created.getByRole('button', { name: 'View invoice' }));
      const details = within(await canvas.findByRole('dialog', { name: 'Invoice details' }));
      await expect(details.getByText('Nickname', { exact: false })).toBeInTheDocument();
    });
    await step('Deactivate the link inside the drawer', async () => {
      await userEvent.click(within(canvas.getByRole('dialog')).getByRole('button', { name: 'Deactivate link' }));
      const ask = within(await canvas.findByRole('dialog', { name: 'Deactivate invoice link?' }));
      await userEvent.click(ask.getByRole('button', { name: 'Deactivate' }));
      const details = within(await canvas.findByRole('dialog', { name: 'Invoice details' }));
      await expect(details.getAllByText('Deactivated').length).toBeGreaterThan(0);
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    });
    await step('Deactivate from a row: the Figma modal', async () => {
      await userEvent.click(canvas.getAllByRole('button', { name: /^Deactivate invoice/ })[0]);
      const ask = within(await canvas.findByRole('dialog', { name: 'Deactivate invoice link?' }));
      await userEvent.click(ask.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    });
  },
};

/** Before verification: invoices wait, and the page says what to do. */
export const NotVerified: Story = { name: 'Not verified', args: { account: 'not-verified' } };

/** The documents are being checked. */
export const VerificationInProgress: Story = { name: 'Verification in progress', args: { account: 'verifying' } };
