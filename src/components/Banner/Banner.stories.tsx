import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { Banner, bannerStatuses, type BannerProps } from './Banner';
import { Button } from '../Button/Button';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/Banner',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Banner,
  // Banner.mdx supplies the documentation.
  parameters: { layout: 'padded', docs: { description: { component: 'A full-width message for a page-wide or service-wide notice, with an optional description, action and dismissal.' } } },
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

const column: CSSProperties = { display: 'grid', gap: 'var(--space-600)', width: '100%', minWidth: 0 };

/** Close updates Controls; Show banner restores the message. */
export const Playground: Story = {
  render: function Playground(args: BannerProps) {
    const [, updateArgs] = useArgs<BannerProps>();
    return args.open === false
      ? <Button size="sm" onClick={() => updateArgs({ open: true })}>Show banner</Button>
      : <Banner {...args} onClose={() => { args.onClose?.(); updateArgs({ open: false }); }} />;
  },
};

export const Anatomy: Story = {
  render: (args: BannerProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Banner anatomy diagram" tabIndex={0}><AnatomyBlock width="auto" markers={[
    { n: 1, target: '.grg-banner', side: 'left' },
    { n: 2, target: '.grg-banner__status-icon', side: 'top' },
    { n: 3, target: '.grg-banner__title', side: 'bottom' },
    { n: 4, target: '.grg-banner__description', side: 'bottom' },
    { n: 5, target: '.grg-banner__action', side: 'top' },
    { n: 6, target: '.grg-banner__close', side: 'right' },
  ]}><div style={{ width: 'calc(var(--space-2000) * 9)' }}><Banner {...args} /></div></AnatomyBlock></div>,
};

/** Filled, then Ghost, with no outline or elevation in either case. */
export const Types: Story = {
  render: (args: BannerProps) => <div style={column}><Banner {...args} filled /><Banner {...args} filled={false} /></div>,
};

/** The Figma set's 10 variants: five statuses, first Ghost, then Filled. */
export const AllVariants: Story = {
  render: (args: BannerProps) => <div style={column}>{[false, true].map(filled => bannerStatuses.map(status => <Banner key={`${filled}-${status}`} {...args} filled={filled} status={status} />))}</div>,
};

export const Alignment: Story = {
  args: { filled: true, status: 'error' },
  render: (args: BannerProps) => <div style={column}><Banner {...args} align="center" /><Banner {...args} align="left" /></div>,
};

export const Description: Story = {
  render: (args: BannerProps) => <div style={column}><Banner {...args} /><Banner {...args} description={undefined} /></div>,
};

export const OptionalParts: Story = {
  render: (args: BannerProps) => <div style={column}>
    <Banner {...args} actionLabel={undefined} />
    <Banner {...args} closable={false} />
    <Banner {...args} description={undefined} actionLabel={undefined} closable={false} />
  </div>,
};

/** A single size that fills its parent; height follows wrapping text. */
export const Widths: Story = {
  render: (args: BannerProps) => <div style={column}>{['100%', 'calc(var(--space-2000) * 9)', 'calc(var(--space-2000) * 4)'].map(width => <div key={width} style={{ width, maxWidth: '100%' }}><Banner {...args} /></div>)}</div>,
};

export const LongContent: Story = {
  args: { title: 'Scheduled maintenance on international transfers', description: 'Some transfers may take longer while we update the service. Your funds remain safe and you can continue using your account.', actionLabel: 'View maintenance details', status: 'info', filled: true },
};

/** Exercise wrapping even when the title, description or action has no spaces. */
export const UnbrokenContent: Story = {
  args: { title: 'SERVICE_STATUS_REFERENCE_012345678901234567890123456789', description: 'REFERENCE_ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789', actionLabel: 'VIEW_REFERENCE_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', align: 'left', filled: true },
};

export const NavigationAction: Story = {
  args: { status: 'info', actionLabel: 'About this system', actionHref: '/?path=/docs/getting-started-about--docs' },
};

export const LocalAction: Story = {
  args: { title: 'Connection interrupted', description: 'Reconnect to refresh your balances.', actionLabel: 'Retry', filled: true },
  render: function LocalAction(args: BannerProps) {
    const [attempts, setAttempts] = useState(0);
    return <div style={column}>
      <Banner {...args} onAction={() => { args.onAction?.(); setAttempts(n => n + 1); }} />
      {attempts > 0 && <span role="status">Retry requested ({attempts})</span>}
    </div>;
  },
};

export const Warning: Story = { args: { status: 'warning' } };
export const ErrorState: Story = { name: 'Error', args: { status: 'error' } };
export const Success: Story = { args: { status: 'success' } };
export const Info: Story = { args: { status: 'info' } };
export const Neutral: Story = { args: { status: 'neutral' } };
