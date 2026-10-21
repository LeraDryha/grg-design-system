import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type MouseEvent } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TopbarNavigation, type TopbarAction, type TopbarNavigationProps } from './TopbarNavigation';
import { SidebarHeaderCard, SidebarNavigation, type SidebarItem, type SidebarSection } from '../SidebarNavigation/SidebarNavigation';
import type { DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import itemFrame from '../../assets/design/topbar-navigation/toolbar-item.png';
import buttonFrame from '../../assets/design/topbar-navigation/toolbar-item-button.png';

/* A neutral logo: the GRX logos are not shown in this Storybook */
const logo = (
  <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', color: 'var(--text-strong-1000)', textDecoration: 'none', font: 'var(--typo-title-sm-bold)' }}>
    <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 'var(--space-800)', height: 'var(--space-800)', borderRadius: 'var(--radius-sm-8)', background: 'var(--primary-base-1000)', color: 'var(--text-inverce)' }}>N</span>
    Northwind
  </a>
);

/* The pages of the Figma Exchange bar */
const exchangePages: SidebarSection[] = [{
  items: [
    { id: 'dashboard', label: 'Dashboard', href: '#dashboard', icon: 'grid-02' },
    { id: 'trading', label: 'Trading', href: '#trading', icon: 'exchange' },
    { id: 'orders', label: 'Orders', href: '#orders', icon: 'bill' },
    { id: 'assets', label: 'Assets', href: '#assets', icon: 'coin' },
    {
      id: 'other', label: 'Other', icon: 'grid', items: [
        { id: 'referrals', label: 'Referrals', href: '#referrals' },
        { id: 'reporting', label: 'Reporting', href: '#reporting' },
      ],
    },
  ],
}];
/* The pages of the Figma Pay sidebar */
const payPages: SidebarSection[] = [{
  items: [
    { id: 'dashboard', label: 'Dashboard', href: '#dashboard', icon: 'grid-02' },
    { id: 'invoices', label: 'Invoices', href: '#invoices', icon: 'bill' },
    { id: 'payouts', label: 'Mass payouts', href: '#payouts', icon: 'money-profit', badge: 'New' },
    { id: 'transactions', label: 'Transactions', href: '#transactions', icon: 'reload' },
    { id: 'members', label: 'Members', href: '#members', icon: 'users' },
    { id: 'reporting', label: 'Reporting', href: '#reporting', icon: 'file-fill-in' },
  ],
}];

const actions: TopbarAction[] = [
  { id: 'help', label: 'Help', icon: 'help', href: '#help' },
  { id: 'settings', label: 'Settings', icon: 'setting', href: '#settings' },
  { id: 'notifications', label: 'Notifications', icon: 'notification', badge: 'new', inBar: true, onClick: () => {} },
];
const accountMenu: DropdownMenuEntry[] = [
  { kind: 'header', label: 'Guadalupe Schimmel', description: 'g.schimmel99@gmail.com' },
  { kind: 'divider' },
  { label: 'Profile', icon: 'user', onSelect: () => {} },
  { label: 'Log out', icon: 'out', onSelect: () => {} },
];
const companies: DropdownMenuEntry[] = [
  { kind: 'section', label: 'Companies' },
  { label: 'Northwind Trading', selected: true, onSelect: () => {} },
  { label: 'Blue Harbor Ltd', onSelect: () => {} },
];
const languages = [
  { value: 'en', label: 'EN', listLabel: 'English' },
  { value: 'uk', label: 'UK', listLabel: 'Українська' },
];

/** A screen: a transformed box holds the menu that opens under the bar, so docs pages stay readable. A desktop bar
 *  needs 1024px: narrower docs pages scroll it sideways */
const screen = (width?: number, height = 560): Decorator => Story => (
  <div style={{ overflowX: 'auto', maxWidth: '100%', width, margin: '0 auto' }}>
    <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', minWidth: width ?? 1024, height, background: 'var(--surface-canvas)' }}>
      <Story />
    </div>
  </div>
);

