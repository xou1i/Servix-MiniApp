/**
 * Barrel export — import all services from one place:
 *
 *   import { authService, ordersService, tablesService, menuService, paymentsService } from '@/services';
 *
 * Or import individually:
 *
 *   import { tablesService } from '@/services/tables.service';
 */

export { default as api }       from './api';
export { authService }          from './auth.service';
export { tablesService }        from './tables.service';
export { menuService }          from './menu.service';
export { ordersService }        from './orders.service';
export { paymentsService }      from './payments.service';
