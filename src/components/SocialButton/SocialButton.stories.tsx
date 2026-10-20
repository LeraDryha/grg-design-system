import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SocialButton, type SocialButtonProps } from './SocialButton';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/social-button/social-button-component.png';

const ACCOUNTS = ['google', 'facebook', 'apple'] as const;
const NAMES = { google: 'Google', facebook: 'Facebook', apple: 'Apple' };

const meta = {
  title: 'Components/Social Button',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: SocialButton,
  // The docs page is SocialButton.mdx
  parameters: {
    // The Design tab: the Figma component as an image (the company's file isn't linked publicly; Figma has no guidelines page)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { social: 'google', iconOnly: false, disabled: false, children: undefined },
  argTypes: {
    social: { control: 'inline-radio', options: ACCOUNTS },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text', description: 'Label; "Sign in with …" (the Figma text) by default' },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof SocialButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Sign up: every supported account, full width and stacked, as in the Figma sign-up examples. */
export const SignUp: Story = {
  name: 'Sign up',
  args: { onClick: fn() },
  render: (args: SocialButtonProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-200)', width: 'min(376px, 100%)' }}>
      {ACCOUNTS.map(social => <SocialButton key={social} {...args} social={social}>Sign up with {NAMES[social]}</SocialButton>)}
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign up with Apple' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Logo only, where space is tight: the buttons still have their names for screen readers. */
export const LogoOnly: Story = {
  name: 'Logo only',
  render: (args: SocialButtonProps) => (
    <div style={{ display: 'flex', gap: 'var(--space-300)' }}>
      {ACCOUNTS.map(social => <SocialButton key={social} {...args} social={social} iconOnly />)}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Google', 'Facebook', 'Apple']) await expect(canvas.getByRole('button', { name: `Sign in with ${name}` })).toBeVisible();
  },
};

/** Not available right now, for example while the account service is down. Not in Figma: the system's disabled colours. */
export const Unavailable: Story = {
  args: { disabled: true },
  render: (args: SocialButtonProps) => (
    <div style={{ display: 'flex', gap: 'var(--space-300)' }}>
      <SocialButton {...args} />
      <SocialButton {...args} iconOnly />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button')) await expect(button).toBeDisabled();
  },
};

/* ---- Overview ---- */

/** Google, Facebook and Apple, with a label and logo only. */
export const Accounts: Story = {
  render: (args: SocialButtonProps) => (
    <Showcase>
      {ACCOUNTS.map(social => (
        <Variant key={social} caption={NAMES[social]}>
          <SocialButton {...args} social={social} />
          <SocialButton {...args} social={social} iconOnly />
        </Variant>
      ))}
    </Showcase>
  ),
};
