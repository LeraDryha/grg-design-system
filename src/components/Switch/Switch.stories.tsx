import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Switch, ThemeSwitch, type SwitchProps } from './Switch';
import { SwitchLabel } from '../SwitchLabel/SwitchLabel';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/switch/switch-component.png';
import modeFrame from '../../assets/design/switch/switch-mode.png';
import labelFrame from '../../assets/design/switch/switch-label.png';
import guidelinesFrame from '../../assets/design/switch/switch-guidelines.png';

const meta = {
  title: 'Components/Switch',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Switch,
  // The docs page is Switch.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Switch', type: 'image', url: componentFrame },
      { name: 'Switch mode', type: 'image', url: modeFrame },
      { name: 'Switch label', type: 'image', url: labelFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { size: 'md', defaultChecked: false, disabled: false, 'aria-label': 'Email notifications' },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const list = { display: 'grid', gap: 'var(--space-600)', width: 'calc(var(--space-5000) * 2)', maxWidth: '100%' } as const;

/** Settings that apply at once: the text first and the switch on the right (Flip), each with what it does. */
export const NotificationSettings: Story = {
  name: 'Notification settings',
  render: () => (
    <div style={list}>
      <SwitchLabel flip defaultChecked label="Payment received" description="An email when a customer pays an invoice." />
      <SwitchLabel flip label="Weekly report" sublabel="(Mondays)" description="A summary of payments and payouts." />
      <SwitchLabel flip defaultChecked label="Security alerts" description="Sign-ins from a new device." link={{ label: 'Manage devices', href: '#devices' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const report = canvas.getByRole('switch', { name: 'Weekly report (Mondays)' });
    await expect(report).not.toBeChecked();
    await expect(report).toHaveAccessibleDescription('A summary of payments and payouts.');
    // The label turns it on, and Space turns it off again
    await userEvent.click(canvas.getByText('Weekly report'));
    await expect(report).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(report).not.toBeChecked();
  },
};

/** Figma Switch mode: the light and the dark theme, a sun or a moon on the knob. Here it switches this example. */
export const DarkTheme: Story = {
  name: 'Dark theme',
  render: function DarkTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    return (
      <div data-theme={theme} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)', padding: 'var(--space-600)', borderRadius: 'var(--radius-lg-12)', background: 'var(--surface-base)', color: 'var(--text-strong-1000)', font: 'var(--typo-body-md-medium)' }}>
        Theme
        <ThemeSwitch theme={theme} onChange={setTheme} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Dark theme' });
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(canvasElement.querySelector('[data-theme="dark"]')).not.toBeNull();
  },
};

/** A setting people can't change yet: say why next to it. */
export const Unavailable: Story = {
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <div style={list}>
      <SwitchLabel flip disabled label="Instant payouts" description="Available after your business is verified." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch', { name: 'Instant payouts' })).toBeDisabled();
  },
};

/* ---- Overview ---- */

/** Figma Enabled × Size. Hover, press and focus come from the pointer and the keyboard. */
export const States: Story = {
  // Known Figma contrast: the disabled track and knob are light on light
  parameters: { a11y: { test: 'todo' } },
  render: (args: SwitchProps) => (
    <Showcase column>
      {(['md', 'sm'] as const).map(size => (
        <Showcase key={size}>
          <Variant caption={`${size === 'md' ? 'md-24' : 'sm-16'} · off`}><Switch {...args} size={size} checked={false} aria-label="Off" /></Variant>
          <Variant caption="on"><Switch {...args} size={size} checked aria-label="On" /></Variant>
          <Variant caption="disabled off"><Switch {...args} size={size} checked={false} disabled aria-label="Disabled off" /></Variant>
          <Variant caption="disabled on"><Switch {...args} size={size} checked disabled aria-label="Disabled on" /></Variant>
          <Variant caption="theme"><ThemeSwitch size={size} theme="light" aria-label={`Theme light ${size}`} /></Variant>
          <Variant caption="theme · dark"><ThemeSwitch size={size} theme="dark" aria-label={`Theme dark ${size}`} /></Variant>
        </Showcase>
      ))}
    </Showcase>
  ),
};

/** Figma Switch label: Flip × Selected, with a sublabel, a description and a link. */
export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <Showcase>
      <Variant caption="label"><SwitchLabel label="Label" sublabel="(Sublabel)" /></Variant>
      <Variant caption="description and link">
        <SwitchLabel defaultChecked label="Label" sublabel="(Sublabel)" description="Insert the switch description here." link={{ label: 'Link button', href: '#link' }} />
      </Variant>
      <Variant caption="flip">
        <div style={{ width: 'calc(var(--space-5000) + var(--space-1600))' }}>
          <SwitchLabel flip defaultChecked label="Label" sublabel="(Sublabel)" description="Insert the switch description here." />
        </div>
      </Variant>
    </Showcase>
  ),
};
