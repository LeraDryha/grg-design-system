import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';
import { icons } from '../Icon/Icon';

const iconOptions = [undefined, ...Object.keys(icons).filter(n => n !== 'loading')];

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Buttons start actions: submit a form, open a dialog, confirm a step. ' +
          'Four types from strongest to quietest (Primary, Secondary, Outline, Text), five sizes, ' +
          'and two tones for destructive and positive actions. Use one Primary button per area.',
      },
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    tone: 'neutral',
    leftIcon: 'plus',
    rightIcon: undefined,
    iconOnly: false,
    loading: false,
    disabled: false,
    previewState: 'default',
  },
  argTypes: {
    children: { control: 'text', description: 'Label (Figma Text)' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'text'] },
    size: { control: 'inline-radio', options: ['xlg', 'lg', 'md', 'sm', 'xs'] },
    tone: { control: 'inline-radio', options: ['neutral', 'destructive', 'green'] },
    leftIcon: { control: 'select', options: iconOptions },
    rightIcon: { control: 'select', options: iconOptions },
    iconOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
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

const VARIANTS = ['primary', 'secondary', 'outline', 'text'] as const;
const SIZES = ['xlg', 'lg', 'md', 'sm', 'xs'] as const;
const TONES = ['neutral', 'destructive', 'green'] as const;

function Row({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-400)' }}>
      <span style={{ width: 96, font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>{label}</span>
      {children}
    </div>
  );
}

const grid = { display: 'grid', gap: 'var(--space-400)' } as const;

/** Every type in every tone. */
export const TypesAndTones: Story = {
  render: (args: ButtonProps) => (
    <div style={grid}>
      {TONES.map(tone => (
        <Row key={tone} label={tone}>
          {VARIANTS.map(variant => <Button key={variant} {...args} variant={variant} tone={tone} />)}
        </Row>
      ))}
    </div>
  ),
};

/** Five sizes; the number in the Figma name is the height. */
export const Sizes: Story = {
  render: (args: ButtonProps) => (
    <div style={grid}>
      {SIZES.map(size => (
        <Row key={size} label={size}>
          <Button {...args} size={size} />
          <Button {...args} size={size} iconOnly aria-label={String(args.children)} />
        </Row>
      ))}
    </div>
  ),
};

/** Default, hovered, active, focused, loading and disabled, for each type. */
export const States: Story = {
  render: (args: ButtonProps) => (
    <div style={grid}>
      {VARIANTS.map(variant => (
        <Row key={variant} label={variant}>
          <Button {...args} variant={variant} />
          <Button {...args} variant={variant} previewState="hover" />
          <Button {...args} variant={variant} previewState="active" />
          <Button {...args} variant={variant} previewState="focus" />
          <Button {...args} variant={variant} loading />
          <Button {...args} variant={variant} disabled />
        </Row>
      ))}
    </div>
  ),
};

/** A square button with one icon. It has no visible label, so `aria-label` is required. */
export const IconOnly: Story = {
  args: { iconOnly: true, 'aria-label': 'Add' },
};

/** The spinner replaces the label; the button keeps its width and stays focusable, announced as busy. */
export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Destructive: Story = {
  args: { tone: 'destructive', children: 'Delete', leftIcon: undefined },
};
