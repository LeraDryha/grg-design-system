import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbItem, type BreadcrumbItemProps } from './BreadcrumbItem';
import { baseIconNames } from '../../icons/names';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/BreadcrumbItem', component: BreadcrumbItem,
  parameters: { layout: 'padded', docs: { description: { component: 'One level in Breadcrumbs: an ancestor link, an icon-only root or the current page.' } } },
  args: { label: 'Breadcrumb', href: '#ancestor', icon: 'home', showLabel: true, current: false, previewState: 'default' },
  argTypes: {
    label: { control: 'text' }, href: { control: 'text' },
    icon: { control: 'select', options: [null, ...baseIconNames], labels: { null: 'none' } },
    showLabel: { control: 'boolean' }, current: { control: 'boolean' },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'focus'] },
    onNavigate: { action: 'ancestor selected', control: false },
  },
} satisfies Meta<typeof BreadcrumbItem>;
export default meta;
type Story = StoryObj<typeof meta>;
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-1000)', padding: 'var(--space-200)' };

export const Playground: Story = {};
export const Anatomy: Story = {
  render: (args: BreadcrumbItemProps) => <AnatomyBlock width="auto" markers={[
    { n: 1, target: '.grg-breadcrumb-item__control', side: 'left' },
    { n: 2, target: '.grg-breadcrumb-item__icon', side: 'top' },
    { n: 3, target: '.grg-breadcrumb-item__label', side: 'top' },
  ]}><BreadcrumbItem {...args} /></AnatomyBlock>,
};
export const Types: Story = {
  render: (args: BreadcrumbItemProps) => <div style={row}><BreadcrumbItem {...args} showLabel={false} /><BreadcrumbItem {...args} /><BreadcrumbItem {...args} icon={null} /></div>,
};
export const Default: Story = {};
export const Hovered: Story = { args: { previewState: 'hover' } };
export const Focused: Story = { args: { previewState: 'focus' } };
export const Current: Story = { args: { current: true } };
export const AllStates: Story = {
  render: (args: BreadcrumbItemProps) => <div style={{ display: 'grid', gap: 'var(--space-600)' }}>{(['default', 'hover', 'focus', 'current'] as const).map(state => <div key={state} style={row}>
    {[{ showLabel: false }, {}, { icon: null }].map((options, index) => <BreadcrumbItem key={index} {...args} {...options} current={state === 'current'} previewState={state === 'current' ? 'default' : state} />)}
  </div>)}</div>,
};
export const LongCurrent: Story = { args: { current: true, icon: null, label: 'How to reset two-factor authentication if you lost access to your device' } };
