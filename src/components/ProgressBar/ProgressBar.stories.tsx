import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ProgressBar, type ProgressBarProps } from './ProgressBar';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/progress-bar/progress-bar-component.png';
import labelFrame from '../../assets/design/progress-bar/progress-bar-label.png';
import lineFrame from '../../assets/design/progress-bar/progress-bar-line.png';
import guidelinesFrame from '../../assets/design/progress-bar/progress-bar-guidelines.png';

const width = { width: 'calc(var(--space-5000) + var(--space-2000) + var(--space-1000))', maxWidth: '100%' } as const;

const meta = {
  title: 'Components/Progress Bar',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: ProgressBar,
  // The docs page is ProgressBar.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Progress bar', type: 'image', url: componentFrame },
      { name: 'Progress bar label', type: 'image', url: labelFrame },
      { name: 'Progress bar line', type: 'image', url: lineFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { value: 80, color: 'primary', label: 'Label', description: 'This is a hint text to help user.', valuePosition: 'right' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    color: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'error', 'info'] },
    valuePosition: { control: 'inline-radio', options: ['right', 'top', 'bottom', 'none'] },
  },
  render: args => <div style={width}><ProgressBar {...args} /></div>,
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** How much of the profile is filled in, with what is left as the hint. */
export const ProfileComplete: Story = {
  name: 'Profile complete',
  args: { value: 60, label: 'Profile complete', description: 'Add your address and a phone number to finish.', valuePosition: 'top' },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', { name: 'Profile complete' });
    await expect(bar).toHaveAttribute('aria-valuenow', '60');
    await expect(bar).toHaveAccessibleDescription('Add your address and a phone number to finish.');
  },
};

/** A limit: the value as text, and the colour turns as the limit gets close. */
export const WithdrawalLimit: Story = {
  name: 'Withdrawal limit',
  // Known Figma contrast: the Warning fill (warning-soft-400) is light against the track; the value says the same in text
  parameters: { a11y: { test: 'todo' } },
  render: function WithdrawalLimit() {
    const [used, setUsed] = useState(7200);
    const percent = (used / 10000) * 100;
    const color: ProgressBarProps['color'] = percent >= 95 ? 'error' : percent >= 75 ? 'warning' : 'primary';
    return (
      <div style={{ ...width, display: 'grid', gap: 'var(--space-400)' }}>
        <ProgressBar
          value={percent}
          color={color}
          label="Daily withdrawal limit"
          valuePosition="top"
          valueText={`${used.toLocaleString('en-GB')} of 10,000 USDT`}
          description={percent >= 95 ? 'Almost at the limit: it resets at midnight UTC.' : undefined}
        />
        <Button variant="secondary" size="sm" onClick={() => setUsed(value => Math.min(10000, value + 1200))}>Withdraw 1,200 USDT</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Withdraw 1,200 USDT' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Withdraw 1,200 USDT' }));
    await expect(canvas.getByRole('progressbar', { name: 'Daily withdrawal limit' })).toHaveAttribute('aria-valuetext', '9,600 of 10,000 USDT');
  },
};

/** A length that isn't known yet (not in Figma): the bar moves until there is a value. */
export const CheckingAFile: Story = {
  name: 'Checking a file',
  args: { value: undefined, label: 'Checking invoice.pdf', description: 'This takes a few seconds.', valuePosition: 'none' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('progressbar', { name: 'Checking invoice.pdf' })).not.toHaveAttribute('aria-valuenow');
  },
};

/* ---- Overview ---- */

/** Figma Progress bar line · Color. */
export const Colors: Story = {
  // Known Figma contrast: the Warning fill (warning-soft-400) is light against the track
  parameters: { a11y: { test: 'todo' } },
  render: args => (
    <Showcase column>
      {(['primary', 'success', 'warning', 'error', 'info'] as const).map(color => (
        <Variant key={color} caption={color}>
          <div style={width}><ProgressBar {...args} color={color} label={undefined} description={undefined} aria-label={color} /></div>
        </Variant>
      ))}
    </Showcase>
  ),
};

/** Figma Progress bar label · Type: the value on the right, on top or at the bottom; with and without the label and hint. */
export const ValuePosition: Story = {
  name: 'Value position',
  render: args => (
    <Showcase column>
      <Variant caption="on right"><div style={width}><ProgressBar {...args} valuePosition="right" label={undefined} description={undefined} aria-label="On right" /></div></Variant>
      <Variant caption="on top, label and hint"><div style={width}><ProgressBar {...args} valuePosition="top" /></div></Variant>
      <Variant caption="on bottom, label and hint"><div style={width}><ProgressBar {...args} valuePosition="bottom" /></div></Variant>
      <Variant caption="without details"><div style={width}><ProgressBar {...args} valuePosition="none" label={undefined} description={undefined} aria-label="Without details" /></div></Variant>
    </Showcase>
  ),
};
