import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Modal, ModalFooter, ModalHeader, ModalPanel, type ModalFooterType, type ModalProps } from './Modal';
import { Button } from '../Button/Button';
import { CheckboxLabel } from '../CheckboxLabel/CheckboxLabel';
import { HintText } from '../FormField/FormField';
import { Icon } from '../Icon/Icon';
import { InputOtp } from '../InputOtp/InputOtp';
import { Link } from '../Link/Link';
import { Select } from '../Select/Select';
import { StepperDot } from '../StepperDot/StepperDot';
import { sampleUsers } from '../Select/samples';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import headerFrame from '../../assets/design/modal/modal-header.png';
import footerFrame from '../../assets/design/modal/modal-footer.png';
import rulesFrame from '../../assets/design/modal/modal-rules.png';
import mobileRulesFrame from '../../assets/design/modal/modal-rules-mobile.png';
import guidelinesFrame from '../../assets/design/modal/modal-guidelines.png';

/**
 * A stage the size of a screen: the modal's overlay covers it instead of the whole page
 * (a transformed box holds `position: fixed` children), so docs pages stay readable.
 */
const stage = (width: number | string = '100%', height = 680): Decorator => Story => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width, maxWidth: '100%', height, margin: '0 auto', display: 'grid', placeItems: 'center', background: 'var(--surface-canvas)' }}>
    <Story />
  </div>
);

type DemoProps = Omit<ModalProps, 'visible' | 'onHide' | 'primaryAction' | 'secondaryAction'> & {
  /** The button that opens it */
  trigger: string;
  open?: boolean;
  primary?: string;
  secondary?: string;
  /** What the main action does before the modal closes; return false to keep it open */
  onPrimary?: () => boolean | void;
  children?: ReactNode;
};

/** A trigger button and its modal; both actions close it. */
function Demo({ trigger, open = false, primary, secondary, onPrimary, ...props }: DemoProps) {
  const [visible, setVisible] = useState(open);
  const close = () => setVisible(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setVisible(true)}>{trigger}</Button>
      <Modal
        appendTo="self"
        {...props}
        visible={visible}
        onHide={close}
        primaryAction={primary ? { label: primary, onClick: () => { if (onPrimary?.() !== false) close(); } } : undefined}
        secondaryAction={secondary ? { label: secondary, onClick: close } : undefined}
      />
    </>
  );
}

const dialog = (canvasElement: HTMLElement) => within(canvasElement).findByRole('dialog');
async function open(canvasElement: HTMLElement, trigger: string) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: trigger }));
  return dialog(canvasElement);
}

