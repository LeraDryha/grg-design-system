import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { DropdownMenu, type DropdownMenuEntry } from './DropdownMenu';
import { DropdownMenuItem } from './DropdownMenuItem';
import { Button } from '../Button/Button';
import photo from '../../assets/avatar-sample.jpg';

const noop = () => {};

const createInvoice: DropdownMenuEntry[] = [
  { label: 'Create invoice', icon: 'plus', onSelect: noop },
  {
    label: 'Assets',
    icon: 'wallet',
    items: [
      { label: 'My assets', icon: 'wallet', onSelect: noop },
      { label: 'Market prices', icon: 'chart-bar', onSelect: noop },
      { label: 'Token details', icon: 'information', onSelect: noop },
      { label: 'Favorites', icon: 'star', onSelect: noop },
    ],
  },
  { kind: 'divider' },
  { label: 'Send', icon: 'send', items: [{ label: 'To a wallet', onSelect: noop }, { label: 'To a bank account', onSelect: noop }] },
  { label: 'Receive', icon: 'download', onSelect: noop },
];

const account: DropdownMenuEntry[] = [
  { kind: 'header', label: 'Ashley Metz', description: 'metz@gmail.com', avatar: { src: photo } },
  { kind: 'divider' },
  { label: 'Account settings', icon: 'user', onSelect: noop },
  { label: 'Integrations', icon: 'apps', onSelect: noop },
  { label: 'Settings', icon: 'setting', onSelect: noop },
  { kind: 'section', label: 'Support' },
  { label: 'Guide', icon: 'open-book', onSelect: noop },
  { label: 'Help center', icon: 'help', onSelect: noop },
  { kind: 'divider' },
  { label: 'Free Plan', description: '12,000 views', badge: 'Upgrade', onSelect: noop },
  { kind: 'divider' },
  { label: 'Logout', icon: 'out', onSelect: noop },
];

const accounts: DropdownMenuEntry[] = [
  { kind: 'header', label: 'Ashley Metz', description: 'metz@gmail.com', avatar: { src: photo }, badge: { label: 'PRO', color: 'success', variant: 'text' } },
  { label: 'Account storage', description: 'Your account has 2GB storage', badge: 'Manage', onSelect: noop },
  { kind: 'divider' },
  { label: 'Settings', icon: 'setting', onSelect: noop },
  { label: 'Manage account', icon: 'user', onSelect: noop },
  { label: 'Integrations', icon: 'apps', onSelect: noop },
  { label: 'Logout', icon: 'out', onSelect: noop },
  { kind: 'button', label: 'Add new account', icon: 'plus', onSelect: noop },
];

const withCaption: DropdownMenuEntry[] = [
  { label: 'Label', onSelect: noop },
  { label: 'Label', selected: true, onSelect: noop },
  { label: 'Label', onSelect: noop },
  { label: 'Label', onSelect: noop },
  { kind: 'divider' },
  { kind: 'caption', text: 'v.1.5.69. Terms & Conditions', action: { label: 'Add item', icon: 'plus', onSelect: noop } },
];

const meta = {
  title: 'Components/Dropdown Menu',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: DropdownMenu,
  // The docs page is DropdownMenu.mdx
  parameters: { layout: 'centered' },
  args: { items: createInvoice, 'aria-label': 'Create', inline: false, width: 240 },
  argTypes: { items: { control: false }, trigger: { control: false } },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const space: CSSProperties = { minHeight: 380, minWidth: 560, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' };

/** Opens from a button. Try the keyboard: Enter opens, arrows move, → opens a submenu, Escape closes. */
export const Playground: Story = {
  render: args => (
    <div style={space}>
      <DropdownMenu
        {...args}
        trigger={props => (
          <Button {...props} variant="primary" size="sm" leftIcon="plus" rightIcon={props['aria-expanded'] ? 'direction-up' : 'direction-down'}>
            Create invoice
          </Button>
        )}
      />
    </div>
  ),
};

/** Actions with submenus (Figma example: Create invoice). */
export const Actions: Story = { args: { inline: true, items: createInvoice, 'aria-label': 'Create' } };

/** An account menu: header, groups with a section title, an item with a description and a badge, dividers. */
export const Account: Story = { args: { inline: true, items: account, 'aria-label': 'Account', width: 240 } };

/** Accounts: a header with a badge, a full-width button at the end. */
export const Accounts: Story = { args: { inline: true, items: accounts, 'aria-label': 'Accounts', width: 240 } };

/** A caption with a text button at the end; a check on the chosen row. */
export const WithCaption: Story = { args: { inline: true, items: withCaption, 'aria-label': 'Options', width: 320 } };

/* ---- The item on its own ---- */

const panel: CSSProperties = { display: 'grid', gap: 'var(--space-050)', width: 320, padding: 'var(--space-200)', borderRadius: 'var(--radius-lg-12)', background: 'var(--surface-floating)', boxShadow: 'var(--shadow-sm)' };

/** The seven Figma types: Basic, Icon, Currency, Country, Payment method, Avatar, Social. */
export const ItemTypes: Story = {
  render: () => (
    <div style={panel}>
      <DropdownMenuItem label="Basic" />
      <DropdownMenuItem label="Icon" icon="globe" />
      <DropdownMenuItem label="Currency" coin="bitcoin-btc" />
      <DropdownMenuItem label="Country" country="bg" />
      <DropdownMenuItem label="Payment method" paymentMethod="mastercard" />
      <DropdownMenuItem label="Avatar" avatar={{ src: photo }} />
      <DropdownMenuItem label="Social" social="google" />
    </div>
  ),
};

/** Options: a description, a badge, an arrow, a check (single choice) and a checkbox (multiple choice). */
export const ItemOptions: Story = {
  render: () => (
    <div style={panel}>
      <DropdownMenuItem label="Label" description="Description here!" icon="globe" />
      <DropdownMenuItem label="Ray Ratke" description="ray@ratke.com" avatar={{ src: photo }} />
      <DropdownMenuItem label="Label" icon="globe" badge="Badge" />
      <DropdownMenuItem label="Label" icon="globe" arrow />
      <DropdownMenuItem label="Label" icon="globe" badge="Badge" arrow />
      <DropdownMenuItem label="Label" icon="globe" selected />
      <DropdownMenuItem label="Label" icon="globe" multiple selected />
      <DropdownMenuItem label="Label" icon="globe" multiple />
    </div>
  ),
};

/** States: default, selected and disabled (hover comes from the list). */
export const ItemStates: Story = {
  render: () => (
    <div style={panel}>
      <DropdownMenuItem label="Default" coin="bitcoin-btc" />
      <DropdownMenuItem label="Selected" coin="bitcoin-btc" selected />
      <DropdownMenuItem label="Disabled" coin="bitcoin-btc" disabled />
      <DropdownMenuItem label="Disabled" coin="bitcoin-btc" multiple disabled />
    </div>
  ),
};
