import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FileUpload, type FileUploadProps, type UploadFile } from './FileUpload';
import { FileCard } from './FileCard';
import { FileIcon, fileFormats } from '../FileIcon/FileIcon';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { Modal } from '../Modal/Modal';
import { ImageCrop, cropImage, defaultCrop, type Crop } from './ImageCrop';
import testLogo from '../../assets/test/company-logo.svg';
import { Showcase, Variant } from '../../docs/blocks/DocBlocks';
import componentFrame from '../../assets/design/file-upload/file-upload-component.png';
import cardsFrame from '../../assets/design/file-upload/file-upload-cards.png';
import iconsFrame from '../../assets/design/file-upload/file-upload-icons.png';
import guidelinesFrame from '../../assets/design/file-upload/file-upload-guidelines.png';

const MB = 1024 * 1024;
const IMAGES_HINT = 'JPEG, JPG, PNG, SVG formats, up to 5 MB.';
// A story with its own stage (a modal flow) sets parameters.stage and skips the narrow column
const width: Decorator = (Story, { parameters }) => (parameters.stage ? <Story /> : <div style={{ width: 'min(400px, 100%)' }}><Story /></div>);
/** A screen-sized stage: the modal opens inside it, as on the Modal page */
const stage: Decorator = Story => (
  <div style={{ position: 'relative', transform: 'translateZ(0)', overflow: 'hidden', width: '100%', height: 760, display: 'grid', placeItems: 'center', background: 'var(--surface-canvas)' }}>
    <Story />
  </div>
);

/**
 * Stands in for the product's upload: each chosen file climbs to 100% and completes. A file with "fail" in its name
 * stops halfway and fails, so the stories can show Try again.
 */
function useFakeUpload(initial: UploadFile[] = [], { multiple = true, step = 25 } = {}) {
  const [files, setFiles] = useState<UploadFile[]>(initial);
  const timers = useRef(new Map<string, ReturnType<typeof setInterval>>());
  useEffect(() => () => timers.current.forEach(clearInterval), []);
  const run = (id: string, fails: boolean) => {
    clearInterval(timers.current.get(id));
    timers.current.set(id, setInterval(() => {
      setFiles(list => list.map(f => {
        if (f.id !== id || f.status !== 'uploading') return f;
        const progress = (f.progress ?? 0) + step;
        if (fails && progress >= 50) { clearInterval(timers.current.get(id)); return { ...f, status: 'failed', progress: 0, retryable: true }; }
        if (progress >= 100) { clearInterval(timers.current.get(id)); return { ...f, status: 'completed', progress: 100 }; }
        return { ...f, progress };
      }));
    }, 120));
  };
  return {
    files,
    onSelect: (chosen: File[]) => {
      const added = chosen.map(file => ({ id: `${file.name}-${Math.random().toString(36).slice(2)}`, name: file.name, size: file.size, status: 'uploading' as const, progress: 0 }));
      setFiles(list => (multiple ? [...list, ...added] : added));
      added.forEach(f => run(f.id, f.name.includes('fail')));
    },
    onCancel: (id: string) => { clearInterval(timers.current.get(id)); setFiles(list => list.filter(f => f.id !== id)); },
    onRemove: (id: string) => setFiles(list => list.filter(f => f.id !== id)),
    onRetry: (id: string) => {
      setFiles(list => list.map(f => (f.id === id ? { ...f, status: 'uploading', progress: 0 } : f)));
      // The second try goes through
      run(id, false);
    },
  };
}

/** A FileUpload wired to the stand-in upload */
function Uploader({ initial, ...props }: FileUploadProps & { initial?: UploadFile[] }) {
  const upload = useFakeUpload(initial, { multiple: props.multiple });
  return <FileUpload {...props} {...upload} />;
}

const fileOf = (name: string, size: number, type = '') => new File([new Uint8Array(size)], name, { type });
const input = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;

