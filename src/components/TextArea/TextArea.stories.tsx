import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { TextArea, type TextAreaProps } from './TextArea';
import { CharacterCounter } from './CharacterCounter';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const MESSAGE =
  'Text Area component, an efficient way to collect multi-line feedback, offers distinct states and the option to add a label, counter, hint text, and more.';

/** A single field is 320px wide, as in Figma, with room for the floating label above. */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;

const meta = {
  title: 'Components/Text Area',
  component: TextArea,
  // The docs page is TextArea.mdx
  parameters: { layout: 'centered' },
  args: {
    size: 'lg',
    label: 'Message',
    floatingLabel: true,
    required: false,
    optional: false,
    hint: '',
    error: '',
    counter: true,
    maxLength: 200,
    resizable: true,
    disabled: false,
    previewState: 'default',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'focus'] },
    optional: { control: 'boolean' },
    onValueChange: { action: 'value changed', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Click the field to see the label float; type past 200 characters to see the limit. */
export const Playground: Story = { decorators: [field] };

/** Every part of the field, numbered as in the Figma guidelines. */
export const Anatomy: Story = {
  args: {
    floatingLabel: false,
    required: true,
    optional: true,
    info: 'We read every message.',
    placeholder: 'Placeholder',
    topKey: 'Key',
    topValue: 'Value',
    hint: 'This is a hint text to help user.',
    bottomValue: 'Value',
  },
  render: (args: TextAreaProps) => (
    <AnatomyBlock
      markers={[
        { n: 1, target: '.grg-textarea__box', side: 'right' },
        { n: 2, target: '.grg-field-label__name', side: 'top' },
        { n: 3, target: '.grg-field-label__star', side: 'top' },
        { n: 4, target: '.grg-field-label__extra', side: 'top' },
        { n: 5, target: '.grg-field-label__info', side: 'top' },
        { n: 6, target: '.grg-textarea__control', side: 'left' },
        { n: 7, target: '.grg-hint .grg-icon', side: 'bottom' },
        { n: 8, target: '.grg-hint > span:last-child', side: 'bottom' },
        { n: 9, target: '.grg-field__top .grg-key-value', side: 'top' },
        { n: 10, target: '.grg-field__bottom .grg-key-value', side: 'bottom' },
        { n: 11, target: '.grg-counter', side: 'bottom' },
        { n: 12, target: '.grg-textarea__resize', side: 'right' },
      ]}
    >
      <TextArea {...args} />
    </AnatomyBlock>
  ),
};

/** Fields one under another, with room for each label */
const column: CSSProperties = { display: 'grid', gap: 'var(--space-1000)', width: 320, paddingTop: 'var(--space-600)' };

/** lg, md and sm, from the top. Only the paddings change. */
export const Sizes: Story = {
  render: (args: TextAreaProps) => (
    <div style={column}>
      {(['lg', 'md', 'sm'] as const).map(size => <TextArea key={size} {...args} size={size} defaultValue={MESSAGE} />)}
    </div>
  ),
};

/** Drag the handle at the bottom right down to make the field taller, and back up; or focus it with Tab and use the arrow keys. */
export const Resizing: Story = { decorators: [field], args: { defaultValue: `${MESSAGE} ${MESSAGE}`.slice(0, 190) } };

/** The counter on its own: Default, Error and Disabled, from the left. */
export const Counter: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-800)' }}>
      <CharacterCounter count={153} max={200} />
      <CharacterCounter count={214} max={200} state="error" />
      <CharacterCounter count={153} max={200} state="disabled" />
    </div>
  ),
};

/* ---- States: one story each, as is usual in Storybook ---- */

/** Empty: the label sits inside as the placeholder. */
export const Default: Story = { decorators: [field] };

/** With a value: the label stays above, the counter shows the length. */
export const Filled: Story = { decorators: [field], args: { defaultValue: MESSAGE } };

/** Pointer over the field: a light fill and a darker border. */
export const Hovered: Story = { decorators: [field], args: { previewState: 'hover', defaultValue: MESSAGE } };

/** Focused: the darkest border, the label floats and turns dark. */
export const Active: Story = { decorators: [field], args: { previewState: 'focus', defaultValue: MESSAGE } };

/** Red border, message and counter. Empty and required, as in Figma. */
export const ErrorState: Story = { name: 'Error', decorators: [field], args: { required: true, error: 'This field is required' } };

/** Over the limit: the counter and the border turn red, with "Character limit exceeded." */
export const OverLimit: Story = { decorators: [field], args: { defaultValue: `${MESSAGE} ${MESSAGE}`.slice(0, 214) } };

/** Not available: grey fill and text, no interaction. */
export const Disabled: Story = { decorators: [field], args: { disabled: true, defaultValue: MESSAGE } };

/** Empty, focused, filled. What happens at each step is described on the docs page. */
export const FloatingLabel: Story = {
  render: (args: TextAreaProps) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--space-800)', paddingTop: 'var(--space-600)' }}>
      <TextArea {...args} />
      <TextArea {...args} previewState="focus" />
      <TextArea {...args} defaultValue={MESSAGE} />
    </div>
  ),
};
