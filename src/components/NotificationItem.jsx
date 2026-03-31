import { Bell, PackageCheck, Clock, AlertCircle } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { NOTIFICATION_TYPES } from '../data/mockNotifications';
import { formatNotificationTime } from '../utils/formatters';

const ICON_MAP = {
  [NOTIFICATION_TYPES.newOrder]:         { Icon: Bell,         cls: 'text-[var(--color-primary)]' },
  [NOTIFICATION_TYPES.statusUpdated]:    { Icon: PackageCheck, cls: 'text-[var(--color-ready)]' },
  [NOTIFICATION_TYPES.delayed]:          { Icon: Clock,        cls: 'text-[var(--color-preparing)]' },
  [NOTIFICATION_TYPES.itemUnavailable]:  { Icon: AlertCircle,  cls: 'text-[var(--color-alert)]' },
};

function NotificationItem({ notification, onClick }) {
  const { language } = useAppState();
  const { Icon, cls } = ICON_MAP[notification.type] ?? { Icon: Bell, cls: 'text-slate-500' };
  const unread = !notification.read;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className={`group glass-panel animate-notif-in cursor-pointer rounded-2xl p-4 transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 ${
        unread ? 'ring-1 ring-[var(--color-primary)]/20' : 'opacity-85'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-low)] transition-transform duration-200 group-hover:scale-105 ${cls}`}>
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{notification.title}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-snug">{notification.body}</p>
        </div>
        <div className="shrink-0 text-end">
          <span className="block text-xs text-[var(--text-muted)]">
            {formatNotificationTime(notification.createdAt)}
          </span>
          {unread && (
            <span className="mt-1.5 inline-block rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
              {language === 'en' ? 'New' : 'جديد'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default NotificationItem;
