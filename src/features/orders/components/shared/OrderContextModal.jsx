import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { tablesService } from '../../../../services/tables.service';
import TableSpot from '../../../../components/tables/TableSpot';

const ZONES = ['الصالة الرئيسية', 'قاعة VIP', 'الخارجي'];

export default function OrderContextModal() {
  const { view, context, setContext, closeContextModal } = useOrderStore();
  const navigate = useNavigate();

  const [tables,    setTables]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeZone, setActiveZone] = useState('الصالة الرئيسية');

  // ── Edit Mode State ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!view.isContextModalOpen) return;
    if (context.type === 'delivery') return;
    setLoading(true);
    tablesService.getAll()
      .then(data => {
        const normalized = (Array.isArray(data) ? data : []).map(t => ({
          ...t,
          id: t.id || t.tableId || t.code || t._id,
          tableNumber: t.tableNumber ?? t.number ?? t.name ?? '?',
          status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase() : 'Available',
          shape: t.shape ?? (t.capacity >= 6 ? 'rectangle' : t.capacity <= 2 ? 'circle' : 'square'),
          capacity: t.capacity ?? t.seatsCount ?? 4,
          isOrderingEnabled: t.isOrderingEnabled !== false,
        })).sort((a,b) => {
          const nA = parseInt((a.tableNumber || '').toString().replace(/\D/g, '')) || 0;
          const nB = parseInt((b.tableNumber || '').toString().replace(/\D/g, '')) || 0;
          return nA - nB || (a.tableNumber || '').toString().localeCompare((b.tableNumber || '').toString());
        });
        setTables(normalized);
        setLoading(false);
      })
      .catch(err => { console.error('Failed to load tables:', err); setLoading(false); });
  }, [view.isContextModalOpen, context.type]);

  if (!view.isContextModalOpen) return null;

  const handleTableClick = (table) => {
    if (isEditMode) {
      const TABLE_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
      const currentStatus = pendingChanges[table.id] || table.status;
      let nextIndex = TABLE_STATUSES.indexOf(currentStatus) + 1;
      if (nextIndex >= TABLE_STATUSES.length) nextIndex = 0;
      setPendingChanges(prev => ({ ...prev, [table.id]: TABLE_STATUSES[nextIndex] }));
      return;
    }

    if (!table.isOrderingEnabled) return;
    // In modal we only select available tables for new orders
    if (table.status === 'Available') {
      setContext({ type: 'dine-in', tableId: table.id, tableCode: table.tableNumber, delivery: null });
      // setContext already closes modal via reducer
    }
  };

  const handleSaveEdits = async () => {
    if (Object.keys(pendingChanges).length === 0) { setIsEditMode(false); return; }
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(pendingChanges).map(([id, st]) => tablesService.updateStatus(id, st)));
      setTables(prev => prev.map(t => pendingChanges[t.id] ? { ...t, status: pendingChanges[t.id] } : t));
      setPendingChanges({});
      setIsEditMode(false);
    } catch (err) {
      console.error('Save failed:', err);
      // Optional fallback fetch here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!context.type) navigate('/orders');
    else closeContextModal();
  };

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setContext({
      type: 'delivery',
      tableId: null,
      tableCode: null,
      delivery: { phone: fd.get('phone'), name: fd.get('name'), address: fd.get('address') },
    });
  };

  const zoneTables = tables.filter(t => {
    const loc = (t.location || t.zone || '').toLowerCase();
    if (activeZone === 'الصالة الرئيسية') return loc.includes('main') || loc.includes('رئيسية');
    if (activeZone === 'قاعة VIP')        return loc.includes('vip');
    if (activeZone === 'الخارجي')         return loc.includes('outdoor') || loc.includes('خارج');
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="w-full max-h-[92vh] max-w-5xl bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-pos-entrance">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-bold text-xl text-slate-800">
              {context.type === 'delivery' ? 'بيانات التوصيل' : 'اختر الطاولة'}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {context.type === 'delivery' ? 'أدخل بيانات العميل للتوصيل' : 'اضغط على طاولة متاحة لإنشاء الطلب'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Table Map ── */}
          {context.type !== 'delivery' && (
            <div className="flex flex-col">

              {/* Zone tabs & Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-200 px-7 shrink-0">
                <div className="flex gap-6">
                  {ZONES.map(zone => (
                    <button
                      key={zone}
                      onClick={() => setActiveZone(zone)}
                      className={`py-3 text-sm font-bold transition-colors relative whitespace-nowrap ${
                        activeZone === zone ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {zone}
                      {activeZone === zone && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Edit Mode Toolbar */}
                <div className="flex py-2">
                  {!isEditMode ? (
                    <button 
                      onClick={() => setIsEditMode(true)} 
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center"
                    >
                      تغيير حالة الطاولات
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setIsEditMode(false); setPendingChanges({}); }} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        disabled={isSaving}
                      >
                        إلغاء التعديل
                      </button>
                      <button 
                        onClick={handleSaveEdits} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
                        disabled={isSaving}
                      >
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Map canvas — scrollable both axes */}
              <div
                className="m-5 rounded-2xl border border-slate-200 overflow-auto"
                style={{ maxHeight: 380, cursor: 'grab' }}
              >
                {/* Inner: fixed size so it can overflow in both directions */}
                <div
                  className="relative"
                  style={{
                    minWidth: 860,
                    minHeight: 360,
                    backgroundColor: '#E8EAF0',
                    backgroundImage:
                      'linear-gradient(45deg,#D8DAE4 25%,transparent 25%),' +
                      'linear-gradient(-45deg,#D8DAE4 25%,transparent 25%),' +
                      'linear-gradient(45deg,transparent 75%,#D8DAE4 75%),' +
                      'linear-gradient(-45deg,transparent 75%,#D8DAE4 75%)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
                  }}
                >
                  {/* Entrance marker */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-stone-200/90 border-x border-b border-stone-300 rounded-b-xl px-10 py-1">
                    <span className="text-[10px] font-black text-stone-600 tracking-widest">المدخل</span>
                  </div>

                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <div className="relative z-0 px-8 pt-12 pb-8">
                      <div
                        className="grid"
                        style={{ gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '8px 0' }}
                      >
                        {zoneTables.map(table => {
                          const isPending = !!pendingChanges[table.id];
                          const displayStatus = pendingChanges[table.id] || table.status;
                          const displayTable = { ...table, status: displayStatus };
                          
                          return (
                            <div key={table.id} className="relative group">
                              {isPending && (
                                <span className="absolute top-1 right-1 z-50 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse" title="تغيير غير محفوظ" />
                              )}
                              <TableSpot
                                table={displayTable}
                                onClick={() => handleTableClick(table)}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {zoneTables.length === 0 && (
                        <div className="flex items-center justify-center py-20 text-slate-400 font-bold">
                          لا توجد طاولات في هذه المنطقة
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 justify-center pb-5 flex-wrap">
                {[
                  { label: 'متاح — اضغط لفتح طلب', color: 'bg-emerald-400' },
                  { label: 'مشغول', color: 'bg-rose-400' },
                  { label: 'محجوز', color: 'bg-amber-400' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Delivery Form ── */}
          {context.type === 'delivery' && (
            <form onSubmit={handleDeliverySubmit} className="p-8 max-w-md mx-auto space-y-5">
              {[
                { name: 'phone', label: 'رقم الجوال', type: 'tel', placeholder: '05xxxxxxxx' },
                { name: 'name',  label: 'اسم العميل', type: 'text', placeholder: 'محمد أحمد...' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">{f.label}</label>
                  <input
                    name={f.name} required type={f.type} placeholder={f.placeholder}
                    defaultValue={context.delivery?.[f.name] || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)] transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">العنوان التفصيلي</label>
                <textarea
                  name="address" required placeholder="الحي، الشارع..."
                  defaultValue={context.delivery?.address || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)] transition min-h-[80px]"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4 rounded-xl">
                حفظ بيانات التوصيل
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
