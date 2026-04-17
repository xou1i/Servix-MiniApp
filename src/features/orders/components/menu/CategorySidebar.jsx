// CategorySidebar.jsx
import { useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import * as Icons from 'lucide-react';

export default function CategorySidebar({ roleKey }) {
  const { view, setCategory, context, setContext, categories, departments } = useOrderStore();

  // Track which department is selected (stored as activeDepartmentId in view)
  const activeDeptId = view.activeDepartmentId || null;

  useEffect(() => {
    // If Waiter, strictly enforce dine-in context
    if (roleKey === 'waiter' && context.type !== 'dine-in') {
      setContext({ type: 'dine-in', tableId: null, delivery: null });
    }
  }, [roleKey, context.type, setContext]);

  // Get categories for the active department
  const filteredCategories = activeDeptId
    ? categories.filter(cat => 
        cat.departmentId === activeDeptId || cat.department?.id === activeDeptId
      )
    : categories;

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col py-4 px-3 gap-2 z-10 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
      
      {/* "All" button */}
      <button
        onClick={() => {
          setCategory('cat_all');
          useOrderStore.setState(state => ({
            view: { ...state.view, activeDepartmentId: null }
          }));
        }}
        className={`shrink-0 flex items-center justify-start gap-3 py-3 px-4 rounded-[1.25rem] transition-all duration-300 ${
          view.activeCategoryId === 'cat_all' && !activeDeptId
            ? 'bg-white text-[var(--color-primary)] shadow-sm font-black'
            : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)] font-bold'
        }`}
      >
        <Icons.LayoutGrid size={18} />
        <span className="text-[13px] whitespace-nowrap">الكل</span>
      </button>

      {/* Separator */}
      <div className="h-px bg-slate-200/60 mx-2 my-1" />

      {/* Category list for the selected department */}
      <div className="flex flex-col gap-1.5">
        {filteredCategories.map(cat => {
          const isActive = view.activeCategoryId === cat.id;
          // Use a unified clean design without broken dynamic icons
          const IconComponent = Icons.Tag;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 flex items-center justify-start gap-3 py-2.5 px-3.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-white text-[var(--color-primary)] shadow-sm font-black'
                  : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)] font-bold'
              }`}
            >
              <IconComponent size={14} className={`transition-transform duration-300 shrink-0 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[13px] leading-tight text-right flex-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
