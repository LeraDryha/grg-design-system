import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ProfileFlow } from './Profile';
import { screen } from '../shared/screen';
import f0 from '../../assets/design/in-product/profile/1-main-info.png';
import f1 from '../../assets/design/in-product/profile/2-edit-name.png';
import f2 from '../../assets/design/in-product/profile/3-change-password.png';
import f3 from '../../assets/design/in-product/profile/4-check-email.png';
import f4 from '../../assets/design/in-product/profile/5-security.png';
import f5 from '../../assets/design/in-product/profile/6-choose-method.png';
import f6 from '../../assets/design/in-product/profile/7-google-authenticator.png';
import f7 from '../../assets/design/in-product/profile/8-2fa-on.png';
import f8 from '../../assets/design/in-product/profile/9-sms.png';
import f9 from '../../assets/design/in-product/profile/10-sms-code.png';
import f10 from '../../assets/design/in-product/profile/11-turn-off.png';
import f11 from '../../assets/design/in-product/profile/12-notifications.png';
import f12 from '../../assets/design/in-product/profile/13-notifications-version-2.png';

export const frames: [string, string][] = [
  [f0, '1 · Main info'],
  [f1, '2 · Edit name'],
  [f2, '3 · Change password'],
  [f3, '4 · Check your email'],
  [f4, '5 · Security'],
  [f5, '6 · Choose the 2FA method'],
  [f6, '7 · Google Authenticator'],
  [f7, '8 · 2FA activated'],
  [f8, '9 · SMS: the phone'],
  [f9, '10 · SMS: the code'],
  [f10, '11 · Turn off 2FA'],
  [f11, '12 · Notifications'],
  [f12, '13 · Notifications, version 2'],
];

const meta = {
  title: 'In product/Profile',
  tags: ['ready'],
  component: ProfileFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames without the bar and its logo; a phone number and the product's name blurred
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
  },
} satisfies Meta<typeof ProfileFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: edit your name, change the password, turn on two-factor authentication, choose your notifications. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = () => within(canvas.getByRole('dialog'));
    await step('Edit name: the avatar\'s menu follows', async () => {
      await userEvent.click(within(canvas.getByRole('region', { name: 'Name' })).getByRole('button', { name: 'Edit' }));
      const last = dialog().getByRole('textbox', { name: /Last name/ });
      await userEvent.clear(last);
      await userEvent.type(last, 'Ortiz');
      await userEvent.click(dialog().getByRole('button', { name: 'Save changes' }));
      await expect(await canvas.findByText('Name updated')).toBeInTheDocument();
      await expect(canvas.getByRole('region', { name: 'Name' })).toHaveTextContent('Guadalupe Ortiz');
    });
    await step('Change password: the link, then Check your email in the same modal', async () => {
      await userEvent.click(within(canvas.getByRole('region', { name: 'Password' })).getByRole('button', { name: 'Change' }));
      await userEvent.click(dialog().getByRole('button', { name: 'Send link' }));
      await expect(await canvas.findByRole('dialog', { name: 'Check your email' })).toBeInTheDocument();
      await expect(dialog().getByText(/Resend in 0:/)).toBeInTheDocument();
      await userEvent.click(dialog().getByRole('button', { name: 'Okay' }));
    });
    await step('2FA with Google Authenticator: a wrong code, then on', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: 'Security' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Turn on' }));
      await userEvent.click(within(await canvas.findByRole('dialog', { name: 'Choose the 2FA method' })).getByText('Google Authenticator'));
      await expect(await dialog().findByRole('img', { name: /QR code/ })).toBeInTheDocument();
      await userEvent.click(dialog().getAllByRole('textbox')[0]);
      await userEvent.keyboard('000000');
      await userEvent.click(dialog().getByRole('button', { name: 'Confirm' }));
      await expect(await dialog().findByText(/Wrong code/)).toBeInTheDocument();
      await userEvent.click(dialog().getAllByRole('textbox')[0]);
      await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}482915');
      await userEvent.click(dialog().getByRole('button', { name: 'Confirm' }));
      await expect(await canvas.findByText('Two-factor authentication is on')).toBeInTheDocument();
      await expect(canvas.getByRole('region', { name: /Two-factor/ })).toHaveTextContent('Google Authenticator');
    });
    await step('Notifications: switches that work at once', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: 'Notifications' }));
      const deposit = within(canvas.getByRole('region', { name: 'Funds deposit' })).getByRole('switch', { name: 'In app' });
      await expect(deposit).toBeChecked();
      await userEvent.click(deposit);
      await waitFor(() => expect(deposit).not.toBeChecked());
    });
  },
};

/** Security, two-factor authentication still off. */
export const Security: Story = { args: { tab: 'security' } };

/** Notifications: Email and In app for each kind; In app is what the bell shows. */
export const Notifications: Story = { args: { tab: 'notifications' } };
