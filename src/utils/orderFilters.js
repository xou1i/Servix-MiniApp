import { DEPARTMENT } from '../constants/roles';

export function matchesOrderSearch(order, normalizedQuery) {
  if (!normalizedQuery) return true;
  const haystack = [order.id, order.table, order.notes, ...(order.items ?? [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function matchesStatusFilter(order, statusFilter) {
  if (statusFilter === 'all') return true;
  return order.status === statusFilter;
}

export function matchesDepartmentFilter(order, departmentKey) {
  if (departmentKey === 'all') return true;
  // Use _rawItems (enriched with _deptKey) for reliable department matching
  const rawItems = order._rawItems || [];
  if (departmentKey === DEPARTMENT.kitchen) {
    return rawItems.some(ri => ri._deptKey === 'kitchen');
  }
  if (departmentKey === DEPARTMENT.barista) {
    return rawItems.some(ri => ri._deptKey === 'barista');
  }
  return true;
}

export function resolveDepartmentScope(roleKey, departmentFilter) {
  if (departmentFilter !== 'auto') return departmentFilter;
  if (roleKey === 'chef') return DEPARTMENT.kitchen;
  if (roleKey === 'barista') return DEPARTMENT.barista;
  return 'all';
}

export function filterOrders(orders, { normalizedQuery, statusFilter, departmentKey }) {
  return orders.filter(
    (order) =>
      matchesStatusFilter(order, statusFilter) &&
      matchesDepartmentFilter(order, departmentKey) &&
      matchesOrderSearch(order, normalizedQuery),
  );
}
