import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toast, type ToastMessage } from 'primereact/toast';
import { Alert, type AlertProps } from './Alert';
import './Messages.css';

/*
 * Where floating messages appear (Figma Examples 419:15467): a Notification in the bottom right corner, a Toast at the
 * bottom in the middle, several of each stacked. On a phone both go to the bottom, the width of the screen.
 * PrimeReact Toast places, stacks and animates them; the message itself is the system's Alert.
 */

export type MessageOptions = Omit<AlertProps, 'onClose' | 'open' | 'elevated' | 'size' | 'closable'> & {
  /** Toast only: disappears after this many milliseconds, for messages that ask nothing (Copied, Changes saved).
   *  It waits while the pointer or the keyboard focus is on it, and is ignored when the Toast has an action. Without it
   *  the Toast stays until it is closed. */
  duration?: number;
  onClose?: () => void;
};

type MessagesApi = {
  /** A Notification: payments, updates. It stays until the person closes it. */
  notify: (message: MessageOptions) => void;
  /** A Toast: brief feedback in a compact size. */
  toast: (message: MessageOptions) => void;
};

const MessagesContext = createContext<MessagesApi | null>(null);

/** Show Notifications and Toasts from anywhere inside MessagesProvider. */
export function useMessages() {
  const api = useContext(MessagesContext);
  if (!api) throw new Error('useMessages needs a MessagesProvider around it');
  return api;
}

const PHONE = '(max-width: 479px)';

function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches);
  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const update = () => setPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return phone;
}

/** One message: the Alert, with its own timer for a Toast that disappears (paused while hovered or focused) */
function MessageItem({ options, kind, close }: { options: MessageOptions; kind: 'notification' | 'toast'; close: () => void }) {
  const { duration, onClose, ...alert } = options;
  const [held, setHeld] = useState({ pointer: false, focus: false });
  const done = () => { onClose?.(); close(); };
  const goesByItself = !!duration && !alert.actionLabel;
  useEffect(() => {
    // Only a Toast that asks nothing goes by itself: never one with an action, never a Notification
    if (kind !== 'toast' || !goesByItself || held.pointer || held.focus) return;
    const timer = window.setTimeout(done, duration);
    return () => window.clearTimeout(timer);
  });
  return (
    <div className="grg-messages__item-body"
      onMouseEnter={() => setHeld(h => ({ ...h, pointer: true }))} onMouseLeave={() => setHeld(h => ({ ...h, pointer: false }))}
      onFocus={() => setHeld(h => ({ ...h, focus: true }))}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(h => ({ ...h, focus: false })); }}>
      {/* A Toast that goes by itself has no Close: there is nothing to wait for */}
      <Alert {...alert} elevated size={kind === 'toast' ? 'xs' : 'sm'} closable={!(kind === 'toast' && goesByItself)} onClose={done} />
    </div>
  );
}

export type MessagesProviderProps = {
  children: ReactNode;
  /** Where the message areas go: document.body by default; 'self' keeps them inside the parent (used by the docs) */
  appendTo?: 'self' | HTMLElement | null;
};

/** The two areas for floating messages, and useMessages() for everything inside. */
export function MessagesProvider({ children, appendTo }: MessagesProviderProps) {
  const notifications = useRef<Toast>(null);
  const toasts = useRef<Toast>(null);
  const phone = usePhone();
  const show = useCallback((kind: 'notification' | 'toast', options: MessageOptions) => {
    const area = kind === 'toast' ? toasts.current : notifications.current;
    // PrimeReact's own timer is off (sticky): a Toast that disappears uses the item's timer, which pauses on focus too.
    // PrimeReact passes onClose to the content at runtime, though its types leave it out
    area?.show({ sticky: true, closable: false, content: ({ onClose }: { onClose: () => void }) => <MessageItem options={options} kind={kind} close={onClose} /> } as unknown as ToastMessage);
  }, []);
  const api = useMemo<MessagesApi>(() => ({ notify: options => show('notification', options), toast: options => show('toast', options) }), [show]);

  const area = (kind: 'notification' | 'toast') => ({
    root: { className: 'grg-messages', 'data-kind': kind, 'data-phone': phone || undefined, 'aria-label': kind === 'toast' ? 'Toasts' : 'Notifications', role: 'region' },
    // Each Alert announces itself (status or alert); PrimeReact's fixed "alert, assertive" wrapper would say it twice
    message: { className: 'grg-messages__item', role: undefined, 'aria-live': undefined, 'aria-atomic': undefined },
    content: { className: 'grg-messages__content' },
  });

  return (
    <MessagesContext.Provider value={api}>
      {children}
      <Toast ref={notifications} position={phone ? 'bottom-center' : 'bottom-right'} appendTo={appendTo} pt={area('notification') as never} />
      <Toast ref={toasts} position="bottom-center" appendTo={appendTo} pt={area('toast') as never} />
    </MessagesContext.Provider>
  );
}
