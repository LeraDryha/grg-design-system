import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { NotificationsFlow } from './Notifications';
import { screen } from '../shared/screen';
import feedFrame from '../../assets/design/in-product/notifications/1-feed.png';
import feedEmptyFrame from '../../assets/design/in-product/notifications/2-feed-empty.png';
import pageFrame from '../../assets/design/in-product/notifications/3-page.png';
import hideReadFrame from '../../assets/design/in-product/notifications/4-hide-read.png';
import emptyFrame from '../../assets/design/in-product/notifications/5-empty.png';
import version1Frame from '../../assets/design/in-product/notifications/6-version-1.png';

export const frames: [string, string][] = [
  [feedFrame, '1 · The feed under the bell'], [feedEmptyFrame, '2 · The feed, empty'], [pageFrame, '3 · Notifications'],
  [hideReadFrame, '4 · Hide read'], [emptyFrame, '5 · Nothing in a category'], [version1Frame, '6 · Version 1, with View details'],
];

const meta = {
  title: 'In product/Notifications',
  tags: ['ready'],
  component: NotificationsFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames; the page without the bar and its logo
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
    // Known Figma contrast: the notification date (text-disabled-400) is about 2.6:1
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof NotificationsFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: open a notification, hide the read ones, mark all as read; wait a few seconds for a new deposit. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  args: { arrive: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const items = () => canvasElement.querySelectorAll('.grg-ip-notes__list li');
    await step('Three unread; Hide read leaves them, a category narrows the list', async () => {
      await expect(canvas.getByRole('tab', { name: /^All/ })).toHaveTextContent('3');
      await userEvent.click(canvas.getByText('Hide read'));
      await waitFor(() => expect(items()).toHaveLength(3));
      await userEvent.click(canvas.getByText('Hide read'));
      await userEvent.click(canvas.getByRole('tab', { name: /Deposits/ }));
      await waitFor(() => expect(canvasElement.querySelector('.grg-ip-notes__list')).toHaveTextContent('deposit successful'));
    });
    await step('A notification opens its transaction, read', async () => {
      await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-ip-notes__list .grg-notification')!);
      await expect(await canvas.findByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument();
      await expect(canvas.getByRole('heading', { level: 1, name: 'Transactions' })).toBeInTheDocument();
    });
    await step('The bell: Mark all as read, then View all back to the page', async () => {
      await userEvent.keyboard('{Escape}');
      await userEvent.click(canvas.getByRole('button', { name: /^Notifications/ }));
      // The feed is placed under the bell, over the page (in the document's body)
      const feed = await within(document.body).findByRole('dialog', { name: 'Notifications' });
      await userEvent.click(within(feed).getByRole('button', { name: 'Mark all as read' }));
      await userEvent.click(within(feed).getByRole('link', { name: /View all notifications/ }));
      await expect(await canvas.findByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    });
  },
};