const meta = {
  title: 'Components/File Upload',
  // Status: ready, in-progress or draft. Shown in the page header; in-progress and draft also in the sidebar
  tags: ['ready'],
  component: FileUpload,
  // The docs page is FileUpload.mdx
  parameters: {
    layout: 'centered',
    // The Design tab: the Figma frames as images (the company's file isn't linked publicly)
    design: [
      { name: 'Upload area', type: 'image', url: componentFrame },
      { name: 'File upload cards', type: 'image', url: cardsFrame },
      { name: 'File format icons', type: 'image', url: iconsFrame },
      { name: 'Guidelines', type: 'image', url: guidelinesFrame },
    ],
  },
  decorators: [width],
  args: { hint: IMAGES_HINT, multiple: false, disabled: false },
  argTypes: {
    accept: { control: 'text' },
    maxFileSize: { control: 'number' },
    files: { control: false },
    onSelect: { action: 'selected', control: false },
  },
  render: (args: FileUploadProps) => <Uploader {...args} />,
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit everything in Controls; choose or drop a file to see the card. */
export const Playground: Story = {};

/* ---- Examples: real tasks, each one a live story with a check of its behaviour ---- */

/** One file: the card shows the progress, then Completed. */
export const UploadAFile: Story = {
  name: 'Upload a file',
  args: { hint: 'PDF or DOCX, up to 10 MB.', accept: '.pdf,.docx', maxFileSize: 10 * MB },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), fileOf('my_cv.pdf', 120 * 1024, 'application/pdf'));
    await expect(await canvas.findByText('Uploading...')).toBeVisible();
    await waitFor(() => expect(canvas.getByText('Completed')).toBeVisible(), { timeout: 3000 });
    await expect(canvas.getByText('120 KB of 120 KB')).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('my_cv.pdf uploaded'));
  },
};

/** Several files: each has its own card and progress. */
export const SeveralFiles: Story = {
  name: 'Several files',
  args: { multiple: true, hint: 'PDF, DOCX or XLSX, up to 10 MB each.', accept: '.pdf,.docx,.xlsx', maxFileSize: 10 * MB },
  render: (args: FileUploadProps) => (
    <Uploader {...args} initial={[{ id: 'certificate', name: 'certificate.pdf', size: 120 * 1024, status: 'completed' }]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), [fileOf('contract.docx', 340 * 1024), fileOf('statement.xlsx', 2.4 * MB)]);
    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(3));
    await waitFor(() => expect(canvas.getAllByText('Completed')).toHaveLength(3), { timeout: 3000 });
  },
};

/** A file that is too big: a Failed card says why; "Try again" wouldn't help, so there is none. */
export const AFileTooBig: Story = {
  name: 'A file too big',
  args: { accept: 'image/png,image/jpeg,.svg', maxFileSize: 5 * MB },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zone = canvasElement.querySelector<HTMLElement>('.grg-file-upload__zone')!;
    await userEvent.upload(input(canvasElement), fileOf('team-photo.png', 6 * MB, 'image/png'));
    // No card: the zone turns red and the reason is under it, read with the zone
    await expect(await canvas.findByText('team-photo.png is larger than 5 MB.')).toBeVisible();
    await expect(zone).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.queryByRole('listitem')).toBeNull();
    // A file that fits clears the error
    await userEvent.upload(input(canvasElement), fileOf('team-photo-small.png', 2 * MB, 'image/png'));
    await waitFor(() => expect(canvas.queryByText('team-photo.png is larger than 5 MB.')).toBeNull());
    await expect(zone).not.toHaveAttribute('aria-invalid');
  },
};

/** The upload failed: "Try again" sends the file once more. */
export const TryAgain: Story = {
  name: 'Try again',
  args: { hint: 'PDF, up to 10 MB.', accept: '.pdf', maxFileSize: 10 * MB },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The stand-in upload fails files with "fail" in the name
    await userEvent.upload(input(canvasElement), fileOf('invoice-fail.pdf', 80 * 1024, 'application/pdf'));
    const retry = await canvas.findByRole('button', { name: 'Try again: invoice-fail.pdf' }, { timeout: 3000 });
    await userEvent.click(retry);
    await waitFor(() => expect(canvas.getByText('Completed')).toBeVisible(), { timeout: 3000 });
  },
};

/** With the keyboard: Tab to the drop zone, Enter opens the file dialog; Tab reaches each card's action. */
export const UseTheKeyboard: Story = {
  name: 'Use the keyboard',
  args: { multiple: true, hint: 'PDF, up to 10 MB.' },
  render: (args: FileUploadProps) => (
    <Uploader {...args} initial={[{ id: 'certificate', name: 'certificate.pdf', size: 120 * 1024, status: 'completed' }]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /click to upload or drag and drop.*pdf/i })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Remove certificate.pdf' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByText('certificate.pdf')).toBeNull());
  },
};

