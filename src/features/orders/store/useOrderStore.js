import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupId } from '../utils/cartUtils';
import { orderSyncService } from '../api/OrderSyncService';
import { menuService } from '../../../services/menu.service';

export const useOrderStore = create((set, get) => ({
  // --- 1. UI TEMPORARY CONTEXT & SEARCH STATE ---
  context: { type: null, tableId: null, delivery: null },
  view: { activeCategoryId: 'cat_all', searchQuery: '', isContextModalOpen: false },
  
  // --- MENU DATA STATE ---
  menuItems: [],
  categories: [{ id: 'cat_all', name: 'الكل', icon: 'LayoutGrid' }],
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
      const items = await menuService.getAll();
      
      // Map categories
      const dynamicCategories = [{ id: 'cat_all', name: 'الكل', icon: 'LayoutGrid' }];
      const catSet = new Set();
      
      items.forEach(item => {
        const cat = item.category || item.target_department;
        if (cat && !catSet.has(cat)) {
          catSet.add(cat);
          dynamicCategories.push({
            id: cat,
            name: cat,
            icon: 'LayoutGrid' // Standard fallback icon
          });
        }
      });
      
      set({ menuItems: items, categories: dynamicCategories, isLoadingMenu: false });
    } catch (err) {
      console.error('[Menu] Failed to fetch:', err);
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
            productId: product.id, 
            name: product.nameAr || product.name,
            unitPrice: product.price,
            modifiers, 
            notes, 
            qty: 1,
            product // keeping a ref to product for image/rendering logic
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
       view: { isContextModalOpen: false, activeCategoryId: 'cat_all', searchQuery: '' },
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
    set({ lifecycle: 'sending' }); // Intermediate state for UI loading

    try {
      // Connect to WebSocket if not already connected
      if (!orderSyncService.isConnected) orderSyncService.connect();

      // Transmit the payload over the bridging service
      await orderSyncService.sendOrder({
        context: state.context,
        cart: state.cart,
        orderNote: state.orderNote
      });

      set({ lifecycle: 'sent', undoStack: [] });
      if (onSuccess) onSuccess({ context: state.context, cart: state.cart, orderNote: state.orderNote }); // Fire callback with payload
      get().clearOrder(); // Clean synchronously to prevent frozen state
    } catch (err) {
      console.error('Order submission failed: ', err);
      set({ lifecycle: 'draft' }); // Graceful Rollback
    }
  }
}));
