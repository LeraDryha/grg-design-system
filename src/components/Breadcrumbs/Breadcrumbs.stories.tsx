import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbEntry } from './Breadcrumbs';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const sample: BreadcrumbEntry[] = [
  { id: 'home', label: 'Home', icon: 'home', showLabel: false, href: '#home' },
  { id: 'account', label: 'Account', icon: null, href: '#account' },
  { id: 'security', label: 'Security', icon: null, href: '#security' },
  { id: 'current', label: 'Two-factor authentication', icon: null },
];
const figmaItems: BreadcrumbEntry[] = Array.from({ length: 5 }, (_, i) => ({ id: `level-${i}`, label: 'Breadcrumb', icon: 'home', href: `#level-${i}` }));
const overflowItems: BreadcrumbEntry[] = [sample[0], { id: 'settings', label: 'Settings', icon: null, href: '#settings' }, ...sample.slice(1)];

const meta = {
  title: 'Components/Breadcrumbs',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'], component: Breadcrumbs,
  parameters: { layout: 'padded', docs: { description: { component: 'A navigable path from the root to the current page, with hidden ancestor levels in an overflow menu.' } } },
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
const column: CSSProperties = { display: 'grid', gap: 'var(--space-600)', width: '100%', minWidth: 0 };

export const Playground: Story = {};
export const Anatomy: Story = {
  render: (args: BreadcrumbsProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Breadcrumbs anatomy diagram" tabIndex={0}><AnatomyBlock width="auto" markers={[
    { n: 1, target: '.grg-breadcrumb-item:first-child .grg-icon', side: 'top' },
    { n: 2, target: '.grg-breadcrumbs__item:nth-child(3)', side: 'top' },
    { n: 3, target: '.grg-breadcrumbs__separator:nth-child(4)', side: 'bottom' },
    { n: 4, target: '.grg-breadcrumb-item[data-current] .grg-breadcrumb-item__label', side: 'top' },
    { n: 5, target: '.grg-breadcrumbs__list', side: 'right' },
  ]}><Breadcrumbs {...args} collapse={false} /></AnatomyBlock></div>,
};
export const Quantities: Story = {
  args: { collapse: false },
  render: (args: BreadcrumbsProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Figma Breadcrumbs quantities" tabIndex={0}><div style={{ ...column, width: 'max-content', padding: 'var(--space-200)' }}>{[5, 4, 3, 2].map(count => <Breadcrumbs key={count} {...args} items={figmaItems.slice(0, count)} />)}</div></div>,
};
export const Overflow: Story = { args: { items: overflowItems } };
export const ManyLevels: Story = { args: { items: [sample[0], ...Array.from({ length: 7 }, (_, i) => ({ id: `ancestor-${i}`, label: `Ancestor ${i + 1}`, icon: null, href: `#ancestor-${i}` })), sample.at(-1)!] } };
export const LongCurrent: Story = { args: { items: [...sample.slice(0, -1), { id: 'long-current', label: 'How to reset two-factor authentication if you lost access to your device', icon: null }] } };
export const LongAncestor: Story = { args: { items: [sample[0], { id: 'long-ancestor', label: 'Account settings and security preferences', icon: null, href: '#account-settings' }, sample.at(-1)!] } };
export const LongRoot: Story = { args: { items: [{ id: 'root', label: 'Organisation account management and settings', icon: null, href: '#organisation' }, sample.at(-1)!] } };
export const Narrow: Story = {
  render: (args: BreadcrumbsProps) => <div style={{ width: 'calc(var(--space-2000) * 4)', maxWidth: '100%' }}><Breadcrumbs {...args} /></div>,
};
export const ConfigurableLimit: Story = { args: { items: overflowItems, maxVisibleItems: 3 } };
export const Empty: Story = { args: { items: [] } };
export const SingleItem: Story = { args: { items: [sample[0]] } };
export const ClientNavigation: Story = {
  render: function ClientNavigation(args: BreadcrumbsProps) {
    const [selected, setSelected] = useState('');
    return <div style={column}><Breadcrumbs {...args} items={args.items.map(item => ({ ...item, href: undefined }))} onNavigate={item => { args.onNavigate?.(item); setSelected(item.label); }} />{selected && <span role="status">Selected: {selected}</span>}</div>;
  },
};
