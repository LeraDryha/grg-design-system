import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SettingsFlow } from './Settings';
import rateFrame from '../../assets/design/in-product/settings/35-exchange-rate.png';
import rateEditFrame from '../../assets/design/in-product/settings/36-exchange-rate-edit.png';
import pay0Frame from '../../assets/design/in-product/settings/27-payments.png';
import pay1Frame from '../../assets/design/in-product/settings/28-turn-on-fixed-sum.png';
import pay2Frame from '../../assets/design/in-product/settings/29-fixed-sum-on.png';
import pay3Frame from '../../assets/design/in-product/settings/30-turn-off-fixed-sum.png';
import pay4Frame from '../../assets/design/in-product/settings/31-turn-on-auto-convert.png';
import pay5Frame from '../../assets/design/in-product/settings/32-auto-convert-on.png';
import pay6Frame from '../../assets/design/in-product/settings/33-turn-off-auto-convert.png';
import pay7Frame from '../../assets/design/in-product/settings/34-payment-coverage.png';
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
import api0Frame from '../../assets/design/in-product/settings/16-api-empty.png';
import api1Frame from '../../assets/design/in-product/settings/17-api-create.png';
import api2Frame from '../../assets/design/in-product/settings/18-api-ip.png';
import api3Frame from '../../assets/design/in-product/settings/19-api-ip-added.png';
import api4Frame from '../../assets/design/in-product/settings/20-api-ip-field.png';
import api5Frame from '../../assets/design/in-product/settings/21-api-create-filled.png';
import api6Frame from '../../assets/design/in-product/settings/22-api-created.png';
import api7Frame from '../../assets/design/in-product/settings/23-api-list.png';
import api8Frame from '../../assets/design/in-product/settings/24-api-expanded.png';
import api9Frame from '../../assets/design/in-product/settings/25-api-delete.png';
import api10Frame from '../../assets/design/in-product/settings/26-api-delete-all.png';

export const frames: [string, string][] = [
  [notVerifiedFrame, '1 · Not verified'], [verifyingFrame, '2 · Verification in progress'], [accountFrame, '3 · Account'],
  [uploadFrame, '4 · Upload logo'], [cropFrame, '5 · Crop'], [menuFrame, '6 · Edit logo or Remove'], [editLogoFrame, '7 · Edit logo'],
  [ownerFrame, '8 · Change the owner'], [ownerSetFrame, '9 · New owner set'], [errorFrame, '10 · Something went wrong'],
  [noContactFrame, '11 · No contact yet'], [addContactFrame, '12 · Add contact'], [requiredFrame, '13 · Contact is required'],
  [editContactFrame, '14 · Edit contact'], [editedFrame, '15 · Contact edited'],
  [api0Frame, '16 · No API keys'],
  [api1Frame, '17 · Create API key'],
  [api2Frame, '18 · IP white list'],
  [api3Frame, '19 · Addresses added'],
  [api4Frame, '20 · Addresses in the field'],
  [api5Frame, '21 · Create API key, filled'],
  [api6Frame, '22 · The key generated'],
  [api7Frame, '23 · My API keys'],
  [api8Frame, '24 · A key opened'],
  [api9Frame, '25 · Delete API key'],
  [api10Frame, '26 · Delete all API keys'],
  [pay0Frame, '27 · Payment settings'],
  [pay1Frame, '28 · Turn on fixed sum invoice'],
  [pay2Frame, '29 · Fixed sum invoice on'],
  [pay3Frame, '30 · Turn off fixed sum invoice'],
  [pay4Frame, '31 · Turn on auto-convert'],
  [pay5Frame, '32 · Auto-convert on'],
  [pay6Frame, '33 · Turn off auto-convert'],
  [pay7Frame, '34 · Payment coverage'],
  [rateFrame, '35 · Exchange rate'], [rateEditFrame, '36 · Editing the coefficients'],
];

