import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Drawer, DrawerPanel, type DrawerProps } from './Drawer';
import { AccordionKeyValue } from '../Accordion/AccordionKeyValue';
import { ActionButton } from '../ActionButton/ActionButton';
import { Button } from '../Button/Button';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { SwitchLabel } from '../SwitchLabel/SwitchLabel';
import { TextArea } from '../TextArea/TextArea';
import { sampleCoins } from '../Select/samples';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';

/**
 * A stage the size of a screen: the drawer's overlay covers it instead of the whole page
 * (a transformed box holds `position: fixed` children), so docs pages stay readable.
 */
const stage: Decorator = Story => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', height: 680, display: 'grid', placeItems: 'center', background: 'var(--surface-canvas)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/Drawer',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Drawer,
  // The docs page is Drawer.mdx
  parameters: { layout: 'fullscreen' },
  decorators: [stage],
  args: {
    visible: false,
    onHide: () => {},
    title: 'Create payment link',
    description: 'The customer pays by the link',
    size: 'sm',
    footerType: 'basic',
    destructive: false,
    closable: true,
    dismissableMask: false,
    layout: 'auto',
  },
  argTypes: {
    visible: { control: false },
    onHide: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    footerType: { control: 'select', options: ['basic', 'stretch', 'fill', 'button', 'link', 'info', 'checkbox'] },
    layout: { control: 'inline-radio', options: ['auto', 'desktop', 'mobile'] },
    primaryAction: { control: 'object' },
    secondaryAction: { control: 'object' },
    footerExtra: { control: false },
    children: { control: false },
    appendTo: { control: false },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls; the button opens it. */
export const Playground: Story = {
  render: function Playground(args: DrawerProps) {
    const [visible, setVisible] = useState(false);
    const close = () => setVisible(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setVisible(true)}>Open drawer</Button>
        <Drawer appendTo="self" {...args} visible={visible} onHide={close}
          primaryAction={{ label: 'Save', onClick: close }} secondaryAction={{ label: 'Cancel', onClick: close }}>
          <p style={{ margin: 0 }}>The content scrolls between the header and the footer; both stay in place.</p>
        </Drawer>
      </>
    );
  },
};

/* ---- Examples ---- */

/** One task, one drawer: the form, then its result in the same drawer. */
export const CreateAPaymentLink: Story = {
  name: 'Create a payment link',
  render: function CreateAPaymentLink() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<'form' | 'done'>('form');
    const [coin, setCoin] = useState<string | null>('USDT');
    const [amount, setAmount] = useState('');
    const open = () => { setStep('form'); setAmount(''); setVisible(true); };
    const close = () => setVisible(false);
    const done = step === 'done';
    return (
      <>
        <Button variant="primary" leftIcon="plus" onClick={open}>Create payment link</Button>
        <Drawer appendTo="self" visible={visible} onHide={close}
          title={done ? 'Link created' : 'Create payment link'}
          description={done ? 'Share it with your customer' : 'The customer pays by the link'}
          primaryAction={done ? { label: 'Done', onClick: close } : { label: 'Create link', disabled: !Number(amount), onClick: () => setStep('done') }}
          secondaryAction={done ? undefined : { label: 'Cancel', onClick: close }}>
          {done ? (
            <>
              <FeaturedIcon type="success" icon="check-circle-filled" label="Created" />
              <AccordionKeyValue rows={[{ key: 'Amount', value: `${amount} ${coin ?? ''}` }, { key: 'Status', value: 'Created' }]} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>https://pay.example.com/i/a389befa</span>
                <ActionButton icon="copy" size="sm" aria-label="Copy the link" />
              </div>
            </>
          ) : (
            <>
              <Select label="Currency" type="coin" options={sampleCoins} value={coin} onChange={setCoin} required />
              <Input label="Amount" required value={amount} onValueChange={value => setAmount(value.replace(/[^\d.]/g, ''))} unit={coin ?? undefined} />
              <TextArea label="Product description" maxLength={1500} />
              <SwitchLabel label="Auto-conversion" description="Payments turn into EUR as they arrive" />
            </>
          )}
        </Drawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Create payment link' });
    await userEvent.click(trigger);
    const drawer = within(await canvas.findByRole('dialog', { name: 'Create payment link' }));
    // Focus starts in the first field
    await waitFor(() => expect(canvasElement.querySelector('.grg-drawer')!.contains(document.activeElement)).toBe(true));
    await expect(drawer.getByRole('button', { name: 'Create link' })).toBeDisabled();
    // The currency list opens over the drawer, as wide as its field
    const field = canvasElement.querySelector<HTMLElement>('.grg-drawer .grg-select__box')!;
    await userEvent.click(field);
    const list = await waitFor(() => { const el = canvasElement.querySelector<HTMLElement>('.grg-drawer .grg-dropdown[data-placed]'); if (!el) throw new Error('no list'); return el; });
    await expect(Math.abs(list.getBoundingClientRect().width - field.getBoundingClientRect().width)).toBeLessThan(2);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvasElement.querySelector('.grg-drawer .grg-dropdown')).toBeNull());
    await userEvent.type(drawer.getByRole('textbox', { name: /Amount/ }), '1000');
    await userEvent.click(drawer.getByRole('button', { name: 'Create link' }));
    // The result in the same drawer, not a new one
    await expect(await canvas.findByRole('dialog', { name: 'Link created' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('dialog')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Details of one item next to its list: wider, read only, closed with Close or Escape. */
export const DetailsAtAGlance: Story = {
  name: 'Details at a glance',
  render: function DetailsAtAGlance() {
    const [visible, setVisible] = useState(false);
    const close = () => setVisible(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setVisible(true)}>Invoice a389befa</Button>
        <Drawer appendTo="self" visible={visible} onHide={close} size="md" title="Invoice details"
          secondaryAction={{ label: 'Close', onClick: close }}>
          <AccordionKeyValue rows={[
            { key: 'Invoice amount', value: '1,000.00 USDC' },
            { key: 'Received amount', value: '0.00 USDC' },
            { key: 'Created at', value: '08/11/26, 17:05:12' },
            { key: 'Created by', value: 'Rudy Kozey' },
            { key: 'Network', value: '—' },
          ]} />
        </Drawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Invoice a389befa' }));
    const drawer = await canvas.findByRole('dialog', { name: 'Invoice details' });
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    // Nothing to fill in: focus starts on the first button, inside the drawer
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    await userEvent.click(drawer.querySelector<HTMLElement>('[data-modal-action="secondary"]')!);
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/* ---- Overview ---- */

/** sm-480 for a form, md-560 for details; lg-960 holds a form with a preview. */
export const Sizes: Story = {
  decorators: [Story => <div style={{ padding: 'var(--space-600)', background: 'var(--surface-canvas)' }}><Story /></div>],
  render: args => (
    <Showcase>
      <Variant caption="sm-480"><div style={{ height: 360 }}><DrawerPanel {...args} size="sm" secondaryAction={{ label: 'Cancel' }} primaryAction={{ label: 'Save' }}><p style={{ margin: 0 }}>A form</p></DrawerPanel></div></Variant>
      <Variant caption="md-560"><div style={{ height: 360 }}><DrawerPanel {...args} size="md" title="Invoice details" description={undefined} secondaryAction={{ label: 'Close' }}><p style={{ margin: 0 }}>Details</p></DrawerPanel></div></Variant>
    </Showcase>
  ),
};
