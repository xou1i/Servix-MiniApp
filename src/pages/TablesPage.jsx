// TablesPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useOrderStore } from '../features/orders/store/useOrderStore';
import { tablesService } from '../services/tables.service';
import TableSpot from '../components/tables/TableSpot';

// ─── Zones ─────────────────────────────────────────────────────────────────
const ZONES = ['الصالة الرئيسية', 'قاعة VIP', 'الخارجي'];

const TABLE_STATUSES = [
  { key: 'Available',   label: 'متاح',  color: 'bg-emerald-400' },
  { key: 'Occupied',    label: 'مشغول', color: 'bg-rose-400' },
  { key: 'Reserved',    label: 'محجوز', color: 'bg-amber-400' },
  { key: 'Maintenance', label: 'صيانة', color: 'bg-slate-400' },
];

// ─── Metric Card ───────────────────────────────────────────────────────────
function MetricCard({ value, label, dotColor, border = false }) {
  return (
    <div className={`flex flex-col items-end justify-center px-8 py-5 ${border ? 'border-r border-slate-200' : ''}`}>
      <div className="flex items-baseline gap-2 flex-row-reverse">
        <span className="text-4xl font-black tracking-tight text-slate-800 tabular-nums" dir="ltr">{value}</span>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
      </div>
      <span className="text-sm font-semibold text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Table Action Modal ─────────────────────────────────────────────
function TableActionModal({ table, onClose, onStatusChange, onAction }) {
  if (!table) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800">
            إدارة طاولة T{table.tableNumber}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="mb-6 mb-6">
          <button 
             onClick={() => onAction(table)} 
             className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all shadow-md ${
               table.status === 'Available' ? 'bg-[#1D4E89] hover:bg-[#163d6b] shadow-[#1D4E89]/20' 
               : table.status === 'Occupied' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
               : 'bg-slate-400 opacity-50 cursor-not-allowed'
             }`}
             disabled={table.status !== 'Available' && table.status !== 'Occupied'}
          >
            {table.status === 'Available' ? 'إنشاء طلب جديد' : table.status === 'Occupied' ? 'عرض / إضافة للطلب' : 'لا يمكن إنشاء طلب'}
          </button>
        </div>
        
        <div className="w-full h-px bg-slate-100 mb-5 relative">
           <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 font-bold">أو تغيير الحالة</span>
        </div>

        {/* Status Options */}
        <div className="flex flex-col gap-2.5">
          {TABLE_STATUSES.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => onStatusChange(table.id, key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-right ${
                table.status === key
                  ? 'bg-slate-50 border-slate-300 ring-2 ring-slate-200'
                  : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color}`} />
              <span className="font-bold text-sm text-slate-700">{label}</span>
              {table.status === key && (
                <span className="mr-auto text-[10px] font-bold text-slate-400">الحالة الحالية</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function TablesPage() {
  const [allTables, setAllTables] = useState([]);
  const [activeZone, setActiveZone] = useState('الصالة الرئيسية');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null); // For single action modal
  
  // ── Edit Mode State ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { setContext } = useOrderStore();

  // Fetch tables from API
  const fetchTables = useCallback(() => {
    setLoading(true);
    tablesService.getAll()
      .then(data => {
        let extracted = Array.isArray(data) ? data : [];

        const normalized = extracted.map(t => ({
          ...t,
          id: t.id || t.tableId || t.code || t._id,
          tableNumber: t.tableNumber ?? t.code ?? t.number ?? t.name ?? '?',
          status: t.status
            ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()
            : 'Available',
          shape: t.shape ?? (t.capacity >= 6 ? 'rectangle' : t.capacity <= 2 ? 'circle' : 'square'),
          capacity: t.capacity ?? t.seatsCount ?? 4,
          isOrderingEnabled: t.isOrderingEnabled !== false,
        })).sort((a, b) => {
          const nA = parseInt((a.tableNumber || '').toString().replace(/\D/g, '')) || 0;
          const nB = parseInt((b.tableNumber || '').toString().replace(/\D/g, '')) || 0;
          return nA - nB || (a.tableNumber || '').toString().localeCompare((b.tableNumber || '').toString());
        });

        setAllTables(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tables:', err);
        setError('فشل تحميل الطاولات');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Compute metrics across ALL tables
  const metrics = useMemo(() => {
    const total = allTables.length || 1;
    const occupied = allTables.filter(t => t.status === 'Occupied').length;
    const available = allTables.filter(t => t.status === 'Available').length;
    const reserved = allTables.filter(t => t.status === 'Reserved').length;
    return {
      occupancyPct: Math.round((occupied / total) * 100),
      occupied, available, reserved,
    };
  }, [allTables]);

  // Zone filtering
  const zoneTables = useMemo(() => {
    if (!Array.isArray(allTables)) return [];
    return allTables.filter(t => {
      const loc = (t.location || t.zone || '').toLowerCase();
      if (activeZone === 'الصالة الرئيسية') return loc.includes('main') || loc.includes('رئيسية');
      if (activeZone === 'قاعة VIP')        return loc.includes('vip');
      if (activeZone === 'الخارجي')         return loc.includes('outdoor') || loc.includes('خارج');
      return true;
    });
  }, [allTables, activeZone]);

  // ── Click handler: open modal OR cycle status if in edit mode
  const handleTableClick = (table) => {
    if (isEditMode) {
      // Cycle status locally
      const currentStatus = pendingChanges[table.id] || table.status;
      const keys = TABLE_STATUSES.map(s => s.key);
      let nextIndex = keys.indexOf(currentStatus) + 1;
      if (nextIndex >= keys.length) nextIndex = 0;
      setPendingChanges(prev => ({ ...prev, [table.id]: keys[nextIndex] }));
      return;
    }

    if (!table.isOrderingEnabled) return;
    setSelectedTable(table);
  };

  const handleTableAction = (table) => {
    if (table.status === 'Available') {
      setContext({ type: 'dine-in', tableId: table.id, tableCode: table.tableNumber, delivery: null });
      navigate('/pos');
    } else if (table.status === 'Occupied') {
      navigate('/orders');
    }
    setSelectedTable(null);
  };

  // ── Status change handler ──
  const handleStatusChange = async (tableId, newStatus) => {
    // Optimistic UI update
    setAllTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, status: newStatus } : t
    ));
    setSelectedTable(null);

    // Sync with backend
    try {
      await tablesService.updateStatus(tableId, newStatus);
    } catch (err) {
      console.error('Failed to update table status:', err);
      // Rollback on error
      fetchTables();
    }
  };

  // ── Save Batch Changes ──
  const handleSaveEdits = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setIsEditMode(false);
      return;
    }
    setIsSaving(true);
    try {
      // Execute all pending changes
      await Promise.all(
        Object.entries(pendingChanges).map(([id, st]) => tablesService.updateStatus(id, st))
      );
      // Confirm changes visually and reset
      setAllTables(prev => prev.map(t => 
        pendingChanges[t.id] ? { ...t, status: pendingChanges[t.id] } : t
      ));
      setPendingChanges({});
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to save batch edits:', err);
      // Refresh to fix any desync
      fetchTables();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-0 animate-fade-in" dir="rtl">

      {/* ── Metrics Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-slate-100">
        <MetricCard value={`${metrics.occupancyPct}%`} label="إشغال" dotColor="bg-slate-400" />
        <MetricCard value={metrics.reserved} label="محجوزة" dotColor="bg-amber-400" border />
        <MetricCard value={metrics.available} label="متاحة" dotColor="bg-emerald-400" border />
        <MetricCard value={metrics.occupied} label="مشغولة" dotColor="bg-rose-400" border />
      </div>

      {/* ── Zone Tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-8 border-b border-slate-200 mt-6 px-1">
        {ZONES.map(zone => (
          <button
            key={zone}
            onClick={() => setActiveZone(zone)}
            className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeZone === zone
              ? 'text-slate-900'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {zone}
            {activeZone === zone && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Floor Map Header / Toolbars ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-2 mt-4 px-1">
         <p className="text-[11px] font-semibold text-slate-400">
           {isEditMode 
             ? "قم بالضغط على الطاولة لتغيير حالتها بشكل سريع. ثم اضغط خيار الحفظ عند الانتهاء."
             : "💡 اضغط على الطاولة لعرض خيارات الإنشاء أو الدخول لنمط تعديل الحالة"}
         </p>
         
         {!isEditMode ? (
           <button 
             onClick={() => setIsEditMode(true)} 
             className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
           >
             تغيير حالة الطاولات
           </button>
         ) : (
           <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsEditMode(false); setPendingChanges({}); }} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                disabled={isSaving}
              >
                إلغاء التعديل
              </button>
              <button 
                onClick={handleSaveEdits} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                disabled={isSaving}
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
           </div>
         )}
      </div>

      {/* ── Floor Map ────────────────────────────────────────────────────── */}
      <div className={`relative rounded-2xl overflow-hidden border shadow-inner transition-colors duration-300 ${isEditMode ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-200'}`} style={{ minHeight: 480 }}>

        {/* Checkered floor background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#E8EAF0',
            backgroundImage:
              'linear-gradient(45deg,#D8DAE4 25%,transparent 25%),' +
              'linear-gradient(-45deg,#D8DAE4 25%,transparent 25%),' +
              'linear-gradient(45deg,transparent 75%,#D8DAE4 75%),' +
              'linear-gradient(-45deg,transparent 75%,#D8DAE4 75%)',
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0,0 14px,14px -14px,-14px 0',
          }}
        />

        {/* Entrance marker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-stone-200/90 backdrop-blur-sm border-x border-b border-stone-300 rounded-b-xl px-12 py-1.5">
          <span className="text-[11px] font-black text-stone-600 tracking-widest">المدخل</span>
        </div>

        {/* Tables grid */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative z-0 px-8 pt-14 pb-8">
            <div
              className="grid justify-items-center"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px 4px',
              }}
            >
              {zoneTables.map(table => {
                const isPending = !!pendingChanges[table.id];
                const displayStatus = pendingChanges[table.id] || table.status;
                const displayTable = { ...table, status: displayStatus };
                
                return (
                  <div key={table.id} className="relative group">
                    {isPending && (
                       <span className="absolute -top-1 -right-1 z-50 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse" title="تغيير غير محفوظ" />
                    )}
                    <TableSpot
                      table={displayTable}
                      onClick={() => handleTableClick(table)}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                );
              })}
            </div>

            {zoneTables.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <p className="font-bold text-lg">لا توجد طاولات في هذه المنطقة</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 justify-center mt-4 flex-wrap">
        {TABLE_STATUSES.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs font-bold text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Action Modal ──────────────────────────────────────────── */}
      <TableActionModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onStatusChange={handleStatusChange}
        onAction={handleTableAction}
      />

    </section>
  );
}
