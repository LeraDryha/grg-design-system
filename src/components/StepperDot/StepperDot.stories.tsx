import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { StepperDot, type StepperDotProps } from './StepperDot';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/stepper-dot/stepper-dot-component.png';

const meta = {
  title: 'Components/Stepper Dot',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: StepperDot,
  // The docs page is StepperDot.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { steps: 4, current: 1, size: 'sm' },
  argTypes: {
    steps: { control: { type: 'range', min: 2, max: 8, step: 1 } },
    current: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    size: { control: 'inline-radio', options: ['sm', 'xs'] },
  },
} satisfies Meta<typeof StepperDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** The buttons move between steps; the dots follow, and screen readers hear the step. */
export const StepsOfATour: Story = {
  name: 'Steps of a tour',
  render: function StepsOfATour(args: StepperDotProps) {
    const [step, setStep] = useState(1);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
        <StepperDot {...args} current={step} />
        <span style={{ flex: 1, minWidth: 'var(--space-1000)' }} />
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
        <Button variant="primary" disabled={step === 4} onClick={() => setStep(step + 1)}>Next</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Step 1 of 4')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('Step 3 of 4')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('[data-active]')).toHaveLength(1);
  },
};

/* ---- Overview ---- */

/** Figma Active 01–04, in both sizes. */
export const Steps: Story = {
  render: (args: StepperDotProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-600)' }}>
      {(['sm', 'xs'] as const).map(size => (
        <Showcase key={size}>
          {[1, 2, 3, 4].map(current => (
            <Variant key={current} caption={`${size === 'sm' ? 'sm-8' : 'xs-4'} · step ${current}`}><StepperDot {...args} size={size} current={current} /></Variant>
          ))}
        </Showcase>
      ))}
    </div>
  ),
};