const meta = {
  title: 'In product/Settings',
  tags: ['ready'],
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

/** The page to try: upload and crop a logo, change the owner, add or edit the contact for buyers; create, open and delete API keys. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = () => canvas.getByRole('dialog');
    await step('Account is open first', async () => {
      await expect(canvas.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
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

/** The API key tab: create a key with its permissions and IP white list, see it once, open it in the list, delete. */
export const ApiKeysWalkthrough: Story = {
  name: 'API keys walkthrough',
  tags: ['!dev', '!autodocs'],
  args: { tab: 'api' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = () => canvas.getByRole('dialog');
    await step('Create waits for a name and a permission', async () => {
      await userEvent.click(canvas.getAllByRole('button', { name: 'Create API key' })[0]);
      const create = within(dialog()).getByRole('button', { name: 'Create API key' });
      await expect(create).toBeDisabled();
      await userEvent.type(within(dialog()).getByRole('textbox', { name: /Key name/ }), 'Accounting');
      await userEvent.click(within(dialog()).getByRole('checkbox', { name: /^Read/ }));
      await expect(create).toBeEnabled();
    });
    await step('The IP white list is a step with Back; a wrong address is not added', async () => {
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Create IP white list' }));
      const field = within(await canvas.findByRole('dialog', { name: 'IP white list' })).getByRole('textbox', { name: /IP address/ });
      await userEvent.type(field, '224.876.103.42{Enter}');
      await expect(await within(dialog()).findByText('224.876.103.42 isn’t a valid IP address')).toBeInTheDocument();
      await userEvent.type(field, '201.195.88.21{Enter}');
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Save list' }));
      await expect(await within(dialog()).findByText('201.195.88.21')).toBeInTheDocument();
    });
    await step('The keys show once, with a QR code', async () => {
      await userEvent.click(within(dialog()).getByRole('button', { name: 'Create API key' }));
      const created = await canvas.findByRole('dialog', { name: 'The key has been successfully generated' });
      await expect(await within(created).findByRole('img', { name: /QR code/ })).toBeInTheDocument();
      await expect(within(created).getByRole('button', { name: 'Copy private key' })).toBeInTheDocument();
      await userEvent.click(within(created).getByRole('button', { name: 'Okay' }));
    });
    await step('In the list, a key opens under its row', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'More about Accounting' }));
      await expect(canvas.getByRole('region', { name: 'More about Accounting' })).toHaveTextContent('201.195.88.21');
    });
    await step('Delete all asks first; then the empty state', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete all' }));
      await userEvent.click(within(await canvas.findByRole('dialog', { name: 'Delete all API keys?' })).getByRole('button', { name: 'Delete' }));
      await expect(await canvas.findByRole('heading', { name: 'API Key' })).toBeInTheDocument();
    });
  },
};

/** Payment settings: fixed sum invoice turns auto-convert on too; auto-convert can't go off before fixed sum. */
export const PaymentsWalkthrough: Story = {
  name: 'Payment settings walkthrough',
  tags: ['!dev', '!autodocs'],
  args: { tab: 'payments' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const row = (name: string) => within(canvas.getByRole('region', { name }));
    await step('Turn on fixed sum invoice: a currency first', async () => {
      await userEvent.click(row('Fixed sum invoice').getByRole('button', { name: 'Turn on' }));
      const modal = within(await canvas.findByRole('dialog', { name: 'Turn on Fixed sum invoice' }));
      await expect(modal.getByRole('button', { name: 'Turn on' })).toBeDisabled();
      await userEvent.click(modal.getByText('EUR'));
      await userEvent.click(modal.getByRole('button', { name: 'Turn on' }));
      await expect(await canvas.findByText('Fixed sum invoice and auto-convert were turned on successfully')).toBeInTheDocument();
    });
    await step('Auto-convert is on too, and stays on while fixed sum is on', async () => {
      await expect(row('Auto-convert').getByText('EUR')).toBeInTheDocument();
      await expect(row('Auto-convert').getByRole('button', { name: 'Turn off' })).toBeDisabled();
      await expect(row('Auto-convert').getByText('Turn off fixed sum invoice first')).toBeInTheDocument();
    });
    await step('Turning off asks first', async () => {
      await userEvent.click(row('Fixed sum invoice').getByRole('button', { name: 'Turn off' }));
      await userEvent.click(within(await canvas.findByRole('dialog', { name: 'Turn off fixed sum invoice?' })).getByRole('button', { name: 'Turn off' }));
      await expect(await canvas.findByText('Fixed sum invoice was turned off successfully')).toBeInTheDocument();
      await expect(row('Auto-convert').getByRole('button', { name: 'Turn off' })).toBeEnabled();
    });
  },
};

/** Exchange rate: the coefficients edited in place, up to 10%; Cancel brings the old ones back. */
export const ExchangeRateWalkthrough: Story = {
  name: 'Exchange rate walkthrough',
  tags: ['!dev', '!autodocs'],
  args: { tab: 'rates' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const field = () => canvas.getByRole('textbox', { name: 'Correction coefficient, Bitcoin' });
    await step('Edit: a field in each row; more than 10% is refused', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Edit coefficients' }));
      await userEvent.clear(field());
      await userEvent.type(field(), '12');
      await expect(await canvas.findByText('Up to 10%')).toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    });
    await step('Cancel brings the old values back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
      await expect(canvas.queryByRole('textbox', { name: 'Correction coefficient, Bitcoin' })).toBeNull();
    });
    await step('Save a new coefficient', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Edit coefficients' }));
      await userEvent.clear(field());
      await userEvent.type(field(), '2.5');
      await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
      await expect(await canvas.findByText('Saved successfully')).toBeInTheDocument();
      await expect(canvas.getByText('2.5%')).toBeInTheDocument();
    });
  },
};

/** No API keys yet: what they are for, and the button to create one. */
export const NoApiKeys: Story = { name: 'No API keys yet', args: { tab: 'api', apiKeys: 'none' } };

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
