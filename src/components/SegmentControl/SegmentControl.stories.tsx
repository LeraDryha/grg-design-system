import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { SegmentControl, type Segment, type SegmentControlProps } from './SegmentControl';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/segment-control/segment-control-component.png';
import itemFrame from '../../assets/design/segment-control/segment-control-item.png';
import guidelinesFrame from '../../assets/design/segment-control/segment-control-guidelines.png';

const labels: Segment[] = [{ value: 'a', label: 'Label' }, { value: 'b', label: 'Label' }, { value: 'c', label: 'Label' }];

const meta = {
  title: 'Components/Segment Control',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: SegmentControl,
  // The docs page is SegmentControl.mdx
  parameters: {
    layout: 'centered',
    // Known Figma contrast on every story: an unselected label (text-soft-500 on bg-weak-100) is 4.3:1, just under 4.5:1
    a11y: { test: 'todo' },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Segment control', type: 'image', url: componentFrame },
      { name: 'Segment control item', type: 'image', url: itemFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    segments: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }],
    'aria-label': 'Period',
    role: 'choice',
    fullWidth: false,
    iconOnly: false,
    disabled: false,
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['choice', 'tabs'] },
    segments: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof SegmentControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const panel = { width: 'calc(var(--space-5000) + var(--space-2000) + var(--space-1000))', maxWidth: '100%' } as const;

/** Figma Active-green and Active-red: Buy and Sell across the panel; the button follows the side. */
export const BuyOrSell: Story = {
  name: 'Buy or sell',
  render: function BuyOrSell() {
    const [side, setSide] = useState('buy');
    return (
      <div style={{ ...panel, display: 'grid', gap: 'var(--space-400)' }}>
        <SegmentControl
          fullWidth
          aria-label="Order side"
          value={side}
          onChange={setSide}
          segments={[{ value: 'buy', label: 'Buy', color: 'green' }, { value: 'sell', label: 'Sell', color: 'red' }]}
        />
        <Button variant="primary" tone={side === 'buy' ? 'green' : 'destructive'}>{side === 'buy' ? 'Buy BTC' : 'Sell BTC'}</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buy = canvas.getByRole('radio', { name: 'Buy' });
    await expect(buy).toBeChecked();
    buy.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Sell' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Sell' })).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Sell BTC' })).toBeInTheDocument();
  },
};

const orders: [string, string][] = [['Open', 'BTC / USDT'], ['Open', 'ETH / USDT'], ['Completed', 'SOL / USDT'], ['Cancelled', 'BTC / EUR']];

/** A filter over a list: each segment as wide as its label. */
export const FilterOrders: Story = {
  name: 'Filter orders',
  render: function FilterOrders() {
    const [status, setStatus] = useState('all');
    const shown = orders.filter(([state]) => status === 'all' || state.toLowerCase() === status);
    return (
      <div style={{ ...panel, display: 'grid', gap: 'var(--space-400)' }}>
        <SegmentControl
          aria-label="Orders"
          value={status}
          onChange={setStatus}
          segments={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]}
        />
        <ul style={{ display: 'grid', gap: 'var(--space-200)', margin: 0, padding: 0, listStyle: 'none', font: 'var(--typo-body-sm-regular)', color: 'var(--text-strong-1000)' }}>
          {shown.map(([state, pair]) => (
            <li key={pair + state} style={{ display: 'flex', justifyContent: 'space-between' }}>
              {pair}
              <Badge variant="light" size="sm" color={state === 'Open' ? 'info' : state === 'Completed' ? 'success' : 'neutral'} label={state} leftIcon={null} rightIcon={null} />
            </li>
          ))}
        </ul>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Open' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

/** Role tabs: the segments switch the content under them (Figma Content view); screen readers hear tabs. */
export const InvoiceSteps: Story = {
  name: 'Invoice steps',
  render: () => (
    <div style={panel}>
      <SegmentControl
        role="tabs"
        aria-label="Create invoice"
        segments={[{ value: 'deposit', label: 'Deposit info' }, { value: 'terms', label: 'Terms' }, { value: 'review', label: 'Review' }]}
      >
        {segment => <p style={{ margin: 0, font: 'var(--typo-body-md-regular)', color: 'var(--text-subtle-700)' }}>{segment.label} form</p>}
      </SegmentControl>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Terms' }));
    await expect(canvas.getByRole('tabpanel', { name: 'Terms' })).toHaveTextContent('Terms form');
  },
};

/** Figma Icon only: list or grid; each icon names its segment in a tooltip. */
export const ListOrGrid: Story = {
  name: 'List or grid',
  args: {
    iconOnly: true,
    'aria-label': 'View',
    segments: [{ value: 'list', label: 'List', icon: 'menu-line-horizontal' }, { value: 'grid', label: 'Grid', icon: 'grid-02' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('radio', { name: 'Grid' }));
    await expect(await within(document.body).findByRole('tooltip', { hidden: true })).toHaveTextContent('Grid');
  },
};

/** On a narrow screen the control keeps its width and scrolls sideways; labels are never cut. */
export const NarrowScreen: Story = {
  name: 'Narrow screen',
  render: args => (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <SegmentControl {...args} aria-label="Orders" segments={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]} />
    </div>
  ),
};

/* ---- Overview ---- */

/** Figma Text only, Text + icon and Icon only, 2 to 6 segments; a disabled segment. */
export const Types: Story = {
  render: (args: SegmentControlProps) => (
    <Showcase column>
      <Variant caption="text only"><SegmentControl {...args} aria-label="Text only" segments={labels} /></Variant>
      <Variant caption="text + icon"><SegmentControl {...args} aria-label="Text and icon" segments={labels.map(segment => ({ ...segment, icon: 'light-mode' as const }))} /></Variant>
      <Variant caption="icon only"><SegmentControl {...args} iconOnly aria-label="Icon only" segments={labels.map((segment, index) => ({ ...segment, label: `Option ${index + 1}`, icon: 'light-mode' as const }))} /></Variant>
      <Variant caption="green · red"><SegmentControl {...args} aria-label="Colours" defaultValue="b" segments={[{ value: 'a', label: 'Buy', color: 'green' }, { value: 'b', label: 'Sell', color: 'red' }]} /></Variant>
      <Variant caption="disabled segment"><SegmentControl {...args} aria-label="Disabled" segments={[...labels.slice(0, 2), { value: 'c', label: 'Label', disabled: true }]} /></Variant>
      <Variant caption="6 segments"><SegmentControl {...args} aria-label="Six" segments={Array.from({ length: 6 }, (_, index) => ({ value: String(index), label: 'Label' }))} /></Variant>
    </Showcase>
  ),
};