/** The bar with a page under it: pages, theme and language work, as in an app */
function Demo({ withSidebar = false, ...props }: TopbarNavigationProps & { withSidebar?: boolean }) {
  const [current, setCurrent] = useState(props.current);
  const [theme, setTheme] = useState<'light' | 'dark'>(props.theme ?? 'light');
  const [language, setLanguage] = useState('en');
  const navigate = (item: SidebarItem, event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    setCurrent(item.id);
  };
  return (
    <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-canvas)', color: 'var(--text-strong-1000)' }}>
      <TopbarNavigation
        {...props}
        current={current}
        onNavigate={navigate}
        theme={theme}
        onThemeChange={setTheme}
        language={{ value: language, options: languages, onChange: setLanguage }}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {withSidebar && <SidebarNavigation layout={props.layout === 'desktop' ? 'expanded' : 'hidden'} sections={props.sections ?? []} current={current} onNavigate={navigate} />}
        <main style={{ flex: 1, padding: 'var(--space-800)', font: 'var(--typo-title-md-semibold)' }}>
          {[...(props.sections ?? []).flatMap(section => section.items.flatMap(item => [item, ...(item.items ?? [])]))].find(item => item.id === current)?.label}
        </main>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Topbar Navigation',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: TopbarNavigation,
  // The docs page is TopbarNavigation.mdx
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly). The bars themselves
    // carry the GRX logos, which this Storybook doesn't show, so only their parts are here.
    design: [
      { name: 'Toolbar item', type: 'image', url: itemFrame },
      { name: 'Toolbar item button', type: 'image', url: buttonFrame },
    ],
  },
  args: {
    type: 'navigation',
    logo,
    sections: exchangePages,
    current: 'dashboard',
    actions,
    account: { name: 'Guadalupe Schimmel', email: 'g.schimmel99@gmail.com', menu: accountMenu },
    layout: 'desktop',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['navigation', 'company'] },
    layout: { control: 'inline-radio', options: ['auto', 'desktop', 'tablet', 'mobile'] },
    logo: { control: false },
    company: { control: false },
    sections: { control: false },
  },
} satisfies Meta<typeof TopbarNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [screen(undefined, 320)],
  render: args => <Demo {...args} />,
};

/* ---- Examples ---- */

/** Figma Exchange: the pages in the bar. Other opens the rest; the theme button switches this example. */
export const PagesInTheBar: Story = {
  name: 'Pages in the bar',
  decorators: [screen(undefined, 320)],
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Orders' }));
    await expect(canvas.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Other' }));
    const reporting = await canvas.findByRole('menuitem', { name: 'Reporting' });
    await userEvent.click(reporting.querySelector('a') ?? reporting);
    await expect(canvas.getByRole('button', { name: 'Other' })).toHaveAttribute('data-active');
    const theme = canvas.getByRole('button', { name: 'Dark theme' });
    await userEvent.click(theme);
    await expect(theme).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Notifications, new' })).toBeInTheDocument();
  },
};

/** Figma Pay: the company in the bar, the pages in Sidebar Navigation under it (without its own header). */
export const CompanyAndSidebar: Story = {
  name: 'Company and sidebar',
  decorators: [screen(undefined, 640)],
  args: {
    type: 'company',
    company: <SidebarHeaderCard name="Northwind Trading" menu={companies} />,
    sections: payPages,
    actions: [actions[2], actions[0]],
  },
  render: args => <Demo {...args} withSidebar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Northwind Trading' }));
    await expect(await canvas.findByRole('menubar', { name: 'Switch company' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

/** Figma Tablet: the logo, Notifications and the menu button. The menu opens under the bar with the company, the
 *  pages, Help, the theme, the language and the account; Escape closes it, back on the menu button. */
export const OnATablet: Story = {
  name: 'On a tablet',
  decorators: [screen(768, 860)],
  args: {
    type: 'company',
    layout: 'tablet',
    company: <SidebarHeaderCard name="Northwind Trading" menu={companies} />,
    sections: payPages,
  },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuButton = canvas.getByRole('button', { name: 'Menu' });
    await userEvent.click(menuButton);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Help' })).toBeVisible();
    const themeSwitch = canvas.getByRole('switch', { name: 'Dark theme' });
    await userEvent.click(themeSwitch);
    await expect(themeSwitch).toBeChecked();
    await userEvent.keyboard('{Escape}');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveFocus();
  },
};

/** Figma Mobile: choosing a page in the menu closes it and shows the page. */
export const OnAPhone: Story = {
  name: 'On a phone',
  decorators: [screen(375, 812)],
  args: { layout: 'mobile' },
  render: args => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    await userEvent.click(canvas.getByRole('link', { name: 'Assets' }));
    await waitFor(() => expect(canvas.queryByRole('navigation', { name: 'Main' })).toBeNull());
    await expect(canvas.getByRole('main')).toHaveTextContent('Assets');
  },
};

/* ---- Overview ---- */

/** Figma Size × Type: Desktop, Tablet and Mobile, the pages in the bar and the company. */
export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: args => (
    <div style={{ overflowX: 'auto' }}>
    <Showcase column>
      {(['desktop', 'tablet', 'mobile'] as const).map(size => (['navigation', 'company'] as const).map(type => (
        <Variant key={size + type} caption={`${type} · ${size}`}>
          <div style={{ width: size === 'desktop' ? 1024 : size === 'tablet' ? 768 : 375, transform: 'translateZ(0)' }}>
            <TopbarNavigation
              {...args}
              type={type}
              layout={size}
              theme="light"
              language={{ value: 'en', options: languages, onChange: () => {} }}
              company={type === 'company' ? <SidebarHeaderCard name="Northwind Trading" menu={companies} /> : undefined}
              actions={type === 'company' ? [actions[2], actions[0]] : actions}
              aria-label={`Main, ${type} ${size}`}
            />
          </div>
        </Variant>
      )))}
    </Showcase>
    </div>
  ),
};
