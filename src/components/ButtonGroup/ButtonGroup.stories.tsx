import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { ButtonGroup, type ButtonGroupProps, type ButtonGroupValue, type ButtonGroupEntry } from './ButtonGroup';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const sample: ButtonGroupEntry[] = [
  { id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' },
];
const meta = {
  title: 'Components/ButtonGroup', component: ButtonGroup,
  parameters: { layout: 'padded', docs: { description: { component: 'A compact choice between related options, with persistent selection and joined borders.' } } },
  args: { items: sample, size: 'md', multiple: false, disabled: false, 'aria-label': 'Time range' },
  argTypes: { items: { control: 'object' }, size: { control: 'inline-radio', options: ['md', 'sm'] }, disabled: { control: 'boolean' }, 'aria-label': { control: 'text' }, multiple: { control: 'boolean' }, allowEmpty: { control: 'boolean' }, value: { control: 'object' }, defaultValue: { control: 'object' }, onValueChange: { action: 'selection changed', control: false } },
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-600)', padding: 'var(--space-200)' };
const column: CSSProperties = { display: 'grid', justifyItems: 'start', gap: 'var(--space-600)', padding: 'var(--space-200)' };
const scroll: CSSProperties = { maxWidth: '100%', overflowX: 'auto', padding: 'var(--space-200)', boxSizing: 'border-box' };

export const Playground: Story = {
  render: function Playground(args) {
    const [, updateArgs] = useArgs<ButtonGroupProps>();
    return <ButtonGroup {...args} onValueChange={(value, event) => { updateArgs({ value }); args.onValueChange?.(value, event); }} />;
  },
};
export const Anatomy: Story = {
  render: (args: ButtonGroupProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Button group anatomy" tabIndex={0}>
    <AnatomyBlock width="auto" markers={[
      { n: 1, target: '.grg-button-group-item', side: 'left' },
      { n: 2, target: '.grg-button-group-item__icon', side: 'top' },
      { n: 3, target: '.grg-button-group-item__label', side: 'bottom' },
      { n: 4, target: '.grg-button-group', side: 'right' },
    ]}><ButtonGroup {...args} items={args.items.map((item, index) => ({ ...item, leftIcon: index === 0 ? 'plus' : item.leftIcon }))} /></AnatomyBlock>
  </div>,
};
export const Types: Story = {
  render: (args: ButtonGroupProps) => <div style={column}>
    <ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: null, rightIcon: null, iconOnly: false }))} />
    <ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: item.leftIcon ?? 'plus', rightIcon: null, iconOnly: false }))} />
    <ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: item.leftIcon ?? 'plus', iconOnly: true }))} />
  </div>,
};
export const Sizes: Story = { render: (args: ButtonGroupProps) => <div style={row}>{(['md', 'sm'] as const).map(size => <ButtonGroup key={size} {...args} size={size} />)}</div> };
export const Quantities: Story = {
  args: { items: Array.from({ length: 6 }, (_, i) => ({ id: `action-${i}`, label: 'Button' })), 'aria-label': 'Related options' },
  render: (args: ButtonGroupProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Button group quantities" tabIndex={0} style={scroll}>
    <div style={{ ...row, alignItems: 'start', width: 'max-content', flexWrap: 'nowrap' }}>{(['md', 'sm'] as const).map(size => <div key={size} style={column}>
      {[6, 5, 4, 3, 2].map(quantity => <ButtonGroup key={quantity} {...args} size={size} items={args.items.slice(0, quantity)} />)}
    </div>)}</div>
  </div>,
};
export const Default: Story = {};
export const Hovered: Story = { render: (args: ButtonGroupProps) => <ButtonGroup {...args} items={args.items.map((item, i) => ({ ...item, previewState: i === 1 ? 'hover' : 'default' }))} /> };
export const Pressed: Story = { render: (args: ButtonGroupProps) => <ButtonGroup {...args} items={args.items.map((item, i) => ({ ...item, previewState: i === 1 ? 'active' : 'default' }))} /> };
export const Focused: Story = { render: (args: ButtonGroupProps) => <ButtonGroup {...args} items={args.items.map((item, i) => ({ ...item, previewState: i === 1 ? 'focus' : 'default' }))} /> };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledItem: Story = { args: { items: sample.map(item => ({ ...item, disabled: item.id === 'week' })) } };

function SelectionFeedback(args: ButtonGroupProps) {
  const [value, setValue] = useState<ButtonGroupValue>(args.defaultValue ?? (args.multiple ? [] : null));
  return <div style={column}><ButtonGroup {...args} value={value} onValueChange={(next, event) => { setValue(next); args.onValueChange?.(next, event); }} /><output aria-live="polite">Selected: {Array.isArray(value) ? value.join(', ') || 'None' : value ?? 'None'}</output></div>;
}
export const SingleSelection: Story = { args: { defaultValue: 'week' }, render: (args: ButtonGroupProps) => <SelectionFeedback {...args} /> };
export const MultipleSelection: Story = { args: { multiple: true, defaultValue: ['day', 'week'] }, render: (args: ButtonGroupProps) => <SelectionFeedback {...args} /> };
export const OptionalSelection: Story = { args: { allowEmpty: true, defaultValue: 'week' }, render: (args: ButtonGroupProps) => <SelectionFeedback {...args} /> };
export const RequiredMultiple: Story = { args: { multiple: true, allowEmpty: false, defaultValue: ['day', 'week'] }, render: (args: ButtonGroupProps) => <SelectionFeedback {...args} /> };
export const Selected: Story = { args: { defaultValue: 'week' } };
export const FirstDisabled: Story = { args: { items: sample.map((item, index) => ({ ...item, disabled: index === 0 })) } };

/** Selection examples from Figma, with state connected to the displayed content. */
function SelectionExamples(args: ButtonGroupProps) {
  const [period, setPeriod] = useState<ButtonGroupValue>('1W');
  const [view, setView] = useState<ButtonGroupValue>('list');
  return <div style={column}>
    <ButtonGroup {...args} size="sm" multiple={false} allowEmpty={false} value={period} onValueChange={setPeriod} aria-label="Chart time range" items={['1D', '1W', '1M', '3M', '1Y'].map(label => ({ id: label, label }))} />
    <output aria-live="polite">Period: {period}</output>
    <ButtonGroup {...args} multiple={false} allowEmpty={false} value={view} onValueChange={setView} aria-label="View" items={[{ id: 'list', label: 'List view', leftIcon: 'list-view-rectangle' }, { id: 'grid', label: 'Grid view', leftIcon: 'grid-02' }]} />
    <div aria-label="View preview" style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(2, 1fr)' : '1fr', gap: 'var(--space-200)', width: 'calc(var(--space-2000) * 3)', maxWidth: '100%' }}>
      {['Overview', 'Activity', 'Reports', 'Settings'].map(label => <div key={label} style={{ padding: 'var(--space-300)', background: 'var(--bg-weak-100)', borderRadius: 'var(--radius-xs-6)' }}>{label}</div>)}
    </div>
  </div>;
}
export const Examples: Story = { render: (args: ButtonGroupProps) => <SelectionExamples {...args} /> };
export const Narrow: Story = {
  args: { items: [{ id: 'overview', label: 'Account overview' }, { id: 'activity', label: 'Account activity' }, { id: 'preferences', label: 'Account preferences' }] },
  render: (args: ButtonGroupProps) => <div className="doc-anatomy-scroll" role="region" aria-label="Scrollable account options" tabIndex={0} style={{ ...scroll, width: 'calc(var(--space-2000) * 4)' }}><ButtonGroup {...args} /></div>,
};
export const SingleItem: Story = { args: { items: [sample[0]] } };
export const Empty: Story = { args: { items: [] } };
