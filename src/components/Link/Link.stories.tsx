import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Link, type LinkProps } from './Link';
import { icons } from '../Icon/Icon';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const iconOptions = [undefined, ...Object.keys(icons).filter(n => n !== 'loading')];

const meta = {
  title: 'Components/Link',
  component: Link,
  // The docs page is Link.mdx
  args: {
    children: 'Link button',
    href: '#',
    color: 'black',
    size: 'md',
    leftIcon: undefined,
    rightIcon: 'maximize',
    external: false,
    disabled: false,
    previewState: 'default',
  },
  argTypes: {
    children: { control: 'text', description: 'Label (Figma Text)' },
    color: { control: 'inline-radio', options: ['black', 'blue'] },
    size: { control: 'inline-radio', options: ['md', 'sm', 'xs'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-800)' };

/** Edit everything in Controls. */
export const Playground: Story = {};

/** Container, icon and label, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  render: (args: LinkProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-link', side: 'left' },
        { n: 2, target: '.grg-link .grg-icon', side: 'top' },
        { n: 3, target: '.grg-link > span:not(.grg-icon)', side: 'bottom' },
      ]}
    >
      <Link {...args} />
    </AnatomyBlock>
  ),
};

/** Text only and text with an icon. */
export const Content: Story = {
  render: (args: LinkProps) => (
    <div style={row}>
      <Link {...args} rightIcon={undefined} />
      <Link {...args} />
    </div>
  ),
};

/** Black and Blue, from the left. */
export const Colors: Story = {
  render: (args: LinkProps) => (
    <div style={row}>
      <Link {...args} color="black" />
      <Link {...args} color="blue" />
    </div>
  ),
};

/** md-24, sm-20 and xs-16, from the left. */
export const Sizes: Story = {
  render: (args: LinkProps) => (
    <div style={row}>
      <Link {...args} size="md" />
      <Link {...args} size="sm" />
      <Link {...args} size="xs" />
    </div>
  ),
};

/* ---- States: one story each ---- */

/** At rest. */
export const Default: Story = {};

/** Pointer over the link: the underline gets darker. */
export const Hovered: Story = { args: { previewState: 'hover' } };

/** While the link is pressed (Figma State: Active): the darkest underline. */
export const Pressed: Story = { args: { previewState: 'active' } };

/** Reached with the keyboard: the system focus ring. */
export const Focused: Story = { args: { previewState: 'focus' } };

/** Not available right now. */
export const Disabled: Story = { args: { disabled: true } };
