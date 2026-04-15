import { useMemo } from 'react';
import TableCard from './TableCard';
import { Layers } from 'lucide-react';

export default function TableGrid({ tables }) {
  // Group tables by floorNumber, then zone
  const groupedTables = useMemo(() => {
    const grouped = {};

    tables.forEach(table => {
      const floor = table.floorNumber || 'أرضي';
      const zone = table.zone || 'صالة رئيسية';

      if (!grouped[floor]) {
        grouped[floor] = {};
      }
      if (!grouped[floor][zone]) {
        grouped[floor][zone] = [];
      }

      grouped[floor][zone].push(table);
    });

    return grouped;
  }, [tables]);

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] animate-fade-in">
        <Layers size={48} className="mb-4 opacity-50" />
        <p className="font-bold text-lg">لا توجد طاولات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {Object.entries(groupedTables).map(([floor, zones]) => (
        <div key={floor} className="space-y-6">
          {/* Floor Header */}
          <div className="flex items-center gap-3 border-b-2 border-[var(--surface-mid)] pb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-sm shadow-md">
              {typeof floor === 'number' || !isNaN(floor) ? `F${floor}` : floor}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              الطابق {floor}
            </h2>
          </div>

          {/* Zones loop */}
          <div className="space-y-8 pl-2 md:pl-6">
            {Object.entries(zones).map(([zone, zoneTables]) => (
              <div key={`${floor}-${zone}`} className="space-y-4">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--surface-low)] border border-[var(--surface-mid)]">
                  <span className="text-sm font-bold text-[var(--text-secondary)]">باقة: {zone}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {zoneTables.map((table) => (
                    <TableCard key={table.id} table={table} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
