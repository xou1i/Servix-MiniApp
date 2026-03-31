import NotificationItem from '../components/NotificationItem';
import { useAppState } from '../hooks/useAppState';

function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, language } = useAppState();
  const isAr = language !== 'en';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl font-bold text-[var(--text-primary)]">
            {isAr ? 'التنبيهات' : 'Notifications'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr
              ? 'تحديثات لحظية تضمن سرعة التنسيق بين الفرق'
              : 'Real-time updates to keep the team in sync'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="btn-ghost shrink-0 text-xs"
          >
            {isAr ? 'تعيين الكل كمقروء' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl bg-[var(--surface-low)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {isAr ? 'لا توجد تنبيهات بعد' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="animate-notif-in stagger"
              style={{ '--delay': `${Math.min(index, 8) * 40}ms` }}
            >
              <NotificationItem
                notification={notification}
                onClick={() => { if (!notification.read) markNotificationRead(notification.id); }}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default NotificationsPage;
