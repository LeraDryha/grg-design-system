import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, type ButtonProps } from './Button';
import { CheckboxLabel } from '../CheckboxLabel/CheckboxLabel';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/button/button-component.png';
import guidelinesFrame from '../../assets/design/button/button-guidelines.png';

const iconOptions = [undefined, ...baseIconNames.filter(n => n !== 'loading')];
const TYPES = ['primary', 'secondary', 'outline', 'text'] as const;
const SIZES = ['xlg', 'lg', 'md', 'sm', 'xs'] as const;

const meta = {
  title: 'Components/Button',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Button,
  // The docs page is Button.mdx
  parameters: {
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    children: 'Button',
    variant: 'secondary',
    size: 'md',
    tone: 'neutral',
    leftIcon: 'plus',
    rightIcon: undefined,
    iconOnly: false,
    loading: false,
    justified: false,
    disabled: false,
  },
  argTypes: {
    children: { control: 'text', description: 'Label (Figma Text)' },
    variant: { control: 'inline-radio', options: TYPES },
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'inline-radio', options: ['neutral', 'destructive', 'green'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    'aria-label': { control: 'text', description: 'Required with iconOnly: the name screen readers announce' },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Saving: the button shows a spinner while the action runs and keeps its width, so nothing jumps. */
export const SaveWithLoading: Story = {
  name: 'Save with loading',
  render: function SaveWithLoading(args: ButtonProps) {
    const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const save = () => {
      setState('saving');
      setTimeout(() => setState('saved'), 1200);
    };
    return (
      <div style={{ display: 'grid', gap: 'var(--space-300)', justifyItems: 'center' }}>
        <Button {...args} variant="primary" leftIcon={undefined} loading={state === 'saving'} onClick={save}>Save changes</Button>
        <output aria-live="polite" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>
          {state === 'saved' ? 'Changes saved' : ' '}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /save changes/i });
    const width = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button.getBoundingClientRect().width).toBe(width);
    await waitFor(() => expect(canvas.getByText('Changes saved')).toBeVisible(), { timeout: 3000 });
    await expect(button).not.toHaveAttribute('aria-busy');
  },
};

/** A destructive choice in a dialog: the red action on the right, a quiet way back next to it. */
export const ConfirmADeletion: Story = {
  name: 'Confirm a deletion',
  args: { onClick: fn() },
  render: (args: ButtonProps) => (
    <div style={{ display: 'flex', gap: 'var(--space-300)' }}>
      <Button {...args} variant="text" leftIcon={undefined}>Cancel</Button>
      <Button {...args} variant="primary" tone="destructive" leftIcon="trash">Delete invoice</Button>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard only: Tab reaches Cancel first, then the destructive action; Enter runs it
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete invoice' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Unavailable until the form is ready: Pay stays disabled until the terms are accepted. */
export const DisabledUntilReady: Story = {
  name: 'Disabled until ready',
  render: function DisabledUntilReady(args: ButtonProps) {
    const [accepted, setAccepted] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-500)', width: 320 }}>
        <CheckboxLabel label="I accept the Terms of payment" checked={accepted} onChange={setAccepted} />
        <Button {...args} variant="primary" size="lg" leftIcon={undefined} justified disabled={!accepted}>Pay 120 USDT</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pay = canvas.getByRole('button', { name: /pay/i });
    await expect(pay).toBeDisabled();
    await userEvent.click(canvas.getByText('I accept the Terms of payment'));
    await expect(pay).toBeEnabled();
  },
};

/** Icon only, in a toolbar: no visible text, so each button gets a name for screen readers. */
export const IconOnlyInAToolbar: Story = {
  name: 'Icon only in a toolbar',
  render: (args: ButtonProps) => (
    <div role="toolbar" aria-label="Invoice" style={{ display: 'flex', gap: 'var(--space-200)' }}>
      <Button {...args} size="sm" iconOnly leftIcon="edit" aria-label="Edit" />
      <Button {...args} size="sm" iconOnly leftIcon="copy" aria-label="Duplicate" />
      <Button {...args} size="sm" iconOnly leftIcon="download" aria-label="Download" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Edit', 'Duplicate', 'Download']) await expect(canvas.getByRole('button', { name })).toBeVisible();
  },
};

/** The main action at the bottom of a form on a phone takes the full width. */
export const FullWidthOnAPhone: Story = {
  name: 'Full width on a phone',
  args: { variant: 'primary', size: 'lg', justified: true, leftIcon: undefined, children: 'Continue' },
  decorators: [Story => <div style={{ width: 343 }}><Story /></div>],
};

/* ---- Overview: types, content, colours and sizes side by side ---- */

/** Primary, Secondary, Outline and Text, from the strongest to the quietest. */
export const Types: Story = {
  render: (args: ButtonProps) => (
    <Showcase>
      {TYPES.map(variant => (
        <Variant key={variant} caption={variant === 'secondary' ? 'Secondary (default)' : variant[0].toUpperCase() + variant.slice(1)}>
          <Button {...args} variant={variant} />
        </Variant>
      ))}
    </Showcase>
  ),
};

/** Text only, text with an icon, icon only. */
export const Content: Story = {
  render: (args: ButtonProps) => (
    <Showcase>
      <Variant caption="Text"><Button {...args} leftIcon={undefined} /></Variant>
      <Variant caption="Text and icon"><Button {...args} /></Variant>
      <Variant caption="Icon only"><Button {...args} iconOnly aria-label="Add" /></Variant>
    </Showcase>
  ),
};

/** Neutral, destructive and green, each in the four types. */
export const Colors: Story = {
  render: (args: ButtonProps) => (
    <Showcase column>
      {(['neutral', 'destructive', 'green'] as const).map(tone => (
        <Variant key={tone} caption={{ neutral: 'Neutral', destructive: 'Destructive', green: 'Green' }[tone]}>
          {TYPES.map(variant => <Button key={variant} {...args} variant={variant} tone={tone} />)}
        </Variant>
      ))}
    </Showcase>
  ),
};

/** xlg-56, lg-44, md-40, sm-32 and xs-24. */
export const Sizes: Story = {
  render: (args: ButtonProps) => (
    <Showcase>
      {SIZES.map(size => (
        <Variant key={size} caption={{ xlg: 'xlg · 56px', lg: 'lg · 44px', md: 'md · 40px', sm: 'sm · 32px', xs: 'xs · 24px' }[size]}>
          <Button {...args} size={size} />
          <Button {...args} size={size} iconOnly aria-label="Add" />
        </Variant>
      ))}
    </Showcase>
  ),
};
