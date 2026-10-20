import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BreadcrumbItem, type BreadcrumbItemProps } from './BreadcrumbItem';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/breadcrumb-item/breadcrumb-item-component.png';
import guidelinesFrame from '../../assets/design/breadcrumbs/breadcrumbs-guidelines.png';

const meta = {
  title: 'Components/BreadcrumbItem',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'], component: BreadcrumbItem,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'One level in Breadcrumbs: an ancestor link, an icon-only root or the current page.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { label: 'Breadcrumb', href: '#ancestor', icon: 'home', showLabel: true, current: false },
  argTypes: {
    label: { control: 'text' }, href: { control: 'text' },
    icon: { control: 'select', options: [null, ...baseIconNames], labels: { null: 'none' } },
    showLabel: { control: 'boolean' }, current: { control: 'boolean' },
    onNavigate: { action: 'ancestor selected', control: false },
  },
} satisfies Meta<typeof BreadcrumbItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** An icon-only root: the label is hidden but stays the link's name. */
export const IconOnlyRoot: Story = {
  name: 'Icon-only root',
  args: { label: 'Home', showLabel: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Home' })).toBeVisible();
  },
};

/** The current page: Medium text, aria-current, no link. */
export const CurrentPage: Story = {
  name: 'Current page',
  args: { current: true, icon: null, label: 'Two-factor authentication' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText('Two-factor authentication').closest('[aria-current="page"]')).not.toBeNull();
  },
};

/** A long current title: clipped, with the full title in a tooltip on hover, focus or tap. */
export const ALongTitle: Story = {
  name: 'A long title',
  args: { current: true, icon: null, label: 'How to reset two-factor authentication if you lost access to your device' },
};

/* ---- Overview ---- */

/** Icon, Icon + Text and Text. */
export const Types: Story = {
  render: (args: BreadcrumbItemProps) => (
    <Showcase>
      <Variant caption="Icon"><BreadcrumbItem {...args} showLabel={false} /></Variant>
      <Variant caption="Icon + Text"><BreadcrumbItem {...args} /></Variant>
      <Variant caption="Text"><BreadcrumbItem {...args} icon={null} /></Variant>
    </Showcase>
  ),
};
