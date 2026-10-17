import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import type { CSSProperties } from 'react';
import { Alert, alertStatuses, type AlertProps } from './Alert';
import { Button } from '../Button/Button';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  // The shared Alert, Notification & Toast docs page is Alert.mdx.
  parameters: { layout: 'padded', docs: { description: { component: 'A contextual message about what happened and what to do next. Use it inline as an Alert, or with elevation as a Notification or Toast.' } } },
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

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--space-800)', maxWidth: '100%' };
const column: CSSProperties = { display: 'grid', justifyItems: 'start', gap: 'var(--space-600)', maxWidth: '100%' };
const description = 'Alert description here! It would look better as two lines of text';

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

/** Container, status icon, title, description, action and close, numbered as in Figma. */
export const Anatomy: Story = {
  args: { size: 'sm', description },
  render: (args: AlertProps) => (
    <AnatomyBlock width={360} markers={[
      { n: 1, target: '.grg-alert', side: 'left' },
      { n: 2, target: '.grg-alert__status-icon', side: 'bottom' },
      { n: 3, target: '.grg-alert__title', side: 'top' },
      { n: 4, target: '.grg-alert__description', side: 'right' },
      { n: 5, target: '.grg-alert__action', side: 'bottom' },
      { n: 6, target: '.grg-alert__close', side: 'top' },
    ]}>
      <Alert {...args} />
    </AnatomyBlock>
  ),
};

/** Inline Alert: no elevation. */
export const InlineAlert: Story = { args: { size: 'sm', elevated: false } };

/** Floating Notification or Toast: Elevation XS, in the current theme. */
export const FloatingMessage: Story = { args: { size: 'sm', elevated: true } };

/** sm-20, then xs-16. The numbers are the text line height and icon size. */
export const Sizes: Story = {
  render: (args: AlertProps) => <div style={column}><Alert {...args} description={undefined} size="sm" /><Alert {...args} description={undefined} size="xs" /></div>,
};

/** Outstroke and Filled for each of the five statuses, as in the Figma Options rows. */
export const Filled: Story = {
  render: (args: AlertProps) => <div style={column}>{alertStatuses.map(status => <div key={status} style={row}><Alert {...args} status={status} filled={false} /><Alert {...args} status={status} filled /></div>)}</div>,
};

/** Without a description, then with one. The described variant always uses sm-20. */
export const Description: Story = {
  args: { size: 'sm' },
  render: (args: AlertProps) => <div style={column}><Alert {...args} description={undefined} /><Alert {...args} description={args.description || description} /></div>,
};

/** Close, action and status icon are independent options. */
export const OptionalParts: Story = {
  render: (args: AlertProps) => <div style={column}><Alert {...args} closable={false} /><Alert {...args} actionLabel={undefined} /><Alert {...args} statusIcon={false} /></div>,
};

/** The complete component set: 5 statuses × 2 fills × (xs, sm, sm with description). */
export const AllVariants: Story = {
  args: { elevated: true },
  render: (args: AlertProps) => <div style={column}>{(['xs', 'sm', 'description'] as const).map(kind => <div key={kind} style={column}>{alertStatuses.map(status => <div key={status} style={row}>{[false, true].map(filled => <Alert key={String(filled)} {...args} status={status} size={kind === 'xs' ? 'xs' : 'sm'} description={kind === 'description' ? (args.description || description) : undefined} filled={filled} />)}</div>)}</div>)}</div>,
};

/** Text grows naturally; long words wrap instead of clipping. */
export const LongContent: Story = {
  args: { size: 'sm', title: 'Your transfer is taking longer than expected', description: 'We are checking the transfer with the receiving bank. You can continue working and check its status later.', actionLabel: 'View transfer' },
};

/** A navigation action uses the existing Link, rather than a button with a URL handler. */
export const NavigationAction: Story = { args: { status: 'info', actionLabel: 'About this system', actionHref: '?path=/docs/getting-started-about--docs' } };

/** A local action is a real button: Enter or Space activates it. */
export const LocalAction: Story = { args: { status: 'success', title: 'Changes saved', actionLabel: 'Undo' } };

/* Message states are its five statuses; there is no disabled or hovered message in Figma. */
export const Warning: Story = { args: { status: 'warning' } };
export const ErrorState: Story = { name: 'Error', args: { status: 'error' } };
export const Success: Story = { args: { status: 'success' } };
export const Info: Story = { args: { status: 'info' } };
export const Neutral: Story = { args: { status: 'neutral' } };
