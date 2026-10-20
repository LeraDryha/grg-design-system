import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker, type DatePickerProps, type DatePickerValue } from './DatePicker';
import { DatePickerPanel } from './DatePickerPanel';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import { dateLocale } from '../../locale/dates';
import componentFrame from '../../assets/design/date-picker/date-picker-component.png';
import dayCellFrame from '../../assets/design/date-picker/date-picker-day-cell.png';
import monthFrame from '../../assets/design/date-picker/date-picker-month.png';
import periodRangeFrame from '../../assets/design/date-picker/date-picker-period-range.png';
import guidelinesFrame from '../../assets/design/date-picker/date-picker-guidelines.png';

/** A field is 320px wide, as in Figma, with room for the floating label above and the open calendar under it */
const field: Decorator = Story => <div style={{ width: 320, minHeight: 480, paddingTop: 'var(--space-600)' }}><Story /></div>;
const wideField: Decorator = Story => <div style={{ width: 320, minHeight: 480, paddingTop: 'var(--space-600)', marginRight: 520 }}><Story /></div>;

/** Opens the calendar from the field, as a click does */
const openCalendar = async (canvasElement: HTMLElement) => {
  await userEvent.click(canvasElement.querySelector<HTMLElement>('.grg-input__box')!);
  return within(canvasElement).findByRole('dialog');
};

