import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Alert, alertStatuses, type AlertProps } from './Alert';
import { MessagesProvider, useMessages } from './Messages';
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

/* ---- On a page (Figma Examples 419:15467): where each kind appears ---- */

const block = (height: string, extra: CSSProperties = {}): CSSProperties => ({ height, borderRadius: 'var(--radius-lg-12)', background: 'var(--surface-base)', ...extra });

/** A page in grey blocks, as in the Figma examples. The frame is a small screen: the messages show inside it */
function PageMock({ top, actions, messages = false }: { top?: ReactNode; actions?: ReactNode; messages?: boolean }) {
  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
        <span style={block('var(--space-1000)', { width: 'var(--space-1000)', borderRadius: 'var(--radius-fully-rounded)' })} />
        <span style={block('var(--space-300)', { width: 'var(--space-2000)' })} />
        <span style={{ flex: 1 }} />
        {actions}
      </div>
      {top}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-400)' }}>
        {[0, 1, 2].map(i => <span key={i} style={block('var(--space-2000)')} />)}
      </div>
      {[0, 1, 2].map(i => <span key={i} style={block('var(--space-1000)')} />)}
    </>
  );
  return (
    <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', height: 'calc(var(--space-5000) * 2 + var(--space-2000))', padding: 'var(--space-600)', borderRadius: 'var(--radius-xl-16)', border: '1px solid var(--stroke-soft-200)', background: 'var(--surface-canvas)', display: 'grid', gap: 'var(--space-400)', alignContent: 'start', boxSizing: 'border-box' }}>
      {messages ? <MessagesProvider appendTo="self">{content}</MessagesProvider> : content}
    </div>
  );
}

/** Figma Alerts: a persistent message at the top of the content, until it is closed. */
export const AlertOnAPage: Story = {
  name: 'Alert on a page',
  render: () => (
    <PageMock top={
      // On a page the Alert takes the width of the content (the component is 360px wide by default)
      <Alert style={{ width: '100%' }} status="success" size="sm" title="Your fee per invoice payment reduced to 1.5%"
        description="Enjoy reduced fee for the first three months after registration, as you joined with the referral program" />
    } />
  ),
};

/** Figma Notification: in the bottom right corner; it stays until it is closed. */
export const NotificationInTheCorner: Story = {
  name: 'Notification in the corner',
  render: function NotificationInTheCorner() {
    function Actions() {
      const { notify } = useMessages();
      return (
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Button size="sm" variant="secondary" onClick={() => notify({ status: 'success', title: 'Payment received', actionLabel: 'See transaction', actionHref: '#transaction' })}>Receive a payment</Button>
          <Button size="sm" variant="secondary" onClick={() => notify({ status: 'error', filled: true, title: 'Database connection failure', description: 'We’re encountering issues with connecting to our system’s database at the moment.', actionLabel: 'Learn more', actionHref: '#status' })}>Lose the database</Button>
        </div>
      );
    }
    return <PageMock messages actions={<Actions />} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Receive a payment' }));
    const area = await canvas.findByRole('region', { name: 'Notifications' });
    await waitFor(() => expect(within(area).getByText('Payment received')).toBeVisible());
    await userEvent.click(within(area).getByRole('button', { name: 'Close message' }));
    await waitFor(() => expect(within(area).queryByText('Payment received')).toBeNull());
  },
};

/** Figma Toast: compact, at the bottom in the middle, several stacked. "Changes saved" and "Copied" disappear by
 *  themselves after 4 seconds (not while the pointer or focus is on them); "Invoice deleted" waits for Undo or Close. */
export const ToastsAtTheBottom: Story = {
  name: 'Toasts at the bottom',
  render: function ToastsAtTheBottom() {
    function Actions() {
      const { toast } = useMessages();
      return (
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Button size="sm" variant="secondary" onClick={() => toast({ status: 'success', title: 'Changes saved', duration: 4000 })}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ status: 'success', title: 'Copied', duration: 4000 })}>Copy</Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ status: 'success', title: 'Invoice deleted', actionLabel: 'Undo', onAction: () => undefined })}>Delete</Button>
        </div>
      );
    }
    return <PageMock messages actions={<Actions />} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    const area = await canvas.findByRole('region', { name: 'Toasts' });
    await waitFor(() => expect(within(area).getByText('Changes saved')).toBeVisible());
    await waitFor(() => expect(within(area).getByText('Invoice deleted')).toBeVisible());
    // The one that asks nothing goes by itself; the one with Undo stays
    await waitFor(() => expect(within(area).queryByText('Changes saved')).toBeNull(), { timeout: 6000 });
    await expect(within(area).getByText('Invoice deleted')).toBeVisible();
  },
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
