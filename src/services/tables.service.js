import api, { unwrap } from './api';

export const tablesService = {
  /**
   * GET /api/v1/Tables
   * Returns flat array of tables (unwraps { success, data } envelope)
   */
  getAll: async () => {
    const { data } = await api.get('/Tables');
    const result = unwrap(data);
    
    let arr = [];
    // Aggressive extraction (same logic as Orders)
    if (Array.isArray(result)) arr = result;
    else if (result && typeof result === 'object') {
      if (Array.isArray(result.items)) arr = result.items;
      else if (Array.isArray(result.data)) arr = result.data;
      else if (Array.isArray(result.tables)) arr = result.tables;
      
      // Handle backend dictionaries: { "0": { id: ... }, "1": { id: ... } }
      if (Object.values(result).length > 0 && typeof Object.values(result)[0] === 'object') {
        arr = Object.values(result);
      }
    }
    
    // Fallback dictionary for mock-patching missing backend persistence
    const localPatches = JSON.parse(localStorage.getItem('servix_table_patches') || '{}');
    
    return arr.map(t => {
      const status = localPatches[t.id || t.tableId || t._id] || t.status || (t.isAvailable ? 'Available' : 'Occupied');
      return {
        ...t,
        status: status,
        isAvailable: status === 'Available'
      };
    });
  },

  /**
   * GET /api/v1/Tables/available
   * Returns only available tables
   */
  getAvailable: async () => {
    const { data } = await api.get('/Tables/available');
    return unwrap(data);
  },

  /**
   * GET /api/public/tables/by-code/{code}
   * Get table via QR code scan
   *
   * NOTE: This endpoint is under /api/public (no /v1), so we use
   * an absolute path relative to the origin, bypassing the baseURL.
   */
  getByQrCode: async (code) => {
    // Use full path to avoid /api/v1 baseURL prefix
    // The URL safety interceptor skips paths containing /api/public
    const { data } = await api.get(`/api/public/tables/by-code/${code}`, {
      baseURL: '', // Override baseURL to use absolute path
    });
    return unwrap(data);
  },

  updateStatus: async (id, status) => {
    try {
      // 1. Fetch current table to ensure we have the full payload
      const { data: currentData } = await api.get(`/Tables/${id}`);
      const table = unwrap(currentData);
      
      // 2. Put the full table
      // Note: we pass status AND isAvailable to align with backend GUID
      const isAvailable = status === 'Available';
      const { data: updatedData } = await api.put(`/Tables/${id}`, { ...table, status, isAvailable });
      
      // 3. Persist local patch because backend DTO currently loses the status property
      const localPatches = JSON.parse(localStorage.getItem('servix_table_patches') || '{}');
      localPatches[id] = status;
      localStorage.setItem('servix_table_patches', JSON.stringify(localPatches));

      return unwrap(updatedData);
    } catch (err) {
      console.error('[TablesService] Error updating table status:', err);
      // Fallback: If backend crashes (e.g. 400 Bad Request) on PUT because of the missing fields,
      // we STILL save it to localStorage so the UI works like magic.
      const localPatches = JSON.parse(localStorage.getItem('servix_table_patches') || '{}');
      localPatches[id] = status;
      localStorage.setItem('servix_table_patches', JSON.stringify(localPatches));
      
      throw err;
    }
  },
};
