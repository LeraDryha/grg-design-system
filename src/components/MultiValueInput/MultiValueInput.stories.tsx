import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MultiValueInput } from './MultiValueInput';
import { Input } from '../Input/Input';
import { ModalPanel } from '../Modal/Modal';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/multi-value-input/multi-value-input-component.png';
import guidelinesFrame from '../../assets/design/multi-value-input/multi-value-input-guidelines.png';
import overflowFrame from '../../assets/design/multi-value-input/multi-value-input-overflow.png';

const width: CSSProperties = { width: 'calc(var(--space-5000) * 2 + var(--space-2000))', maxWidth: '100%' };
const ids = [
  '16214228-5c0c-5abc-be6a-c90259b21d4e', '274a1abe-43c5-5613-9b11-8583521dbd02', 'b34555b7-dca4-5ec1-ade3-64a3ad545310',
  '5c0c5abc-be6a-4c90-8259-b21d4e16214a', '9b118583-521d-4bd0-2274-a1abe43c5561', 'ade364a3-ad54-4531-0b34-555b7dca45ec',
  'c90259b2-1d4e-4162-a142-285c0c5abcbe', '8583521d-bd02-4274-a1ab-e43c55613a9b',
];

const meta = {
  title: 'Components/Multi-value Input',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: MultiValueInput,
  // The docs page is MultiValueInput.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Multi-value Input', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
      { name: 'Input chips: three rows', type: 'image', url: overflowFrame },
    ],
  },
  args: { label: 'Availability', size: 'md', hint: 'Press Enter or a comma to add a value', disabled: false, readOnly: false, allowDuplicate: false, addOnBlur: true, collapsedRows: 3 },
  argTypes: {
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    value: { control: 'object' },
    defaultValue: { control: 'object' },
    moreLabel: { control: false },
    removable: { control: false },
    keyfilter: { control: false },
    collapsedRows: { control: { type: 'number', min: 1 } },
  },
  render: args => <div style={width}><MultiValueInput {...args} /></div>,
} satisfies Meta<typeof MultiValueInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ---- Examples ---- */

