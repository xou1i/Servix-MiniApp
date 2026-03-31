import { STATUS_META, getStatusLabel } from '../utils/status';

function StatusBadge({ status, lang = 'ar' }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${meta.color} animate-status-pop`}
    >
      {getStatusLabel(status, lang)}
    </span>
  );
}

export default StatusBadge;
