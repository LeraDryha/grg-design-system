import { createContext, useContext } from 'react';
import type { Notification } from '../../components/NotificationFeed/NotificationFeed';

/** What the bar's bell needs from the app around it: the notifications and what opening one does. Given by an app
 *  that can show them (the Dashboard, the Notifications page); without it the bell is a plain button */
export type NotificationsController = {
  items: Notification[];
  open: (notification: Notification) => void;
  markAllRead: () => void;
  viewAll?: () => void;
};

export const NotificationsContext = createContext<NotificationsController | null>(null);
export const useNotificationsController = () => useContext(NotificationsContext);
