/** Role definitions — all role logic derives from this single source */
export const ROLES = {
  waiter: {
    key: 'waiter',
    labelAr: 'النادل',
    labelEn: 'Waiter',
    hintAr: 'إنشاء الطلبات وتتبع حالتها',
    hintEn: 'Create orders and track their status',
    color: '#1D4E89',
    dept: 'all',
  },
  chef: {
    key: 'chef',
    labelAr: 'الشيف',
    labelEn: 'Chef',
    hintAr: 'إدارة طلبات الأطباق الرئيسية',
    hintEn: 'Manage food & kitchen orders',
    color: '#1FA89B',
    dept: 'kitchen',
  },
  barista: {
    key: 'barista',
    labelAr: 'الباريستا',
    labelEn: 'Barista',
    hintAr: 'إدارة المشروبات الساخنة والباردة',
    hintEn: 'Manage hot and cold beverages',
    color: '#7209B7',
    dept: 'barista',
  },
};

export const ROLE_KEYS = Object.keys(ROLES);

export const DEPARTMENT = {
  kitchen: 'kitchen',
  barista: 'barista',
};

/** Maps role key → department filter */
export function getRoleDept(roleKey) {
  return ROLES[roleKey]?.dept ?? 'all';
}
