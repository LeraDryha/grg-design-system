import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MembersFlow } from './Members';
import { screen } from '../shared/screen';
import listFrame from '../../assets/design/in-product/members/1-list.png';
import addFrame from '../../assets/design/in-product/members/2-add-empty.png';
import filledFrame from '../../assets/design/in-product/members/3-add-filled.png';
import addedFrame from '../../assets/design/in-product/members/4-added.png';
import waitingFrame from '../../assets/design/in-product/members/5-waiting.png';
import editFrame from '../../assets/design/in-product/members/6-edit.png';
import roleFrame from '../../assets/design/in-product/members/7-edit-role.png';
import deleteFrame from '../../assets/design/in-product/members/8-delete.png';

export const frames: [string, string][] = [
  [listFrame, '1 · Members'], [addFrame, '2 · Add member'], [filledFrame, '3 · Add member, filled'], [addedFrame, '4 · Member added'],
  [waitingFrame, '5 · Waiting for confirmation'], [editFrame, '6 · Edit member'], [roleFrame, '7 · A new role'], [deleteFrame, '8 · Delete a member'],
];

const meta = {
  title: 'In product/Members',
  tags: ['ready'],
  component: MembersFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo; the company's own address replaced
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
    // Known Figma contrast: soft text (text-soft-500) in the table is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof MembersFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: invite a member, change a role, delete a member. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvasElement.querySelectorAll('.grg-ip-surface tbody tr');
    const pickRole = async (modal: HTMLElement, role: string) => {
      await userEvent.click(modal.querySelector<HTMLElement>('.grg-select__box')!);
      await userEvent.click(await canvas.findByRole('option', { name: role }));
    };
    await step('The owner can only transfer ownership; everyone else can be edited and deleted', async () => {
      await expect(rows()).toHaveLength(6);
      await expect(canvas.queryByRole('button', { name: 'Edit Guadalupe Schimmel' })).toBeNull();
      await expect(canvas.getByRole('button', { name: 'Transfer ownership' })).toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'Delete Hana Sato' })).toBeInTheDocument();
    });
    await step('A name and its address: search finds either', async () => {
      const search = canvas.getByRole('searchbox', { name: 'Search members by name or email' });
      await userEvent.type(search, 'raman');
      await expect(rows()).toHaveLength(1);
      await expect(within(rows()[0] as HTMLElement).getByText('Priya Raman')).toBeInTheDocument();
      await expect(within(rows()[0] as HTMLElement).getByText('priya.raman@company.test')).toBeInTheDocument();
      await userEvent.clear(search);
      await expect(rows()).toHaveLength(6);
    });
    await step('Send invite waits for a free address and a role', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Add member' }));
      const modal = await canvas.findByRole('dialog', { name: 'Add member' });
      const invite = within(modal).getByRole('button', { name: 'Send invite' });
      await expect(invite).toBeDisabled();
      const field = within(modal).getByRole('textbox', { name: 'Email' });
      await waitFor(() => expect(field).toHaveFocus());
      await userEvent.type(field, 'hana.sato@company.test');
      await expect(within(modal).getByText('This person is already a member')).toBeInTheDocument();
      await userEvent.clear(field);
      await userEvent.type(field, 'nina.berg@company');
      await userEvent.tab();
      await expect(within(modal).getByText('Enter an email like name@company.com')).toBeInTheDocument();
      await userEvent.type(field, '.test');
      await pickRole(modal, 'Accountant');
      await waitFor(() => expect(invite).toBeEnabled());
      await userEvent.click(invite);
    });
    await step('The invitation is a toast, and the new member waits on top', async () => {
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await expect(await canvas.findByText('Invitation sent')).toBeInTheDocument();
      await expect(rows()).toHaveLength(7);
      await expect(within(rows()[1] as HTMLElement).getByText('nina.berg@company.test')).toBeInTheDocument();
      await expect(within(rows()[1] as HTMLElement).getByText('Waiting for confirmation')).toBeInTheDocument();
    });
    await step('Save changes waits for a new role', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Edit Tomas Novak' }));
      const modal = await canvas.findByRole('dialog', { name: 'Edit member' });
      const save = within(modal).getByRole('button', { name: 'Save changes' });
      await expect(save).toBeDisabled();
      await expect(within(modal).getByRole('textbox', { name: 'Email' })).toBeDisabled();
      await pickRole(modal, 'Admin');
      await waitFor(() => expect(save).toBeEnabled());
      await userEvent.click(save);
      await expect(await canvas.findByText('Role updated')).toBeInTheDocument();
      const row = canvas.getByText('tomas.novak@company.test').closest('tr')!;
      await expect(within(row).getByText('Admin')).toBeInTheDocument();
    });
    await step('Delete asks first, Cancel is the safe way out', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete Marco Lindqvist' }));
      const modal = await canvas.findByRole('dialog', { name: 'Delete a member?' });
      await waitFor(() => expect(within(modal).getByRole('button', { name: 'Cancel' })).toHaveFocus());
      await userEvent.click(within(modal).getByRole('button', { name: 'Delete' }));
      await waitFor(() => expect(canvas.queryByText('marco.lindqvist@company.test')).toBeNull());
      await expect(await canvas.findByText('Member deleted')).toBeInTheDocument();
    });
    await step('Transfer ownership: choose, confirm; you become an Admin and the button is gone', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Transfer ownership' }));
      const modal = await canvas.findByRole('dialog', { name: 'Transfer ownership' });
      const save = within(modal).getByRole('button', { name: 'Save changes' });
      await expect(save).toBeDisabled();
      // Only confirmed members, not you and not someone still invited
      await expect(within(modal).queryByRole('radio', { name: 'Guadalupe Schimmel' })).toBeNull();
      await expect(within(modal).queryByRole('radio', { name: 'leo.okafor@company.test' })).toBeNull();
      await userEvent.click(within(modal).getByRole('radio', { name: 'Priya Raman' }));
      await userEvent.click(save);
      const confirm = await canvas.findByRole('dialog', { name: 'Make Priya Raman the owner?' });
      await userEvent.click(within(confirm).getByRole('button', { name: 'Make owner' }));
      await expect(await canvas.findByText('New owner is set successfully')).toBeInTheDocument();
      await expect(canvas.queryByRole('button', { name: 'Transfer ownership' })).toBeNull();
    });
  },
};
