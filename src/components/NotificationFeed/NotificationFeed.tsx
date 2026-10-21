import { useEffect, useId, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { FeaturedIcon } from '../FeaturedIcon/FeaturedIcon';
import { Icon } from '../Icon/Icon';
import { TabMenu } from '../TabMenu/TabMenu';
import { useOverlayTheme } from '../../hooks/useOverlayTheme';
import './NotificationFeed.css';

/* Figma page ❖ Notification feed: "Notification feed" (1870:9294), "Notifications misc items" (2161:16786), the usage
   guidelines (2177:45755) and the popover guidelines (2177:47320). */

type Action = { label: string; onClick: () => void };

/** One notification: Figma Notification feed */
export type Notification = {
  id: string;
  /** Figma Label */
  title: string;
  /** Figma Sublabel: a short note after the title */
  sublabel?: string;
  /** Figma Description: up to two lines; longer text ends with an ellipsis */
  description?: string;
  /** Figma Date: written in the page's language */
  date?: Date;
  /** Figma New: a red dot until it is read */
  unread?: boolean;
  /** Figma Icon: usually a TransactionIcon */
  icon?: ReactNode;
  /** Where it leads, for a notification without buttons */
  href?: string;
  /** Figma Buttons: Secondary and Primary. With buttons only they act; the notification itself isn't a link */
  primaryAction?: Action;
  secondaryAction?: Action;
};

const formatDate = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);

export type NotificationItemProps = {
  notification: Notification;
  /** A notification without buttons was opened (clicked, or Enter on it); the product marks it read */
  onOpen?: (notification: Notification, event: MouseEvent<HTMLElement>) => void;
  /** Locale of the date; the page's language by default */
  locale?: string;
};

/** Figma "Notification feed": icon, label, sublabel, description, date, the new dot and buttons. */
export function NotificationItem({ notification: n, onOpen, locale }: NotificationItemProps) {
  const withButtons = !!(n.primaryAction || n.secondaryAction);
  const lang = locale ?? (typeof document !== 'undefined' ? document.documentElement.lang || undefined : undefined);
  const parts = (
    <>
      {n.icon && <span className="grg-notification__icon">{n.icon}</span>}
      <span className="grg-notification__content">
        <span className="grg-notification__text">
          <span className="grg-notification__title">
            <span className="grg-notification__label">{n.title}</span>
            {n.sublabel && <span className="grg-notification__sublabel">{n.sublabel}</span>}
          </span>
          {n.description && <span className="grg-notification__description">{n.description}</span>}
        </span>
        {n.date && <time className="grg-notification__date" dateTime={n.date.toISOString()}>{formatDate(n.date, lang)}</time>}
        {withButtons && (
          <span className="grg-notification__buttons">
            {n.secondaryAction && <Button variant="outline" size="sm" onClick={n.secondaryAction.onClick}>{n.secondaryAction.label}</Button>}
            {n.primaryAction && <Button variant="primary" size="sm" onClick={n.primaryAction.onClick}>{n.primaryAction.label}</Button>}
          </span>
        )}
      </span>
      {n.unread && (
        <span className="grg-notification__new">
          <Badge variant="text" size="md" type="dot" color="error" decorative />
          <span className="grg-sr-only">Unread</span>
        </span>
      )}
    </>
  );
  // With buttons only the buttons act: a link around them would be two controls in one
  if (withButtons) return <div className="grg-notification" data-unread={n.unread || undefined} data-static>{parts}</div>;
  return (
    <a className="grg-notification" href={n.href} data-unread={n.unread || undefined} onClick={event => onOpen?.(n, event)}>
      {parts}
    </a>
  );
}

const PHONE_QUERY = '(max-width: 767px)';
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

export type NotificationFeedProps = {
  notifications: Notification[];
  /** Figma Skeleton: the notifications are loading */
  loading?: boolean;
  onOpen?: NotificationItemProps['onOpen'];
  /** Figma Mark all as read: shown while something is unread */
  onMarkAllRead?: () => void;
  /** Figma Header · Action button: the notification settings */
  settingsHref?: string;
  /** Figma Footer: View all notifications */
  viewAllHref?: string;
  /** Figma Empty */
  empty?: { title: string; subtitle?: string };
  /** The bell (Topbar Navigation's button): spread the given props on it */
  trigger: (props: { onClick: (event: MouseEvent<HTMLElement>) => void; 'aria-expanded': boolean; 'aria-controls': string; 'aria-haspopup': 'dialog' }) => ReactNode;
  /** Figma Header title */
  title?: string;
  /** Figma Size; phones (under 768px) get the feed under the top bar, the full width. auto follows the screen */
  layout?: 'auto' | 'popover' | 'phone';
  locale?: string;
  className?: string;
};

