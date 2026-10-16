import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton, type ActionButtonProps } from './ActionButton';
import { icons } from '../Icon/Icon';

const meta = {
  title: 'Components/Action Button',
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small icon-only button for actions inside other components: copy a link, reveal a password, open a list. ' +
          'Only the icon colour changes between states. It has no visible text, so `aria-label` is required.',
      },
    },
  },
  args: { icon: 'copy', 'aria-label': 'Copy', size: 'sm', color: 'grey', disabled: false, previewState: 'default' },
  argTypes: {
    icon: { control: 'select', options: Object.keys(icons) },
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

export const Playground: Story = {};

/** Three colours through every state. */
export const States: Story = {
  render: (args: ActionButtonProps) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: 'var(--space-600)', alignItems: 'center' }}>
      {(['grey', 'blue', 'red'] as const).flatMap(color => [
        <ActionButton key={`${color}-d`} {...args} color={color} />,
        <ActionButton key={`${color}-h`} {...args} color={color} previewState="hover" />,
        <ActionButton key={`${color}-a`} {...args} color={color} previewState="active" />,
        <ActionButton key={`${color}-f`} {...args} color={color} previewState="focus" />,
        <ActionButton key={`${color}-x`} {...args} color={color} disabled />,
      ])}
    </div>
  ),
};

/** md is 24px, sm 20px, xs 16px. Small sizes keep a 24px touch target around the icon. */
export const Sizes: Story = {
  render: (args: ActionButtonProps) => (
    <div style={{ display: 'flex', gap: 'var(--space-600)', alignItems: 'center' }}>
      <ActionButton {...args} size="md" />
      <ActionButton {...args} size="sm" />
      <ActionButton {...args} size="xs" />
    </div>
  ),
};
