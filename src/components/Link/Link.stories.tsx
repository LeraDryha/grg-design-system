import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Link, type LinkProps } from './Link';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/link/link-component.png';
import guidelinesFrame from '../../assets/design/link/link-guidelines.png';

const iconOptions = [undefined, ...baseIconNames.filter(n => n !== 'loading')];

const meta = {
  title: 'Components/Link',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Link,
  // The docs page is Link.mdx
  parameters: {
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    children: 'Link button',
    href: '#',
    color: 'black',
    size: 'md',
    leftIcon: undefined,
    rightIcon: 'maximize',
    external: false,
    disabled: false,
  },
  argTypes: {
    children: { control: 'text', description: 'Label (Figma Text)' },
    color: { control: 'inline-radio', options: ['black', 'blue'] },
    size: { control: 'inline-radio', options: ['md', 'sm', 'xs'] },
    leftIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    rightIcon: { control: 'select', options: iconOptions, labels: { undefined: 'none' } },
    onClick: { action: 'clicked', control: false },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Documentation in a new tab: the external icon, and screen readers hear that a tab opens. */
export const OpenExternalDocs: Story = {
  name: 'Open external docs',
  args: { children: 'API references', href: 'https://example.com/docs', external: true, rightIcon: 'maximize' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /api references.*opens in a new tab/i });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  },
};

/** View all, in a card: the Blue link stands out from the content around it. */
export const ViewAllInACard: Story = {
  name: 'View all in a card',
  args: { children: 'View all invoices', color: 'blue', size: 'sm', rightIcon: undefined },
  render: (args: LinkProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-300)', width: 300, padding: 'var(--space-500)', border: '1px solid var(--stroke-soft-200)', borderRadius: 'var(--radius-lg-12)' }}>
      <span style={{ font: 'var(--typo-body-md-semibold)', color: 'var(--text-strong-1000)' }}>Recent invoices</span>
      <span style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>3 invoices waiting for payment</span>
      <span><Link {...args} /></span>
    </div>
  ),
};

/** Not available yet: no address, announced as unavailable and skipped by Tab. */
export const Unavailable: Story = {
  args: { children: 'Download statement', disabled: true, rightIcon: undefined },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText('Download statement').closest('a')!;
    await expect(link).not.toHaveAttribute('href');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
  },
};

/* ---- Overview ---- */

/** Black (underlined) and Blue. */
export const Colors: Story = {
  render: (args: LinkProps) => (
    <Showcase>
      <Variant caption="Black (default)"><Link {...args} color="black" /></Variant>
      <Variant caption="Blue"><Link {...args} color="blue" /></Variant>
    </Showcase>
  ),
};

/** md-24, sm-20 and xs-16. */
export const Sizes: Story = {
  render: (args: LinkProps) => (
    <Showcase>
      <Variant caption="md · 24px"><Link {...args} size="md" /></Variant>
      <Variant caption="sm · 20px"><Link {...args} size="sm" /></Variant>
      <Variant caption="xs · 16px"><Link {...args} size="xs" /></Variant>
    </Showcase>
  ),
};
