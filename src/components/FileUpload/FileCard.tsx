import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Icon } from '../Icon/Icon';
import { ActionButton } from '../ActionButton/ActionButton';
import { Button } from '../Button/Button';
import { FileIcon } from '../FileIcon/FileIcon';
import { formatFileSize } from './fileSize';

/** One file in the list (Figma File upload cards: Uploading, Completed, Failed) */
export type UploadFile = {
  id: string;
  name: string;
  /** Size in bytes */
  size: number;
  status: 'uploading' | 'completed' | 'failed';
  /** Uploading: 0–100 */
  progress?: number;
  /** Failed: the reason, such as "Larger than 5 MB"; "Failed" by default */
  error?: string;
  /** Failed: whether "Try again" can help (an upload error), or not (a file that didn't pass the check) */
  retryable?: boolean;
};

type FileCardProps = {
  file: UploadFile;
  locale?: string;
  onCancel: () => void;
  onRemove: () => void;
  onRetry: () => void;
};

/** A file card: the format icon, the name, the size and status, a progress bar while uploading, and its action. */
export function FileCard({ file, locale, onCancel, onRemove, onRetry }: FileCardProps) {
  const progress = Math.max(0, Math.min(100, Math.round(file.progress ?? 0)));
  const total = formatFileSize(file.size, locale);
  const done = file.status === 'completed' ? file.size : file.status === 'uploading' ? (file.size * progress) / 100 : 0;
  // A file that didn't pass the check was never sent: its size alone; otherwise how much has arrived
  const sizeText = file.status === 'failed' && file.retryable === false ? total : `${formatFileSize(done, locale)} of ${total}`;

  return (
    <li className="grg-file-card" data-status={file.status}>
      <FileIcon file={file.name} size={40} />
      <div className="grg-file-card__content">
        <div className="grg-file-card__text">
          <span className="grg-file-card__name">{file.name}</span>
          <span className="grg-file-card__description">
            <span>{sizeText}</span>
            <span className="grg-file-card__separator" aria-hidden="true" />
            {file.status === 'uploading' && <span className="grg-file-card__status"><Icon name="upload" size={16} />Uploading...</span>}
            {file.status === 'completed' && <span className="grg-file-card__status"><Icon name="check-circle" size={16} />Completed</span>}
            {file.status === 'failed' && <span className="grg-file-card__status"><Icon name="information-circle" size={16} />{file.error ?? 'Failed'}</span>}
          </span>
        </div>
        {file.status === 'uploading' && (
          <ProgressBar value={progress} aria-label={`Uploading ${file.name}`} className="grg-file-card__progress" />
        )}
        {file.status === 'failed' && file.retryable !== false && (
          <span className="grg-file-card__retry">
            <Button variant="text" tone="destructive" size="sm" leftIcon={undefined} onClick={onRetry} aria-label={`Try again: ${file.name}`}>Try again</Button>
          </span>
        )}
      </div>
      {file.status === 'uploading' ? (
        <ActionButton className="grg-file-card__action" icon="remove" size="xs" aria-label={`Cancel uploading ${file.name}`} onClick={onCancel} />
      ) : (
        <ActionButton className="grg-file-card__action" icon="trash" size="xs" aria-label={`Remove ${file.name}`} onClick={onRemove} />
      )}
    </li>
  );
}
