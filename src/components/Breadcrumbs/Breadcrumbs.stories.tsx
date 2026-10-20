import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbEntry } from './Breadcrumbs';
import { BreadcrumbItem } from './BreadcrumbItem';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/breadcrumbs/breadcrumbs-component.png';
import guidelinesFrame from '../../assets/design/breadcrumbs/breadcrumbs-guidelines.png';
import itemFrame from '../../assets/design/breadcrumb-item/breadcrumb-item-component.png';

const sample: BreadcrumbEntry[] = [
  { id: 'home', label: 'Home', icon: 'home', showLabel: false, href: '#home' },
  { id: 'account', label: 'Account', icon: null, href: '#account' },
  { id: 'security', label: 'Security', icon: null, href: '#security' },
  { id: 'current', label: 'Two-factor authentication', icon: null },
];
const figmaItems: BreadcrumbEntry[] = Array.from({ length: 5 }, (_, i) => ({ id: `level-${i}`, label: 'Breadcrumb', icon: 'home', href: `#level-${i}` }));
const overflowItems: BreadcrumbEntry[] = [sample[0], { id: 'settings', label: 'Settings', icon: null, href: '#settings' }, ...sample.slice(1)];
const full = { width: '100%', minWidth: 0 };

const meta = {
  title: 'Components/Breadcrumbs',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'], component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A navigable path from the root to the current page, with hidden ancestor levels in an overflow menu.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Breadcrumb item', type: 'image', url: itemFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { items: sample, maxVisibleItems: 4, collapse: true, 'aria-label': 'Breadcrumbs', overflowLabel: 'Show hidden breadcrumb levels' },
  argTypes: {
    items: { control: 'object' },
    maxVisibleItems: { control: { type: 'number', min: 3, step: 1 } },
    collapse: { control: 'boolean' },
    'aria-label': { control: 'text' },
    overflowLabel: { control: 'text' },
    onNavigate: { action: 'ancestor selected', control: false },
  },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A deep page: the levels in between fold into the … menu; the root and the current page stay. */
export const ADeepPage: Story = {
  name: 'A deep page',
  args: { onNavigate: fn() },
  render: function ADeepPage(args: BreadcrumbsProps) {
    const [selected, setSelected] = useState('');
    // Client-side navigation: no href, so every ancestor reports the choice
    const items = overflowItems.map(item => ({ ...item, href: undefined }));
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)', ...full }}>
        <Breadcrumbs {...args} items={items} onNavigate={item => { args.onNavigate?.(item); setSelected(item.label); }} />
        {selected && <span role="status" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>Going to: {selected}</span>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Settings' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Show hidden breadcrumb levels' }));
    // The menu opens in a layer over the page, outside the example
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'Settings' }));
    await waitFor(() => expect(canvas.getByText('Going to: Settings')).toBeVisible());
  },
};

/** The current page is the last item: named for screen readers, never a link. */
export const WhereAmI: Story = {
  name: 'Where am I',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumbs' });
    await expect(within(nav).getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(within(nav).getByText('Two-factor authentication').closest('[aria-current="page"]')).not.toBeNull();
  },
};

/** A long current title: shortened with an ellipsis; hover, focus or a tap shows it in full. */
export const ALongTitle: Story = {
  name: 'A long title',
  args: { items: [...sample.slice(0, -1), { id: 'long-current', label: 'How to reset two-factor authentication if you lost access to your device', icon: null }] },
};

/** A narrow layout: more levels fold into the menu so the path fits on one line. */
export const Narrow: Story = {
  render: (args: BreadcrumbsProps) => <div style={{ width: 'calc(var(--space-2000) * 4)', maxWidth: '100%' }}><Breadcrumbs {...args} /></div>,
};

/* ---- Overview ---- */

/** The Figma group variants: 5, 4, 3 and 2 items, with collapsing turned off. */
export const Quantities: Story = {
  args: { collapse: false },
  render: (args: BreadcrumbsProps) => (
    <Showcase column>
      {[5, 4, 3, 2].map(count => (
        <Variant key={count} caption={`${count} items`}><Breadcrumbs {...args} items={figmaItems.slice(0, count)} /></Variant>
      ))}
    </Showcase>
  ),
};

/** Breadcrumb item, the level inside the group: Icon, Icon + Text, Text, and the current page. */
export const ItemTypes: Story = {
  name: 'Item types',
  render: () => (
    <Showcase>
      <Variant caption="Icon"><BreadcrumbItem label="Home" href="#home" showLabel={false} /></Variant>
      <Variant caption="Icon + Text"><BreadcrumbItem label="Breadcrumb" href="#level" /></Variant>
      <Variant caption="Text"><BreadcrumbItem label="Breadcrumb" href="#level" icon={null} /></Variant>
      <Variant caption="Current page"><BreadcrumbItem label="Breadcrumb" icon={null} current /></Variant>
    </Showcase>
  ),
};