/**
 * The notifications of the account, in a panel from the bell in the top bar: All and Unread, Mark all as read,
 * the settings and the full list. PrimeReact OverlayPanel gives the panel (it closes on a click outside and on
 * Escape) and Skeleton the loading rows. New notifications that arrive while it is open are announced.
 */
export function NotificationFeed({
  notifications, loading = false, onOpen, onMarkAllRead, settingsHref, viewAllHref, empty = { title: 'No notifications yet', subtitle: 'We’ll let you know when something happens.' },
  trigger, title = 'Notifications', layout = 'auto', locale, className = '',
}: NotificationFeedProps) {
  const panel = useRef<OverlayPanel>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const theme = useOverlayTheme(anchor);
  const phoneScreen = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const phone = layout === 'auto' ? phoneScreen : layout === 'phone';

  const unread = notifications.filter(n => n.unread).length;

  // New notifications while the feed is open are announced politely
  const [announcement, setAnnouncement] = useState('');
  const seen = useRef(new Set(notifications.map(n => n.id)));
  useEffect(() => {
    const fresh = notifications.filter(n => !seen.current.has(n.id));
    fresh.forEach(n => seen.current.add(n.id));
    if (open && fresh.length) setAnnouncement(fresh.length === 1 ? '1 new notification' : `${fresh.length} new notifications`);
  }, [notifications, open]);

  const list = (items: Notification[]) => {
    if (loading) {
      return (
        <div className="grg-feed__list" aria-busy="true">
          <span className="grg-sr-only">Loading notifications</span>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} pt={{ root: { className: 'grg-feed__skeleton' } }} />
          ))}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="grg-feed__empty">
          <FeaturedIcon type="neutral" size="lg" icon="notification" />
          <span className="grg-feed__empty-title">{empty.title}</span>
          {empty.subtitle && <span className="grg-feed__empty-subtitle">{empty.subtitle}</span>}
        </div>
      );
    }
    return (
      <ul className="grg-feed__list">
        {items.map(n => <li key={n.id}><NotificationItem notification={n} onOpen={onOpen} locale={locale} /></li>)}
      </ul>
    );
  };

  return (
    <span ref={anchor} className="grg-feed-anchor">
      {trigger({
        onClick: event => {
          opener.current = event.currentTarget;
          panel.current?.toggle(event);
        },
        'aria-expanded': open,
        'aria-controls': id,
        'aria-haspopup': 'dialog',
      })}
      <OverlayPanel
        ref={panel}
        id={id}
        // On phones the feed opens in place, under the top bar; on larger screens it is placed under the bell
        appendTo={phone ? 'self' : undefined}
        // Focus moves into the feed (its selected tab) and back to the bell when it closes
        onShow={() => {
          setOpen(true);
          document.getElementById(id)?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
        }}
        onHide={() => {
          setOpen(false);
          setTab('all');
          const active = document.activeElement;
          if (!active || active === document.body || document.getElementById(id)?.contains(active)) opener.current?.focus();
        }}
        pt={{
          root: { className: `grg-feed ${className}`, role: 'dialog', 'aria-label': title, 'data-phone': phone || undefined, ...theme } as object,
          content: { className: 'grg-feed__inner' },
        }}
      >
        <div className="grg-feed__header">
          <h2 className="grg-feed__title">{title}</h2>
          {settingsHref && (
            <a className="grg-feed__settings" href={settingsHref} aria-label="Notification settings">
              <Icon name="setting" size={24} />
            </a>
          )}
        </div>
        <hr className="grg-feed__divider" />
        <TabMenu
          items={[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread', badge: unread || undefined }]}
          value={tab}
          onChange={setTab}
          aria-label="Show"
          className="grg-feed__tabs"
          end={unread > 0 && onMarkAllRead && (
            <Button variant="text" size="xs" leftIcon="check-circle" onClick={onMarkAllRead}>Mark all as read</Button>
          )}
        >
          {item => list(item.id === 'unread' ? notifications.filter(n => n.unread) : notifications)}
        </TabMenu>
        {viewAllHref && (
          <>
            <hr className="grg-feed__divider" />
            <div className="grg-feed__footer">
              <a className="grg-feed__view-all" href={viewAllHref}>
                View all notifications
                <Icon name="arrow-right" size={16} />
              </a>
            </div>
          </>
        )}
        <span className="grg-sr-only" role="status">{announcement}</span>
      </OverlayPanel>
    </span>
  );
}
