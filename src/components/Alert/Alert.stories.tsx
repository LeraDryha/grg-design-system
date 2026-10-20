import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Alert, alertStatuses, type AlertProps } from './Alert';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/alert/alert-component.png';
import guidelinesFrame from '../../assets/design/alert/alert-guidelines.png';

const meta = {
  title: 'Components/Alert',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Alert,
  // The shared Alert, Notification & Toast docs page is Alert.mdx.
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A contextual message about what happened and what to do next. Use it inline as an Alert, or with elevation as a Notification or Toast.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { title: 'Alert title here!', status: 'warning', size: 'xs', filled: false, statusIcon: true, elevated: false, actionLabel: 'Link button', closable: true, closeLabel: 'Close message' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    status: { control: 'inline-radio', options: alertStatuses },
    size: { control: 'inline-radio', options: ['xs', 'sm'] },
    filled: { control: 'boolean' },
    statusIcon: { control: 'boolean' },
    elevated: { control: 'boolean' },
    actionLabel: { control: 'text' },
    actionHref: { control: 'text' },
    closable: { control: 'boolean' },
    closeLabel: { control: 'text' },
    statusLabel: { control: 'text' },
    open: { control: 'boolean' },
    role: { control: 'inline-radio', options: ['status', 'alert'] },
    onAction: { action: 'action pressed', control: false },
    onClose: { action: 'closed', control: false },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const width = { width: 'min(360px, 100%)' };
const description = 'Alert description here! It would look better as two lines of text';
const STATUS_NAMES = { warning: 'Warning', error: 'Error', success: 'Success', info: 'Info', neutral: 'Neutral' };

/** Edit everything in Controls; Close hides it, and Show message brings it back. */
export const Playground: Story = {
  render: function Playground(args: AlertProps) {
    const [, updateArgs] = useArgs<AlertProps>();
    return args.open === false ? (
      <Button size="sm" onClick={() => updateArgs({ open: true })}>Show message</Button>
    ) : (
      <Alert {...args} onClose={() => { args.onClose?.(); updateArgs({ open: false }); }} />
    );
  },
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Saved, with a way back: a Toast with Undo. The action is a real button. */
export const UndoAChange: Story = {
  name: 'Undo a change',
  args: { status: 'success', size: 'sm', elevated: true, title: 'Invoice deleted', actionLabel: 'Undo', onAction: fn() },
  render: (args: AlertProps) => <div style={width}><Alert {...args} /></div>,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(/invoice deleted/i);
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

/** A failed payment next to the form: an error is announced at once, and explains what to do. */
export const APaymentFailed: Story = {
  name: 'A payment failed',
  args: {
    status: 'error', size: 'sm', filled: true, closable: false,
    title: 'The payment didn’t go through',
    description: 'Your bank declined the card. Try another card or contact your bank.',
    actionLabel: 'Try again', onAction: fn(),
  },
  render: (args: AlertProps) => <div style={width}><Alert {...args} /></div>,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(/error/i);
  },
};

/** Dismiss a notice: Close hides it until something brings it back. */
export const DismissANotice: Story = {
  name: 'Dismiss a notice',
  args: { status: 'info', title: 'New statement available', actionLabel: 'View', actionHref: '#' },
  render: function DismissANotice(args: AlertProps) {
    const [open, setOpen] = useState(true);
    return (
      <div style={width}>
        {open ? <Alert {...args} open onClose={() => setOpen(false)} /> : <Button size="sm" onClick={() => setOpen(true)}>Show message</Button>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close message' }));
    await waitFor(() => expect(canvas.queryByText('New statement available')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'Show message' }));
    await expect(canvas.getByText('New statement available')).toBeVisible();
  },
};

/** Long text: the message grows; keep the title short and put the explanation in the description. */
export const LongContent: Story = {
  name: 'Long content',
  args: { size: 'sm', title: 'Your transfer is taking longer than expected', description: 'We are checking the transfer with the receiving bank. You can continue working and check its status later.', actionLabel: 'View transfer' },
  render: (args: AlertProps) => <div style={width}><Alert {...args} /></div>,
};

/* ---- Overview ---- */

/** Inline Alert (no elevation) and a floating Notification or Toast (Elevation XS). */
export const Types: Story = {
  args: { size: 'sm' },
  render: (args: AlertProps) => (
    <Showcase>
      <Variant caption="Inline Alert"><div style={width}><Alert {...args} elevated={false} /></div></Variant>
      <Variant caption="Notification & Toast"><div style={width}><Alert {...args} elevated /></div></Variant>
    </Showcase>
  ),
};

/** The five statuses, Outstroke and Filled. */
export const Statuses: Story = {
  render: (args: AlertProps) => (
    <Showcase column>
      {alertStatuses.map(status => (
        <Variant key={status} caption={STATUS_NAMES[status]}>
          <Alert {...args} status={status} filled={false} />
          <Alert {...args} status={status} filled />
        </Variant>
      ))}
    </Showcase>
  ),
};

/** sm-20, xs-16, and sm-20 with a description. */
export const Sizes: Story = {
  render: (args: AlertProps) => (
    <Showcase column>
      <Variant caption="sm · 20px"><div style={width}><Alert {...args} size="sm" /></div></Variant>
      <Variant caption="xs · 16px"><div style={width}><Alert {...args} size="xs" /></div></Variant>
      <Variant caption="With a description (sm only)"><div style={width}><Alert {...args} size="sm" description={description} /></div></Variant>
    </Showcase>
  ),
};
