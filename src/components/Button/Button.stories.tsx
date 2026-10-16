import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Button, type ButtonProps } from './Button';
import { icons } from '../Icon/Icon';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const iconOptions = [undefined, ...Object.keys(icons).filter(n => n !== 'loading')];

const meta = {
  title: 'Components/Button',
  component: Button,
  // The docs page is Button.mdx
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
    previewState: 'default',
  },
  argTypes: {
    children: { control: 'text', description: 'Label (Figma Text)' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'text'] },
    size: { control: 'inline-radio', options: ['xlg', 'lg', 'md', 'sm', 'xs'] },
    tone: { control: 'inline-radio', options: ['neutral', 'destructive', 'green'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    'aria-label': { control: 'text', description: 'Required with iconOnly: the name screen readers announce' },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-400)' };
const rows: CSSProperties = { display: 'grid', gap: 'var(--space-400)', justifyItems: 'start' };

/** Edit everything in Controls. */
export const Playground: Story = {};

/** Container, icon and label, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  args: { variant: 'primary', size: 'xlg' },
  render: (args: ButtonProps) => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-button', side: 'bottom' },
        { n: 2, target: '.grg-button .grg-icon', side: 'top' },
        { n: 3, target: '.grg-button__label', side: 'top' },
      ]}
    >
      <Button {...args} />
    </AnatomyBlock>
  ),
};

/** Primary, Secondary, Outline and Text, from the strongest to the quietest. */
export const Types: Story = {
  render: (args: ButtonProps) => (
    <div style={row}>
      {(['primary', 'secondary', 'outline', 'text'] as const).map(variant => <Button key={variant} {...args} variant={variant} />)}
    </div>
  ),
};

/** Text only, text with an icon, icon only. */
export const Content: Story = {
  render: (args: ButtonProps) => (
    <div style={row}>
      <Button {...args} leftIcon={undefined} />
      <Button {...args} />
      <Button {...args} iconOnly aria-label="Add" />
    </div>
  ),
};

/** Neutral, destructive and green, each in the four types. */
export const Colors: Story = {
  render: (args: ButtonProps) => (
    <div style={rows}>
      {(['neutral', 'destructive', 'green'] as const).map(tone => (
        <div key={tone} style={row}>
          {(['primary', 'secondary', 'outline', 'text'] as const).map(variant => <Button key={variant} {...args} variant={variant} tone={tone} />)}
        </div>
      ))}
    </div>
  ),
};

/** xlg-56, lg-44, md-40, sm-32 and xs-24, from the left. */
export const Sizes: Story = {
  render: (args: ButtonProps) => (
    <div style={rows}>
      <div style={row}>{(['xlg', 'lg', 'md', 'sm', 'xs'] as const).map(size => <Button key={size} {...args} size={size} />)}</div>
      <div style={row}>{(['xlg', 'lg', 'md', 'sm', 'xs'] as const).map(size => <Button key={size} {...args} size={size} iconOnly aria-label="Add" />)}</div>
    </div>
  ),
};

/** The button takes the full width of its container. */
export const Justified: Story = {
  args: { variant: 'primary', size: 'lg', justified: true },
  decorators: [Story => <div style={{ width: 376 }}><Story /></div>],
};

/* ---- States: one story each ---- */

/** At rest. */
export const Default: Story = { args: { variant: 'primary' } };

/** Pointer over the button. */
export const Hovered: Story = { args: { variant: 'primary', previewState: 'hover' } };

/** While the button is pressed (Figma State: Active). */
export const Pressed: Story = { args: { variant: 'primary', previewState: 'active' } };

/** Reached with the keyboard: the system focus ring. */
export const Focused: Story = { args: { variant: 'primary', previewState: 'focus' } };

/** The action is running: a spinner replaces the label, the width stays. */
export const Loading: Story = { args: { variant: 'primary', loading: true } };

/** Not available right now. */
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };
