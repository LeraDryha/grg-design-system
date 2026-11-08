import { ModalFrame, ModalPanel, type ModalAction, type ModalFooterType, type ModalLayout } from '../Modal/Modal';
import type { ReactNode, Ref } from 'react';
import './Drawer.css';

/* Not in the Figma file: built in code from Modal's parts (its header, content, footer, overlay and rules), at the right
   edge of the screen. PrimeReact Dialog, as Modal, rather than PrimeReact Sidebar: Sidebar keeps no focus inside and
   isn't announced as a dialog. */

export type DrawerSize = 'sm' | 'md' | 'lg';

export type DrawerProps = {
  /** Open or closed */
  visible: boolean;
  /** Called when people close it: Close button, Escape, or a click on the overlay when `dismissableMask` */
  onHide: () => void;
  /** The title in the header */
  title: string;
  /** A line under the title */
  description?: ReactNode;
  /** Width: sm-480 for a form, md-560 for details, lg-960 for a form with a preview. On phones it takes the whole screen */
  size?: DrawerSize;
  /** Modal footer Type: Basic (buttons on the right) by default */
  footerType?: ModalFooterType;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  destructive?: boolean;
  footerExtra?: ReactNode;
  /** The content between the header and the footer; it scrolls, the header and the footer stay */
  children?: ReactNode;
  /** Hide the Close button; Escape still closes */
  closable?: boolean;
  /** A click on the overlay closes the drawer too. Off by default, so nothing typed is lost */
  dismissableMask?: boolean;
  /** Mobile: the whole screen, the Modal header and footer in their mobile size. auto follows the screen (under 480px) */
  layout?: ModalLayout;
  /** Where the drawer goes in the page; document.body by default. 'self' keeps it inside the parent (used by the docs) */
  appendTo?: 'self' | HTMLElement | null;
  className?: string;
};

/**
 * A panel at the right edge of the screen for a task that belongs to the page under it: create an item, see its details.
 * The page stays in view under the overlay. Everything Modal does, it does: focus inside, Escape, focus back to the opener.
 */
export function Drawer({ size = 'sm', footerType = 'basic', className = '', ...props }: DrawerProps) {
  return <ModalFrame {...props} placement="right" align="left" height="full" size={size} footerType={footerType} className={`grg-drawer ${className}`} />;
}

/** The drawer's surface without the overlay, for the docs */
export function DrawerPanel({ size = 'sm', footerType = 'basic', className = '', ref, ...props }:
  Omit<DrawerProps, 'visible' | 'onHide' | 'closable' | 'dismissableMask' | 'layout' | 'appendTo'> & { onClose?: () => void; mobile?: boolean; ref?: Ref<HTMLDivElement> }) {
  return <ModalPanel {...props} ref={ref} align="left" height="full" size={size} footerType={footerType} className={`grg-drawer ${className}`} />;
}
