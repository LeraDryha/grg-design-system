import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { SocialButton, type SocialButtonProps } from './SocialButton';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/Social Button',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: SocialButton,
  // The docs page is SocialButton.mdx
  args: { social: 'google', iconOnly: false, disabled: false, children: undefined, previewState: 'default' },
  argTypes: {
    social: { control: 'inline-radio', options: ['google', 'facebook', 'apple'] },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text', description: 'Label; "Sign in with …" (the Figma text) by default' },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof SocialButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-400)' };

/** Edit everything in Controls. */
export const Playground: Story = {};

/** Container, logo and label. */
export const Anatomy: Story = {
  render: (args: SocialButtonProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-social-button', side: 'left' },
        { n: 2, target: '.grg-social-button .grg-social-icon', side: 'top' },
        { n: 3, target: '.grg-social-button__label', side: 'bottom' },
      ]}
    >
      <SocialButton {...args} />
    </AnatomyBlock>
  ),
};

/** Google, Facebook and Apple, from the left. */
export const Accounts: Story = {
  render: (args: SocialButtonProps) => (
    <div style={row}>
      <SocialButton {...args} social="google" />
      <SocialButton {...args} social="facebook" />
      <SocialButton {...args} social="apple" />
    </div>
  ),
};

/** With a label and logo only (Figma Icon button), from the left. */
export const Content: Story = {
  render: (args: SocialButtonProps) => (
    <div style={row}>
      <SocialButton {...args} />
      <SocialButton {...args} iconOnly />
    </div>
  ),
};

/** Full width, stacked, as in the sign-up form. */
export const FullWidth: Story = {
  render: (args: SocialButtonProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-200)', width: 'min(376px, 100%)' }}>
      <SocialButton {...args} social="facebook" />
      <SocialButton {...args} social="google" />
      <SocialButton {...args} social="apple" />
    </div>
  ),
};

/* ---- States: one story each ---- */

/** At rest. */
export const Default: Story = {};

/** Pointer over the button: a darker border. */
export const Hovered: Story = { args: { previewState: 'hover' } };

/** While the button is pressed (Figma State: Active): the darkest border. */
export const Pressed: Story = { args: { previewState: 'active' } };

/** Reached with the keyboard: the system focus ring. */
export const Focused: Story = { args: { previewState: 'focus' } };

/** Disabled for all providers, with text and icon-only variants. */
export const Disabled: Story = { args: { disabled: true }, render: args => <div style={row}>{(['google', 'facebook', 'apple'] as const).map(social => <div key={social} style={row}><SocialButton {...args} social={social} /><SocialButton {...args} social={social} iconOnly /></div>)}</div> };