const meta = {
  title: 'Components/Date Picker',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: DatePicker,
  // The docs page is DatePicker.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Date picker', type: 'image', url: componentFrame },
      { name: 'Day cell', type: 'image', url: dayCellFrame },
      { name: 'Month', type: 'image', url: monthFrame },
      { name: 'Period range', type: 'image', url: periodRangeFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: { label: 'Due date', selectionMode: 'single', double: false, presets: false, disabled: false, hint: '', error: '' },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['single', 'range'] },
    view: { control: 'inline-radio', options: ['date', 'month'] },
    locale: { control: 'select', options: [undefined, 'en-GB', 'en-US', 'uk-UA', 'de-DE'], labels: { undefined: 'page language' } },
    presets: { control: 'boolean' },
    onChange: { action: 'changed', control: false },
    minDate: { control: 'date' },
    maxDate: { control: 'date' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Turn on Range, Double and Presets for the filter calendar. */
export const Playground: Story = { decorators: [wideField] };

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A due date: click the field, choose a day; the calendar closes and the field shows the date. */
export const PickADueDate: Story = {
  name: 'Pick a due date',
  decorators: [field],
  args: { onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = await openCalendar(canvasElement);
    const today = new Date();
    const day = new Date(today.getFullYear(), today.getMonth(), 15);
    await userEvent.click(within(calendar).getAllByText('15').find(el => el.closest('td')?.getAttribute('data-p-other-month') !== 'true')!);
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await expect(canvas.getByLabelText('Due date')).toHaveValue(dateLocale().format(day));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/** Type it, or use the keyboard: digits fall into the locale's format; ↓ opens the calendar on that day, Escape returns. */
export const TypeOrUseTheKeyboard: Story = {
  name: 'Type or use the keyboard',
  decorators: [field],
  args: { label: 'Date of birth' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date of birth');
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');
    await userEvent.type(input, '05012026');
    // The Storybook locale is en-GB: day, month, year
    await expect(input).toHaveValue('05/01/2026');
    await userEvent.keyboard('{ArrowDown}');
    // Focus lands on that day, which screen readers hear in full
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Monday, 5 January 2026'));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await waitFor(() => expect(input).toHaveValue('06/01/2026'));
    await expect(input).toHaveFocus();
  },
};

/** A period for a report: two months, ready-made periods, and the choice applies on Apply. */
export const ChooseAPeriod: Story = {
  name: 'Choose a period',
  decorators: [wideField],
  args: { label: 'Period', selectionMode: 'range', double: true, presets: true, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = await openCalendar(canvasElement);
    await userEvent.click(within(calendar).getByRole('option', { name: 'Last 7 days' }));
    // Nothing is applied until Apply
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(within(calendar).getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    const dl = dateLocale();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    await expect(canvas.getByLabelText('Period')).toHaveValue(`${dl.format(start)} – ${dl.format(today)}`);
  },
};

/** The same date in three locales: the order, the separator and the first day of the week follow each one. */
export const FollowTheLocale: Story = {
  name: 'Follow the locale',
  render: (args: DatePickerProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-1000)', width: 320, minHeight: 520, paddingTop: 'var(--space-600)' }}>
      <DatePicker {...args} label="United Kingdom (en-GB)" locale="en-GB" defaultValue={new Date(2026, 0, 5)} />
      <DatePicker {...args} label="United States (en-US)" locale="en-US" defaultValue={new Date(2026, 0, 5)} />
      <DatePicker {...args} label="Ukraine (uk-UA)" locale="uk-UA" defaultValue={new Date(2026, 0, 5)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('United Kingdom (en-GB)')).toHaveValue('05/01/2026');
    await expect(canvas.getByLabelText('United States (en-US)')).toHaveValue('01/05/2026');
    await expect(canvas.getByLabelText('Ukraine (uk-UA)')).toHaveValue('05.01.2026');
  },
};

/** Another year: the month and year lists jump straight there. */
export const JumpToAnotherYear: Story = {
  name: 'Jump to another year',
  decorators: [field],
  args: { label: 'Contract start', defaultValue: new Date(2026, 4, 12) },
  play: async ({ canvasElement }) => {
    const calendar = within(await openCalendar(canvasElement));
    await userEvent.click(calendar.getByRole('button', { name: '2026' }));
    // A click lands on the row's text, as a pointer does (the row element itself only lays it out)
    await userEvent.click(within(await calendar.findByRole('menuitem', { name: '2029' })).getByText('2029'));
    await waitFor(() => expect(calendar.getByRole('button', { name: '2029' })).toBeVisible());
    await userEvent.click(calendar.getByRole('button', { name: 'May' }));
    await userEvent.click(within(await calendar.findByRole('menuitem', { name: 'September' })).getByText('September'));
    await waitFor(() => expect(calendar.getByRole('button', { name: 'September' })).toBeVisible());
  },
};

/** Only some dates allowed: days before today and more than 30 days ahead can't be chosen. */
export const LimitTheDates: Story = {
  name: 'Limit the dates',
  decorators: [field],
  render: function LimitTheDates(args: DatePickerProps) {
    const [today] = useState(() => new Date());
    return <DatePicker {...args} label="Delivery date" minDate={today} maxDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)} />;
  },
  play: async ({ canvasElement }) => {
    const calendar = await openCalendar(canvasElement);
    const today = new Date();
    if (today.getDate() > 1) {
      const cell = calendar.querySelector(`td[data-p-day="${today.getDate() - 1}"][data-p-month="${today.getMonth()}"]:not([data-p-other-month="true"]) [role="gridcell"]`);
      await expect(cell).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

/** A whole month, such as for a statement: the Month grid instead of days. */
export const ChooseAMonth: Story = {
  name: 'Choose a month',
  decorators: [field],
  args: { label: 'Statement month', view: 'month' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = within(await openCalendar(canvasElement));
    await userEvent.click(calendar.getByText('Mar'));
    await waitFor(() => expect(canvas.getByLabelText('Statement month')).toHaveValue(`March ${new Date().getFullYear()}`));
  },
};

/** Start over: Reset clears the period in the calendar; nothing changes until Apply. */
export const StartOver: Story = {
  name: 'Start over',
  render: function StartOver() {
    const [value, setValue] = useState<DatePickerValue>([new Date(2026, 0, 12), new Date(2026, 0, 20)]);
    const onChange = fn((next: DatePickerValue) => setValue(next));
    return (
      <div style={{ display: 'grid', gap: 'var(--space-300)', justifyItems: 'start' }}>
        <DatePickerPanel selectionMode="range" value={value} onChange={onChange} />
        <output style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>
          {Array.isArray(value) && value[0] ? 'A period is chosen' : 'No period'}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-range]').length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvasElement.querySelectorAll('[data-range]')).toHaveLength(0);
    await expect(canvas.getByText('A period is chosen')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByText('No period')).toBeVisible();
  },
};

/** Not available right now: the field can't be opened. */
export const Unavailable: Story = {
  decorators: [field],
  args: { disabled: true, defaultValue: new Date(2026, 0, 5) },
  // Known contrast note: the Figma disabled text grey is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
};

/* ---- Overview: the open calendar on its own (Figma Date picker) ---- */

/** Default (one date), Range (two months, Reset and Apply) and Presets. */
export const Types: Story = {
  render: () => (
    <Showcase column>
      <Variant caption="Default: one date"><DatePickerPanel value={new Date(2026, 0, 16)} /></Variant>
      <Variant caption="Range: two months, Reset and Apply"><DatePickerPanel selectionMode="range" double value={[new Date(2026, 0, 16), new Date(2026, 1, 4)]} /></Variant>
      <Variant caption="Presets"><DatePickerPanel selectionMode="range" double presets value={[new Date(2026, 0, 16), new Date(2026, 1, 12)]} /></Variant>
    </Showcase>
  ),
};
