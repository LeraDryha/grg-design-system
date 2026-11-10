import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PageHeader } from './PageHeader';
import { Button } from '../Button/Button';
import { TabMenu } from '../TabMenu/TabMenu';

/** The page's canvas behind it, as in the product */
const page: Decorator = Story => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-500)', padding: 'var(--space-500) var(--space-600)', background: 'var(--surface-canvas)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/Page Header',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: PageHeader,
  // The docs page is PageHeader.mdx
  parameters: { layout: 'fullscreen' },
  decorators: [page],
  args: { title: 'Invoices' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    actions: <>
      <Button variant="outline" leftIcon="download">Download</Button>
      <Button variant="primary" leftIcon="plus">Create invoice</Button>
    </>,
  },
};

/* ---- Examples ---- */

/** With buttons and without: the same height, so the content under it starts at the same place. */
export const SameHeight: Story = {
  name: 'With buttons and without',
  render: () => (
    <>
      <PageHeader title="Members" actions={<Button variant="primary" leftIcon="plus">Add member</Button>} />
      <PageHeader title="Assets" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const [withButton, without] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.grg-page-header'));
    await expect(without.getBoundingClientRect().height).toBe(withButton.getBoundingClientRect().height);
  },
};

/** A page opened from a list: the arrow goes back to it. */
const goBack = fn();
export const OpenedFromAList: Story = {
  name: 'Opened from a list',
  args: { title: 'Invoice details', back: { label: 'Back to invoices', onClick: goBack },
    actions: <Button variant="outline" tone="destructive">Deactivate link</Button> },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Back to invoices' }));
    await expect(goBack).toHaveBeenCalled();
  },
};

/** Tabs go right under it: the Tab Menu holds its own panels. */
export const WithTabs: Story = {
  name: 'With tabs',
  render: function WithTabs() {
    const [tab, setTab] = useState('company');
    return (
      <>
        <PageHeader title="Settings" />
        <TabMenu aria-label="Settings" value={tab} onChange={setTab}
          items={[{ id: 'company', label: 'Company' }, { id: 'api', label: 'API key' }, { id: 'payments', label: 'Payment settings' }]}>
          {item => <p style={{ margin: 0, paddingTop: 'var(--space-400)', font: 'var(--typo-body-md-regular)', color: 'var(--text-soft-500)' }}>{item.label}</p>}
        </TabMenu>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
  },
};
