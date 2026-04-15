import CategorySidebar from './components/menu/CategorySidebar';
import MenuBrowser from './components/menu/MenuBrowser';
import OrderCart from './components/cart/OrderCart';

export default function OrderPOSWorkspace({ roleKey }) {
  return (
    <div className="fixed inset-0 z-[100] h-[var(--app-height,100vh)] w-full flex flex-col md:flex-row bg-[#F1F5F9] md:bg-[#F8FAFC] overflow-hidden animate-pos-entrance font-sans" dir="rtl">

      {/* 
        Modern POS Golden Ratio Layout / Responsive Stack:
        - 15% Left: Super compact minimal categories
        - 55% Center: Dominant search and grid
        - 30% Right: Clean detailed cart (sticky)
      */}

      {/* Categories (Top in Mobile, Left visually in RTL Desktop/Tablet) */}
      <div className="w-full md:w-[120px] lg:w-[130px] xl:w-[140px] shrink-0 h-auto md:h-full relative z-10 transition-all overflow-hidden bg-[#F8FAFC]">
        <CategorySidebar roleKey={roleKey} />
      </div>

      {/* Main Menu (Center, scales flexibly) */}
      <div className="flex-1 min-h-0 md:h-full min-w-0 z-0 bg-[#F1F5F9]">
        <MenuBrowser />
      </div>

      {/* Cart Summary (Bottom in Mobile stretching 45vh, Right visually in RTL Desktop/Tablet) */}
      <div className="w-full md:w-[280px] lg:w-[320px] xl:w-[380px] shrink-0 h-auto md:h-full relative z-20 transition-all shadow-[0_-10px_40px_rgba(0,0,0,0.08)] md:shadow-none bg-white max-h-[50vh] md:max-h-full flex flex-col">
        <OrderCart roleKey={roleKey} />
      </div>

      {/* NOTE: OrderContextModal is now mounted globally in App.jsx */}
    </div>
  );
}
