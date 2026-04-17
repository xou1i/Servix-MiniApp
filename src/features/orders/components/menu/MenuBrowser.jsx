// MenuBrowser.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, ArrowRight, ChefHat, Coffee } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatIQD } from '../../../../utils/currencyFormatter';
import ItemModifiersModal from './ItemModifiersModal';

export default function MenuBrowser() {
  const { view, addItem, menuItems, departments, isLoadingMenu } = useOrderStore();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);

  const activeDeptId = view.activeDepartmentId || null;

  const setActiveDepartment = (deptId) => {
    useOrderStore.setState(state => ({
      view: {
        ...state.view,
        activeDepartmentId: deptId === state.view.activeDepartmentId ? null : deptId,
        activeCategoryId: 'cat_all',
      }
    }));
  };

  const filteredItems = menuItems.filter(item => {
    // Backend: item.categoryId links to Category.id
    const matchesCategory = view.activeCategoryId === 'cat_all' || 
      item.categoryId === view.activeCategoryId ||
      item.category?.id === view.activeCategoryId;

    // Department filter (if a department is selected)
    let matchesDept = true;
    if (activeDeptId) {
      matchesDept = item.departmentId === activeDeptId || item.department?.id === activeDeptId;
      
      // Fallback: check if the item's category belongs to the active department
      if (!matchesDept && item.categoryId) {
        const itemCat = useOrderStore.getState().categories.find(c => c.id === item.categoryId);
        if (itemCat && (itemCat.departmentId === activeDeptId || itemCat.department?.id === activeDeptId)) {
          matchesDept = true;
        }
      }
    }

    const searchTarget = (item.name || item.nameAr || '').toLowerCase();
    const matchesSearch = searchTarget.includes(view.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && matchesDept;
  });

  const handleItemClick = (item) => {
    if (item.hasModifiers) {
      setActiveItem(item);
    } else {
      addItem(item); // Fast add
    }
  };

  // Identify kitchen vs barista departments
  const kitchenDept = departments.find(d =>
    (d.name || '').includes('مطبخ') || (d.name || '').toLowerCase().includes('kitchen')
  );
  const baristaDept = departments.find(d =>
    (d.name || '').includes('بارستا') || (d.name || '').includes('باريستا') || (d.name || '').toLowerCase().includes('barista')
  );

  return (
    <div className="h-full flex flex-col relative z-0 bg-[#F8FAFD]">
      {/* Header & Search */}
      <div className="shrink-0 px-6 pt-5 pb-4 flex flex-col gap-3">
        {/* Top row: back button, title, search */}
        <div className="flex gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:scale-105 transition-transform text-slate-600 hover:text-[var(--color-primary)] border border-slate-100"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <h1 className="font-headline font-bold text-lg text-slate-800 tracking-tight">نقطة البيع</h1>
              <p className="text-[11px] font-semibold text-slate-400">جاهز لاستقبال الطلبات بسرعة</p>
            </div>
          </div>

          <div className="relative w-[260px] max-w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ابحث عن صنف..."
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pr-10 pl-4 text-[13px] font-semibold shadow-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
              value={view.searchQuery}
              onChange={(e) => useOrderStore.getState().setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Department toggle row: Kitchen / Barista */}
        <div className="flex items-center gap-2">
          {kitchenDept && (
            <button
              onClick={() => setActiveDepartment(kitchenDept.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                activeDeptId === kitchenDept.id
                  ? 'bg-[#1FA89B] text-white border-[#1FA89B] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <ChefHat size={16} />
              المطبخ
            </button>
          )}
          {baristaDept && (
            <button
              onClick={() => setActiveDepartment(baristaDept.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                activeDeptId === baristaDept.id
                  ? 'bg-[#7209B7] text-white border-[#7209B7] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Coffee size={16} />
              البارستا
            </button>
          )}
          {/* If no departments detected, show all departments as generic buttons */}
          {!kitchenDept && !baristaDept && departments.map(dept => (
            <button
              key={dept.id}
              onClick={() => setActiveDepartment(dept.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                activeDeptId === dept.id
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        {isLoadingMenu ? (
          <div className="flex flex-col items-center justify-center pt-20 pb-4 w-full">
            <Loader2 size={36} className="text-[var(--color-primary)] animate-spin" />
            <p className="font-bold text-sm text-slate-400 mt-3">جاري تحميل القائمة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white border border-transparent p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-slate-100 stagger animate-slide-up group relative"
                style={{ '--delay': `${Math.min(i * 30, 300)}ms` }}
              >
                {item.hasModifiers && (
                  <span className="absolute top-2.5 left-2.5 bg-slate-50 text-[var(--color-primary)] text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-100">تخصيص</span>
                )}
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-white rounded-full flex items-center justify-center text-4xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-full" />
                    : (item.image || '🍽️')}
                </div>
                <div className="mt-1 text-center w-full">
                  <h3 className="font-bold text-slate-800 text-[13px] leading-tight truncate px-1">{item.name || item.nameAr}</h3>
                  <span className="inline-block mt-1.5 font-bold text-[12px] bg-slate-50 text-[var(--color-primary)] px-3 py-1 rounded-full border border-slate-100">{formatIQD(item.price ?? item.unitPrice ?? 0)}</span>
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full pt-10 flex text-center justify-center text-slate-400 font-bold text-sm">لا توجد أصناف تطابق البحث أو التصنيف.</div>
            )}
          </div>
        )}
      </div>

      {/* Modifier Modal */}
      {activeItem && <ItemModifiersModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
