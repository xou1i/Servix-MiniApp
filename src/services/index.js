/**
 * Barrel export — import all services from one place:
 *
 *   import { authService, ordersService, tablesService, menuService, paymentsService, usersService } from '@/services';
 *
 * Or import individually:
 *
 *   import { tablesService } from '@/services/tables.service';
 */

export { default as api }       from './api';
export { unwrap, classifyError, ERROR_TYPES } from './api';
export { authService }          from './auth.service';
export { tablesService }        from './tables.service';
export { menuService }          from './menu.service';
export { ordersService }        from './orders.service';
export { paymentsService }      from './payments.service';
export { usersService }         from './users.service';
export { signalRService }       from './signalr.service';
