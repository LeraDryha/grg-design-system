import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FeatureCard, type FeatureCardProps } from './FeatureCard';
import { Button } from '../Button/Button';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/feature-card/feature-card-component.png';

const colors = ['white', 'gray', 'black', 'primary'] as const;
/* The width of a card in an expanded sidebar: 232px */
const card = { width: 'calc(var(--space-5000) + var(--space-1000) - var(--space-200))', maxWidth: '100%' } as const;
const inSidebar: Decorator = Story => <div style={card}><Story /></div>;

const meta = {
  title: 'Components/Feature Card',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: FeatureCard,
  // The docs page is FeatureCard.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [{ name: 'Component', type: 'image', url: componentFrame }],
  },
  args: {
    type: 'left-icon',
    color: 'black',
    title: 'Claim your gift!',
    description: 'Find it on Benefits page.',
    href: '#benefits',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['left-icon', 'support'] },
    color: { control: 'inline-radio', options: colors },
    icon: { control: 'select', options: [undefined, ...baseIconNames] },
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { decorators: [inSidebar] };

/* ---- Examples ---- */

/** An offer: the whole card is one link, named by its title and line. */
export const ClaimAGift: Story = {
  name: 'Claim a gift',
  decorators: [inSidebar],
  args: { onClick: fn(event => event.preventDefault()) },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Claim your gift! Find it on Benefits page.' });
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

/** A way to get help that people can close. The product decides whether it comes back. */
export const NeedSupport: Story = {
  name: 'Need support?',
  decorators: [inSidebar],
  args: {
    type: 'support',
    color: 'white',
    title: 'Need support?',
    description: 'Our team answers in English and Ukrainian, 24/7.',
    href: undefined,
  },
  render: function NeedSupport(args: FeatureCardProps) {
    const [shown, setShown] = useState(true);
    return shown
      ? <FeatureCard {...args} onClose={() => setShown(false)} />
      : <Button variant="text" size="sm" onClick={() => setShown(true)}>Show the support card</Button>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(canvas.queryByText('Need support?')).toBeNull();
  },
};

/* ---- Overview ---- */

/** Figma Color × Type. */
export const Colors: Story = {
  render: (args: FeatureCardProps) => (
    <Showcase column>
      {(['left-icon', 'support'] as const).map(type => (
        <Showcase key={type}>
          {colors.map(color => (
            <Variant key={color} caption={color}>
              <div style={card}>
                <FeatureCard
                  {...args}
                  type={type}
                  color={color}
                  title={type === 'support' ? 'Need support?' : args.title}
                  description={type === 'support' ? 'Alert description here! It would look better as two lines of text' : args.description}
                  onClose={type === 'support' ? () => {} : undefined}
                />
              </div>
            </Variant>
          ))}
        </Showcase>
      ))}
    </Showcase>
  ),
};
