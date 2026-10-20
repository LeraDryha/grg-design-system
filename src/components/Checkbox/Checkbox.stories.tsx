import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Checkbox, type CheckboxProps } from './Checkbox';
import { CheckboxLabel } from '../CheckboxLabel/CheckboxLabel';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // The docs page is Checkbox.mdx
  parameters: { layout: 'centered' },
  args: { checked: true, indeterminate: false, size: 'sm', destructive: false, disabled: false, 'aria-label': 'Select row', previewState: 'default' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    onChange: { action: 'changed', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-600)' };
const column: CSSProperties = { display: 'grid', gap: 'var(--space-400)', width: 343 };

/** Edit everything in Controls. Click it: it switches on and off. */
export const Playground: Story = {
  render: function Render(args: CheckboxProps) {
    const [checked, setChecked] = useState(args.checked ?? false);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};

/** Checkbox and label. */
export const Anatomy: Story = {
  render: () => (
    <AnatomyBlock
      width="auto"
      markers={[
        { n: 1, target: '.grg-checkbox', side: 'left' },
        { n: 2, target: '.grg-checkbox-label__label', side: 'top' },
      ]}
    >
      <CheckboxLabel label="Checkbox label" />
    </AnatomyBlock>
  ),
};

/** md-20 and sm-16, from the left. */
export const Sizes: Story = {
  args: { checked: undefined },
  render: (args: CheckboxProps) => (
    <div style={row}>
      <CheckboxLabel {...args} size="md" label="md-20" defaultChecked />
      <CheckboxLabel {...args} size="sm" label="sm-16" defaultChecked />
    </div>
  ),
};

/** Empty, checked and indeterminate, from the left. */
export const Selection: Story = {
  render: (args: CheckboxProps) => (
    <div style={row}>
      <Checkbox {...args} checked={false} aria-label="Empty" />
      <Checkbox {...args} checked aria-label="Checked" />
      <Checkbox {...args} checked={false} indeterminate aria-label="Some selected" />
    </div>
  ),
};

/** With a label: label only, with a sublabel, with a description and a link, and flipped. */
export const WithLabel: Story = {
  args: { checked: undefined },
  render: (args: CheckboxProps) => (
    <div style={column}>
      <CheckboxLabel {...args} label="Remember me" defaultChecked />
      <CheckboxLabel {...args} label="Send me product news" sublabel="(Optional)" />
      <CheckboxLabel
        {...args}
        label="Two-step verification"
        sublabel="(Recommended)"
        description="Ask for a code from the app every time you sign in."
        link={{ label: 'Learn more', href: '#' }}
        defaultChecked
      />
      <CheckboxLabel {...args} label="Show archived invoices" description="The checkbox sits on the right in lists." flip />
    </div>
  ),
};

/** A list with a parent checkbox: indeterminate while only some items are selected. */
export const ListWithParent: Story = {
  render: function Render(args: CheckboxProps) {
    const items = ['Payman', 'Stripe', 'Adyen', 'SEPA EUR'];
    const [picked, setPicked] = useState<string[]>(['Payman', 'Stripe']);
    const all = picked.length === items.length;
    return (
      <div style={{ ...column, gap: 'var(--space-300)' }}>
        <CheckboxLabel
          {...args}
          label="All providers"
          checked={all}
          indeterminate={!all && picked.length > 0}
          onChange={on => setPicked(on ? items : [])}
        />
        <div style={{ display: 'grid', gap: 'var(--space-300)', paddingLeft: 'var(--space-600)' }}>
          {items.map(item => (
            <CheckboxLabel
              key={item}
              {...args}
              label={item}
              checked={picked.includes(item)}
              indeterminate={false}
              onChange={on => setPicked(on ? [...picked, item] : picked.filter(p => p !== item))}
            />
          ))}
        </div>
      </div>
    );
  },
};

/* ---- States: one story each, checked and empty side by side ---- */

const pair = (args: CheckboxProps) => (
  <div style={row}>
    <Checkbox {...args} checked={false} aria-label="Empty" />
    <Checkbox {...args} checked aria-label="Checked" />
    <Checkbox {...args} checked={false} indeterminate aria-label="Some selected" />
  </div>
);

/** At rest. */
export const Default: Story = { render: pair };

/** Pointer over it. */
export const Hovered: Story = { args: { previewState: 'hover' }, render: pair };

/** While it is pressed. */
export const Pressed: Story = { args: { previewState: 'active' }, render: pair };

/** Reached with the keyboard: the system focus ring. */
export const Focused: Story = { args: { previewState: 'focus' }, render: pair };

/** Not available right now. */
export const Disabled: Story = { args: { disabled: true }, render: pair };

/** Red for a choice that removes something. */
export const Destructive: Story = { args: { destructive: true }, render: pair };

/** A required choice that is missing: red, with a message under the label, read with the checkbox. */
export const ErrorState: Story = {
  name: 'Error',
  args: { checked: undefined },
  render: (args: CheckboxProps) => (
    <div style={column}>
      <CheckboxLabel {...args} label="I agree to the Terms of Service" required error="You need to accept the Terms to continue." />
      <CheckboxLabel
        {...args}
        label="I understand the withdrawal risks"
        description="Crypto transfers can't be reversed."
        required
        error="Confirm that you understand the risks."
      />
    </div>
  ),
};
