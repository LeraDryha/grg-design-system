import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { Dialog } from 'primereact/dialog';
import { ActionButton } from '../ActionButton/ActionButton';
import { Button } from '../Button/Button';
import { FeaturedIcon, type FeaturedIconType } from '../FeaturedIcon/FeaturedIcon';
import type { IconName } from '../Icon/Icon';
import './Modal.css';

/* Figma page ❖ Modal: "Modal header" (479:2119) and "Modal footer" (329:13837), combined by the rules in
   "Modal – Guidelines" (483:31840). The modal itself is PrimeReact Dialog. */

/** Figma Size of the header and footer. auto follows the screen: Mobile under 480px. */
export type ModalLayout = 'auto' | 'desktop' | 'mobile';

/** Screens narrower than this show the modal as a bottom sheet (Figma Size = Mobile) */
const MOBILE_QUERY = '(max-width: 479px)';

function useMobile(layout: ModalLayout) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return layout === 'auto' ? matches : layout === 'mobile';
}

/* ---- Modal header ---- */

export type ModalHeaderProps = {
  /** Figma Modal title */
  title: string;
  /** Figma Modal description */
  description?: ReactNode;
  /** Figma Type: Center aligned, Left aligned, Horizontal left aligned (the icon left of the title) */
  align?: 'center' | 'left' | 'horizontal';
  /** Figma Status: a Featured icon above or beside the title */
  status?: FeaturedIconType;
  /** Another Base icon in the Featured icon, such as `mail` */
  statusIcon?: IconName;
  /** Figma Arrow: a back button, for a modal with steps. Center aligned only, as in Figma */
  onBack?: () => void;
  backLabel?: string;
  /** Figma Close: the dismiss button */
  onClose?: () => void;
  closeLabel?: string;
  /** Figma Size */
  mobile?: boolean;
  titleId?: string;
  descriptionId?: string;
};

/** Figma "Modal header": status icon, title, description, back and close. */
export function ModalHeader({
  title, description, align = 'center', status, statusIcon, onBack, backLabel = 'Back', onClose, closeLabel = 'Close',
  mobile = false, titleId, descriptionId,
}: ModalHeaderProps) {
  return (
    <div className="grg-modal-header" data-align={align} data-size={mobile ? 'mobile' : 'desktop'}>
      {status && <FeaturedIcon type={status} icon={statusIcon} />}
      <div className="grg-modal-header__text">
        <h2 id={titleId} className="grg-modal-header__title">{title}</h2>
        {description && <p id={descriptionId} className="grg-modal-header__description">{description}</p>}
      </div>
      {onBack && align === 'center' && (
        <ActionButton icon="arrow-left" className="grg-modal-header__back" aria-label={backLabel} onClick={onBack} />
      )}
      {onClose && <ActionButton icon="remove" className="grg-modal-header__close" aria-label={closeLabel} onClick={onClose} />}
    </div>
  );
}

/* ---- Modal footer ---- */

export type ModalAction = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Submits a form inside the modal: give the form's id */
  form?: string;
};

export type ModalFooterType = 'stretch' | 'fill' | 'basic' | 'button' | 'link' | 'stepper' | 'info' | 'checkbox';

export type ModalFooterProps = {
  /** Figma Type. Stretch: two equal buttons side by side. Fill: full-width buttons, one under the other. Basic: buttons on the right.
   *  Button, Link, Stepper, Info, Checkbox: Basic with `extra` on the left (a Text button, a Link, a Stepper Dot, a hint, a Checkbox label). */
  type?: ModalFooterType;
  /** The main action (Primary button) */
  primary?: ModalAction;
  /** The other way out, usually Cancel (Outline button) */
  secondary?: ModalAction;
  /** Figma Destructive: the main action is red, for what can't be undone */
  destructive?: boolean;
  /** The item on the left for the Button, Link, Stepper, Info and Checkbox types */
  extra?: ReactNode;
  /** Figma Size */
  mobile?: boolean;
};

/** Figma "Modal footer": the actions, and one more item for some types. On mobile every button is full width, the main one on top. */
export function ModalFooter({ type = 'basic', primary, secondary, destructive = false, extra, mobile = false }: ModalFooterProps) {
  const full = mobile || type === 'stretch' || type === 'fill';
  const main = primary && (
    <Button variant="primary" tone={destructive ? 'destructive' : 'neutral'} size="lg" justified={full} data-modal-action="primary"
      onClick={primary.onClick} disabled={primary.disabled} loading={primary.loading} type={primary.form ? 'submit' : 'button'} form={primary.form}>
      {primary.label}
    </Button>
  );
  const other = secondary && (
    <Button variant="outline" size="lg" justified={full} data-modal-action="secondary"
      onClick={secondary.onClick} disabled={secondary.disabled} loading={secondary.loading}>
      {secondary.label}
    </Button>
  );
  // Side by side the way out comes first and the main action last; stacked, the main action is on top
  const stacked = mobile || type === 'fill';
  return (
    <div className="grg-modal-footer" data-type={type} data-size={mobile ? 'mobile' : 'desktop'}>
      {extra && type !== 'stretch' && type !== 'fill' && type !== 'basic' && <div className="grg-modal-footer__extra">{extra}</div>}
      <div className="grg-modal-footer__actions">
        {stacked ? <>{main}{other}</> : <>{other}{main}</>}
      </div>
    </div>
  );
}

