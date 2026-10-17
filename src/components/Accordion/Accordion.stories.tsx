import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import type { CSSProperties } from 'react';
import { Accordion, type AccordionProps } from './Accordion';
import { AccordionDescription } from './AccordionDescription';
import { AccordionKeyValue, type AccordionKeyValueRow } from './AccordionKeyValue';
import { baseIconNames } from '../../icons/names';
import { Anatomy as AnatomyBlock } from '../../docs/blocks/DocBlocks';

const sampleRows: AccordionKeyValueRow[] = [1, 2, 3, 4, 5].map(n => ({ id: String(n), key: 'Key', value: 'Value' }));

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  // Accordion.mdx documents the component and its Description and Key-value parts.
  parameters: { layout: 'padded', docs: { description: { component: 'An expandable section that keeps a title visible and reveals a text description or key–value details when opened.' } } },
  args: { title: 'Accordion title', description: 'Accordion description here! It would look better as two lines of text', descriptionType: 'text', rows: sampleRows, chevronPosition: 'after', icon: 'help', expanded: false, disabled: false, headingLevel: 3, previewState: 'default' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    descriptionType: { control: 'inline-radio', options: ['text', 'key-value'] },
    rows: { control: 'object' },
    chevronPosition: { control: 'inline-radio', options: ['before', 'after'] },
    icon: { control: 'select', options: [null, ...baseIconNames], labels: { null: 'none' } },
    expanded: { control: 'boolean' },
    defaultExpanded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    previewState: { control: 'inline-radio', options: ['default', 'hover', 'active', 'focus'] },
    onExpandedChange: { action: 'expanded changed', control: false },
  },
  render: function InteractiveAccordion(args: AccordionProps) {
    const [, updateArgs] = useArgs<AccordionProps>();
    return <Accordion {...args} onExpandedChange={expanded => { args.onExpandedChange?.(expanded); updateArgs({ expanded }); }} />;
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--space-800)', maxWidth: '100%' };
const column: CSSProperties = { display: 'grid', justifyItems: 'start', gap: 'var(--space-600)', maxWidth: '100%' };

export const Playground: Story = {};

/** The five parts from the Figma anatomy. */
export const Anatomy: Story = {
  args: { expanded: true },
  render: (args: AccordionProps) => <AnatomyBlock width={360} markers={[
    { n: 1, target: '.grg-accordion__item', side: 'left' },
    { n: 2, target: '.grg-accordion__leading-icon', side: 'top' },
    { n: 3, target: '.grg-accordion__title', side: 'top' },
    { n: 4, target: '.grg-accordion__chevron', side: 'top' },
    { n: 5, target: '.grg-accordion-description', side: 'bottom' },
  ]}><Accordion {...args} /></AnatomyBlock>,
};

/** Chevron before, then after. Before takes the leading icon's place. */
export const ChevronPosition: Story = {
  render: (args: AccordionProps) => <div style={column}>{(['before', 'after'] as const).map(chevronPosition => <Accordion key={chevronPosition} {...args} chevronPosition={chevronPosition} />)}</div>,
};

/** With and without the optional Base icon, as in the guidelines. */
export const LeadingIcon: Story = {
  render: (args: AccordionProps) => <div style={column}><Accordion {...args} chevronPosition="after" /><Accordion {...args} chevronPosition="after" icon={null} /></div>,
};

/** Text and Key–Value descriptions inside the same Accordion. */
export const DescriptionTypes: Story = {
  args: { expanded: true },
  render: (args: AccordionProps) => <div style={column}><Accordion {...args} descriptionType="text" /><Accordion {...args} descriptionType="key-value" /></div>,
};

/** Description's two internal variants, at the 231px width of their Figma set. */
export const DescriptionParts: Story = {
  render: (args: AccordionProps) => <div style={{ ...column, width: 231 }}><AccordionDescription text={args.description} disabled={args.disabled} /><AccordionDescription type="key-value" rows={args.rows?.slice(0, 1)} disabled={args.disabled} /></div>,
};

/** The Key-value part's Rows 01–05, with a 12px gap between rows. */
export const KeyValueRows: Story = {
  render: (args: AccordionProps) => <div style={row}>{[1, 2, 3, 4, 5].map(count => <div key={count} style={{ width: 231, maxWidth: '100%' }}><AccordionKeyValue rows={args.rows?.slice(0, count) ?? []} disabled={args.disabled} /></div>)}</div>,
};

/** The complete 16-variant Figma set: Expanded × State × Flip icon. */
export const AllVariants: Story = {
  render: (args: AccordionProps) => <div style={column}>{[false, true].map(expanded => <div key={String(expanded)} style={column}>{(['default', 'hover', 'active', 'disabled'] as const).map(state => <div key={state} style={row}>{(['after', 'before'] as const).map(chevronPosition => <Accordion key={chevronPosition} {...args} expanded={expanded} chevronPosition={chevronPosition} disabled={state === 'disabled'} previewState={state === 'disabled' ? 'default' : state} />)}</div>)}</div>)}</div>,
};

export const Default: Story = {};
export const Hovered: Story = { args: { previewState: 'hover' } };
export const Active: Story = { args: { previewState: 'active' } };
export const Focused: Story = { args: { previewState: 'focus' } };
export const Disabled: Story = {
  args: { disabled: true },
  render: (args: AccordionProps) => <div style={column}><Accordion {...args} expanded={false} /><Accordion {...args} expanded /></div>,
};
export const Expanded: Story = { args: { expanded: true } };

/** An uncontrolled instance opens and closes itself, without a parent updating props. */
export const Uncontrolled: Story = { args: { expanded: undefined, defaultExpanded: true }, render: (args: AccordionProps) => <Accordion {...args} /> };

/** A title and description wrap, so content determines the height. */
export const LongContent: Story = {
  args: { expanded: true, title: 'How can I check the status of an international transfer?', description: 'Open the transfer details to see the latest status. If the receiving bank asks for more information, the request will appear with the transfer.\nYou can return to these details at any time.' },
};

/** Long keys and values wrap within their columns. */
export const LongKeyValues: Story = {
  args: { expanded: true, descriptionType: 'key-value', rows: [{ key: 'Receiving bank reference', value: 'TRANSFER-2026-12345678901234567890' }, { key: 'Beneficiary name', value: 'Alexandra Montgomery-Williams' }] },
};
