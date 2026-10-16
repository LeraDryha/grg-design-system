import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { FieldLabel, FormField, HintText, KeyValue, type FormFieldProps } from './FormField';

const meta = {
  title: 'Components/Form Field',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'The parts every form control shares: **label**, **hint text** and **Key: value**. Input uses them today; Select and Text Area will use the same parts.',
          '',
          '`FormField` puts them around a control. The label row sits 2px above the control and takes no vertical space (as in Figma), ',
          'the hint row sits 2px below. Connect the control to the hint with `aria-describedby={hintId}`.',
        ].join('\n'),
      },
    },
  },
  args: {
    controlId: 'demo-control',
    hintId: 'demo-hint',
    label: 'Label',
    required: true,
    optional: true,
    info: 'More about this field',
    labelVisible: true,
    labelState: 'default',
    hint: 'This is a hint text to help user.',
    error: '',
    topKey: 'Key',
    topValue: 'Value',
    bottomValue: 'Value',
    disabled: false,
    children: null,
  },
  argTypes: {
    labelState: { control: 'inline-radio', options: ['default', 'active', 'disabled'] },
    optional: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

const box: CSSProperties = {
  boxSizing: 'border-box',
  height: 'var(--space-1000)',
  border: '1px solid var(--stroke-base-300)',
  borderRadius: 'var(--radius-md-10)',
};

/** The frame with a placeholder box where the control goes. */
export const Frame: Story = {
  render: (args: FormFieldProps) => (
    <div style={{ width: 320, paddingTop: 'var(--space-600)' }}>
      <FormField {...args}>
        <div id={args.controlId} style={box} />
      </FormField>
    </div>
  ),
};

const column: CSSProperties = { display: 'grid', gap: 'var(--space-400)', justifyItems: 'start' };

/** Figma "Floating label": Default, Active (the control has focus), Disabled. */
export const Label: Story = {
  render: () => (
    <div style={column}>
      <FieldLabel required optional info="More about this field">Label</FieldLabel>
      <FieldLabel required optional info="More about this field" state="active">Label</FieldLabel>
      <FieldLabel required optional info="More about this field" state="disabled">Label</FieldLabel>
    </div>
  ),
};

/** Figma "Hint text": Default, Error, Disabled. An error replaces the hint. */
export const Hint: Story = {
  render: () => (
    <div style={column}>
      <HintText>This is a hint text to help user.</HintText>
      <HintText state="error">This is a hint text to help user.</HintText>
      <HintText state="disabled">This is a hint text to help user.</HintText>
    </div>
  ),
};

/** Figma "Key: value": a key and a value on top, or only a value under the control. */
export const KeyValues: Story = {
  render: () => (
    <div style={column}>
      <KeyValue keyText="Key" value="Value" />
      <KeyValue value="Value" />
      <KeyValue keyText="Balance" value="1 250.00 USD" />
    </div>
  ),
};