/* ---- Modal panel: header, content and footer on the floating surface ---- */

export type ModalPanelProps = Omit<ModalHeaderProps, 'mobile' | 'titleId' | 'descriptionId'> & {
  /** Figma Width: sm-440, md-600, lg-880. On mobile the sheet takes the screen's width (xs-343 in Figma) */
  size?: 'sm' | 'md' | 'lg';
  /** Default: as tall as the content. Full: the whole screen height less 40px above and below, the content scrolls */
  height?: 'auto' | 'full';
  /** Footer: Figma Modal footer Type, actions and the extra item */
  footerType?: ModalFooterType;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  destructive?: boolean;
  footerExtra?: ReactNode;
  /** The content between the header and the footer */
  children?: ReactNode;
  mobile?: boolean;
  titleId?: string;
  descriptionId?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

/** The modal's surface without the overlay: shown inside Modal, and on its own in the docs. */
export function ModalPanel({
  size = 'sm', height = 'auto', footerType = 'basic', primaryAction, secondaryAction, destructive, footerExtra,
  children, mobile = false, titleId, descriptionId, className = '', ref, ...header
}: ModalPanelProps) {
  const hasFooter = !!(primaryAction || secondaryAction);
  return (
    <div ref={ref} className={`grg-modal ${className}`} data-size={size} data-height={height} data-layout={mobile ? 'mobile' : 'desktop'}>
      <ModalHeader {...header} mobile={mobile} titleId={titleId} descriptionId={descriptionId} />
      {/* Full height scrolls its content: the scroll area takes focus so keyboard users can scroll it */}
      {children && <div className="grg-modal__content" tabIndex={height === 'full' ? 0 : undefined}>{children}</div>}
      {hasFooter ? (
        <ModalFooter type={footerType} primary={primaryAction} secondary={secondaryAction} destructive={destructive} extra={footerExtra} mobile={mobile} />
      ) : <div className="grg-modal__end" />}
    </div>
  );
}

/* ---- Modal ---- */

export type ModalProps = Omit<ModalPanelProps, 'mobile' | 'titleId' | 'descriptionId' | 'onClose'> & {
  /** Open or closed */
  visible: boolean;
  /** Called when people close it: Close button, Escape, or a click on the overlay when `dismissableMask` */
  onHide: () => void;
  /** Figma Size of the header and footer; auto turns the modal into a bottom sheet on screens under 480px */
  layout?: ModalLayout;
  /** A click on the overlay closes the modal too. Off by default, so nothing typed is lost */
  dismissableMask?: boolean;
  /** Hide the Close button (Figma Close off); Escape still closes */
  closable?: boolean;
  /** Where the modal goes in the page; document.body by default. 'self' keeps it inside the parent (used by the docs) */
  appendTo?: 'self' | HTMLElement | null;
};

/** Fields that should get focus first: the first form control in the content */
const FIELD = 'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [role="combobox"]:not([aria-disabled="true"])';

/**
 * PrimeReact Dialog (unstyled): focus stays inside, Escape closes, the page behind doesn't scroll,
 * focus goes back to what opened it. The header, content and footer are GRG's own (Dialog `content`).
 * PrimeReact focuses its own close button; this one focuses the first field, or else the safe action:
 * Cancel when the main action is destructive, the main action otherwise.
 */
export function Modal({
  visible, onHide, layout = 'auto', dismissableMask = false, closable = true, appendTo, className = '', ...panel
}: ModalProps) {
  const mobile = useMobile(layout);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = panel.description ? `${id}-description` : undefined;
  const rootRef = useRef<HTMLDivElement | null>(null);

  function focusFirst() {
    const root = rootRef.current;
    if (!root || root.contains(document.activeElement)) return;
    const field = root.querySelector<HTMLElement>(`.grg-modal__content :is(${FIELD})`);
    const safe = root.querySelector<HTMLElement>(`[data-modal-action="${panel.destructive ? 'secondary' : 'primary'}"]:not(:disabled)`);
    const any = root.querySelector<HTMLElement>('button:not(:disabled)');
    (field ?? safe ?? any)?.focus();
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      appendTo={appendTo}
      position={mobile ? 'bottom' : 'center'}
      modal
      blockScroll
      closable
      closeOnEscape
      dismissableMask={dismissableMask}
      draggable={false}
      resizable={false}
      focusOnShow={false}
      onShow={focusFirst}
      aria-labelledby={titleId}
      aria-describedby={descriptionId ?? ''}
      pt={{
        mask: { className: 'grg-modal-mask', 'data-sheet': mobile || undefined } as never,
        root: { className: 'grg-modal-dialog' },
      }}
      content={({ hide }) => (
        <ModalPanel
          {...panel}
          className={className}
          mobile={mobile}
          titleId={titleId}
          descriptionId={descriptionId}
          onClose={closable ? (() => hide(undefined as never)) : undefined}
          ref={rootRef}
        />
      )}
    />
  );
}
