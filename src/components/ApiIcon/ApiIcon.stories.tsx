import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ApiIcon, type ApiIconProps, type ApiMethod } from './ApiIcon';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/api-icon/api-icon-component.png';

const methods: ApiMethod[] = ['post', 'get', 'delete', 'patch', 'put'];

const meta = {
  title: 'Components/Api Icon',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: ApiIcon,
  // The docs page is ApiIcon.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { method: 'post', text: true, active: false },
  argTypes: {
    method: { control: 'inline-radio', options: methods },
  },
} satisfies Meta<typeof ApiIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const endpoints: [ApiMethod, string][] = [
  ['get', '/v1/invoices'],
  ['post', '/v1/invoices'],
  ['patch', '/v1/invoices/{id}'],
  ['put', '/v1/invoices/{id}/items'],
  ['delete', '/v1/invoices/{id}'],
];

/** A list of endpoints: the method in colour and as text, then the path. */
export const Endpoints: Story = {
  // Known Figma contrast: the Patch and Put text (warning-base-600 on warning-muted-50) is about 3:1
  parameters: { a11y: { test: 'todo' } },
  render: (args: ApiIconProps) => (
    <ul style={{ display: 'grid', gap: 'var(--space-200)', margin: 0, padding: 0, listStyle: 'none' }}>
      {endpoints.map(([method, path]) => (
        <li key={method} style={{ display: 'grid', gridTemplateColumns: 'calc(var(--space-1600) + var(--space-200)) auto', alignItems: 'center', gap: 'var(--space-300)' }}>
          <span><ApiIcon {...args} method={method} text /></span>
          <code style={{ font: 'var(--typo-code-code-md-regular)', color: 'var(--text-strong-1000)' }}>{path}</code>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('DELETE')).toBeVisible();
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);
  },
};

/** Without text the tile still has a name: screen readers hear the method. */
export const IconOnly: Story = {
  name: 'Icon only',
  args: { text: false },
  render: (args: ApiIconProps) => (
    <span style={{ display: 'flex', gap: 'var(--space-200)' }}>
      {methods.map(method => <ApiIcon key={method} {...args} method={method} />)}
    </span>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'PATCH' })).toBeInTheDocument();
  },
};

/* ---- Overview ---- */

/** Figma Type × Text × State. */
export const Types: Story = {
  // Known Figma contrast: Patch and Put text about 3:1; every Active text 2.8–4.2:1 on the deeper tint
  parameters: { a11y: { test: 'todo' } },
  render: (args: ApiIconProps) => (
    <Showcase column>
      {[false, true].map(active => [false, true].map(text => (
        <Showcase key={`${active}${text}`}>
          {methods.map(method => (
            <Variant key={method} caption={`${method}${active ? ' · active' : ''}`}>
              <ApiIcon {...args} method={method} text={text} active={active} />
            </Variant>
          ))}
        </Showcase>
      )))}
    </Showcase>
  ),
};
