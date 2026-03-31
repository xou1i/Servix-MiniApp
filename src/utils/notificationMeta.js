import { AlarmClock, Bell, Inbox, PackageX } from 'lucide-react';
import { NOTIFICATION_TYPES } from '../data/mockNotifications';

export function getNotificationIcon(type) {
  switch (type) {
    case NOTIFICATION_TYPES.newOrder:
      return Inbox;
    case NOTIFICATION_TYPES.statusUpdated:
      return Bell;
    case NOTIFICATION_TYPES.delayed:
      return AlarmClock;
    case NOTIFICATION_TYPES.itemUnavailable:
      return PackageX;
    default:
      return Bell;
  }
}

export function getNotificationIconClass(type) {
  switch (type) {
    case NOTIFICATION_TYPES.delayed:
      return 'text-[#FCA311]';
    case NOTIFICATION_TYPES.itemUnavailable:
      return 'text-red-500 dark:text-red-400';
    case NOTIFICATION_TYPES.newOrder:
      return 'text-[#1FA89B]';
    default:
      return 'text-[#1D4E89]';
  }
}
