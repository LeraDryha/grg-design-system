/** A ready-made period in the list next to the calendar (Figma Period range). `range` gets today's date. */
export type DatePreset = {
  id: string;
  label: string;
  /** The period, or null for no limit ("All time") */
  range: (today: Date) => [Date, Date] | null;
  disabled?: boolean;
};

const day = (date: Date, shift = 0) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + shift);
const monthsBack = (today: Date, months: number) => new Date(today.getFullYear(), today.getMonth() - months, today.getDate() + 1);

/** The Figma presets, in the Figma order */
export const defaultPresets: DatePreset[] = [
  { id: 'all', label: 'All time', range: () => null },
  { id: 'today', label: 'Today', range: today => [day(today), day(today)] },
  { id: 'last-7-days', label: 'Last 7 days', range: today => [day(today, -6), day(today)] },
  { id: 'last-30-days', label: 'Last 30 days', range: today => [day(today, -29), day(today)] },
  { id: 'last-3-months', label: 'Last 3 months', range: today => [monthsBack(today, 3), day(today)] },
  { id: 'last-12-months', label: 'Last 12 months', range: today => [monthsBack(today, 12), day(today)] },
  { id: 'month-to-date', label: 'Month to date', range: today => [new Date(today.getFullYear(), today.getMonth(), 1), day(today)] },
  { id: 'year-to-date', label: 'Year to date', range: today => [new Date(today.getFullYear(), 0, 1), day(today)] },
];

export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
