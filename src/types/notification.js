/**
 * @typedef {'new_order'|'status_updated'|'delayed'|'item_unavailable'} NotificationType
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {NotificationType} type
 * @property {string} title
 * @property {string} body
 * @property {boolean} read
 * @property {number} createdAt
 * @property {string} [orderId]
 */

/** @typedef {AppNotification} NotificationSeed */
export {};
