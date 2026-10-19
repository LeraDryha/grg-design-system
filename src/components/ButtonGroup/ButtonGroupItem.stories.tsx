import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroupItem, type ButtonGroupItemProps } from './ButtonGroupItem';
import { baseIconNames } from '../../icons/names';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const meta = {
  title: 'Components/ButtonGroupItem', component: ButtonGroupItem,
  parameters: { layout: 'padded', docs: { description: { component: 'A compact action button with the edge shape required by its position in Button group.' } } },
  args: { label: 'Button', size: 'md', side: 'left', leftIcon: 'plus', rightIcon: 'plus', iconOnly: false, disabled: false, previewState: 'default', type: 'button' },
  argTypes: {
    label: { control: 'text' }, size: { control: 'inline-radio', options: ['md', 'sm'] },
    side: { control: 'inline-radio', options: ['left', 'center', 'right', 'single'] },
    leftIcon: { control: 'select', options: [null, ...baseIconNames] },
    rightIcon: { control: 'select', options: [null, ...baseIconNames] },
    selected: { control: 'boolean' }, iconOnly: { control: 'boolean' }, disabled: { control: 'boolean' },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    'aria-label': { control: 'text' }, onClick: { action: 'button activated', control: false },
  },
} satisfies Meta<typeof ButtonGroupItem>;
export default meta;
type Story = StoryObj<typeof meta>;
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-600)', padding: 'var(--space-200)' };
const column: CSSProperties = { display: 'grid', justifyItems: 'start', gap: 'var(--space-600)' };

export const Playground: Story = {};
export const Anatomy: Story = {
  render: (args: ButtonGroupItemProps) => <AnatomyBlock width="auto" markers={[
    { n: 1, target: '.grg-button-group-item', side: 'left' },
    { n: 2, target: '.grg-button-group-item__icon', side: 'top' },
    { n: 3, target: '.grg-button-group-item__label', side: 'bottom' },
  ]}><ButtonGroupItem {...args} rightIcon={null} /></AnatomyBlock>,
};
export const Types: Story = {
  render: (args: ButtonGroupItemProps) => <div style={row}>
    <ButtonGroupItem {...args} leftIcon={null} rightIcon={null} iconOnly={false} />
    <ButtonGroupItem {...args} rightIcon={null} iconOnly={false} />
    <ButtonGroupItem {...args} iconOnly />
  </div>,
};
export const Sizes: Story = { render: (args: ButtonGroupItemProps) => <div style={row}>{(['md', 'sm'] as const).map(size => <ButtonGroupItem key={size} {...args} size={size} />)}</div> };
export const Sides: Story = { render: (args: ButtonGroupItemProps) => <div style={row}>{(['left', 'center', 'right'] as const).map(side => <ButtonGroupItem key={side} {...args} side={side} />)}</div> };
export const Default: Story = {};
export const Hovered: Story = { args: { previewState: 'hover' } };
export const Pressed: Story = { args: { previewState: 'active' } };
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Focused: Story = { args: { previewState: 'focus' } };
export const Icons: Story = {
  render: (args: ButtonGroupItemProps) => <div style={row}>
    <ButtonGroupItem {...args} rightIcon={null} />
    <ButtonGroupItem {...args} leftIcon={null} />
    <ButtonGroupItem {...args} />
  </div>,
};
/** All 48 source variants: two sizes × four states × three sides × icon-only on/off. */
export const AllVariants: Story = {
  render: (args: ButtonGroupItemProps) => <div style={column}>{(['md', 'sm'] as const).map(size =>
    <section key={size} aria-label={size === 'md' ? '32px items' : '24px items'} style={column}>
      {(['default', 'hover', 'active', 'disabled'] as const).map(state => <div key={state} style={row}>
        {[false, true].map(iconOnly => (['left', 'center', 'right'] as const).map(side => <ButtonGroupItem key={`${iconOnly}-${side}`} {...args} size={size} side={side} iconOnly={iconOnly} disabled={state === 'disabled'} previewState={state === 'disabled' ? 'default' : state} />))}
      </div>)}
    </section>)}</div>,
};
