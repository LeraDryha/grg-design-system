import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip, type TooltipProps, type TooltipSide } from './Tooltip';
import { ActionButton } from '../ActionButton/ActionButton';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/tooltip/tooltip-component.png';
import guidelinesFrame from '../../assets/design/tooltip/tooltip-guidelines.png';

/** Tooltips open in the page's body: find them there */
const tooltip = () => within(document.body).findByRole('tooltip', { hidden: true });

const meta = {
  title: 'Components/Tooltip',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Tooltip,
  // The docs page is Tooltip.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    title: 'Copy link',
    color: 'white',
    side: 'top',
    align: 'center',
    purpose: 'name',
    children: <ActionButton icon="copy" aria-label="Copy link" />,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'inline-radio', options: ['center', 'start', 'end'] },
    color: { control: 'inline-radio', options: ['white', 'black'] },
    purpose: { control: 'inline-radio', options: ['description', 'name', 'repeat'] },
    icon: { control: 'select', options: [undefined, ...baseIconNames] },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** An icon button has no text: the tooltip shows its name, and screen readers hear the same name. */
export const NameAnIconButton: Story = {
  name: 'Name an icon button',
  render: args => (
    <div style={{ display: 'flex', gap: 'var(--space-300)' }}>
      {([['copy', 'Copy link'], ['edit', 'Edit'], ['trash', 'Delete']] as const).map(([icon, title]) => (
        <Tooltip key={icon} {...args} title={title} purpose="name">
          <ActionButton icon={icon} aria-label={title} />
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy link' });
    await userEvent.hover(button);
    await expect(await tooltip()).toHaveTextContent('Copy link');
    await userEvent.unhover(button);
    // From the keyboard: Tab shows it, Escape hides it
    await userEvent.tab();
    await expect(await tooltip()).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.querySelector('.grg-tooltip')).toBeNull());
  },
};

/** A hint next to a setting: a title and two lines that explain it. Screen readers hear it after the button's name. */
export const ExplainASetting: Story = {
  name: 'Explain a setting',
  args: {
    title: 'Payment window',
    description: 'How long a customer has to pay before the invoice expires.',
    icon: 'information-circle',
    side: 'right',
    purpose: 'description',
  },
  render: args => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', font: 'var(--typo-body-md-medium)' }}>
      Payment window
      <Tooltip {...args}>
        <ActionButton icon="information-circle" size="sm" aria-label="About the payment window" />
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'About the payment window' });
    await expect(button).toHaveAccessibleDescription('Payment window. How long a customer has to pay before the invoice expires.');
    await userEvent.hover(button);
    await expect(await tooltip()).toHaveTextContent('How long a customer has to pay');
  },
};

/** Black stands out on a busy screen, such as over a chart. In the dark theme it turns light. */
export const OverAChart: Story = {
  name: 'Over a chart',
  args: { title: '12 Oct · 4,820 USDT', color: 'black', side: 'top', purpose: 'repeat' },
  render: args => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-200)', height: 'var(--space-2400)' }}>
      {[40, 64, 52, 80, 70].map((height, index) => (
        <Tooltip key={index} {...args} title={index === 3 ? args.title : `${8 + index} Oct`}>
          <button
            type="button"
            aria-label={index === 3 ? args.title : `${8 + index} Oct`}
            style={{ width: 'var(--space-600)', height: `${height}%`, border: 0, borderRadius: 'var(--radius-xxs-4)', background: index === 3 ? 'var(--primary-gold-base)' : 'var(--bg-soft-200)', cursor: 'pointer' }}
          />
        </Tooltip>
      ))}
    </div>
  ),
};

/* ---- Overview ---- */

const trigger = <Button variant="secondary" size="sm">Hover me</Button>;

/** Where the tooltip opens; Figma names the side with the tip, the opposite one. */
export const Sides: Story = {
  render: args => (
    <Showcase>
      {(['top', 'bottom', 'left', 'right'] as TooltipSide[]).map(side => (
        <Variant key={side} caption={side}>
          <Tooltip {...args} side={side} purpose="description">{trigger}</Tooltip>
        </Variant>
      ))}
    </Showcase>
  ),
};

/** The tooltip only exists while it is open, so the overview draws the open tooltip itself. */
function Drawn({ side = 'bottom', color = 'white', title, description, icon }: Partial<TooltipProps>) {
  return (
    <div className="grg-tooltip" data-side={side} data-color={color} data-details={description ? true : undefined} style={{ position: 'static' }}>
      <div className="grg-tooltip__body">
        {icon && <Icon name={icon} size={16} className="grg-tooltip__icon" />}
        <span className="grg-tooltip__text">
          <span className="grg-tooltip__title">{title}</span>
          {description && <span className="grg-tooltip__description">{description}</span>}
        </span>
      </div>
    </div>
  );
}

const longText = 'Tooltip description here! It would look better as two lines of text';

/** Figma Color and Details: White and Black, a single line or a title with a description. */
export const Styles: Story = {
  render: () => (
    <Showcase column>
      {(['white', 'black'] as const).map(color => (
        <Showcase key={color}>
          <Variant caption={`${color} · title`}><Drawn color={color} title="Tooltip" /></Variant>
          <Variant caption={`${color} · with icon`}><Drawn color={color} title="Tooltip description here!" icon="globe" /></Variant>
          <Variant caption={`${color} · with description`}><Drawn color={color} title="Tooltip" description={longText} /></Variant>
          <Variant caption={`${color} · icon and description`}><Drawn color={color} title="Tooltip" description={longText} icon="globe" /></Variant>
        </Showcase>
      ))}
    </Showcase>
  ),
};
