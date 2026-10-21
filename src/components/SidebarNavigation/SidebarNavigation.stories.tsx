import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type MouseEvent } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  SidebarHeaderCard, SidebarNavigation, SidebarNavigationItem, SidebarProfileCard, useSidebarLayout,
  type SidebarItem, type SidebarNavigationProps, type SidebarSection,
} from './SidebarNavigation';
import { ActionButton } from '../ActionButton/ActionButton';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import type { DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import itemsFrame from '../../assets/design/sidebar-navigation/sidebar-items.png';
import headerFrame from '../../assets/design/sidebar-navigation/header-card.png';
import profileFrame from '../../assets/design/sidebar-navigation/user-profile-card.png';
import guidelinesFrame from '../../assets/design/sidebar-navigation/sidebar-navigation-guidelines.png';
import layoutFrame from '../../assets/design/sidebar-navigation/sidebar-navigation-layout.png';

/* The pages of the Figma anatomy */
const main: SidebarSection = {
  title: 'Main',
  items: [
    { id: 'dashboard', label: 'Dashboard', href: '#dashboard', icon: 'grid-02' },
    {
      id: 'assets', label: 'Assets', icon: 'coin', items: [
        { id: 'overview', label: 'Overview', href: '#overview' },
        { id: 'portfolio', label: 'Portfolio', href: '#portfolio' },
      ],
    },
    { id: 'invoices', label: 'Invoices', href: '#invoices', icon: 'bill' },
    { id: 'payouts', label: 'Mass payouts', href: '#payouts', icon: 'money-profit', badge: 'New' },
    { id: 'transactions', label: 'Transactions', href: '#transactions', icon: 'reload' },
    { id: 'members', label: 'Members', href: '#members', icon: 'users' },
    { id: 'referrals', label: 'Referrals', href: '#referrals', icon: 'gift' },
    { id: 'reporting', label: 'Reporting', href: '#reporting', icon: 'file-fill-in' },
  ],
};
const other: SidebarSection = {
  title: 'Other',
  items: [
    { id: 'settings', label: 'Settings', href: '#settings', icon: 'setting' },
    { id: 'support', label: 'Support', href: '#support', icon: 'support' },
  ],
};
const sections = [main, other];

const companies: DropdownMenuEntry[] = [
  { kind: 'section', label: 'Companies' },
  { label: 'Northwind Trading', selected: true, onSelect: () => {} },
  { label: 'Blue Harbor Ltd', onSelect: () => {} },
  { kind: 'divider' },
  { kind: 'button', label: 'Add company', icon: 'plus', onSelect: () => {} },
];
const account: DropdownMenuEntry[] = [
  { kind: 'header', label: 'Guadalupe Schimmel', description: 'g.schimmel99@gmail.com' },
  { kind: 'divider' },
  { label: 'Profile', icon: 'user', onSelect: () => {} },
  { label: 'Settings', icon: 'setting', onSelect: () => {} },
  { kind: 'divider' },
  { label: 'Log out', icon: 'out', onSelect: () => {} },
];
const header = <SidebarHeaderCard name="Northwind Trading" menu={companies} />;
const footer = <SidebarProfileCard name="Guadalupe Schimmel" email="g.schimmel99@gmail.com" menu={account} />;
const gift = <FeatureCard color="black" title="Claim your gift!" description="Find it on Benefits page." href="#benefits" />;

/** A screen-high box, so the sidebar has its height on docs pages; a transformed box also holds the drawer */
const screen = (height = 720, width?: number): Decorator => Story => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', display: 'flex', width, maxWidth: '100%', height, margin: '0 auto', background: 'var(--surface-base)' }}>
    <Story />
  </div>
);

/** The sidebar with the page it shows: choosing a page makes it current, as an app's router would */
function Demo(props: Omit<SidebarNavigationProps, 'current'> & { current?: string }) {
  const [current, setCurrent] = useState(props.current);
  const navigate = (item: SidebarItem, event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    setCurrent(item.id);
    props.onNavigate?.(item, event);
  };
  return <SidebarNavigation {...props} current={current} onNavigate={navigate} />;
}

