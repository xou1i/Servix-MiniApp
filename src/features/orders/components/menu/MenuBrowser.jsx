import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { MOCK_ITEMS } from '../../data/mockMenu';
import { formatIQD } from '../../../../utils/currencyFormatter';
import ItemModifiersModal from './ItemModifiersModal';

export default function MenuBrowser() {
  const { view, addItem } = useOrderStore();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);

  const filteredItems = MOCK_ITEMS.filter(item =>
    (view.activeCategoryId === 'cat_all' || item.category === view.activeCategoryId) &&
    item.name.includes(view.searchQuery)
  );

  const handleItemClick = (item) => {
    if (item.hasModifiers) {
      setActiveItem(item);
    } else {
      addItem(item); // Fast add
    }
  };

  return (
    <div className="h-full flex flex-col relative z-0 bg-[#F8FAFD]">
      {/* Header & Search */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="w-11 h-11 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center hover:scale-105 transition-transform text-[var(--text-primary)] hover:text-[var(--color-primary)] border border-transparent hover:border-[var(--surface-high)]"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="font-headline font-bold text-xl text-[var(--text-primary)] tracking-tight">نقطة البيع</h1>
            <p className="text-xs font-semibold text-[var(--text-muted)]">جاهز لاستقبال الطلبات بسرعة</p>
          </div>
        </div>

        <div className="relative w-[300px] max-w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="ابحث عن صنف..."
            className="w-full bg-white border border-[var(--surface-high)] rounded-2xl py-3 pr-11 pl-4 text-sm font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
            value={view.searchQuery}
            onChange={(e) => useOrderStore.getState().setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
          {filteredItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`bg-white border border-transparent p-4 rounded-3xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(29,78,137,0.08)] hover:border-[var(--surface-high)] stagger animate-slide-up group relative`}
              style={{ '--delay': `${Math.min(i * 30, 300)}ms` }}
            >
              {item.hasModifiers && (
                <span className="absolute top-3 left-3 bg-[var(--surface-low)] text-[var(--color-primary)] text-[10px] font-black px-2 py-0.5 rounded-md">تخصيص</span>
              )}
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--surface-low)] to-white rounded-full flex items-center justify-center text-5xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.02)] group-hover:scale-110 transition-transform duration-300">
                {item.image}
              </div>
              <div className="mt-2 text-center w-full">
                <h3 className="font-bold text-[var(--text-primary)] text-sm leading-tight truncate px-1">{item.name}</h3>
                <span className="inline-block mt-1.5 font-bold text-[13px] bg-[var(--surface-low)] text-[var(--color-primary)] px-3 py-1 rounded-full">{formatIQD(item.price)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modifier Modal */}
      {activeItem && <ItemModifiersModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
