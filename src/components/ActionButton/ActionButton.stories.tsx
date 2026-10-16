import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ActionButton, type ActionButtonProps } from './ActionButton';
import { baseIconNames } from '../../icons/names';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/Action Button',
  component: ActionButton,
  // The docs page is ActionButton.mdx
  args: { icon: 'pencil', 'aria-label': 'Edit', size: 'md', color: 'grey', disabled: false, previewState: 'default' },
  argTypes: {
    icon: { control: 'select', options: baseIconNames },
    'aria-label': { control: 'text', description: 'The name screen readers announce, such as "Copy link"' },
    size: { control: 'inline-radio', options: ['md', 'sm', 'xs'] },
    color: { control: 'inline-radio', options: ['grey', 'blue', 'red'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-800)' };

/** Edit everything in Controls. */
export const Playground: Story = {};

/** Container and icon, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  render: (args: ActionButtonProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-action-button', side: 'left' },
        { n: 2, target: '.grg-action-button .grg-icon', side: 'top' },
      ]}
    >
      <ActionButton {...args} />
    </AnatomyBlock>
  ),
};

/** md-24, sm-20 and xs-16, from the left. */
export const Sizes: Story = {
  render: (args: ActionButtonProps) => (
    <div style={row}>
      <ActionButton {...args} size="md" />
      <ActionButton {...args} size="sm" />
      <ActionButton {...args} size="xs" />
    </div>
  ),
};

/** Black (grey), blue and red, from the left. */
export const Colors: Story = {
  render: (args: ActionButtonProps) => (
    <div style={row}>
      <ActionButton {...args} color="grey" />
      <ActionButton {...args} color="blue" />
      <ActionButton {...args} color="red" />
    </div>
  ),
};

/** Typical actions, from the Figma usage row: edit, copy, more, info, delete. */
export const Usage: Story = {
  render: (args: ActionButtonProps) => (
    <div style={row}>
      <ActionButton {...args} icon="pencil" aria-label="Edit" />
      <ActionButton {...args} icon="copy" aria-label="Copy" />
      <ActionButton {...args} icon="menu-circle-vertical-01" aria-label="More actions" />
      <ActionButton {...args} icon="information-circle" color="blue" aria-label="Details" />
      <ActionButton {...args} icon="trash" color="red" aria-label="Delete" />
    </div>
  ),
};

/* ---- States: one story each ---- */

/** At rest. */
export const Default: Story = {};

/** Pointer over the button: the icon gets darker. */
export const Hovered: Story = { args: { previewState: 'hover' } };

/** While the button is pressed (Figma State: Active). */
export const Pressed: Story = { args: { previewState: 'active' } };

/** Reached with the keyboard: the system focus ring. */
export const Focused: Story = { args: { previewState: 'focus' } };

/** Not available right now. */
export const Disabled: Story = { args: { disabled: true } };
