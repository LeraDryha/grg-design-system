import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within } from 'storybook/test';
import { ButtonGroup, type ButtonGroupProps, type ButtonGroupValue, type ButtonGroupEntry } from './ButtonGroup';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/button-group/button-group-component.png';
import guidelinesFrame from '../../assets/design/button-group/button-group-guidelines.png';

const sample: ButtonGroupEntry[] = [
  { id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' },
];
const meta = {
  title: 'Components/ButtonGroup',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'], component: ButtonGroup,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A compact choice between related options, with persistent selection and joined borders.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { items: sample, size: 'md', disabled: false, 'aria-label': 'Time range' },
  argTypes: { items: { control: 'object' }, size: { control: 'inline-radio', options: ['md', 'sm'] }, disabled: { control: 'boolean' }, 'aria-label': { control: 'text' }, allowEmpty: { control: 'boolean' }, value: { control: 'object' }, defaultValue: { control: 'object' }, onValueChange: { action: 'selection changed', control: false } },
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

const note = { font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' };

export const Playground: Story = {
  render: function Playground(args) {
    const [, updateArgs] = useArgs<ButtonGroupProps>();
    return <ButtonGroup {...args} onValueChange={(value, event) => { updateArgs({ value }); args.onValueChange?.(value, event); }} />;
  },
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A chart's time range: one option is always chosen, and the choice stays after the pointer leaves. */
export const ChooseATimeRange: Story = {
  name: 'Choose a time range',
  render: function ChooseATimeRange(args: ButtonGroupProps) {
    const [period, setPeriod] = useState<ButtonGroupValue>('1W');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-300)', justifyItems: 'start' }}>
        <ButtonGroup {...args} size="sm" allowEmpty={false} value={period} onValueChange={setPeriod} aria-label="Chart time range"
          items={['1D', '1W', '1M', '3M', '1Y'].map(label => ({ id: label, label }))} />
        <output aria-live="polite" style={note}>Showing: {period}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '1M' }));
    await expect(canvas.getByRole('button', { name: '1M' })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: '1W' })).toHaveAttribute('aria-pressed', 'false');
    // allowEmpty={false}: a second click keeps the choice
    await userEvent.click(canvas.getByRole('button', { name: '1M' }));
    await expect(canvas.getByText('Showing: 1M')).toBeVisible();
  },
};

/** List or grid: icons with names, and the preview follows the choice. */
export const SwitchTheView: Story = {
  name: 'Switch the view',
  render: function SwitchTheView(args: ButtonGroupProps) {
    const [view, setView] = useState<ButtonGroupValue>('list');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)', justifyItems: 'start' }}>
        <ButtonGroup {...args} allowEmpty={false} value={view} onValueChange={setView} aria-label="View"
          items={[{ id: 'list', label: 'List view', leftIcon: 'list-view-rectangle', iconOnly: true }, { id: 'grid', label: 'Grid view', leftIcon: 'grid-02', iconOnly: true }]} />
        <div aria-label="View preview" style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(2, 1fr)' : '1fr', gap: 'var(--space-200)', width: 'calc(var(--space-2000) * 3)', maxWidth: '100%' }}>
          {['Overview', 'Activity', 'Reports', 'Settings'].map(label => (
            <div key={label} style={{ padding: 'var(--space-300)', background: 'var(--bg-weak-100)', borderRadius: 'var(--radius-xs-6)', font: 'var(--typo-body-md-regular)', color: 'var(--text-strong-1000)' }}>{label}</div>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard: Tab into the group, → moves focus, Space chooses
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Grid view' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
  },
};

/** One option not available right now: it can't be chosen. */
export const AnUnavailableOption: Story = {
  name: 'An unavailable option',
  args: { items: sample.map(item => ({ ...item, disabled: item.id === 'month' })), defaultValue: 'day' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Month' }));
    await expect(canvas.getByRole('button', { name: 'Day' })).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Long labels in a narrow space: a labelled scroll region keeps the buttons whole. */
export const Narrow: Story = {
  args: { items: [{ id: 'overview', label: 'Account overview' }, { id: 'activity', label: 'Account activity' }, { id: 'preferences', label: 'Account preferences' }] },
  render: (args: ButtonGroupProps) => (
    <div className="doc-scroll" role="region" aria-label="Scrollable account options" tabIndex={0}
      style={{ width: 'calc(var(--space-2000) * 4)', maxWidth: '100%', overflowX: 'auto', padding: 'var(--space-200)', boxSizing: 'border-box' }}>
      <ButtonGroup {...args} />
    </div>
  ),
};

/* ---- Overview ---- */

/** Text only, text and icon, icon only. */
export const Types: Story = {
  render: (args: ButtonGroupProps) => (
    <Showcase column>
      <Variant caption="Text"><ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: null, rightIcon: null, iconOnly: false }))} /></Variant>
      <Variant caption="Text and icon"><ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: item.leftIcon ?? 'plus', rightIcon: null, iconOnly: false }))} /></Variant>
      <Variant caption="Icon only"><ButtonGroup {...args} items={args.items.map(item => ({ ...item, leftIcon: item.leftIcon ?? 'plus', iconOnly: true }))} /></Variant>
    </Showcase>
  ),
};

/** md-32 and sm-24. */
export const Sizes: Story = {
  render: (args: ButtonGroupProps) => (
    <Showcase>
      <Variant caption="md · 32px"><ButtonGroup {...args} size="md" /></Variant>
      <Variant caption="sm · 24px"><ButtonGroup {...args} size="sm" /></Variant>
    </Showcase>
  ),
};