/** A logo: one image; a new file replaces the old one. */
export const UploadALogo: Story = {
  name: 'Upload a logo',
  args: { accept: 'image/png,image/jpeg,.svg', maxFileSize: 5 * MB },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), fileOf('logo.png', 48 * 1024, 'image/png'));
    await userEvent.upload(input(canvasElement), fileOf('logo-new.svg', 12 * 1024, 'image/svg+xml'));
    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(1));
    await expect(canvas.getByText('logo-new.svg')).toBeVisible();
  },
};

/** The logo flow from Figma (Upload photo flow): the avatar opens Upload logo; the chosen picture is cropped in the
 *  same modal (back returns to the upload), then shows in the avatar. With a logo, the avatar opens Edit logo and
 *  Remove; Edit logo crops the original again. */
export const CropALogo: Story = {
  name: 'Crop a logo',
  parameters: { stage: true, layout: 'fullscreen' },
  decorators: [stage],
  render: function CropALogo() {
    const [logo, setLogo] = useState<{ src: string; original: string; crop: Crop } | null>(null);
    const [step, setStep] = useState<null | 'upload' | 'crop' | 'edit'>(null);
    const [draft, setDraft] = useState<{ src: string; crop: Crop } | null>(null);
    const close = () => setStep(null);
    const save = async () => {
      if (!draft) return;
      setLogo({ src: await cropImage(draft.src, draft.crop), original: draft.src, crop: draft.crop });
      close();
    };
    const avatar = <Avatar size={120} shape="company" src={logo?.src} status="edit" decorative />;
    const description = 'Your uploaded logo will be shown on the payment checkout';
    return (
      <>
        {logo ? (
          <DropdownMenu aria-label="Logo" width={160} items={[
            { label: 'Edit logo', onSelect: () => { setDraft({ src: logo.original, crop: logo.crop }); setStep('edit'); } },
            { label: 'Remove', onSelect: () => setLogo(null) },
          ]} trigger={props => <button type="button" className="grg-avatar-button" aria-label="Logo" {...props}>{avatar}</button>} />
        ) : (
          <button type="button" className="grg-avatar-button" aria-label="Upload logo" onClick={() => setStep('upload')}>{avatar}</button>
        )}
        <Modal appendTo="self" visible={step !== null} onHide={close} title={step === 'edit' ? 'Edit logo' : 'Upload logo'} description={description}
          onBack={step === 'crop' ? () => setStep('upload') : undefined}
          footerType="basic"
          primaryAction={step === 'upload' ? undefined : { label: 'Save', onClick: () => { void save(); } }}
          secondaryAction={step === 'upload' ? undefined : { label: 'Cancel', onClick: close }}>
          {step === 'upload' && (
            <FileUpload accept="image/png,image/jpeg,.svg" maxFileSize={5 * MB} hint={IMAGES_HINT}
              onSelect={([file]) => { setDraft({ src: URL.createObjectURL(file), crop: defaultCrop }); setStep('crop'); }} />
          )}
          {(step === 'crop' || step === 'edit') && draft && (
            <ImageCrop src={draft.src} label="Logo position" value={draft.crop} onChange={crop => setDraft({ ...draft, crop })} />
          )}
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const file = new File([await (await fetch(testLogo)).blob()], 'logo.svg', { type: 'image/svg+xml' });
    await step('The avatar opens Upload logo; a picture goes on to the crop', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Upload logo' }));
      const modal = await canvas.findByRole('dialog', { name: 'Upload logo' });
      await userEvent.upload(input(modal), file);
      await expect(await within(modal).findByRole('group', { name: 'Logo position' })).toBeInTheDocument();
    });
    await step('Zoom with + and the keys; the picture stays inside the window', async () => {
      const modal = canvas.getByRole('dialog');
      const zoom = within(modal).getByRole('slider', { name: 'Zoom' });
      await userEvent.click(within(modal).getByRole('button', { name: 'More' }));
      await expect(zoom).toHaveAttribute('aria-valuenow', '110');
      within(modal).getByRole('group', { name: 'Logo position' }).focus();
      await userEvent.keyboard('+');
      await expect(zoom).toHaveAttribute('aria-valuenow', '120');
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
      const window = within(modal).getByRole('group', { name: 'Logo position' }).getBoundingClientRect();
      const picture = modal.querySelector('.grg-image-crop__image')!.getBoundingClientRect();
      await expect(picture.right).toBeGreaterThanOrEqual(window.right - 1);
    });
    await step('Back returns to the upload; Save puts the logo in the avatar', async () => {
      const modal = canvas.getByRole('dialog');
      await userEvent.click(within(modal).getByRole('button', { name: 'Back' }));
      await userEvent.upload(input(await canvas.findByRole('dialog', { name: 'Upload logo' })), file);
      await userEvent.click(await within(canvas.getByRole('dialog')).findByRole('button', { name: 'Save' }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(canvasElement.querySelector('.grg-avatar img')).toBeTruthy());
    });
    await step('With a logo: Edit logo crops the original again, Remove takes it away', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Logo' }));
      // A pointer presses the row's text, once the menu has opened
      await userEvent.click(within(await canvas.findByRole('menuitem', { name: 'Edit logo' })).getByText('Edit logo'));
      const modal = await canvas.findByRole('dialog', { name: 'Edit logo' });
      await expect(within(modal).queryByRole('button', { name: 'Back' })).toBeNull();
      await userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await userEvent.click(canvas.getByRole('button', { name: 'Logo' }));
      // A pointer presses the row's text, once the menu has opened
      await userEvent.click(within(await canvas.findByRole('menuitem', { name: 'Remove' })).getByText('Remove'));
      await expect(await canvas.findByRole('button', { name: 'Upload logo' })).toBeInTheDocument();
    });
  },
};

