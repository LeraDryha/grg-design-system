import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Slider } from './Slider';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/slider/slider-component.png';
import rangeFrame from '../../assets/design/slider/range-slider.png';
import handleFrame from '../../assets/design/slider/control-handle.png';
import guidelinesFrame from '../../assets/design/slider/slider-guidelines.png';

const width = { width: 'calc(var(--space-5000) + var(--space-2000) + var(--space-1000))', maxWidth: '100%' } as const;
const usdt = (value: number) => `${value.toLocaleString('en-GB')} USDT`;

const meta = {
  title: 'Components/Slider',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Slider,
  // The docs page is Slider.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Slider', type: 'image', url: componentFrame },
      { name: 'Range slider', type: 'image', url: rangeFrame },
      { name: 'Control handle', type: 'image', url: handleFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { defaultValue: 40, min: 0, max: 100, step: 1, label: 'Label', sublabel: '(Optional)', showValue: true, handleValue: 'none', steppers: false, disabled: false },
  argTypes: {
    handleValue: { control: 'inline-radio', options: ['none', 'text', 'tooltip'] },
    format: { control: false },
  },
  render: args => <div style={width}><Slider {...args} /></div>,
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** How much to withdraw: the value top right, in USDT; the keyboard moves it by a step or to the ends. */
export const WithdrawalAmount: Story = {
  name: 'Withdrawal amount',
  render: () => (
    <div style={width}>
      <Slider label="Amount" defaultValue={2500} min={0} max={10000} step={100} format={usdt} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider', { name: 'Amount' });
    await expect(handle).toHaveAttribute('aria-valuetext', '2,500 USDT');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '2700');
    await expect(canvas.getByText('2,700 USDT')).toBeInTheDocument();
    await userEvent.keyboard('{End}');
    await expect(handle).toHaveAttribute('aria-valuenow', '10000');
  },
};

/** Figma Range slider: two handles with tooltips; each has its own name for screen readers. */
export const PriceRange: Story = {
  name: 'Price range',
  render: () => (
    <div style={{ ...width, paddingTop: 'var(--space-1000)' }}>
      <Slider label="Price range" defaultValue={[200, 750] as [number, number]} min={0} max={1000} step={10} format={usdt} handleValue="tooltip" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const low = canvas.getByRole('slider', { name: 'Price range Minimum' });
    await expect(low).toHaveAttribute('aria-valuenow', '200');
    await expect(canvas.getByRole('slider', { name: 'Price range Maximum' })).toHaveAttribute('aria-valuenow', '750');
    low.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(low).toHaveAttribute('aria-valuenow', '210');
  },
};

/** The Figma example: zoom in a photo, with − and + at the ends. */
export const ZoomAPhoto: Story = {
  name: 'Zoom a photo',
  render: function ZoomAPhoto() {
    const [zoom, setZoom] = useState(130);
    return (
      <div style={{ ...width, display: 'grid', gap: 'var(--space-400)' }}>
        <div style={{ height: 'var(--space-2400)', overflow: 'hidden', borderRadius: 'var(--radius-md-10)', background: 'var(--bg-soft-200)', display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 'var(--space-1600)', height: 'var(--space-1600)', borderRadius: 'var(--radius-fully-rounded)', background: 'var(--primary-gold-base)', transform: `scale(${zoom / 100})` }} />
        </div>
        <Slider aria-label="Zoom" value={zoom} onChange={setZoom} min={100} max={300} step={10} steppers showValue={false} format={value => `${value}%`} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await expect(canvas.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuenow', '140');
  },
};

/** Unavailable (not in Figma): the grey of other disabled fields. */
export const Unavailable: Story = {
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  args: { disabled: true, label: 'Leverage', sublabel: '(Verify your account first)', defaultValue: 20 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('slider', { name: 'Leverage' })).toHaveAttribute('aria-disabled', 'true');
  },
};

/* ---- Overview ---- */

/** Figma Control handle: the value nowhere, under the handle, or in a tooltip (hover a handle to see it). */
export const HandleValue: Story = {
  name: 'Handle value',
  render: () => (
    <Showcase column>
      <Variant caption="handle only"><div style={width}><Slider aria-label="Handle only" defaultValue={25} showValue={false} /></div></Variant>
      <Variant caption="text"><div style={width}><Slider aria-label="Text" defaultValue={25} showValue={false} handleValue="text" format={value => `${value}%`} /></div></Variant>
      <Variant caption="tooltip"><div style={{ ...width, paddingTop: 'var(--space-1000)' }}><Slider aria-label="Tooltip" defaultValue={25} showValue={false} handleValue="tooltip" format={value => `${value}%`} /></div></Variant>
      <Variant caption="range"><div style={width}><Slider aria-label="Range" defaultValue={[25, 75] as [number, number]} showValue={false} /></div></Variant>
    </Showcase>
  ),
};
