import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { FileUpload as PrimeFileUpload } from 'primereact/fileupload';
import { Icon } from '../Icon/Icon';
import { HintText } from '../FormField/FormField';
import { FileCard, type UploadFile } from './FileCard';
import { formatFileSize } from './fileSize';
import './FileUpload.css';

export type { UploadFile };

/** A file that didn't pass the check (type or size): the zone turns red and says why under it */
type Rejected = { name: string; reason: 'type' | 'size' };

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
  /** Largest file in bytes; a bigger file isn't added: the zone turns red and says why under it */
  maxFileSize?: number;
  /** Several files at once; otherwise a new file replaces the chosen one */
  multiple?: boolean;
  /** The line under the call to action, such as "JPEG, JPG, PNG, SVG formats, up to 5 MB." */
  hint?: string;
  /** The link-coloured start of the call to action */
  actionLabel?: string;
  /** The rest of the call to action */
  dropLabel?: string;
  /** An error from the product (Figma Upload area in red with Hint text), such as the server refusing the picture.
   *  A file that fails the type or size check shows its own error the same way */
  error?: string;
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

/**
 * A drop zone that is one big button, and a card for each file. PrimeReact FileUpload gives the file dialog,
 * the dropping and the size check; the product does the upload and reports each file's progress and status.
 */
export function FileUpload({
  files = [], onSelect, onCancel, onRemove, onRetry, accept, maxFileSize, multiple = false,
  hint, actionLabel = 'Click to upload', dropLabel = 'or drag and drop', error, 'aria-label': ariaLabel,
  disabled = false, locale, className = '',
}: FileUploadProps) {
  const id = useId();
  const upload = useRef<PrimeFileUpload>(null);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');

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

  const reasonText = ({ name, reason }: Rejected) =>
    reason === 'size' && maxFileSize ? `${name} is larger than ${formatFileSize(maxFileSize, locale)}` : `${name}: this file type isn’t supported`;
  const message = error ?? (rejected.length ? `${rejected.map(reasonText).join('. ')}.` : undefined);
  const errorId = `${id}-error`;

  return (
    <div className={`grg-file-upload ${className}`} data-disabled={disabled || undefined}>
      <PrimeFileUpload
        ref={upload}
        name={id}
        mode="advanced"
        customUpload
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        // The size is checked here, not by PrimeReact: its check shows a message of its own above the zone
        onSelect={e => {
          const list = e.files.flatMap((f): Rejected[] => (
            !accepts(f, accept) ? [{ name: f.name, reason: 'type' }]
              : maxFileSize && f.size > maxFileSize ? [{ name: f.name, reason: 'size' }] : []));
          const valid = e.files.filter(f => !list.some(r => r.name === f.name));
          // Each choice starts afresh: the error says what happened to the files just chosen
          setRejected(list);
          if (list.length) setAnnouncement(list.map(reasonText).join('. '));
          if (valid.length) onSelect?.(multiple ? valid : valid.slice(0, 1));
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
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
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
            'data-error': message ? true : undefined,
          },
          // PrimeReact's own messages are never shown: an error is the red zone and the Hint text under it
          message: { root: { hidden: true } },
          progressbar: { root: { hidden: true } },
        } as object}
      />
      {message && <HintText id={errorId} state="error">{message}</HintText>}
      {files.length > 0 && (
        <ul className="grg-file-upload__files" aria-label="Files">
          {files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              locale={locale}
              onCancel={() => onCancel?.(file.id)}
              onRemove={() => onRemove?.(file.id)}
              onRetry={() => onRetry?.(file.id)}
            />
          ))}
        </ul>
      )}
      <span className="grg-sr-only" role="status">{announcement}</span>
    </div>
  );
}
