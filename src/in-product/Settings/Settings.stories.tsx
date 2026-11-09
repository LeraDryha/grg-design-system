import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SettingsFlow } from './Settings';
import { screen } from '../shared/screen';
import testLogo from '../../assets/test/company-logo.svg';
import notVerifiedFrame from '../../assets/design/in-product/settings/1-not-verified.png';
import verifyingFrame from '../../assets/design/in-product/settings/2-verifying.png';
import accountFrame from '../../assets/design/in-product/settings/3-account.png';
import uploadFrame from '../../assets/design/in-product/settings/4-upload-logo.png';
import cropFrame from '../../assets/design/in-product/settings/5-crop.png';
import menuFrame from '../../assets/design/in-product/settings/6-logo-menu.png';
import editLogoFrame from '../../assets/design/in-product/settings/7-edit-logo.png';
import ownerFrame from '../../assets/design/in-product/settings/8-change-owner.png';
import ownerSetFrame from '../../assets/design/in-product/settings/9-owner-set.png';
import errorFrame from '../../assets/design/in-product/settings/10-something-went-wrong.png';
import noContactFrame from '../../assets/design/in-product/settings/11-no-contact.png';
import addContactFrame from '../../assets/design/in-product/settings/12-add-contact.png';
import requiredFrame from '../../assets/design/in-product/settings/13-contact-required.png';
import editContactFrame from '../../assets/design/in-product/settings/14-edit-contact.png';
import editedFrame from '../../assets/design/in-product/settings/15-contact-edited.png';

export const frames: [string, string][] = [
  [notVerifiedFrame, '1 · Not verified'], [verifyingFrame, '2 · Verification in progress'], [accountFrame, '3 · Account'],
  [uploadFrame, '4 · Upload logo'], [cropFrame, '5 · Crop'], [menuFrame, '6 · Edit logo or Remove'], [editLogoFrame, '7 · Edit logo'],
  [ownerFrame, '8 · Change the owner'], [ownerSetFrame, '9 · New owner set'], [errorFrame, '10 · Something went wrong'],
  [noContactFrame, '11 · No contact yet'], [addContactFrame, '12 · Add contact'], [requiredFrame, '13 · Contact is required'],
  [editContactFrame, '14 · Edit contact'], [editedFrame, '15 · Contact edited'],
];

const meta = {
  title: 'In product/Settings',
  // The Account tab is built; API key, Payment settings and Exchange rate come next
  tags: ['in-progress'],
  component: SettingsFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames without the bar and its logo; a car brand's logo, an email and a phone blurred
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
  },
} satisfies Meta<typeof SettingsFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: upload and crop a logo, change the owner, add or edit the contact for buyers. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = () => canvas.getByRole('dialog');
    await step('The other tabs are there, not available yet', async () => {
      await expect(canvas.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByRole('tab', { name: 'API key' })).toHaveAttribute('aria-disabled', 'true');
    });
    await step('Upload a logo, crop it, then remove it and undo', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Upload logo' }));
      const file = new File([await (await fetch(testLogo)).blob()], 'logo.svg', { type: 'image/svg+xml' });
      await userEvent.upload(dialog().querySelector<HTMLInputElement>('input[type="file"]')!, file);
      await expect(await within(dialog()).findByRole('group', { name: 'Logo position' })).toBeInTheDocument();
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(canvasElement.querySelector('.grg-ip-profile .grg-avatar img')).toBeTruthy());
      await userEvent.click(canvas.getByRole('button', { name: 'Logo' }));
      // A pointer presses the row's text, once the menu has opened
      await userEvent.click(within(await canvas.findByRole('menuitem', { name: 'Remove' })).getByText('Remove'));
      await expect(await canvas.findByRole('button', { name: 'Upload logo' })).toBeInTheDocument();
      await userEvent.click(await canvas.findByRole('button', { name: 'Undo' }));
      await expect(await canvas.findByRole('button', { name: 'Logo' })).toBeInTheDocument();
    });
    await step('Add contact asks for something; emptying it in Edit removes it', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Edit contact' }));
      const field = within(dialog()).getByRole('textbox', { name: 'Contact' });
      await userEvent.clear(field);
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Save' }));
      await expect(await canvas.findByText('Support contact removed')).toBeInTheDocument();
      await userEvent.click(canvas.getByRole('button', { name: 'Add contact' }));
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Save' }));
      await expect(within(dialog()).getByText('Contact is a required field')).toBeInTheDocument();
      await userEvent.type(within(dialog()).getByRole('textbox', { name: 'Contact' }), 'support@company.test');
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Save' }));
      await expect(await canvas.findByText('Support contact added successfully')).toBeInTheDocument();
      await expect(canvas.getByRole('region', { name: 'Company contact' })).toHaveTextContent('support@company.test');
    });
    await step('Change the owner: choose, confirm, and the button is gone', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Change owner' }));
      const save = within(dialog()).getByRole('button', { name: 'Save changes' });
      await expect(save).toBeDisabled();
      // Only confirmed members, not you and not the invited one
      await expect(within(dialog()).queryByRole('radio', { name: 'g.schimmel@company.test' })).toBeNull();
      await expect(within(dialog()).queryByRole('radio', { name: 'leo.okafor@company.test' })).toBeNull();
      await userEvent.click(within(dialog()).getByRole('radio', { name: 'priya.raman@company.test' }));
      await userEvent.click(save);
      const confirm = await canvas.findByRole('dialog', { name: 'Make priya.raman@company.test the owner?' });
      await userEvent.click(within(confirm).getByRole('button', { name: 'Make owner' }));
      await expect(await canvas.findByText('New owner is set successfully')).toBeInTheDocument();
      await expect(canvas.getByRole('region', { name: 'Company owner' })).toHaveTextContent('priya.raman@company.test');
      await expect(canvas.queryByRole('button', { name: 'Change owner' })).toBeNull();
    });
  },
};

/** Saving the owner or the contact fails: the Figma warning toast. */
export const WhenSavingFails: Story = {
  name: 'When saving fails',
  args: { failing: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit contact' }));
    await userEvent.click(within(canvas.getByRole('dialog')).getByRole('button', { name: 'Save' }));
    await expect(await canvas.findByText('Something went wrong, please try again')).toBeInTheDocument();
  },
};

/** Before verification: the settings open once the business is verified, and the page says how to get there. */
export const NotVerified: Story = {
  name: 'Not verified',
  args: { account: 'not-verified' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Company settings' })).toBeInTheDocument();
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
    await expect(canvas.queryByRole('button', { name: /Verify business/ })).toBeNull();
  },
};
