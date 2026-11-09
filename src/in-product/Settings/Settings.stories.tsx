import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SettingsFlow } from './Settings';
import { screen } from '../shared/screen';
import notVerifiedFrame from '../../assets/design/in-product/settings/1-not-verified.png';
import verifyingFrame from '../../assets/design/in-product/settings/2-verifying.png';

export const frames: [string, string][] = [[notVerifiedFrame, '1 · Not verified'], [verifyingFrame, '2 · Verification in progress']];

const meta = {
  title: 'In product/Settings',
  // The settings themselves are still to come: only the states before verification so far
  tags: ['in-progress'],
  component: SettingsFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
  },
} satisfies Meta<typeof SettingsFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

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
