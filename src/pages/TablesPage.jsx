import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../features/orders/store/useOrderStore';
import { tablesService } from '../services/tables.service';
import TableSpot from '../components/tables/TableSpot';

// ─── Zones ─────────────────────────────────────────────────────────────────
const ZONES = ['الصالة الرئيسية', 'قاعة VIP', 'الخارجي'];

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

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function TablesPage() {
  const [allTables, setAllTables]   = useState([]);
  const [activeZone, setActiveZone] = useState('الصالة الرئيسية');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const navigate    = useNavigate();
  const { setContext } = useOrderStore();

  // Fetch tables from API
  useEffect(() => {
    let active = true;
    setLoading(true);
    tablesService.getAll()
      .then(data => {
        if (active) { setAllTables(data); setLoading(false); }
      })
      .catch(err => {
        console.error('Failed to fetch tables:', err);
        if (active) { setError('فشل تحميل الطاولات'); setLoading(false); }
      });
    return () => { active = false; };
  }, []);

  // Compute metrics across ALL tables
  const metrics = useMemo(() => {
    const total    = allTables.length || 1;
    const occupied = allTables.filter(t => t.status === 'Occupied').length;
    const available= allTables.filter(t => t.status === 'Available').length;
    const reserved = allTables.filter(t => t.status === 'Reserved').length;
    return {
      occupancyPct: Math.round((occupied / total) * 100),
      occupied, available, reserved,
    };
  }, [allTables]);

  // Filter tables by active zone tab
  const zoneTables = useMemo(
    () => allTables.filter(t => t.zone === activeZone),
    [allTables, activeZone]
  );

  // ── Click handler: preserves order-creation logic ──
  const handleTableClick = (table) => {
    if (!table.isOrderingEnabled) return;
    if (table.status === 'Available') {
      setContext({ type: 'dine-in', tableId: table.id, delivery: null });
      navigate('/pos');
    } else if (table.status === 'Occupied') {
      navigate('/orders');
    }
    // Reserved / Maintenance: no-op for now
  };

  return (
    <section className="flex flex-col gap-0 animate-fade-in" dir="rtl">

      {/* ── Metrics Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-slate-100">
        {/* Occupancy — leftmost in RTL = rightmost slot visually */}
        <MetricCard value={`${metrics.occupancyPct}%`} label="إشغال" dotColor="bg-slate-400" />
        <MetricCard value={metrics.reserved}           label="محجوزة"  dotColor="bg-amber-400" border />
        <MetricCard value={metrics.available}          label="متاحة"   dotColor="bg-emerald-400" border />
        <MetricCard value={metrics.occupied}           label="مشغولة"  dotColor="bg-rose-400" border />
      </div>

      {/* ── Zone Tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-8 border-b border-slate-200 mt-6 px-1">
        {ZONES.map(zone => (
          <button
            key={zone}
            onClick={() => setActiveZone(zone)}
            className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${
              activeZone === zone
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

      {/* ── Floor Map ────────────────────────────────────────────────────── */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-200 shadow-inner" style={{ minHeight: 520 }}>

        {/* Checkered floor background, subtle */}
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

        {/* Tables grid — 7 per row, generous padding so seats are always visible */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative z-0 px-10 pt-14 pb-10">
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px 0px',
              }}
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
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <p className="font-bold text-lg">لا توجد طاولات في هذه المنطقة</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 justify-center mt-4 flex-wrap">
        {[
          { label: 'متاح',   color: 'bg-emerald-400' },
          { label: 'مشغول',  color: 'bg-rose-400' },
          { label: 'محجوز',  color: 'bg-amber-400' },
          { label: 'صيانة', color: 'bg-slate-400' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs font-bold text-slate-500">{label}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
