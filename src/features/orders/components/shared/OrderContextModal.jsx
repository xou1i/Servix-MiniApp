import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { fetchTablesMock } from '../../../../api/tablesMock';
import TableSpot from '../../../../components/tables/TableSpot';

const ZONES = ['الصالة الرئيسية', 'قاعة VIP', 'الخارجي'];

export default function OrderContextModal() {
  const { view, context, setContext, closeContextModal } = useOrderStore();
  const navigate = useNavigate();

  const [tables,    setTables]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeZone, setActiveZone] = useState('الصالة الرئيسية');

  useEffect(() => {
    if (!view.isContextModalOpen) return;
    if (context.type === 'delivery') return;
    setLoading(true);
    fetchTablesMock().then(data => {
      setTables(data);
      setLoading(false);
    });
  }, [view.isContextModalOpen, context.type]);

  if (!view.isContextModalOpen) return null;

  const handleTableClick = (table) => {
    if (!table.isOrderingEnabled) return;
    // In modal we only select available tables for new orders (occupied handled from orders page)
    if (table.status === 'Available') {
      setContext({ type: 'dine-in', tableId: table.id, delivery: null });
      // setContext already closes modal via reducer
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
      delivery: { phone: fd.get('phone'), name: fd.get('name'), address: fd.get('address') },
    });
  };

  const zoneTables = tables.filter(t => t.zone === activeZone);

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

              {/* Zone tabs */}
              <div className="flex gap-6 border-b border-slate-200 px-7 shrink-0">
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
                        {zoneTables.map(table => (
                          <TableSpot
                            key={table.id}
                            table={table}
                            onClick={() => handleTableClick(table)}
                          />
                        ))}
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
