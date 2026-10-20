import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TextArea, type TextAreaProps } from './TextArea';
import { CharacterCounter } from './CharacterCounter';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/text-area/text-area-component.png';
import guidelinesFrame from '../../assets/design/text-area/text-area-guidelines.png';

const MESSAGE =
  'Text Area component, an efficient way to collect multi-line feedback, offers distinct states and the option to add a label, counter, hint text, and more.';

/** A single field is 320px wide, as in Figma, with room for the floating label above. */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;

const meta = {
  title: 'Components/Text Area',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: TextArea,
  // The docs page is TextArea.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
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
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    optional: { control: 'boolean' },
    onValueChange: { action: 'value changed', control: false },
    onChange: { action: 'native change', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Click the field to see the label float; type up to 200 characters to see the limit. */
export const Playground: Story = { decorators: [field] };

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Feedback with a limit: the counter follows the text, and the browser stops typing at the limit. */
export const WriteFeedback: Story = {
  name: 'Write feedback',
  decorators: [field],
  args: { label: 'Your feedback', maxLength: 40, hint: 'What could we do better?' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByLabelText('Your feedback');
    await userEvent.type(area, 'The payment page could load faster.');
    await expect(canvas.getByText('35/40')).toBeVisible();
    await userEvent.type(area, ' Thanks a lot!');
    await expect(area).toHaveValue('The payment page could load faster. Than');
    await expect(canvas.getByText('40/40')).toBeVisible();
  },
};

/** A required message: the error appears when the form is sent empty, and goes once people write. */
export const RequiredInAForm: Story = {
  name: 'Required in a form',
  render: function RequiredInAForm(args: TextAreaProps) {
    const [value, setValue] = useState('');
    const [sent, setSent] = useState(false);
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setSent(true);
    };
    return (
      <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 'var(--space-600)', width: 320, paddingTop: 'var(--space-600)' }}>
        <TextArea {...args} label="Reason for the refund" required value={value} onValueChange={setValue} error={sent && !value ? 'This field is required' : ''} />
        <Button type="submit" variant="primary">Send request</Button>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send request' }));
    const area = canvas.getByLabelText(/reason for the refund/i);
    await expect(await canvas.findByText('This field is required')).toBeVisible();
    await expect(area).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(area, 'Charged twice');
    await waitFor(() => expect(canvas.queryByText('This field is required')).toBeNull());
  },
};

/** Make it taller: drag the handle at the bottom right, or Tab to it and use the arrow keys. */
export const ResizeWithTheKeyboard: Story = {
  name: 'Resize with the keyboard',
  decorators: [field],
  args: { defaultValue: `${MESSAGE} ${MESSAGE}`.slice(0, 190) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize text area' });
    const before = Number(handle.getAttribute('aria-valuenow'));
    handle.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(Number(handle.getAttribute('aria-valuenow'))).toBe(before + 40));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '400'));
  },
};

/** Saved text over the limit: shown with an error, never cut without asking. */
export const SavedTextOverTheLimit: Story = {
  name: 'Saved text over the limit',
  decorators: [field],
  args: { defaultValue: `${MESSAGE} ${MESSAGE}`.slice(0, 214) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Character limit exceeded.')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveValue(`${MESSAGE} ${MESSAGE}`.slice(0, 214));
  },
};

/** Not available right now: grey fill, text and counter, no interaction. */
export const Unavailable: Story = { decorators: [field], args: { disabled: true, defaultValue: MESSAGE } };

/** A parent form owns the value through the standard onChange. */
export const ControlledByAForm: Story = {
  name: 'Controlled by a form',
  decorators: [field],
  args: { maxLength: 20 },
  render: function Controlled(args) {
    const [value, setValue] = useState('');
    return <><TextArea {...args} value={value} onChange={event => { setValue(event.target.value); args.onChange?.(event); }} /><output aria-live="polite">Form value: {value || 'Empty'}</output></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Message'), 'Hello');
    await expect(canvas.getByText('Form value: Hello')).toBeVisible();
  },
};

/* ---- Overview ---- */

/** lg, md and sm. Only the paddings change. */
export const Sizes: Story = {
  render: (args: TextAreaProps) => (
    <div style={{ width: 320, paddingTop: 'var(--space-600)' }}>
      <Showcase column>
        {(['lg', 'md', 'sm'] as const).map(size => (
          <Variant key={size} caption={{ lg: 'lg · 44px base', md: 'md · 40px base', sm: 'sm · 32px base' }[size]}>
            <div style={{ width: '100%' }}><TextArea {...args} size={size} defaultValue={MESSAGE} /></div>
          </Variant>
        ))}
      </Showcase>
    </div>
  ),
};

/** The counter on its own: Default, Error and Disabled. */
export const Counter: Story = {
  render: () => (
    <Showcase>
      <Variant caption="Default"><CharacterCounter count={153} max={200} /></Variant>
      <Variant caption="Error"><CharacterCounter count={214} max={200} state="error" /></Variant>
      <Variant caption="Disabled"><CharacterCounter count={153} max={200} state="disabled" /></Variant>
    </Showcase>
  ),
};
