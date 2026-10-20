import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Select, type SelectProps } from './Select';
import { sampleCoins, sampleCountries, samplePaymentMethods, samplePayments, sampleProviders, sampleUsers } from './samples';
import componentFrame from '../../assets/design/select/select-component.png';
import guidelinesFrame from '../../assets/design/select/select-guidelines.png';

/** A field is 320px wide, as in Figma, with room for the floating label above and the open list below */
const field: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)' }}><Story /></div>;
/** For a list that is open from the start: room for it inside the card */
const withList: Decorator = Story => <div style={{ width: 320, paddingTop: 'var(--space-600)', minHeight: 400 }}><Story /></div>;

/** Opens the list unless it is open already (stories with defaultOpen) */
const openTheList = async (canvasElement: HTMLElement) => {
  // People click the field; the combobox input inside it is visually hidden, as in PrimeReact
  if (!within(canvasElement).queryByRole('listbox')) await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-select__box')!);
};

const meta = {
  title: 'Components/Select',
  component: Select,
  // The docs page is Select.mdx
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'A field that opens a list to choose one or several options.' } },
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Component', type: 'image', url: componentFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    options: samplePayments,
    type: 'common',
    size: 'md',
    label: 'Payment type',
    floatingLabel: true,
    required: false,
    optional: false,
    hint: '',
    error: '',
    icon: true,
    disabled: false,
  },
  argTypes: {
    options: { control: false },
    type: { control: 'select', options: ['common', 'country', 'user', 'payment', 'coin'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
    optional: { control: 'boolean' },
    onChange: { action: 'changed', control: false },
    onValuesChange: { action: 'values changed', control: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLES = { common: samplePayments, country: sampleCountries, user: sampleUsers, payment: samplePaymentMethods, coin: sampleCoins };

/** Try everything in Controls. Choosing a type also picks its sample options. */
export const Playground: Story = {
  decorators: [field],
  render: (args: SelectProps) => <Select {...args} options={SAMPLES[args.type ?? 'common']} />,
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** Countries: a long list gets a search row by itself (more than 10 options). Typing filters the list. */
export const SearchALongList: Story = {
  decorators: [withList],
  args: { type: 'country', label: 'Country of residence', options: sampleCountries, defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTheList(canvasElement);
    const search = await canvas.findByRole('textbox', { name: /search/i });
    await userEvent.type(search, 'po');
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1));
    await expect(canvas.getByRole('option', { name: /poland/i })).toBeVisible();
  },
};

/** Choosing with the keyboard only: Tab to the field, ↓ to open, ↓ to move, Enter to choose. */
export const ChooseWithTheKeyboard: Story = {
  decorators: [field],
  args: { type: 'coin', label: 'Currency', options: sampleCoins },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('combobox')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(canvas.getByText('Ethereum (ETH)')).toBeVisible());
  },
};

/** Several providers at once: checkboxes in the list; the field lists the choices in the order they were picked. */
export const ChooseSeveral: Story = {
  decorators: [field],
  args: { multiple: true, label: 'Cash register', options: sampleProviders, defaultValues: ['payman', 'stripe', 'mastercard', 'crypto', 'visa'], onValuesChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await openTheList(canvasElement);
    await userEvent.click(await canvas.findByText('SWIFT USD'));
    await userEvent.click(canvas.getByText('Adyen'));
    // Picked last, listed last: choice order, not list order (Adyen sits third in the list, SWIFT fifth)
    await waitFor(() => expect(args.onValuesChange).toHaveBeenLastCalledWith(['payman', 'stripe', 'mastercard', 'crypto', 'visa', 'swift', 'adyen']));
    await expect(canvasElement.querySelector('.grg-overflow-summary__text')).toHaveTextContent(/^Payman, Stripe.* and \d others$/);
    await expect(canvas.getByRole('option', { name: /swift usd/i })).toHaveAttribute('aria-selected', 'true');
  },
};

/** A required choice in a form: the error appears when the form is sent without it, and goes once something is chosen. */
export const RequiredInAForm: Story = {
  decorators: [field],
  render: function RequiredInAForm(args: SelectProps) {
    const [value, setValue] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setSent(true);
    };
    return (
      <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 'var(--space-600)' }}>
        <Select {...args} label="Payment type" required value={value} onChange={setValue} error={sent && !value ? 'Choose a payment type' : ''} />
        <Button type="submit" variant="primary">Pay</Button>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Pay' }));
    await expect(await canvas.findByText('Choose a payment type')).toBeVisible();
    await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  },
};

/** People: photos, initials or a company shape, from Avatar. */
export const People: Story = {
  decorators: [field],
  args: { type: 'user', label: 'Assignee', options: sampleUsers, defaultValue: 'warren-fritsch' },
};

/** While the options load, the list shows grey rows (Figma Skeleton). */
export const Loading: Story = {
  decorators: [withList],
  args: { type: 'user', label: 'Assignee', options: sampleUsers, loading: true, searchable: true, defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTheList(canvasElement);
    await expect(await canvas.findByRole('status', { name: 'Loading' })).toBeVisible();
  },
};

/** Nothing to show (Figma Empty): the search found nothing, or the list is empty. */
export const NoResults: Story = {
  decorators: [withList],
  args: { type: 'user', label: 'Assignee', options: [], searchable: true, defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTheList(canvasElement);
    await expect(await canvas.findByText('There are no search results')).toBeVisible();
  },
};

/** A parent form owns the value and can clear it, as with PrimeReact Dropdown. */
export const Controlled: Story = {
  decorators: [field],
  render: function Controlled(args: SelectProps) {
    const [value, setValue] = useState<string | null>('utility');
    return (
      <div style={{ display: 'grid', gap: 'var(--space-400)' }}>
        <Select {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />
        <Button onClick={() => setValue(null)}>Clear selection</Button>
        <output aria-live="polite">Selected: {value ?? 'None'}</output>
      </div>
    );
  },
};

/* ---- Design overview: sizes and states side by side ---- */

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--space-1000) var(--space-800)', paddingTop: 'var(--space-600)' };
const caption: CSSProperties = { font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)', marginBottom: 'var(--space-800)' };
const Cell = ({ title, children, id }: { title: string; children: ReactNode; id?: string }) => (
  <div id={id}><div style={caption}>{title}</div>{children}</div>
);

/** lg-44, md-40 and sm-32. Only the paddings and corners change. */
export const Sizes: Story = {
  render: (args: SelectProps) => (
    <div style={grid}>
      {(['lg', 'md', 'sm'] as const).map(size => (
        <Cell key={size} title={{ lg: 'lg-44', md: 'md-40', sm: 'sm-32' }[size]}>
          <Select {...args} size={size} type="coin" label="Currency" options={sampleCoins} defaultValue="BTC" />
        </Cell>
      ))}
    </div>
  ),
};

/** The look of each state. Hover is shown by Storybook (pseudo-states); focus and the open list are live in the examples above. */
export const States: Story = {
  parameters: { pseudo: { hover: ['#state-hovered .grg-select__box'] } },
  render: (args: SelectProps) => (
    <div style={grid}>
      <Cell title="Default"><Select {...args} /></Cell>
      <Cell title="Filled"><Select {...args} defaultValue="utility" /></Cell>
      <Cell title="Hovered" id="state-hovered"><Select {...args} defaultValue="utility" /></Cell>
      <Cell title="Error"><Select {...args} required error="Choose a payment type" /></Cell>
      <Cell title="Disabled"><Select {...args} disabled defaultValue="utility" /></Cell>
    </div>
  ),
};
