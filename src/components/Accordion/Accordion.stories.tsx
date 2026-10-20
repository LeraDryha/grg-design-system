import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Accordion, type AccordionProps } from './Accordion';
import { AccordionKeyValue, type AccordionKeyValueRow } from './AccordionKeyValue';
import { baseIconNames } from '../../icons/names';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/accordion/accordion-component.png';
import guidelinesFrame from '../../assets/design/accordion/accordion-guidelines.png';

const sampleRows: AccordionKeyValueRow[] = [1, 2, 3, 4, 5].map(n => ({ id: String(n), key: 'Key', value: 'Value' }));

const meta = {
  title: 'Components/Accordion',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Accordion,
  // Accordion.mdx documents the component and its Description and Key-value parts.
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'An expandable section that keeps a title visible and reveals a text description or key–value details when opened.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { title: 'Accordion title', description: 'Accordion description here! It would look better as two lines of text', descriptionType: 'text', rows: sampleRows, chevronPosition: 'after', icon: 'help', expanded: false, disabled: false, headingLevel: 3 },
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
    onExpandedChange: { action: 'expanded changed', control: false },
  },
  render: function InteractiveAccordion(args: AccordionProps) {
    const [, updateArgs] = useArgs<AccordionProps>();
    return <Accordion {...args} onExpandedChange={expanded => { args.onExpandedChange?.(expanded); updateArgs({ expanded }); }} />;
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const width = { width: 'min(360px, 100%)' };
const stack = { display: 'grid', gap: 'var(--space-300)', ...width };

export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Questions people may have: each answer opens on its own, with the mouse or the keyboard. */
export const AnswerQuestions: Story = {
  name: 'Answer questions',
  render: () => (
    <div style={stack}>
      <Accordion title="How long does a transfer take?" description="Most transfers arrive within one business day. International transfers can take up to three." />
      <Accordion title="Can I cancel a transfer?" description="You can cancel a transfer while its status is Pending. Open it and choose Cancel." />
      <Accordion title="Where do I find my statements?" description="Statements are in Account → Documents, one for each month." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'How long does a transfer take?' });
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(first);
    await waitFor(() => expect(first).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByText(/most transfers arrive/i)).toBeVisible();
    // Keyboard: Tab to the next header, Enter opens it; focus stays on the header
    await userEvent.tab();
    const second = canvas.getByRole('button', { name: 'Can I cancel a transfer?' });
    await expect(second).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(second).toHaveAttribute('aria-expanded', 'true'));
    await expect(second).toHaveFocus();
  },
};

/** Payment details: facts as keys and values, read as a list by screen readers. */
export const PaymentDetails: Story = {
  name: 'Payment details',
  render: () => (
    <div style={width}>
      <Accordion
        title="Payment details"
        icon="file-doc"
        descriptionType="key-value"
        defaultExpanded
        rows={[
          { id: 'ref', key: 'Reference', value: 'TX-4821-9907' },
          { id: 'amount', key: 'Amount', value: '120.00 USDT' },
          { id: 'fee', key: 'Fee', value: '0.80 USDT' },
          { id: 'date', key: 'Date', value: '12 Dec 2025' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('dl')).not.toBeNull();
    await expect(canvas.getByText('120.00 USDT')).toBeVisible();
  },
};

/** Not available right now: the header can't toggle and Tab skips it. It can stay open, as in Figma. */
export const Unavailable: Story = {
  render: () => (
    <div style={stack}>
      <Accordion title="Card limits" description="Available after your card is activated." disabled />
      <Accordion title="Account details" description="This account is locked while we check a recent payment." disabled defaultExpanded />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Card limits' })).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Long titles and values wrap; the header grows and values stay aligned to the right. */
export const LongContent: Story = {
  name: 'Long content',
  render: function LongContent() {
    const [open, setOpen] = useState(true);
    return (
      <div style={stack}>
        <Accordion expanded={open} onExpandedChange={setOpen} title="How can I check the status of an international transfer?"
          description="Open the transfer details to see the latest status. If the receiving bank asks for more information, the request will appear with the transfer." />
        <Accordion defaultExpanded title="Receiving bank" descriptionType="key-value"
          rows={[{ id: 'ref', key: 'Receiving bank reference', value: 'TRANSFER-2026-12345678901234567890' }, { id: 'name', key: 'Beneficiary name', value: 'Alexandra Montgomery-Williams' }]} />
      </div>
    );
  },
};

/* ---- Overview ---- */

/** Chevron after (with an optional icon) and before. */
export const ChevronPosition: Story = {
  render: (args: AccordionProps) => (
    <Showcase column>
      <Variant caption="Chevron after, with an icon"><div style={width}><Accordion {...args} chevronPosition="after" /></div></Variant>
      <Variant caption="Chevron after, no icon"><div style={width}><Accordion {...args} chevronPosition="after" icon={null} /></div></Variant>
      <Variant caption="Chevron before"><div style={width}><Accordion {...args} chevronPosition="before" /></div></Variant>
    </Showcase>
  ),
};

/** Text and Key–Value descriptions. */
export const DescriptionTypes: Story = {
  args: { expanded: true },
  render: (args: AccordionProps) => (
    <Showcase column>
      <Variant caption="Text"><div style={width}><Accordion {...args} descriptionType="text" /></div></Variant>
      <Variant caption="Key–Value"><div style={width}><Accordion {...args} descriptionType="key-value" /></div></Variant>
    </Showcase>
  ),
};

/** The Key-value part on its own: Rows 01–05, 12px apart. */
export const KeyValueRows: Story = {
  render: (args: AccordionProps) => (
    <Showcase>
      {[1, 3, 5].map(count => (
        <Variant key={count} caption={`${count} ${count === 1 ? 'row' : 'rows'}`}>
          <div style={{ width: 231, maxWidth: '100%' }}><AccordionKeyValue rows={args.rows?.slice(0, count) ?? []} /></div>
        </Variant>
      ))}
    </Showcase>
  ),
};
