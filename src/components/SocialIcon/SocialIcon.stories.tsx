import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { SocialIcon, socialPlatforms, grayPlatforms, platformLabels, type SocialIconProps } from './SocialIcon';

const meta = {
  title: 'Foundations/Social Icons',
  component: SocialIcon,
  // The docs page is SocialIcon.mdx
  args: { platform: 'linkedin', variant: 'brand', size: 24, label: undefined },
  argTypes: {
    platform: { control: 'select', options: socialPlatforms, labels: platformLabels },
    variant: { control: 'inline-radio', options: ['brand', 'gray'] },
    size: { control: 'inline-radio', options: [24, 20] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof SocialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-600)', maxWidth: 560 };

/** Edit everything in Controls. */
export const Playground: Story = {};

/** Every platform in its brand colours. Switch the theme: near-black marks turn white on dark. */
export const Brand: Story = {
  render: (args: SocialIconProps) => (
    <div style={row}>
      {socialPlatforms.map(p => <SocialIcon key={p} {...args} platform={p} variant="brand" />)}
    </div>
  ),
};

/** The platforms that have a Gray version, in the icon-base-500 token. */
export const Gray: Story = {
  render: (args: SocialIconProps) => (
    <div style={row}>
      {grayPlatforms.map(p => <SocialIcon key={p} {...args} platform={p} variant="gray" />)}
    </div>
  ),
};

/** 24 and 20, side by side. */
export const Sizes: Story = {
  render: (args: SocialIconProps) => (
    <div style={row}>
      <SocialIcon {...args} size={24} />
      <SocialIcon {...args} size={20} />
    </div>
  ),
};
