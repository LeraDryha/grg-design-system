import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ActionButton, type ActionButtonProps } from './ActionButton';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/action-button/action-button-component.png';
import guidelinesFrame from '../../assets/design/action-button/action-button-guidelines.png';

const meta = {
  title: 'Components/Action Button',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: ActionButton,
  // The docs page is ActionButton.mdx
  parameters: {
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { icon: 'pencil', 'aria-label': 'Edit', size: 'md', color: 'grey', disabled: false },
  argTypes: {
    icon: { control: 'select', options: baseIconNames },
    'aria-label': { control: 'text', description: 'The name screen readers announce, such as "Copy link"' },
    size: { control: 'inline-radio', options: ['md', 'sm', 'xs'] },
    color: { control: 'inline-radio', options: ['grey', 'blue', 'red'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const text = { font: 'var(--typo-body-md-regular)', color: 'var(--text-strong-1000)' };

/** Edit everything in Controls. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Copy a value: the button sits next to what it copies, and says so when it's done. */
export const CopyAValue: Story = {
  name: 'Copy a value',
  render: function CopyAValue(args: ActionButtonProps) {
    const [copied, setCopied] = useState(false);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
        <span style={text}>TX-4821-9907</span>
        <ActionButton
          {...args}
          size="sm"
          icon={copied ? 'copy-check' : 'copy'}
          aria-label="Copy transaction ID"
          onClick={() => setCopied(true)}
        />
        <output aria-live="polite" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>
          {copied ? 'Copied' : ''}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy transaction ID' }));
    await waitFor(() => expect(canvas.getByText('Copied')).toBeVisible());
  },
};

/** Row actions in a table: quiet icons that say in words what they do. */
export const RowActions: Story = {
  name: 'Row actions',
  args: { onClick: fn() },
  render: (args: ActionButtonProps) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-600)', ...text }}>
      <span style={{ minWidth: 160 }}>Invoice #1042</span>
      <div style={{ display: 'flex', gap: 'var(--space-300)' }}>
        <ActionButton {...args} size="sm" icon="pencil" aria-label="Edit invoice #1042" />
        <ActionButton {...args} size="sm" icon="copy" aria-label="Duplicate invoice #1042" />
        <ActionButton {...args} size="sm" icon="trash" color="red" aria-label="Delete invoice #1042" />
      </div>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard only: Tab moves along the row, Enter runs the action
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Edit invoice #1042' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete invoice #1042' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/* ---- Overview ---- */

/** md-24, sm-20 and xs-16. */
export const Sizes: Story = {
  render: (args: ActionButtonProps) => (
    <Showcase>
      <Variant caption="md · 24px"><ActionButton {...args} size="md" /></Variant>
      <Variant caption="sm · 20px"><ActionButton {...args} size="sm" /></Variant>
      <Variant caption="xs · 16px"><ActionButton {...args} size="xs" /></Variant>
    </Showcase>
  ),
};

/** Black (grey), blue and red. */
export const Colors: Story = {
  render: (args: ActionButtonProps) => (
    <Showcase>
      <Variant caption="Black (grey)"><ActionButton {...args} color="grey" /></Variant>
      <Variant caption="Blue"><ActionButton {...args} color="blue" icon="information-circle" aria-label="Details" /></Variant>
      <Variant caption="Red"><ActionButton {...args} color="red" icon="trash" aria-label="Delete" /></Variant>
    </Showcase>
  ),
};
