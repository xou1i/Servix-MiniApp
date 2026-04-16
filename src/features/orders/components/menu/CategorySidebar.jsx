import { useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import * as Icons from 'lucide-react';

export default function CategorySidebar({ roleKey }) {
  const { view, setCategory, context, setContext, categories } = useOrderStore();
  
  useEffect(() => {
    // If Waiter, strictly enforce dine-in context
    if (roleKey === 'waiter' && context.type !== 'dine-in') {
       setContext({ type: 'dine-in', delivery: null });
    }
  }, [roleKey, context.type, setContext]);
  
  return (
    <div className="h-full bg-[#F8FAFC] flex flex-row md:flex-col items-center md:items-stretch py-3 md:py-6 px-3 gap-2 z-10 w-full overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden no-scrollbar">
      
      <div className="w-full flex-row md:flex-col flex gap-3 md:gap-2">
        {categories.map(cat => {
          const isActive = view.activeCategoryId === cat.id;
          const IconComponent = Icons[cat.icon] || Icons.HelpCircle;
          
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`relative shrink-0 md:shrink flex flex-row items-center justify-start md:justify-start gap-3 py-3 px-4 rounded-[1.25rem] transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-[var(--color-primary)] shadow-sm font-black' 
                  : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)] font-bold'
              }`}
            >
              <IconComponent size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[13px] whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-80'}`}>{cat.name}</span>
              
              {isActive && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--color-primary)] rounded-l-full animate-slide-in-r"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
