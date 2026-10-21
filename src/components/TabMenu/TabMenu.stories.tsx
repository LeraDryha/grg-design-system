import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TabMenu, type TabMenuItem, type TabMenuProps } from './TabMenu';
import { Button } from '../Button/Button';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import horizontalFrame from '../../assets/design/tab-menu/tab-menu-horizontal.png';
import verticalFrame from '../../assets/design/tab-menu/tab-menu-vertical.png';
import horizontalItemFrame from '../../assets/design/tab-menu/tab-menu-horizontal-item.png';
import verticalItemFrame from '../../assets/design/tab-menu/tab-menu-vertical-item.png';
import guidelinesFrame from '../../assets/design/tab-menu/tab-menu-guidelines.png';

const sections: TabMenuItem[] = [
  { id: 'deposit', label: 'Deposit info' },
  { id: 'terms', label: 'Terms' },
  { id: 'review', label: 'Review' },
];
const panel = (item: TabMenuItem) => (
  <p style={{ margin: 0, padding: 'var(--space-600) 0', font: 'var(--typo-body-md-regular)', color: 'var(--text-subtle-700)' }}>{item.label} content</p>
);
const width = { width: 'calc(var(--space-5000) * 2 + var(--space-1000))', maxWidth: '100%' } as const;

const meta = {
  title: 'Components/Tab Menu',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: TabMenu,
  // The docs page is TabMenu.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Tab menu horizontal', type: 'image', url: horizontalFrame },
      { name: 'Tab menu vertical', type: 'image', url: verticalFrame },
      { name: 'Horizontal item', type: 'image', url: horizontalItemFrame },
      { name: 'Vertical item', type: 'image', url: verticalItemFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { items: sections, orientation: 'horizontal', 'aria-label': 'Invoice', children: panel },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    items: { control: false },
    children: { control: false },
  },
  render: (args: TabMenuProps) => <div style={width}><TabMenu {...args} /></div>,
} satisfies Meta<typeof TabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** Steps of a form in tabs: click or use the arrow keys, then Enter; the open tab shows its part. */
export const SectionsOfAForm: Story = {
  name: 'Sections of a form',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Deposit info' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'Terms' }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Terms content');
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByRole('tab', { name: 'Review' })).toHaveAttribute('aria-selected', 'true');
  },
};

/** Figma Badge: a count after the label; something at the end of the row, such as an action on the list. */
export const WithCounts: Story = {
  name: 'With counts',
  args: {
    items: [{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread', badge: 3 }, { id: 'archived', label: 'Archived', disabled: true }],
    'aria-label': 'Messages',
    end: <Button variant="text" size="xs" leftIcon="check-circle">Mark all as read</Button>,
  },
};

/** Figma Tab menu vertical: settings sections with a title, icons and arrows; up and down move between them. */
export const SettingsSections: Story = {
  name: 'Settings sections',
  args: {
    orientation: 'vertical',
    title: 'Settings',
    arrow: true,
    items: [
      { id: 'profile', label: 'Profile', icon: 'user' },
      { id: 'security', label: 'Security', icon: 'shield' },
      { id: 'notifications', label: 'Notifications', icon: 'notification', badge: 2 },
      { id: 'payouts', label: 'Payouts', transaction: 'withdrawal' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('tab', { name: 'Profile' }).focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tablist', { name: 'Settings' })).toHaveAttribute('aria-orientation', 'vertical');
  },
};

/** Figma Text off: icons only, each named in a tooltip and for screen readers. */
export const IconsOnly: Story = {
  name: 'Icons only',
  args: {
    iconOnly: true,
    'aria-label': 'View',
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'list', label: 'List', icon: 'menu-line-horizontal' },
      { id: 'gallery', label: 'Gallery', icon: 'grid-02' },
      { id: 'settings', label: 'Settings', icon: 'setting' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gallery = canvas.getByRole('tab', { name: 'Gallery' });
    await userEvent.hover(gallery);
    await expect(await within(document.body).findByRole('tooltip', { hidden: true })).toHaveTextContent('Gallery');
  },
};

/* ---- Overview ---- */

const shield: TabMenuItem[] = [
  { id: 'a', label: 'Label', icon: 'shield', badge: 2 },
  { id: 'b', label: 'Label', icon: 'shield', badge: 2 },
  { id: 'c', label: 'Label', icon: 'shield', badge: 2, disabled: true },
];

/** Horizontal and vertical, with icons, badges, a disabled tab and icons only. */
export const Layouts: Story = {
  // Known Figma contrast: the disabled tab (text-disabled-400) is under 4.5:1
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <Showcase column>
      <Variant caption="horizontal"><div style={width}><TabMenu items={shield} aria-label="Horizontal" /></div></Variant>
      <Variant caption="horizontal · icons only"><TabMenu items={shield} iconOnly aria-label="Icons only" /></Variant>
      <Variant caption="vertical"><TabMenu items={shield} orientation="vertical" title="Title" arrow aria-label="Vertical" /></Variant>
    </Showcase>
  ),
};
