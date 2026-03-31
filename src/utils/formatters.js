export const formatSinceMinutes = (minutesAgo) => `منذ ${minutesAgo} دقيقة`;

export const formatItemsPreview = (items) => {
  if (!items?.length) return '—';
  if (items.length <= 2) return items.join('، ');
  return `${items.slice(0, 2).join('، ')} +${items.length - 2}`;
};

/** طابع زمني نسبي للتنبيهات */
export function formatNotificationTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}