/** Upload files, in a card with Cancel and Save, as in the Figma examples (the dialog itself comes with Modal). */
export const UploadFilesInACard: Story = {
  name: 'Upload files in a card',
  args: { multiple: true, hint: 'PDF, DOCX or XLSX, up to 10 MB each.', accept: '.pdf,.docx,.xlsx' },
  render: (args: FileUploadProps) => (
    <div style={{ display: 'grid', gap: 'var(--space-600)', padding: 'var(--space-600)', borderRadius: 'var(--radius-xl-16)', background: 'var(--surface-floating)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-100)' }}>
        <span style={{ font: 'var(--typo-title-md-medium, var(--typo-body-lg-semibold))', color: 'var(--text-strong-1000)' }}>Upload files</span>
        <span style={{ font: 'var(--typo-body-sm-regular)', color: 'var(--text-soft-500)' }}>Select and upload the files of your choice</span>
      </div>
      <Uploader {...args} initial={[
        { id: 'cv', name: 'my_cv.pdf', size: 120 * 1024, status: 'uploading', progress: 10 },
        { id: 'certificate', name: 'certificate.pdf', size: 120 * 1024, status: 'completed' },
      ]} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-300)' }}>
        <Button variant="outline" leftIcon={undefined}>Cancel</Button>
        <Button variant="primary" leftIcon={undefined}>Save</Button>
      </div>
    </div>
  ),
};

/** Not available right now. */
export const Unavailable: Story = {
  args: { disabled: true },
  // Known contrast note: the Figma disabled text grey is below 4.5:1. Listed in the Accessibility panel, not failed, until the colour is decided in Figma
  parameters: { a11y: { test: 'todo' } },
};

/* ---- Overview ---- */

/** Uploading, Completed, Failed (the upload failed: Try again). */
export const FileCards: Story = {
  name: 'File cards',
  render: () => (
    <ul style={{ display: 'grid', gap: 'var(--space-200)', margin: 0, padding: 0, listStyle: 'none' }}>
      {([
        { id: 'a', name: 'my_cv.pdf', size: 120 * 1024, status: 'uploading', progress: 10 },
        { id: 'b', name: 'my_cv.pdf', size: 120 * 1024, status: 'completed' },
        { id: 'c', name: 'my_cv.pdf', size: 120 * 1024, status: 'failed', retryable: true },
      ] as UploadFile[]).map(file => <FileCard key={file.id} file={file} onCancel={() => {}} onRemove={() => {}} onRetry={() => {}} />)}
    </ul>
  ),
};

/** The fifteen Figma formats; any other (jpg, png, svg…) gets a neutral label with its extension. */
export const FileFormatIcons: Story = {
  name: 'File format icons',
  decorators: [Story => <div style={{ width: 'min(560px, 100%)' }}><Story /></div>],
  render: () => (
    <Showcase>
      {[...fileFormats.map(([key]) => key), 'jpg', 'png', 'svg'].map(ext => (
        <Variant key={ext} caption={ext}><FileIcon file={ext} /></Variant>
      ))}
    </Showcase>
  ),
};