/** The Figma example: a new coin and the payment providers that may use it. */
export const AddACoin: Story = {
  name: 'Add a coin',
  render: function AddACoin() {
    const [providers, setProviders] = useState(ids.slice(0, 2));
    return (
      <ModalPanel size="md" title="Add new" align="left" onClose={() => undefined}
        primaryAction={{ label: 'Save' }} secondaryAction={{ label: 'Cancel' }}>
        {/* Floating labels sit above their fields: 20px above the first row, 40px between rows */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1000) var(--space-400)', paddingTop: 'var(--space-500)' }}>
          <Input label="ID" defaultValue="009" />
          <Input label="Code" defaultValue="DOGE" />
          <Input label="Name" defaultValue="Dogecoin" />
          <Input label="Payload" defaultValue='{"icons":{"svg":"https://example.com/doge.svg"}}' />
          <div style={{ gridColumn: '1 / -1' }}>
            <MultiValueInput label="Availability" value={providers} onChange={setProviders} hint="Payment provider IDs, separated by commas" />
          </div>
        </div>
      </ModalPanel>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Availability' });
    await userEvent.click(field);
    await userEvent.type(field, 'b34555b7{Enter}');
    // The field's own list: a hidden copy beside it measures the rows
    const list = within(canvasElement.querySelector<HTMLElement>('.grg-multi-value__list')!);
    await expect(list.getByText('b34555b7')).toBeInTheDocument();
    await userEvent.keyboard('{Backspace}');
    await expect(list.queryByText('b34555b7')).toBeNull();
    // Text left without Enter still becomes a value when focus moves on
    await userEvent.type(field, 'c90259b2');
    await userEvent.click(canvas.getByRole('textbox', { name: 'Name' }));
    await expect(list.getByText('c90259b2')).toBeInTheDocument();
  },
};

/** Pasting a list splits it into values; a value already there isn't added twice. */
export const PasteAList: Story = {
  name: 'Paste a list',
  args: { label: 'Recipients', hint: 'Paste emails separated by commas' },
  render: function PasteAList(args) {
    const [values, setValues] = useState(['anna@example.com']);
    return (
      <div style={width}>
        <MultiValueInput {...args} value={values} onChange={setValues} />
        <p role="status" style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>{values.length} recipients</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Recipients' }));
    await userEvent.paste('anna@example.com,ben@example.com,cleo@example.com');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('3 recipients'));
  },
};

/** The account owner always gets the report: that value is locked, the others can be removed. */
export const KeepTheOwner: Story = {
  name: 'Keep the owner',
  args: { label: 'Report recipients', hint: 'The account owner always gets the report' },
  render: function KeepTheOwner(args) {
    const [values, setValues] = useState(['owner@company.example', 'finance@company.example']);
    return <div style={width}>
      <MultiValueInput {...args} value={values} onChange={setValues} removable={value => value !== 'owner@company.example'} />
    </div>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tokens = () => canvasElement.querySelectorAll('.grg-multi-value__list .grg-multi-value__token');
    await expect(tokens()[0]).not.toHaveAttribute('data-removable');
    await expect(tokens()[1]).toHaveAttribute('data-removable');
    await userEvent.click(canvas.getByRole('textbox', { name: 'Report recipients' }));
    await userEvent.keyboard('{Backspace}{Backspace}');
    // The removable value goes; the locked one stays
    await waitFor(() => expect(tokens()).toHaveLength(1));
    await expect(tokens()[0]).toHaveTextContent('owner@company.example');
  },
};

/** The product decides which characters a field takes: here account numbers, digits only. */
export const AccountNumbers: Story = {
  name: 'Account numbers',
  args: { label: 'Account numbers', hint: 'Digits only', keyfilter: 'pint' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Account numbers' });
    await userEvent.click(field);
    await userEvent.type(field, '40a81-7{Enter}');
    const list = within(canvasElement.querySelector<HTMLElement>('.grg-multi-value__list')!);
    await expect(list.getByText('40817')).toBeInTheDocument();
  },
};

/** Figma Input chips: at most three rows, then "+N more"; "Show less" folds them back. */
export const ManyValues: Story = {
  name: 'Many values',
  args: { defaultValue: ids, hint: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole('button', { name: /more$/ });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(canvas.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  },
};

/** An error says what is wrong with the values; the application checks them. */
export const UnknownProvider: Story = {
  name: 'Unknown provider',
  args: { defaultValue: [ids[0], 'stripe-eu'], error: 'stripe-eu is not a provider ID', hint: undefined },
};

/** Unavailable until a coin is saved; read-only values can be read and expanded, not changed. */
export const UnavailableAndReadOnly: Story = {
  name: 'Unavailable and read only',
  // Known Figma contrast: disabled text (text-disabled-400) is under 4.5:1, as in every disabled control
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <div style={{ ...width, display: 'grid', gap: 'var(--space-1000)' }}>
      <MultiValueInput label="Availability" defaultValue={ids.slice(0, 2)} disabled hint="Save the coin first" />
      <MultiValueInput label="Availability" defaultValue={ids.slice(0, 2)} readOnly hint="Set by the provider" />
    </div>
  ),
};

/* ---- Overview ---- */

/** Figma Size: lg-44 and md-40 with md-24 chips, sm-32 with sm-20 chips. */
export const Sizes: Story = {
  render: args => (
    <Showcase column>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Variant key={size} caption={`${size}-${{ lg: 44, md: 40, sm: 32 }[size]}`}>
          <div style={width}><MultiValueInput {...args} size={size} label={`Availability (${size})`} defaultValue={['Chip1', 'Chip2', 'Chip3', 'Chip4']} /></div>
        </Variant>
      ))}
    </Showcase>
  ),
  args: { hint: undefined },
};

/** Figma Top & Bottom: required mark, optional text and the key-value pairs above and below. */
export const TopAndBottom: Story = {
  name: 'Top and bottom',
  args: { required: true, optional: true, info: 'IDs from the provider list', topKey: 'Key', topValue: 'Value', bottomValue: 'Value', defaultValue: ['Chip', 'Chip'] },
};
