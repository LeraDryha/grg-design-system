import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ProgressCircle } from './ProgressCircle';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/progress-circle/progress-circle-component.png';
import guidelinesFrame from '../../assets/design/progress-circle/progress-circle-guidelines.png';

const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const meta = {
  title: 'Components/Progress Circle',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: ProgressCircle,
  // The docs page is ProgressCircle.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Circular progress bar', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { value: 75, size: 'lg', showValue: true, 'aria-label': 'Progress' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'inline-radio', options: sizes },
  },
} satisfies Meta<typeof ProgressCircle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const steps = ['Verify email', 'Add a wallet', 'Set up 2FA', 'Make a deposit'];

/** Steps of onboarding: the ring fills as each one is done. */
export const OnboardingSteps: Story = {
  name: 'Onboarding steps',
  render: function OnboardingSteps() {
    const [done, setDone] = useState(1);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-400)' }}>
        <ProgressCircle value={(done / steps.length) * 100} size="lg" aria-label="Account setup" />
        <div style={{ display: 'grid', gap: 'var(--space-200)' }}>
          <span style={{ font: 'var(--typo-body-md-medium)', color: 'var(--text-strong-1000)' }}>{done < steps.length ? `Next: ${steps[done]}` : 'All set'}</span>
          <Button variant="secondary" size="sm" disabled={done === steps.length} onClick={() => setDone(done + 1)}>Mark as done</Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Mark as done' }));
    await expect(canvas.getByRole('progressbar', { name: 'Account setup' })).toHaveAttribute('aria-valuenow', '50');
  },
};

/** A length that isn't known yet (not in Figma): PrimeReact's spinner turns on the track. */
export const Waiting: Story = {
  args: { value: undefined, size: 'md', 'aria-label': 'Loading balances' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('progressbar', { name: 'Loading balances' })).toBeInTheDocument();
  },
};

/* ---- Overview ---- */

/** Figma Size × Percentage. xs-24 has no room for the number. */
export const SizesAndValues: Story = {
  name: 'Sizes and values',
  render: args => (
    <Showcase column>
      {sizes.map(size => (
        <Showcase key={size}>
          {[0, 25, 50, 75, 100].map(value => (
            <Variant key={value} caption={`${size} · ${value}%`}>
              <ProgressCircle {...args} size={size} value={value} aria-label={`${size} ${value}`} />
            </Variant>
          ))}
          <Variant caption={`${size} · unknown`}><ProgressCircle size={size} aria-label={`${size} unknown`} /></Variant>
        </Showcase>
      ))}
    </Showcase>
  ),
};
