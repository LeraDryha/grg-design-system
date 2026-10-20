import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { FileUpload as PrimeFileUpload } from 'primereact/fileupload';
import { Icon } from '../Icon/Icon';
import { FileCard, type UploadFile } from './FileCard';
import { formatFileSize } from './fileSize';
import './FileUpload.css';

export type { UploadFile };

/** A file that didn't pass the check (type or size); the component shows it as a Failed card with the reason */
type Rejected = { id: string; name: string; size: number; reason: 'type' | 'size' };

/** Figma "Upload area" (324:4742) with "File upload cards" (660:16427). */
export type FileUploadProps = {
  /** The files being uploaded or uploaded, with their status: the product does the upload and keeps this list */
  files?: UploadFile[];
  /** Called with the files that passed the check, after a click or a drop */
  onSelect?: (files: File[]) => void;
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Called on "Try again" of a file whose upload failed */
  onRetry?: (id: string) => void;
  /** File types, as for a file input: "image/png,image/jpeg,.svg" or ".pdf,.docx" */
  accept?: string;
  /** Largest file in bytes; bigger files show as Failed with the reason */
  maxFileSize?: number;
  /** Several files at once; otherwise a new file replaces the chosen one */
  multiple?: boolean;
  /** The line under the call to action, such as "JPEG, JPG, PNG, SVG formats, up to 5 MB." */
  hint?: string;
  /** The link-coloured start of the call to action */
  actionLabel?: string;
  /** The rest of the call to action */
  dropLabel?: string;
  /** Name of the upload area for screen readers; the call to action and the hint by default */
  'aria-label'?: string;
  disabled?: boolean;
  /** The locale for file sizes (1.2 MB, 1,2 MB); the page or browser language by default */
  locale?: string;
  className?: string;
};

/** Whether a file matches an accept list: extensions (.svg), exact types (image/png) or groups (image/*) */
const accepts = (file: File, accept?: string) => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(',').map(a => a.trim().toLowerCase()).filter(Boolean).some(a =>
    a.startsWith('.') ? name.endsWith(a) : a.endsWith('/*') ? type.startsWith(a.slice(0, -1)) : type === a);
};

let uid = 0;

/**
 * A drop zone that is one big button, and a card for each file. PrimeReact FileUpload gives the file dialog,
 * the dropping and the size check; the product does the upload and reports each file's progress and status.
 */
export function FileUpload({
  files = [], onSelect, onCancel, onRemove, onRetry, accept, maxFileSize, multiple = false,
  hint, actionLabel = 'Click to upload', dropLabel = 'or drag and drop', 'aria-label': ariaLabel,
  disabled = false, locale, className = '',
}: FileUploadProps) {
  const id = useId();
  const upload = useRef<PrimeFileUpload>(null);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const sizeTooBig = useRef<File[]>([]);

  // Screen readers hear when a file finishes or fails (the cards change silently otherwise)
  const previous = useRef(new Map<string, UploadFile['status']>());
  useEffect(() => {
    for (const f of files) {
      const before = previous.current.get(f.id);
      if (before && before !== f.status) {
        if (f.status === 'completed') setAnnouncement(`${f.name} uploaded`);
        if (f.status === 'failed') setAnnouncement(`${f.name} failed to upload`);
      }
    }
    previous.current = new Map(files.map(f => [f.id, f.status]));
  }, [files]);

  const choose = () => {
    if (disabled) return;
    upload.current?.getInput()?.click();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose();
    }
  };

  const reject = (list: Rejected[]) => {
    if (!list.length) return;
    setRejected(r => (multiple ? [...r, ...list] : list));
    setAnnouncement(list.map(f => `${f.name}: ${f.reason === 'size' ? 'too large' : 'file type not supported'}`).join('. '));
  };

  const reasonText = (reason: Rejected['reason']) =>
    reason === 'size' && maxFileSize ? `Larger than ${formatFileSize(maxFileSize, locale)}` : 'File type not supported';

  const cards: UploadFile[] = [
    ...files,
    ...rejected.map(r => ({ id: r.id, name: r.name, size: r.size, status: 'failed' as const, error: reasonText(r.reason), retryable: false })),
  ];

  return (
    <div className={`grg-file-upload ${className}`} data-disabled={disabled || undefined}>
      <PrimeFileUpload
        ref={upload}
        name={id}
        mode="advanced"
        customUpload
        multiple={multiple}
        accept={accept}
        maxFileSize={maxFileSize}
        disabled={disabled}
        onValidationFail={file => { sizeTooBig.current.push(file); }}
        onSelect={e => {
          const tooBig = sizeTooBig.current;
          sizeTooBig.current = [];
          const valid = e.files.filter(f => accepts(f, accept));
          const wrongType = e.files.filter(f => !accepts(f, accept));
          reject([
            ...tooBig.map(f => ({ id: `rejected-${++uid}`, name: f.name, size: f.size, reason: 'size' as const })),
            ...wrongType.map(f => ({ id: `rejected-${++uid}`, name: f.name, size: f.size, reason: 'type' as const })),
          ]);
          if (valid.length) {
            if (!multiple) setRejected([]);
            onSelect?.(multiple ? valid : valid.slice(0, 1));
          }
          // The product keeps the list of files; PrimeReact's own list stays empty, so the drop zone always shows
          upload.current?.clear();
        }}
        // The drop zone (Figma Upload area): one big button, the whole area clickable and droppable
        emptyTemplate={() => (
          <div
            className="grg-file-upload__zone"
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            // Named by its own text (the call to action and the hint) unless a name is given
            aria-label={ariaLabel}
            onClick={choose}
            onKeyDown={onKeyDown}
          >
            <Icon name="upload" size={24} />
            <span className="grg-file-upload__text">
              <span className="grg-file-upload__cta"><span className="grg-file-upload__action">{actionLabel}</span> {dropLabel}</span>
              {hint && <span className="grg-file-upload__hint">{hint}</span>}
            </span>
          </div>
        )}
        pt={{
          root: { className: 'grg-file-upload__root' },
          // PrimeReact's Choose / Upload / Cancel bar: kept for its file input (opened from the drop zone), never shown
          buttonbar: { hidden: true },
          content: {
            className: 'grg-file-upload__content',
            onDragEnter: () => setDragging(true),
            onDragLeave: (e: DragEvent<HTMLDivElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); },
            onDrop: () => setDragging(false),
            'data-dragging': dragging || undefined,
          },
          // PrimeReact's own messages are replaced by Failed cards with the reason
          message: { root: { hidden: true } },
          progressbar: { root: { hidden: true } },
        } as object}
      />
      {cards.length > 0 && (
        <ul className="grg-file-upload__files" aria-label="Files">
          {cards.map(file => (
            <FileCard
              key={file.id}
              file={file}
              locale={locale}
              onCancel={() => onCancel?.(file.id)}
              onRemove={() => (file.id.startsWith('rejected-') ? setRejected(r => r.filter(x => x.id !== file.id)) : onRemove?.(file.id))}
              onRetry={() => onRetry?.(file.id)}
            />
          ))}
        </ul>
      )}
      <span className="grg-sr-only" role="status">{announcement}</span>
    </div>
  );
}
