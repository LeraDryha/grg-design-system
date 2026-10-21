import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FeaturedIcon, type FeaturedIconProps, type FeaturedIconType } from './FeaturedIcon';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/featured-icon/featured-icon-component.png';

const types: FeaturedIconType[] = ['success', 'info', 'warning', 'error', 'neutral', 'primary'];
const title = (word: string) => word[0].toUpperCase() + word.slice(1);

const meta = {
  title: 'Components/Featured Icon',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: FeaturedIcon,
  // The docs page is FeaturedIcon.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: { type: 'success', size: 'lg', filled: true },
  argTypes: {
    type: { control: 'select', options: types },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    icon: { control: 'select', options: [undefined, ...baseIconNames] },
  },
} satisfies Meta<typeof FeaturedIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

const row = { display: 'flex', alignItems: 'center', gap: 'var(--space-400)', maxWidth: 'calc(var(--space-5000) * 2)' } as const;
const text = { display: 'grid', gap: 'var(--space-100)', font: 'var(--typo-body-md-regular)', color: 'var(--text-subtle-700)' } as const;

/** Next to a title it says the same thing again: decorative, screen readers skip it. */
export const NextToATitle: Story = {
  name: 'Next to a title',
  render: (args: FeaturedIconProps) => (
    <div style={row}>
      <FeaturedIcon {...args} type="success" />
      <div style={text}>
        <strong style={{ font: 'var(--typo-title-sm-semibold)', color: 'var(--text-strong-1000)' }}>Payment sent</strong>
        <span>1,250.00 USDC is on its way to Warren Fritsch.</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.grg-featured-icon')).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Alone, the status is in the icon only: `label` gives it a name. */
export const OnItsOwn: Story = {
  name: 'On its own',
  args: { type: 'warning', label: 'Needs attention', size: 'md' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Needs attention' })).toBeVisible();
  },
};

/** Neutral and Primary carry a subject rather than a status: any Base icon. */
export const ASubject: Story = {
  name: 'A subject',
  render: (args: FeaturedIconProps) => (
    <Showcase>
      <Variant caption="Neutral · mail"><FeaturedIcon {...args} type="neutral" /></Variant>
      <Variant caption="Primary · wallet"><FeaturedIcon {...args} type="primary" icon="wallet" /></Variant>
      <Variant caption="Primary · shield-check"><FeaturedIcon {...args} type="primary" icon="shield-check" filled={false} /></Variant>
    </Showcase>
  ),
};

/* ---- Overview ---- */

/** The six types, Filled on and off. */
export const Types: Story = {
  render: (args: FeaturedIconProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-600)' }}>
      {[true, false].map(filled => (
        <Showcase key={String(filled)}>
          {types.map(type => (
            <Variant key={type} caption={`${title(type)}${filled ? '' : ' · off'}`}><FeaturedIcon {...args} type={type} filled={filled} /></Variant>
          ))}
        </Showcase>
      ))}
    </div>
  ),
};

/** lg-48 with a 32px icon, md-40 with 24, sm-32 with 20. */
export const Sizes: Story = {
  render: (args: FeaturedIconProps) => (
    <Showcase>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Variant key={size} caption={{ lg: 'lg · 48px', md: 'md · 40px', sm: 'sm · 32px' }[size]}><FeaturedIcon {...args} size={size} /></Variant>
      ))}
    </Showcase>
  ),
};
