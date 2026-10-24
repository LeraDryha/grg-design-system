import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Banner, bannerStatuses, type BannerProps } from './Banner';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/banner/banner-component.png';
import guidelinesFrame from '../../assets/design/banner/banner-guidelines.png';
import longTextFrame from '../../assets/design/banner/banner-long-text.png';

const meta = {
  title: 'Components/Banner',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Banner,
  // Banner.mdx supplies the documentation.
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A full-width message for a page-wide or service-wide notice, with an optional description, action and dismissal.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Long text', type: 'image', url: longTextFrame },
    ],
  },
  args: { title: 'Banner title here!', description: 'Banner description here!', status: 'warning', filled: false, align: 'center', actionLabel: 'Link button', closable: true, closeLabel: 'Close banner' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    status: { control: 'inline-radio', options: bannerStatuses },
    filled: { control: 'boolean' },
    align: { control: 'inline-radio', options: ['center', 'left'] },
    actionLabel: { control: 'text' },
    actionHref: { control: 'text' },
    closable: { control: 'boolean' },
    closeLabel: { control: 'text' },
    open: { control: 'boolean' },
    statusLabel: { control: 'text' },
    role: { control: 'inline-radio', options: ['status', 'alert'] },
    onAction: { action: 'action pressed', control: false },
    onClose: { action: 'closed', control: false },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUS_NAMES = { warning: 'Warning', error: 'Error', success: 'Success', info: 'Info', neutral: 'Neutral' };
const full = { width: '100%', minWidth: 0 };

/** Close updates Controls; Show banner restores the message. */
export const Playground: Story = {
  render: function Playground(args: BannerProps) {
    const [, updateArgs] = useArgs<BannerProps>();
    return args.open === false
      ? <Button size="sm" onClick={() => updateArgs({ open: true })}>Show banner</Button>
      : <Banner {...args} onClose={() => { args.onClose?.(); updateArgs({ open: false }); }} />;
  },
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Planned maintenance across the service: a Filled Info banner with a link to the details. */
export const PlannedMaintenance: Story = {
  name: 'Planned maintenance',
  args: {
    status: 'info', filled: true,
    title: 'Scheduled maintenance on international transfers',
    description: 'Some transfers may take longer on Saturday, 02:00–04:00 UTC.',
    actionLabel: 'View details', actionHref: '#',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(/scheduled maintenance/i);
    await expect(canvas.getByRole('link', { name: 'View details' })).toBeVisible();
  },
};

/** The connection dropped: Retry is a local action, and the banner stays until the problem is solved. */
export const ConnectionLost: Story = {
  name: 'Connection lost',
  args: { status: 'error', filled: true, title: 'Connection interrupted', description: 'Reconnect to refresh your balances.', actionLabel: 'Retry', closable: false, onAction: fn() },
  render: function ConnectionLost(args: BannerProps) {
    const [attempts, setAttempts] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)', ...full }}>
        <Banner {...args} onAction={() => { args.onAction?.(); setAttempts(n => n + 1); }} />
        {attempts > 0 && <span role="status" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>Retry requested ({attempts})</span>}
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(/connection interrupted/i);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Retry requested (1)')).toBeVisible();
  },
};

/** A notice people can put aside: Close hides it. */
export const DismissANotice: Story = {
  name: 'Dismiss a notice',
  args: { status: 'neutral', title: 'Statements now arrive on the 1st of each month', description: undefined, actionLabel: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close banner' }));
    await waitFor(() => expect(canvas.queryByText(/statements now arrive/i)).toBeNull());
  },
};

const LONG = { title: 'Scheduled maintenance on international transfers', description: 'Some transfers may take longer while we update the service. Your funds remain safe and you can continue using your account.', actionLabel: 'View maintenance details' };

/** Text that doesn't fit one line: left-aligned, the icon on the first line, the action on its own row, Close at the top. */
export const LongContent: Story = {
  name: 'Long content',
  args: { ...LONG, status: 'info', filled: true, align: 'center' },
  render: (args: BannerProps) => <div data-testid="frame" style={{ width: 'calc(var(--space-2000) * 9)', maxWidth: '100%' }}><Banner {...args} /></div>,
  play: async ({ canvasElement }) => {
    const frame = within(canvasElement).getByTestId('frame');
    const banner = canvasElement.querySelector<HTMLElement>('.grg-banner')!;
    await waitFor(() => expect(banner).toHaveAttribute('data-layout', 'stack'));
    const box = (el: Element) => el.getBoundingClientRect();
    const icon = box(banner.querySelector('.grg-banner__status-icon')!);
    const text = box(banner.querySelector('.grg-banner__text')!);
    const action = box(banner.querySelector('.grg-banner__action')!);
    const close = box(within(banner).getByRole('button', { name: 'Close banner' }));
    // Even with align="center": the text starts at the 48px inset, next to the icon on its first line
    await expect(icon.left - box(banner).left).toBeCloseTo(48, 0);
    await expect(icon.top).toBeCloseTo(text.top, 0);
    await expect(action.top).toBeGreaterThanOrEqual(text.bottom);
    await expect(action.right).toBeCloseTo(text.right, 0);
    await expect(close.top - box(banner).top).toBeLessThan(icon.top - box(banner).top + 1);
    // Room for the whole message on one line: back to the centred one-line layout, and narrow again
    const narrow = frame.getAttribute('style')!;
    frame.setAttribute('style', 'width: 1600px');
    await waitFor(() => expect(banner).toHaveAttribute('data-layout', 'line'));
    frame.setAttribute('style', narrow);
    await waitFor(() => expect(banner).toHaveAttribute('data-layout', 'stack'));
  },
};

/* ---- Overview ---- */

/** Filled and Ghost, for each of the five statuses. */
export const Statuses: Story = {
  render: (args: BannerProps) => (
    <Showcase column>
      {bannerStatuses.map(status => (
        <Variant key={status} caption={STATUS_NAMES[status]}>
          <div style={{ display: 'grid', gap: 'var(--space-200)', ...full }}>
            <Banner {...args} status={status} filled />
            <Banner {...args} status={status} filled={false} />
          </div>
        </Variant>
      ))}
    </Showcase>
  ),
};

/** Center (default) and left. */
export const Alignment: Story = {
  args: { filled: true, status: 'error' },
  render: (args: BannerProps) => (
    <Showcase column>
      <Variant caption="Center (default)"><div style={full}><Banner {...args} align="center" /></div></Variant>
      <Variant caption="Left"><div style={full}><Banner {...args} align="left" /></div></Variant>
      <Variant caption="Long text (always left)"><div style={{ width: 'calc(var(--space-2000) * 9)', maxWidth: '100%' }}><Banner {...args} {...LONG} align="center" /></div></Variant>
    </Showcase>
  ),
};
