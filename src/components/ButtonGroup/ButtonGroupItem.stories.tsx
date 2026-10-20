import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ButtonGroupItem, type ButtonGroupItemProps } from './ButtonGroupItem';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/button-group-item/button-group-item-component.png';
import guidelinesFrame from '../../assets/design/button-group/button-group-guidelines.png';

const meta = {
  title: 'Components/ButtonGroupItem',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'], component: ButtonGroupItem,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A compact action button with the edge shape required by its position in Button group.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { label: 'Button', size: 'md', side: 'left', leftIcon: 'plus', rightIcon: 'plus', iconOnly: false, disabled: false, type: 'button' },
  argTypes: {
    label: { control: 'text' }, size: { control: 'inline-radio', options: ['md', 'sm'] },
    side: { control: 'inline-radio', options: ['left', 'center', 'right', 'single'] },
    leftIcon: { control: 'select', options: [null, ...baseIconNames] },
    rightIcon: { control: 'select', options: [null, ...baseIconNames] },
    selected: { control: 'boolean' }, iconOnly: { control: 'boolean' }, disabled: { control: 'boolean' },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    'aria-label': { control: 'text' }, onClick: { action: 'button activated', control: false },
  },
} satisfies Meta<typeof ButtonGroupItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** A standalone toggle: the item keeps its selected look and says it's pressed. */
export const AToggle: Story = {
  name: 'A toggle',
  args: { side: 'single', label: 'Bold', leftIcon: null, rightIcon: null },
  render: function AToggle(args: ButtonGroupItemProps) {
    const [on, setOn] = useState(false);
    return <ButtonGroupItem {...args} selected={on} onClick={() => setOn(!on)} />;
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Bold' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

/* ---- Overview ---- */

/** Text only, text and icon, icon only. */
export const Types: Story = {
  render: (args: ButtonGroupItemProps) => (
    <Showcase>
      <Variant caption="Text"><ButtonGroupItem {...args} leftIcon={null} rightIcon={null} iconOnly={false} /></Variant>
      <Variant caption="Text and icon"><ButtonGroupItem {...args} rightIcon={null} iconOnly={false} /></Variant>
      <Variant caption="Icon only"><ButtonGroupItem {...args} iconOnly /></Variant>
    </Showcase>
  ),
};

/** Left, Center and Right: the corners follow the position in the group. */
export const Sides: Story = {
  render: (args: ButtonGroupItemProps) => (
    <Showcase>
      {(['left', 'center', 'right'] as const).map(side => <Variant key={side} caption={side[0].toUpperCase() + side.slice(1)}><ButtonGroupItem {...args} side={side} /></Variant>)}
    </Showcase>
  ),
};

/** md-32 and sm-24. */
export const Sizes: Story = {
  render: (args: ButtonGroupItemProps) => (
    <Showcase>
      <Variant caption="md · 32px"><ButtonGroupItem {...args} size="md" /></Variant>
      <Variant caption="sm · 24px"><ButtonGroupItem {...args} size="sm" /></Variant>
    </Showcase>
  ),
};
