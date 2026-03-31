import { ROLES } from '../constants/roles';

function RoleBadge({ roleKey, lang = 'ar' }) {
  const role = ROLES[roleKey];
  if (!role) return null;
  const label = lang === 'en' ? role.labelEn : role.labelAr;
  const colorMap = {
    waiter:  'role-waiter-bg role-waiter-text',
    chef:    'role-chef-bg role-chef-text',
    barista: 'role-barista-bg role-barista-text',
  };
  return (
    <span
      className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold ${colorMap[roleKey] ?? ''}`}
    >
      {label}
    </span>
  );
}

export default RoleBadge;
