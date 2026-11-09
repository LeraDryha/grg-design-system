import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ReportingFlow } from './Reporting';
import { screen } from '../shared/screen';
import notVerifiedFrame from '../../assets/design/in-product/reporting/1-not-verified.png';
import verifyingFrame from '../../assets/design/in-product/reporting/2-verifying.png';
import emptyFrame from '../../assets/design/in-product/reporting/3-empty.png';
import generateFrame from '../../assets/design/in-product/reporting/4-generate.png';
import historyFrame from '../../assets/design/in-product/reporting/5-history.png';
import version1Frame from '../../assets/design/in-product/reporting/6-version-1.png';
import version2Frame from '../../assets/design/in-product/reporting/7-version-2.png';

export const frames: [string, string][] = [
  [notVerifiedFrame, '1 · Not verified'], [verifyingFrame, '2 · Verification in progress'], [emptyFrame, '3 · No reports yet'],
  [generateFrame, '4 · Generate a report'], [historyFrame, '5 · Report history'],
  [version1Frame, '6 · Version 1: the parameters on the page'], [version2Frame, '7 · Version 2: the parameters beside the table'],
];

const meta = {
  title: 'In product/Reporting',
  tags: ['ready'],
  component: ReportingFlow,
  decorators: [screen],
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames, the page without the bar and its logo
    design: frames.map(([url, name]) => ({ name, type: 'image', url })),
    // Known Figma contrast: soft text (text-soft-500) in the table is 4.3:1 on white
    a11y: { test: 'todo' },
  },
} satisfies Meta<typeof ReportingFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page to try: generate a report, wait for it, download it as CSV or PDF, delete one and undo. */
export const LiveFlow: Story = { name: 'Live flow' };

/** The checks behind the live flow: they run as tests, and in the Interactions tab. */
export const Walkthrough: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvasElement.querySelectorAll('tbody tr');
    await step('Statement Report is there, not available yet', async () => {
      await expect(canvas.getByRole('tab', { name: 'Statement Report' })).toHaveAttribute('aria-disabled', 'true');
    });
    await step('Generate: the parameters in a modal, then the report is processed', async () => {
      const before = rows().length;
      await userEvent.click(canvas.getByRole('button', { name: 'Generate report' }));
      let modal = within(await canvas.findByRole('dialog', { name: 'Settlement Report' }));
      // Custom period… is a calendar step of the same modal; Apply waits for a day, Back returns to the form
      await userEvent.click(canvas.getByRole('dialog').querySelectorAll<HTMLElement>('.grg-select__box')[2]);
      await userEvent.click(within(await canvas.findByRole('option', { name: 'Custom period…' })).getByText('Custom period…'));
      const step = within(await canvas.findByRole('dialog', { name: 'Custom period' }));
      await expect(step.getByRole('button', { name: 'Apply' })).toBeDisabled();
      await userEvent.click(step.getByRole('button', { name: 'Back' }));
      await expect(await canvas.findByRole('dialog', { name: 'Settlement Report' })).toBeInTheDocument();
      modal = within(canvas.getByRole('dialog', { name: 'Settlement Report' }));
      await userEvent.click(modal.getByText('PDF'));
      await userEvent.click(modal.getByRole('button', { name: 'Generate report' }));
      await waitFor(() => expect(rows().length).toBe(before + 1));
      await expect(canvas.getByRole('progressbar', { name: /Generating report/ })).toBeInTheDocument();
      await waitFor(() => expect(canvas.queryByRole('progressbar', { name: /Generating report/ })).toBeNull(), { timeout: 6000 });
    });
    await step('Delete with Undo', async () => {
      const count = rows().length;
      await userEvent.click(canvas.getAllByRole('button', { name: /^Delete report/ })[0]);
      await waitFor(() => expect(rows().length).toBe(count - 1));
      await userEvent.click(await canvas.findByRole('button', { name: 'Undo' }));
      await waitFor(() => expect(rows().length).toBe(count));
    });
  },
};

/** No reports yet: the table's empty state under the card. */
export const NoReports: Story = { name: 'No reports yet', args: { history: 'none' } };

/** Before verification: the reports open once the business is verified. */
export const NotVerified: Story = { name: 'Not verified', args: { account: 'not-verified' } };

/** While the documents are checked: nothing to do but wait. */
export const Verifying: Story = { name: 'Verification in progress', args: { account: 'verifying' } };
