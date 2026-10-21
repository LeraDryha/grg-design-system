import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup, type RadioProps } from './Radio';
import { RadioLabel } from '../RadioLabel/RadioLabel';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/radio/radio-component.png';
import labelFrame from '../../assets/design/radio/radio-label.png';
import guidelinesFrame from '../../assets/design/radio/radio-guidelines.png';

const meta = {
  title: 'Components/Radio',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Radio,
  // The docs page is Radio.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Radio', type: 'image', url: componentFrame },
      { name: 'Radio label', type: 'image', url: labelFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { value: 'a', checked: true, size: 'sm', destructive: false, disabled: false, 'aria-label': 'Option' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = { display: 'grid', gap: 'var(--space-400)', width: 343, maxWidth: '100%' } as const;

export const Playground: Story = {};

/* ---- Examples ---- */

/** A safe choice is already made (Standard); the arrow keys move between the options and choose. */
export const PayoutMethod: Story = {
  name: 'Payout method',
  render: () => (
    <div style={column}>
      <RadioGroup label="Payout method" defaultValue="standard">
        <RadioLabel value="standard" label="Standard" sublabel="(Free)" description="1–3 business days." />
        <RadioLabel value="instant" label="Instant" sublabel="(1%)" description="Within 30 minutes." />
        <RadioLabel value="crypto" label="To a crypto wallet" description="USDT on Tron or Ethereum." />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Payout method' })).toBeInTheDocument();
    const standard = canvas.getByRole('radio', { name: 'Standard (Free)' });
    await expect(standard).toBeChecked();
    standard.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Instant (1%)' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Instant (1%)' })).toHaveAccessibleDescription('Within 30 minutes.');
  },
};

/** Figma Flip: the text first and the radio on the right, as in a list of plans. Nothing is chosen until people choose. */
export const ChooseAPlan: Story = {
  name: 'Choose a plan',
  render: () => (
    <div style={column}>
      <RadioGroup label="Plan" hint="You can change it at any time.">
        <RadioLabel flip value="starter" label="Starter" description="Up to 100 invoices a month." />
        <RadioLabel flip value="business" label="Business" description="Unlimited invoices and mass payouts." link={{ label: 'Compare plans', href: '#plans' }} />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Starter' })).not.toBeChecked();
    await userEvent.click(canvas.getByText('Business'));
    await expect(canvas.getByRole('radio', { name: 'Business' })).toBeChecked();
  },
};

/** Nothing chosen on submit: the error under the group, the rings red, and screen readers hear it with the options. */
export const NothingChosen: Story = {
  name: 'Nothing chosen',
  render: function NothingChosen() {
    const [value, setValue] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setSubmitted(true);
    };
    return (
      <form style={column} onSubmit={submit} noValidate>
        <RadioGroup label="Account type" value={value} onChange={setValue} error={submitted && !value ? 'Choose an account type' : undefined}>
          <RadioLabel value="personal" label="Personal" />
          <RadioLabel value="business" label="Business" />
        </RadioGroup>
        <Button type="submit" variant="primary">Continue</Button>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('radio', { name: 'Personal' })).toHaveAccessibleDescription('Choose an account type');
    await userEvent.click(canvas.getByText('Business'));
    await expect(canvas.queryByText('Choose an account type')).toBeNull();
  },
};

/** An option that isn't available yet: disabled, with the reason in its description. */
export const Unavailable: Story = {
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <div style={column}>
      <RadioGroup label="Network" defaultValue="tron" orientation="horizontal">
        <RadioLabel value="tron" label="Tron" />
        <RadioLabel value="ethereum" label="Ethereum" />
        <RadioLabel value="solana" label="Solana" disabled description="Coming soon" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'Solana' })).toBeDisabled();
  },
};

/* ---- Overview ---- */

/** Figma Selected × Size × Destructive. Hover, press and focus come from the pointer and the keyboard. */
export const States: Story = {
  // Known Figma contrast: the disabled rings are light on light
  parameters: { a11y: { test: 'todo' } },
  render: (args: RadioProps) => (
    <Showcase column>
      {(['md', 'sm'] as const).map(size => (
        <Showcase key={size}>
          <Variant caption={`${size === 'md' ? 'md-20' : 'sm-16'} · off`}><Radio {...args} value="a" size={size} checked={false} aria-label="Off" /></Variant>
          <Variant caption="on"><Radio {...args} value="b" size={size} checked aria-label="On" /></Variant>
          <Variant caption="destructive"><Radio {...args} value="c" size={size} checked destructive aria-label="Destructive" /></Variant>
          <Variant caption="disabled off"><Radio {...args} value="d" size={size} checked={false} disabled aria-label="Disabled off" /></Variant>
          <Variant caption="disabled on"><Radio {...args} value="e" size={size} checked disabled aria-label="Disabled on" /></Variant>
        </Showcase>
      ))}
    </Showcase>
  ),
};

/** Figma Radio label: a sublabel, a description and a link; Flip. */
export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <Showcase>
      <Variant caption="label"><RadioLabel value="a" name="label-1" label="Label" sublabel="(Sublabel)" /></Variant>
      <Variant caption="description and link">
        <RadioLabel value="b" name="label-2" checked label="Label" sublabel="(Sublabel)" description="Insert the radio description here." link={{ label: 'Link button', href: '#link' }} />
      </Variant>
      <Variant caption="flip">
        <div style={{ width: 'calc(var(--space-5000) + var(--space-1600))' }}>
          <RadioLabel value="c" name="label-3" checked flip label="Label" sublabel="(Sublabel)" description="Insert the radio description here." />
        </div>
      </Variant>
    </Showcase>
  ),
};