const meta = {
  title: 'Components/Sidebar Navigation',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: SidebarNavigation,
  // The docs page is SidebarNavigation.mdx
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Sidebar items', type: 'image', url: itemsFrame },
      { name: 'Header card', type: 'image', url: headerFrame },
      { name: 'User profile card', type: 'image', url: profileFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Layout', type: 'image', url: layoutFrame },
    ],
  },
  args: { sections, current: 'dashboard', layout: 'expanded', header, footer, featureCard: gift },
  argTypes: {
    layout: { control: 'inline-radio', options: ['auto', 'expanded', 'collapsed', 'drawer'] },
    header: { control: false },
    footer: { control: false },
    featureCard: { control: false },
    sections: { control: false },
  },
} satisfies Meta<typeof SidebarNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [screen()],
  render: args => <Demo {...args} />,
};

/* ---- Examples ---- */

/** Figma Single level: a flat list of pages. */
export const SingleLevel: Story = {
  name: 'Single level',
  decorators: [screen(320)],
  args: { sections: [{ items: [main.items[0], ...main.items.slice(2, 5)] }], header: undefined, footer: undefined, featureCard: undefined },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('link', { name: 'Invoices' }));
    await expect(canvas.getByRole('link', { name: 'Invoices' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  },
};

/** Figma Single level with headers: the pages in groups, each named by its title. */
export const WithGroupTitles: Story = {
  name: 'With group titles',
  decorators: [screen(560)],
  args: { sections: [{ ...main, items: [main.items[0], ...main.items.slice(2, 5)] }, other], header: undefined, footer: undefined, featureCard: undefined },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('list', { name: 'Other' })).toBeInTheDocument();
  },
};

/** Figma Multi-level: a row with an arrow opens its pages. The group of the current page is open from the start;
 *  closed, its row shows the current page. */
export const MultiLevel: Story = {
  name: 'Multi-level',
  decorators: [screen(480)],
  args: { sections: [{ items: main.items.slice(0, 5) }], current: 'overview', header: undefined, footer: undefined, featureCard: undefined },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const assets = canvas.getByRole('button', { name: 'Assets' });
    await expect(assets).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(assets);
    await expect(assets).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('link', { name: 'Overview' })).toBeNull();
    await expect(assets).toHaveAttribute('data-active');
    await userEvent.click(assets);
    await userEvent.click(canvas.getByRole('link', { name: 'Portfolio' }));
    await expect(canvas.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('aria-current', 'page');
  },
};

/** Figma Without icons: icons are optional on any first-level row. */
export const WithoutIcons: Story = {
  name: 'Without icons',
  decorators: [screen(320)],
  args: {
    sections: [{ items: [main.items[0], ...main.items.slice(2, 5)].map(({ icon: _icon, ...item }) => item) }],
    header: undefined, footer: undefined, featureCard: undefined,
  },
  render: args => <Demo {...args} />,
};

/** The company, the pages, an offer and the account. The company card switches companies; the account card opens
 *  the account menu beside it. */
export const CompanyAndAccount: Story = {
  name: 'Company and account',
  decorators: [screen(900)],
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Northwind Trading' }));
    await expect(await canvas.findByRole('menubar', { name: 'Switch company' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: /Guadalupe Schimmel/ }));
    await expect(await canvas.findByRole('menuitem', { name: 'Log out' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

/** Figma Collapsed: icons only, 80px. Each icon names its page in a tooltip; a group opens its pages in a menu
 *  beside it; a badge becomes a dot. */
export const Collapsed: Story = {
  decorators: [screen(900)],
  args: { layout: 'collapsed', current: 'portfolio' },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const invoices = canvas.getByRole('link', { name: 'Invoices' });
    await userEvent.hover(invoices);
    await expect(await within(document.body).findByRole('tooltip', { hidden: true })).toHaveTextContent('Invoices');
    await userEvent.unhover(invoices);
    await expect(canvas.getByRole('link', { name: 'Mass payouts, New' })).toBeInTheDocument();
    const assets = canvas.getByRole('button', { name: 'Assets' });
    await expect(assets).toHaveAttribute('data-active');
    await userEvent.click(assets);
    // The pointer lands on the row's link, inside the menu item
    const overview = await canvas.findByRole('menuitem', { name: 'Overview' });
    await userEvent.click(overview.querySelector('a') ?? overview);
    await waitFor(() => expect(canvas.queryByRole('menubar')).toBeNull());
  },
};

/** Figma Left badge: an API reference, each endpoint with its method. */
export const ApiReference: Story = {
  name: 'API reference',
  decorators: [screen(560)],
  args: {
    sections: [
      { title: 'Invoices', items: [
        { id: 'list', label: 'List invoices', href: '#list', apiMethod: 'get' },
        { id: 'create', label: 'Create an invoice', href: '#create', apiMethod: 'post' },
        { id: 'update', label: 'Update an invoice', href: '#update', apiMethod: 'patch' },
        { id: 'delete', label: 'Delete an invoice', href: '#delete', apiMethod: 'delete' },
      ] },
      { title: 'Payouts', items: [
        { id: 'payout', label: 'Create a payout', href: '#payout', apiMethod: 'post' },
        { id: 'replace', label: 'Replace recipients', href: '#replace', apiMethod: 'put' },
      ] },
    ],
    current: 'create', header: undefined, footer: undefined, featureCard: undefined,
  },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'POST Create an invoice' })).toHaveAttribute('aria-current', 'page');
  },
};

