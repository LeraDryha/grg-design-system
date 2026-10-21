import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { NotificationFeed, NotificationItem, type Notification, type NotificationFeedProps } from './NotificationFeed';
import { TopbarButton, TopbarNavigation } from '../TopbarNavigation/TopbarNavigation';
import { TransactionIcon } from '../TransactionIcon/TransactionIcon';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/notification-feed/notification-feed-component.png';
import partsFrame from '../../assets/design/notification-feed/notification-feed-parts.png';
import guidelinesFrame from '../../assets/design/notification-feed/notification-feed-guidelines.png';
import popoverFrame from '../../assets/design/notification-feed/notification-feed-popover.png';

const at = (minutesAgo: number) => new Date(Date.UTC(2026, 3, 9, 10, 54, 14) - minutesAgo * 60_000);

/* The notifications of the Figma examples */
const sample: Notification[] = [
  {
    id: 'deposit', title: 'ETH deposit successful', unread: true, date: at(0), href: '#deposit',
    description: 'The deposit of 9.9990001 ETH has been received. Your balance has been successfully updated.',
    icon: <TransactionIcon type="deposit" />,
  },
  {
    id: 'withdrawal', title: 'ETH withdrawal successful', unread: true, date: at(12), href: '#withdrawal',
    description: 'You have successfully withdrawn 1.0005 ETH. If you do not recognize this activity, please contact us. You have successfully withdrawn 1.0005 ETH.',
    icon: <TransactionIcon type="withdrawal" />,
  },
  {
    id: 'payment', title: 'You have received a payment', unread: true, date: at(40), href: '#payment',
    description: 'You have received a payment of 0.00170452 in BTC',
    icon: <TransactionIcon type="payment" />,
  },
  {
    id: 'withdrawal-2', title: 'ETH withdrawal successful', date: at(180), href: '#withdrawal-2',
    description: 'You have successfully withdrawn 1.0005 ETH',
    icon: <TransactionIcon type="withdrawal" />,
  },
  {
    id: 'payment-2', title: 'You have received a payment', date: at(600), href: '#payment-2',
    description: 'You have received a payment of 0.00170452 in BTC',
    icon: <TransactionIcon type="payment" />,
  },
];

/** A screen with room for the feed under the bell; a transformed box holds the phone layout */
const screen = (width?: number, height = 720): Decorator => Story => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width, maxWidth: '100%', height, margin: '0 auto', background: 'var(--surface-canvas)' }}>
    <Story />
  </div>
);

/** The bell of the top bar with its feed: opening one marks it read, as the product would */
function Demo({ initial = sample, bare = false, ...props }: Omit<NotificationFeedProps, 'notifications' | 'trigger'> & { initial?: Notification[]; bare?: boolean }) {
  const [items, setItems] = useState(initial);
  const unread = items.filter(n => n.unread).length;
  const feed = (
      <NotificationFeed
        settingsHref="#notification-settings"
        viewAllHref="#notifications"
        {...props}
        notifications={items}
        onOpen={(n, event) => {
          event.preventDefault();
          setItems(list => list.map(item => (item.id === n.id ? { ...item, unread: false } : item)));
        }}
        onMarkAllRead={() => setItems(list => list.map(item => ({ ...item, unread: false })))}
        trigger={props => (
          <TopbarButton action={{ label: 'Notifications', icon: 'notification', badge: unread ? `${unread} unread` : undefined }} buttonProps={props} />
        )}
      />
  );
  // On its own the bell sits at the top right, as in a top bar
  return bare ? feed : <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-400) var(--space-600)' }}>{feed}</div>;
}

const meta = {
  title: 'Components/Notification Feed',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: NotificationFeed,
  // The docs page is NotificationFeed.mdx
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Notification feed', type: 'image', url: componentFrame },
      { name: 'Notifications misc items', type: 'image', url: partsFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Popover', type: 'image', url: popoverFrame },
    ],
  },
  args: { notifications: sample, trigger: () => null, layout: 'popover' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['auto', 'popover', 'phone'] },
    notifications: { control: false },
    trigger: { control: false },
  },
} satisfies Meta<typeof NotificationFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [screen()],
  render: ({ notifications: _n, trigger: _t, ...args }) => <Demo {...args} />,
};

/* ---- Examples ---- */

const openFeed = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /^Notifications/ }));
  return within(document.body).findByRole('dialog', { name: 'Notifications' });
};

