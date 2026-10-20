import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox, type CheckboxProps } from './Checkbox';
import { CheckboxLabel } from '../CheckboxLabel/CheckboxLabel';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/checkbox/checkbox-component.png';
import guidelinesFrame from '../../assets/design/checkbox/checkbox-guidelines.png';

const meta = {
  title: 'Components/Checkbox',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Checkbox,
  // The docs page is Checkbox.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { checked: true, indeterminate: false, size: 'sm', destructive: false, disabled: false, 'aria-label': 'Select row' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    onChange: { action: 'changed', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = { display: 'grid', gap: 'var(--space-400)', width: 343 } as const;

/** Edit everything in Controls. Click it: it switches on and off. */
export const Playground: Story = {
  render: function Render(args: CheckboxProps) {
    const [checked, setChecked] = useState(args.checked ?? false);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Select all: the parent checkbox is indeterminate while only some items are selected. */
export const SelectAll: Story = {
  name: 'Select all',
  args: { checked: undefined, 'aria-label': undefined },
  render: function SelectAll(args: CheckboxProps) {
    const items = ['Payman', 'Stripe', 'Adyen', 'SEPA EUR'];
    const [picked, setPicked] = useState<string[]>(['Payman', 'Stripe']);
    const all = picked.length === items.length;
    return (
      <div style={{ ...column, gap: 'var(--space-300)' }}>
        <CheckboxLabel {...args} label="All providers" checked={all} indeterminate={!all && picked.length > 0} onChange={on => setPicked(on ? items : [])} />
        <div style={{ display: 'grid', gap: 'var(--space-300)', paddingLeft: 'var(--space-600)' }}>
          {items.map(item => (
            <CheckboxLabel key={item} {...args} label={item} checked={picked.includes(item)} indeterminate={false}
              onChange={on => setPicked(on ? [...picked, item] : picked.filter(p => p !== item))} />
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: 'All providers' });
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(canvas.getByText('All providers'));
    for (const name of ['Payman', 'Stripe', 'Adyen', 'SEPA EUR']) await expect(canvas.getByRole('checkbox', { name })).toBeChecked();
    // Space switches the focused checkbox
    canvas.getByRole('checkbox', { name: 'Adyen' }).focus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Adyen' })).not.toBeChecked();
    await expect(parent).toBePartiallyChecked();
  },
};

/** Accept the terms: a required choice, with a message under the label when it's missing. */
export const AcceptTheTerms: Story = {
  name: 'Accept the terms',
  args: { checked: undefined, 'aria-label': undefined },
  render: function AcceptTheTerms(args: CheckboxProps) {
    const [accepted, setAccepted] = useState(false);
    const [sent, setSent] = useState(false);
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setSent(true);
    };
    return (
      <form onSubmit={submit} noValidate style={{ ...column, gap: 'var(--space-600)' }}>
        <CheckboxLabel {...args} label="I agree to the Terms of Service" required checked={accepted} onChange={setAccepted}
          error={sent && !accepted ? 'You need to accept the Terms to continue.' : undefined} />
        <Button type="submit" variant="primary" size="lg" justified>Create account</Button>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    const terms = canvas.getByRole('checkbox', { name: /terms of service/i });
    await expect(terms).toHaveAttribute('aria-invalid', 'true');
    await expect(terms).toHaveAccessibleDescription(/you need to accept the terms/i);
    await userEvent.click(canvas.getByText('I agree to the Terms of Service'));
    await expect(terms).toBeChecked();
    await expect(canvas.queryByText('You need to accept the Terms to continue.')).toBeNull();
  },
};

/** Settings with more to say: a sublabel, a description and a link, all read with the checkbox. */
export const ExplainAnOption: Story = {
  name: 'Explain an option',
  args: { checked: undefined, 'aria-label': undefined },
  render: (args: CheckboxProps) => (
    <div style={column}>
      <CheckboxLabel {...args} label="Two-step verification" sublabel="(Recommended)"
        description="Ask for a code from the app every time you sign in." link={{ label: 'Learn more', href: '#' }} defaultChecked />
      <CheckboxLabel {...args} label="Send me product news" sublabel="(Optional)" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: /two-step verification/i })).toHaveAccessibleDescription(/ask for a code/i);
  },
};

/** A list where the text comes first: the checkbox on the right (Figma Flip). */
export const ChecklistOnTheRight: Story = {
  name: 'Checklist on the right',
  args: { checked: undefined, 'aria-label': undefined },
  render: (args: CheckboxProps) => (
    <div style={column}>
      <CheckboxLabel {...args} label="Show archived invoices" flip />
      <CheckboxLabel {...args} label="Show refunds" flip defaultChecked />
      <CheckboxLabel {...args} label="Show test payments" flip disabled />
    </div>
  ),
};

/** A choice that removes something: red in every state (Figma Destructive). */
export const RemoveSomething: Story = {
  name: 'Remove something',
  args: { checked: undefined, 'aria-label': undefined },
  render: (args: CheckboxProps) => (
    <div style={column}>
      <CheckboxLabel {...args} label="Also delete the attached files" description="This can't be undone." destructive />
    </div>
  ),
};

/* ---- Overview ---- */

/** Empty, checked and indeterminate. */
export const Selection: Story = {
  render: (args: CheckboxProps) => (
    <Showcase>
      <Variant caption="Empty"><Checkbox {...args} checked={false} aria-label="Empty" /></Variant>
      <Variant caption="Checked"><Checkbox {...args} checked aria-label="Checked" /></Variant>
      <Variant caption="Indeterminate"><Checkbox {...args} checked={false} indeterminate aria-label="Some selected" /></Variant>
    </Showcase>
  ),
};

/** md-20 and sm-16. */
export const Sizes: Story = {
  args: { checked: undefined },
  render: (args: CheckboxProps) => (
    <Showcase>
      <Variant caption="md · 20px"><CheckboxLabel {...args} size="md" label="Label" defaultChecked /></Variant>
      <Variant caption="sm · 16px (default)"><CheckboxLabel {...args} size="sm" label="Label" defaultChecked /></Variant>
    </Showcase>
  ),
};