/** On a phone the sidebar is a drawer: the menu button opens it over the page, and choosing a page, Close,
 *  Escape or a tap outside closes it. Focus goes back to the menu button. */
export const OnAPhone: Story = {
  name: 'On a phone',
  decorators: [screen(720, 375)],
  args: { layout: 'drawer' },
  render: function OnAPhone(args) {
    const [open, setOpen] = useState(false);
    const resolved = useSidebarLayout(args.layout);
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-300) var(--space-400)', borderBottom: '1px solid var(--stroke-soft-200)' }}>
          <span style={{ font: 'var(--typo-body-md-semibold)' }}>Northwind Trading</span>
          {resolved === 'drawer' && (
            <ActionButton icon="menu-line-horizontal" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)} />
          )}
        </div>
        <Demo {...args} drawerOpen={open} onDrawerClose={() => setOpen(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuButton = canvas.getByRole('button', { name: 'Menu' });
    await userEvent.click(menuButton);
    const drawer = await canvas.findByRole('dialog', { name: 'Main' });
    await waitFor(() => expect(within(drawer).getByRole('button', { name: 'Close menu' })).toHaveFocus());
    await userEvent.click(within(drawer).getByRole('link', { name: 'Invoices' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(menuButton).toHaveFocus());
  },
};

/* ---- Overview ---- */

/* One row, 232px wide as in an expanded sidebar */
const row = (item: SidebarItem, current?: string, collapsed = false, level: 1 | 2 = 1) => (
  <div style={{ width: collapsed ? 'auto' : 'calc(var(--space-5000) + var(--space-800))' }}>
    <SidebarNavigationItem item={item} current={current} collapsed={collapsed} level={level} />
  </div>
);

/** Figma Sidebar items: the kinds of row, Default and Active. Hover and focus come from the pointer and the keyboard. */
export const Items: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const dashboard: SidebarItem = { id: 'dashboard', label: 'Dashboard', href: '#dashboard' };
    const kinds: [string, SidebarItem, (1 | 2)?][] = [
      ['Default', dashboard],
      ['With icon', { ...dashboard, icon: 'grid-02' }],
      ['With arrow', { ...dashboard, icon: 'grid-02', items: [{ id: 'child', label: 'Overview' }] }],
      ['Second level', dashboard, 2],
      ['Right badge', { ...dashboard, icon: 'grid-02', badge: 'New' }],
      ['Left badge', { ...dashboard, apiMethod: 'post' }],
    ];
    return (
      <Showcase column>
        {kinds.map(([caption, item, level]) => (
          <Showcase key={caption}>
            <Variant caption={`${caption} · default`}>{row(item, undefined, false, level)}</Variant>
            <Variant caption={`${caption} · active`}>{row(item, item.items ? 'child' : item.id, false, level)}</Variant>
          </Showcase>
        ))}
        <Showcase>
          <Variant caption="Collapsed · default">{row({ ...dashboard, icon: 'grid-02' }, undefined, true)}</Variant>
          <Variant caption="Collapsed · active">{row({ ...dashboard, icon: 'grid-02' }, 'dashboard', true)}</Variant>
          <Variant caption="Collapsed · badge">{row({ ...dashboard, icon: 'grid-02', badge: 'New' }, undefined, true)}</Variant>
        </Showcase>
      </Showcase>
    );
  },
};

/** Figma Expand and Collapsed: 272px and 80px. */
export const Widths: Story = {
  decorators: [screen(900)],
  render: args => (
    <div style={{ display: 'flex', gap: 'var(--space-1000)' }}>
      <SidebarNavigation {...args} current="overview" layout="expanded" aria-label="Expanded" />
      <SidebarNavigation {...args} current="overview" layout="collapsed" aria-label="Collapsed" />
    </div>
  ),
};