const meta = {
  title: 'Components/Modal',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: Modal,
  // The docs page is Modal.mdx
  parameters: {
    layout: 'fullscreen',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Modal header', type: 'image', url: headerFrame },
      { name: 'Modal footer', type: 'image', url: footerFrame },
      { name: 'Combining items', type: 'image', url: rulesFrame },
      { name: 'Combining items on mobile', type: 'image', url: mobileRulesFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  args: {
    visible: false,
    onHide: () => {},
    title: 'Blog post published',
    description: 'This blog post has been published. Team members will be able to edit this post and republish changes.',
    align: 'center',
    status: 'success',
    size: 'sm',
    height: 'auto',
    footerType: 'fill',
    destructive: false,
    layout: 'auto',
    dismissableMask: false,
    closable: true,
  },
  argTypes: {
    visible: { control: false },
    onHide: { control: false },
    align: { control: 'inline-radio', options: ['center', 'left', 'horizontal'] },
    status: { control: 'select', options: [undefined, 'success', 'info', 'warning', 'error', 'neutral', 'primary'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    height: { control: 'inline-radio', options: ['auto', 'full'] },
    footerType: { control: 'select', options: ['stretch', 'fill', 'basic', 'button', 'link', 'stepper', 'info', 'checkbox'] },
    layout: { control: 'inline-radio', options: ['auto', 'desktop', 'mobile'] },
    primaryAction: { control: 'object' },
    secondaryAction: { control: 'object' },
    footerExtra: { control: false },
    children: { control: false },
    appendTo: { control: false },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls. Open on its own page; on the docs page it waits for the button. */
export const Playground: Story = {
  decorators: [stage()],
  render: function Playground(args, { viewMode }) {
    return <Demo {...args} trigger="Open modal" open={viewMode === 'story'} primary="Confirm" secondary="Cancel" />;
  },
};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** A short confirmation: a status icon, the result, two buttons. Focus starts on the main action; Escape closes. */
export const BlogPostPublished: Story = {
  decorators: [stage()],
  name: 'Blog post published',
  render: () => (
    <Demo trigger="Publish post" title="Blog post published" status="success" footerType="fill" primary="Confirm" secondary="Cancel"
      description="This blog post has been published. Team members will be able to edit this post and republish changes." />
  ),
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Publish post');
    await expect(modal).toHaveAccessibleName('Blog post published');
    await expect(modal).toHaveAccessibleDescription(/team members will be able to edit/i);
    await waitFor(() => expect(within(modal).getByRole('button', { name: 'Confirm' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(canvasElement).queryByRole('dialog')).toBeNull());
    // Focus goes back to the button that opened it
    await expect(within(canvasElement).getByRole('button', { name: 'Publish post' })).toHaveFocus();
  },
};

/** Something that can't be undone: the main action is red and focus starts on Cancel, the safe way out. */
export const DeleteInvoice: Story = {
  decorators: [stage()],
  name: 'Delete invoice',
  render: () => (
    <Demo trigger="Delete invoice" title="Delete invoice?" status="error" footerType="fill" destructive primary="Delete" secondary="Cancel"
      description="This action will permanently delete the invoice and all related data. You won’t be able to undo this." />
  ),
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Delete invoice');
    await waitFor(() => expect(within(modal).getByRole('button', { name: 'Cancel' })).toHaveFocus());
    // Tab stays inside the modal
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(modal.contains(document.activeElement)).toBe(true);
  },
};

/** A form in the content: fields get 40px between them and 20px above the first for its floating label. Focus starts in the first field. */
export const SelectUser: Story = {
  decorators: [stage()],
  name: 'Select user',
  render: function SelectUser() {
    const [user, setUser] = useState<string | null>('warren-fritsch');
    const [level, setLevel] = useState<string | null>(null);
    return (
      <Demo trigger="Share post" title="Share post" align="left" footerType="basic" primary="Share" secondary="Cancel"
        description="Choose who can edit this post and what they can change.">
        <Select type="user" label="Select user" options={sampleUsers} value={user} onChange={setUser} />
        <Select label="Select permission level" value={level} onChange={setLevel}
          options={[{ value: 'view', label: 'Can view' }, { value: 'edit', label: 'Can edit' }, { value: 'admin', label: 'Admin' }]} />
      </Demo>
    );
  },
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Share post');
    await waitFor(() => expect(within(modal).getByRole('combobox', { name: 'Select user' })).toHaveFocus());
    await userEvent.click(within(modal).getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(within(canvasElement).queryByRole('dialog')).toBeNull());
  },
};

/** The code check from Input Otp, in its Figma Modal: back arrow, mail icon, the code, then Verify. */
export const CheckYourEmail: Story = {
  decorators: [stage()],
  name: 'Check your email',
  render: function CheckYourEmail() {
    const [code, setCode] = useState('');
    return (
      <Demo trigger="Verify email" title="Please check your email" status="neutral" statusIcon="mail" onBack={() => {}}
        description={<>We've sent a code to <strong>olivia@mail.com</strong></>}
        footerType="fill" primary="Verify" secondary="Cancel" onPrimary={() => code.length === 6}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-300)' }}>
          <InputOtp label="Verification code" characters="digits" value={code} onValueChange={setCode} />
          <span style={{ display: 'flex', alignItems: 'center', font: 'var(--typo-body-md-regular)', color: 'var(--text-soft-500)' }}>
            Didn’t receive the code?<Button variant="text" size="sm">Click to resend</Button>
          </span>
        </div>
      </Demo>
    );
  },
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Verify email');
    await waitFor(() => expect(within(modal).getByRole('button', { name: 'Back' })).toBeVisible());
    // Focus starts in the first cell of the code
    await waitFor(() => expect(within(modal).getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveFocus());
    await userEvent.keyboard('482913');
    await userEvent.click(within(modal).getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(within(canvasElement).queryByRole('dialog')).toBeNull());
  },
};

/** Onboarding in steps: the dots show where people are, the back arrow appears from the second step. */
export const WelcomeTour: Story = {
  decorators: [stage()],
  name: 'Welcome tour',
  render: function WelcomeTour() {
    const steps = [
      { icon: 'layout' as const, title: 'Welcome to your dashboard', text: 'Here are some tips to get you up and running.' },
      { icon: 'wallet' as const, title: 'Your assets in one place', text: 'Balances from every account and custody, updated as they change.' },
      { icon: 'chart-line' as const, title: 'Follow the market', text: 'Rates and charts for the assets you hold.' },
      { icon: 'shield-check' as const, title: 'Safe by default', text: 'Every operation is checked and recorded.' },
    ];
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const close = () => { setVisible(false); setStep(0); };
    return (
      <>
        <Button variant="secondary" onClick={() => setVisible(true)}>Start tour</Button>
        <Modal appendTo="self" visible={visible} onHide={close} size="md" closable={false}
          title={steps[step].title} description={steps[step].text}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
          footerType="stepper" footerExtra={<StepperDot steps={steps.length} current={step + 1} />}
          secondaryAction={{ label: 'Skip', onClick: close }}
          primaryAction={{ label: step === steps.length - 1 ? 'Finish' : 'Continue', onClick: () => (step === steps.length - 1 ? close() : setStep(step + 1)) }}>
          {/* A neutral picture of the step, in the place of the product screenshot in Figma */}
          <div aria-hidden="true" style={{ display: 'grid', placeItems: 'center', height: 'calc(var(--space-5000) + var(--space-1000))', borderRadius: 'var(--radius-lg-12)', background: 'var(--primary-gold-muted-50)', color: 'var(--primary-gold-base)' }}>
            <Icon name={steps[step].icon} size={32} />
          </div>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Start tour');
    await expect(within(modal).getByText('Step 1 of 4')).toBeInTheDocument();
    await expect(within(modal).queryByRole('button', { name: 'Back' })).toBeNull();
    await userEvent.click(within(modal).getByRole('button', { name: 'Continue' }));
    await expect(within(modal).getByText('Step 2 of 4')).toBeInTheDocument();
    await expect(modal).toHaveAccessibleName('Your assets in one place');
    await userEvent.click(within(modal).getByRole('button', { name: 'Back' }));
    await expect(within(modal).getByText('Step 1 of 4')).toBeInTheDocument();
  },
};

const terms = Array.from({ length: 8 }, (_, i) => (
  <p key={i} style={{ margin: 0 }}>
    {i + 1}. The service is provided as is. Rates shown are indicative and may change before an operation is confirmed.
    Operations are recorded and can be reviewed in the history for seven years. Fees depend on the asset and the network
    and are shown before every confirmation. Contact support for any question about these terms.
  </p>
));

/** Long content: Full height keeps 40px above and below; the header and the buttons stay, the text scrolls. */
export const TermsOfService: Story = {
  decorators: [stage()],
  name: 'Terms of service',
  render: () => (
    <Demo trigger="Read the terms" title="Terms of service" align="horizontal" status="info" size="md" height="full"
      description="Updated 1 October 2026" footerType="basic" primary="Accept" secondary="Decline">
      {terms}
    </Demo>
  ),
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Read the terms');
    const content = modal.querySelector<HTMLElement>('.grg-modal__content')!;
    await waitFor(() => expect(content.scrollHeight).toBeGreaterThan(content.clientHeight));
    // The scrolling text takes focus, so the keyboard can scroll it
    await expect(content).toHaveAttribute('tabindex', '0');
  },
};

/** Something to read, nothing to lose: a click on the overlay closes it too. */
export const WhatsNew: Story = {
  decorators: [stage()],
  name: 'What’s new',
  render: () => (
    <Demo trigger="What’s new" title="Statements now arrive on the 1st" status="primary" statusIcon="file" dismissableMask
      description="Monthly statements are ready on the first day of every month, for every account." footerType="link"
      footerExtra={<Link href="#" size="md">Learn more</Link>} primary="Got it" />
  ),
  play: async ({ canvasElement }) => {
    await open(canvasElement, 'What’s new');
    const mask = canvasElement.querySelector<HTMLElement>('.grg-modal-mask')!;
    await userEvent.click(mask, { skipHover: true });
    await waitFor(() => expect(within(canvasElement).queryByRole('dialog')).toBeNull());
  },
};

/** On a phone the modal is a bottom sheet: full width, rounded on top, every button full width with the main one on top. */
export const OnAPhone: Story = {
  name: 'On a phone',
  decorators: [stage(375, 720)],
  render: () => (
    <Demo trigger="Reset settings" title="Reset settings?" layout="mobile" footerType="checkbox"
      description="Your layout and filters go back to the defaults." primary="Reset" secondary="Cancel"
      footerExtra={<CheckboxLabel label="Don’t show again" />} />
  ),
  play: async ({ canvasElement }) => {
    const modal = await open(canvasElement, 'Reset settings');
    await expect(modal.querySelector('.grg-modal')).toHaveAttribute('data-layout', 'mobile');
    await expect(canvasElement.querySelector('.grg-modal-mask')).toHaveAttribute('data-sheet');
  },
};

/* ---- Overview: the parts, without the overlay ---- */

const panel = { display: 'grid', gap: 'var(--space-800)', padding: 'var(--space-800)', justifyItems: 'center' } as const;
const surface = { borderRadius: 'var(--radius-xl-16)', background: 'var(--surface-floating)', boxShadow: 'var(--shadow-md)', width: 'calc(var(--space-5000) * 2 + var(--space-1000))' } as const;

/** Figma Modal header Type: Center aligned (with the back arrow), Left aligned, Horizontal left aligned. */
export const HeaderTypes: Story = {
  render: () => (
    <div style={panel}>
      <Showcase>
        {([['center', 'Center aligned'], ['left', 'Left aligned'], ['horizontal', 'Horizontal left aligned']] as const).map(([align, caption]) => (
          <Variant key={align} caption={caption}>
            <div style={{ ...surface, paddingBottom: 'var(--space-800)' }}>
              <ModalHeader align={align} status="success" title="Modal title" description="Modal description here!" onBack={() => {}} onClose={() => {}} />
            </div>
          </Variant>
        ))}
      </Showcase>
    </div>
  ),
};

const footerExtras: Partial<Record<ModalFooterType, ReactNode>> = {
  button: <Button variant="text" size="lg">View details</Button>,
  link: <Link href="#">View details</Link>,
  stepper: <StepperDot />,
  info: <HintText iconName="information-circle-filled">This is a hint text.</HintText>,
  checkbox: <CheckboxLabel label="Don’t show again" />,
};
const footerTypes: [ModalFooterType, string][] = [
  ['stretch', 'Stretch'], ['fill', 'Fill'], ['basic', 'Basic'], ['button', 'Button'],
  ['link', 'Link button'], ['stepper', 'Stepper'], ['info', 'Info'], ['checkbox', 'Checkbox'],
];

/** Figma Modal footer Type, desktop. Destructive turns the main action red. */
export const FooterTypes: Story = {
  render: () => (
    <div style={panel}>
      <Showcase>
        {footerTypes.map(([type, caption]) => (
          <Variant key={type} caption={caption}>
            <div style={surface}>
              <ModalFooter type={type} extra={footerExtras[type]} primary={{ label: 'Confirm' }} secondary={{ label: 'Cancel' }} destructive={type === 'basic'} />
            </div>
          </Variant>
        ))}
      </Showcase>
    </div>
  ),
};

/** The same types on mobile: one column, the main action on top; the stepper above, the rest below. */
export const MobileFooters: Story = {
  render: () => (
    <div style={panel}>
      <Showcase>
        {footerTypes.filter(([type]) => !['stretch', 'fill'].includes(type)).map(([type, caption]) => (
          <Variant key={type} caption={caption}>
            <div style={{ ...surface, width: 'calc(var(--space-5000) + var(--space-4000) - var(--space-400) - 1px)' }}>
              <ModalFooter type={type} extra={footerExtras[type]} primary={{ label: 'Confirm' }} secondary={{ label: 'Cancel' }} mobile />
            </div>
          </Variant>
        ))}
      </Showcase>
    </div>
  ),
};

/** Widths sm-440, md-600 and lg-880: the content decides; on mobile the sheet is the screen's width. */
export const Sizes: Story = {
  render: () => (
    <div style={panel}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Variant key={size} caption={{ sm: 'sm · 440px', md: 'md · 600px', lg: 'lg · 880px' }[size]}>
          <ModalPanel size={size} title="Blog post published" status="success" align={size === 'sm' ? 'center' : 'left'}
            description="This blog post has been published. Team members will be able to edit this post and republish changes."
            footerType={size === 'sm' ? 'fill' : 'basic'} primaryAction={{ label: 'Confirm' }} secondaryAction={{ label: 'Cancel' }} onClose={() => {}} />
        </Variant>
      ))}
    </div>
  ),
};