/** The bell opens the feed. Opening a notification marks it read; Unread shows what is left. */
export const ReadAndUnread: Story = {
  name: 'Read and unread',
  // Known Figma contrast: the date (text-disabled-400, Caption-xs) is about 2.6:1
  parameters: { a11y: { test: 'todo' } },
  decorators: [screen()],
  render: ({ notifications: _n, trigger: _t, ...args }) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const bell = within(canvasElement).getByRole('button', { name: 'Notifications, 3 unread' });
    const feed = within(await openFeed(canvasElement));
    await waitFor(() => expect(bell).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(feed.getByRole('link', { name: /ETH deposit successful/ }));
    await userEvent.click(feed.getByRole('tab', { name: /Unread/ }));
    await expect(within(feed.getByRole('tabpanel')).getAllByRole('link')).toHaveLength(2);
    await userEvent.click(feed.getByRole('button', { name: 'Mark all as read' }));
    await expect(await feed.findByText('No notifications yet')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(bell).toHaveAttribute('aria-expanded', 'false'));
  },
};

/** Figma Buttons: a notification that asks for a decision. Only its buttons act. */
export const ApproveAWithdrawal: Story = {
  name: 'Approve a withdrawal',
  // Known Figma contrast: the date (text-disabled-400, Caption-xs) is about 2.6:1
  parameters: { a11y: { test: 'todo' } },
  decorators: [screen(undefined, 420)],
  render: () => (
    <div style={{ width: 'calc(var(--space-5000) * 2 - var(--space-400))', margin: 'var(--space-600) auto', background: 'var(--surface-floating)', borderRadius: 'var(--radius-lg-12)' }}>
      <NotificationItem
        notification={{
          id: 'approve', title: 'Withdrawal request', sublabel: '(Members)', unread: true, date: at(3),
          description: 'Mia Lane asks to withdraw 2.5 ETH to an external wallet.',
          icon: <TransactionIcon type="withdrawal" />,
          secondaryAction: { label: 'Decline', onClick: () => {} },
          primaryAction: { label: 'Approve', onClick: () => {} },
        }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  },
};

/** Figma Empty: nothing yet. */
export const Empty: Story = {
  decorators: [screen()],
  render: ({ notifications: _n, trigger: _t, ...args }) => <Demo {...args} initial={[]} />,
  play: async ({ canvasElement }) => {
    const feed = within(await openFeed(canvasElement));
    await expect(feed.getByText('No notifications yet')).toBeVisible();
    await expect(feed.queryByRole('button', { name: 'Mark all as read' })).toBeNull();
  },
};

/** Figma Skeleton: PrimeReact Skeleton in the system colours while the notifications load. */
export const Loading: Story = {
  decorators: [screen()],
  render: ({ notifications: _n, trigger: _t, ...args }) => <Demo {...args} loading />,
  play: async ({ canvasElement }) => {
    const feed = await openFeed(canvasElement);
    await expect(feed.querySelector('[aria-busy="true"]')).not.toBeNull();
  },
};

/** In the top bar: Notifications stays in the bar on every screen. */
export const InTheTopBar: Story = {
  name: 'In the top bar',
  decorators: [screen(undefined, 720)],
  render: function InTheTopBar() {
    return (
      <TopbarNavigation
        layout="desktop"
        logo={<span style={{ font: 'var(--typo-title-sm-bold)' }}>Northwind</span>}
        sections={[{ items: [{ id: 'dashboard', label: 'Dashboard', href: '#dashboard' }, { id: 'orders', label: 'Orders', href: '#orders' }] }]}
        current="dashboard"
        actions={[{ id: 'notifications', label: 'Notifications', icon: 'notification', inBar: true, element: <Demo bare /> }]}
        account={{ name: 'Guadalupe Schimmel' }}
      />
    );
  },
};

/** On a phone the feed opens under the top bar, the full width. */
export const OnAPhone: Story = {
  name: 'On a phone',
  decorators: [screen(375, 720)],
  render: ({ notifications: _n, trigger: _t, ...args }) => <Demo {...args} layout="phone" />,
};

/* ---- Overview ---- */

/** Figma Notification feed: with and without the new dot, a sublabel, buttons, and a long description cut at two lines. */
export const Items: Story = {
  // Known Figma contrast: the date (text-disabled-400, Caption-xs) is about 2.6:1
  parameters: { layout: 'padded', a11y: { test: 'todo' } },
  render: () => (
    <Showcase column>
      {[
        ['new', { ...sample[0] }],
        ['read', { ...sample[0], id: 'read', unread: false }],
        ['two lines at most', { ...sample[1], id: 'long' }],
        ['sublabel and buttons', { id: 'b', title: 'Label', sublabel: '(Sublabel)', description: 'Insert the notif feed description here.', date: at(0), unread: true, icon: <TransactionIcon type="withdrawal" />, secondaryAction: { label: 'Button', onClick: () => {} }, primaryAction: { label: 'Button', onClick: () => {} } }],
      ].map(([caption, n]) => (
        <Variant key={caption as string} caption={caption as string}>
          <div style={{ width: 'calc(var(--space-5000) * 2 - var(--space-400))' }}><NotificationItem notification={n as Notification} /></div>
        </Variant>
      ))}
    </Showcase>
  ),
};
