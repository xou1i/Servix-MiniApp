// useOrderStore.js
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupId } from '../utils/cartUtils';
import { orderSyncService } from '../api/OrderSyncService';
import { menuService } from '../../../services/menu.service';
import { ordersService } from '../../../services/orders.service';
import { tablesService } from '../../../services/tables.service';
import { authService } from '../../../services/auth.service';
import api, { unwrap } from '../../../services/api';

export const useOrderStore = create((set, get) => ({
  // --- 1. UI TEMPORARY CONTEXT & SEARCH STATE ---
  context: { type: null, tableId: null, delivery: null },
  view: { activeCategoryId: 'cat_all', activeDepartmentId: null, searchQuery: '', isContextModalOpen: false },

  // --- MENU DATA STATE ---
  menuItems: [],
  categories: [],
  departments: [],
  isLoadingMenu: false,

  // --- 2. ORDER LIFECYCLE DOMAIN ---
  lifecycle: 'draft', // 'draft' | 'sent' | 'locked' | 'completed'

  // --- 3. CART STATE & UNDO STACK ---
  cart: [],
  orderNote: "",
  undoStack: [], // Array of previous cart arrays (Max length: 5)

  // --- ACTIONS: UI CONTEXT ---
  setContext: (updates) => set((state) => ({ context: { ...state.context, ...updates }, view: { ...state.view, isContextModalOpen: false } })),
  openContextModal: () => set((state) => ({ view: { ...state.view, isContextModalOpen: true } })),
  closeContextModal: () => set((state) => ({ view: { ...state.view, isContextModalOpen: false } })),
  setCategory: (categoryId) => set((state) => ({ view: { ...state.view, activeCategoryId: categoryId } })),
  setSearchQuery: (query) => set((state) => ({ view: { ...state.view, searchQuery: query } })),
  setOrderNote: (note) => set({ orderNote: note }),

  // --- ACTIONS: DATA FETCHING ---
  fetchMenu: async () => {
    set({ isLoadingMenu: true });
    try {
      const results = await Promise.allSettled([
        menuService.getAll(),
        menuService.getDepartments(),
        menuService.getCategories()
      ]);

      let iVal = results[0].status === 'fulfilled' ? results[0].value : [];
      let dVal = results[1].status === 'fulfilled' ? results[1].value : [];
      let cVal = results[2].status === 'fulfilled' ? results[2].value : [];

      const extract = (val) => {
        if (Array.isArray(val)) return val;
        if (val && typeof val === 'object') {
          if (Array.isArray(val.items)) return val.items;
          if (Array.isArray(val.data)) return val.data;
        }
        return [];
      };

      const extractedItems = extract(iVal);
      const extractedDepts = extract(dVal);
      const extractedCats = extract(cVal);

      console.log("MENU SETTLED:", { items: extractedItems, departments: extractedDepts, categories: extractedCats });

      const builtDepts = Array.from(
        new Map(
          extractedCats
            .filter(c => c.departmentId && c.departmentName)
            .map(c => [c.departmentId, { id: c.departmentId, name: c.departmentName }])
        ).values()
      );

      set({ 
        menuItems: extractedItems,
        departments: builtDepts,
        categories: extractedCats,
        isLoadingMenu: false 
      });
    } catch (err) {
      console.error('[Menu] Failed to settle fetches:', err);
      set({ isLoadingMenu: false });
    }
  },

  // --- ACTIONS: CART MUTATION (With Grouping & Undo) ---
  addItem: (product, modifiers = [], notes = "") => {
    const currentState = get();

    const prevState = currentState.cart;
    const groupId = generateGroupId(product.id, modifiers, notes);

    set((state) => {
      const existing = state.cart.find(i => i.groupId === groupId);
      const newCart = existing
        ? state.cart.map(i => i.groupId === groupId ? { ...i, qty: i.qty + 1 } : i)
        : [...state.cart, {
          id: uuidv4(),
          groupId,
          productId: product.id,  // Backend GUID — used in submitOrder payload
          name: product.name || product.nameAr || 'صنف',
          unitPrice: product.price ?? product.unitPrice ?? 0,
          modifiers,
          notes,
          qty: 1,
          product
        }];

      return {
        cart: newCart,
        undoStack: [...state.undoStack, prevState].slice(-5)
      };
    });
  },

  updateQuantity: (groupId, delta) => {
    const currentState = get();

    const prevState = currentState.cart;

    set((state) => {
      const newCart = state.cart.map(item => {
        if (item.groupId === groupId) {
          const newQty = item.qty + delta;
          return { ...item, qty: Math.max(0, newQty) }; // Keep at 0 to filter out next step, or max 1
        }
        return item;
      }).filter(item => item.qty > 0);

      return { cart: newCart, undoStack: [...state.undoStack, prevState].slice(-5) };
    });
  },

  removeItem: (groupId) => {
    const currentState = get();

    const prevState = currentState.cart;

    set((state) => ({
      cart: state.cart.filter(item => item.groupId !== groupId),
      undoStack: [...state.undoStack, prevState].slice(-5)
    }));
  },

  splitItem: (groupId) => {
    const currentState = get();

    const prevState = currentState.cart;

    set((state) => {
      const existingItem = state.cart.find(i => i.groupId === groupId);
      if (!existingItem || existingItem.qty <= 1) return state; // Nothing to split

      // Reduce original by 1
      const itemReduced = { ...existingItem, qty: existingItem.qty - 1 };

      // Create new detached item with exact same group temporarily? 
      // Wait, if it has the exact same group, future adds will just merge back into the old one.
      // We should generate a unique ID to decouple it from grouping or leave it with same group 
      // and just let it render distinctly until they change notes. 
      // Actually, assigning it a unique ID as groupId forces split.
      const detachedItem = {
        ...existingItem,
        qty: 1,
        id: uuidv4(),
        groupId: uuidv4() // Break grouping to ensure it stays split!
      };

      const newCart = state.cart.map(i => i.groupId === groupId ? itemReduced : i).concat(detachedItem);

      return { cart: newCart, undoStack: [...state.undoStack, prevState].slice(-5) };
    });
  },

  undoLastAction: () => {
    set((state) => {
      if (state.undoStack.length === 0 || state.lifecycle !== 'draft') return {};
      const previousCart = state.undoStack[state.undoStack.length - 1];
      return { cart: previousCart, undoStack: state.undoStack.slice(0, -1) };
    });
  },

  // --- ACTIONS: LIFECYCLE ---
  clearOrder: () => {
    set({
      cart: [],
      orderNote: '',
      undoStack: [],
      context: { type: null, tableId: null, delivery: null },
      view: { isContextModalOpen: false, activeCategoryId: 'cat_all', activeDepartmentId: null, searchQuery: '' },
      lifecycle: 'draft'
    });
  },

  // --- ACTIONS: SERVER SYNC (Called natively by SignalR Event Handlers) ---
  syncOrderLifecycle: (newStatus) => {
    // E.g. Kitchen accepts order -> transitions to 'locked'
    set({ lifecycle: newStatus });
  },

  submitOrder: async (onSuccess) => {
    const state = get();

    // Validate before sending
    if (state.cart.length === 0) {
      console.warn('[Order] Cart is empty — aborting submission.');
      return;
    }

    set({ lifecycle: 'sending' });

    try {
      const storedUser = authService.getStoredUser();
      const orderTypeMap = {
        'dine-in': 'DineIn',
        'takeaway': 'TakeAway',
        'delivery': 'Delivery'
      };

      const payload = {
        userId: storedUser?.id || null,
        orderType: orderTypeMap[state.context.type] ?? 'DineIn',
        tableId: state.context.type === 'dine-in' ? (state.context.tableId || null) : null,
        specialNotes: state.orderNote || '',
        items: state.cart.map(item => ({
          menuItemId: item.productId || item.id,
          quantity: item.qty || 1,
          specialInstructions: item.notes || ''
        })),
        // Delivery fields — required by Render backend for Delivery orders
        deliveryAddress: state.context.delivery?.address || '',
        customerPhoneNumber: state.context.delivery?.phone || '',
        deliveryFee: 0,
        latitude: 0,
        longitude: 0,
      };

      console.log('[Order] Submitting payload to Swagger DTO:', payload);

      const result = await ordersService.create(payload);

      console.log('[Order] Created successfully:', result);

      // Patch the result with local data so the OrderCard renders correctly instantly.
      // Use state.context.tableCode which holds the human-readable table number (e.g., M1).
      const fullResult = {
        ...result,
        tableNumber: state.context.tableCode || payload.tableId,
        notes: payload.specialNotes,
        items: state.cart.map(i => ({
          menuItemName: i.name || 'صنف',
          quantity: i.qty || 1,
          departmentName: i.product?.departmentName || '' // Critical for barista vs kitchen split
        }))
      };

      // Auto-update table status to Occupied
      if (payload.tableId) {
        try {
          await tablesService.updateStatus(payload.tableId, 'Occupied');
        } catch (e) {
          console.warn('[Order] Could not auto-update table status to Occupied:', e);
        }
      }

      // Mark as sent first so UI shows success state briefly
      set({ lifecycle: 'sent', undoStack: [] });

      // Trigger success callback (refetch + navigate) THEN clear cart
      if (onSuccess) await onSuccess(fullResult);

      // Clear cart after navigation is triggered
      setTimeout(() => {
        get().clearOrder();
      }, 300);

    } catch (err) {
      console.error('[Order] Submission failed:', err?.response?.data || err.message);
      set({ lifecycle: 'draft' });
    }
  }
}));
