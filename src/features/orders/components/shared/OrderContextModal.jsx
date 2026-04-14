import { useState } from 'react';
import { X, Store, Bike, Check } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useNavigate } from 'react-router-dom';

export default function OrderContextModal() {
  const { view, context, setContext, closeContextModal } = useOrderStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(context.type === 'delivery' ? 'delivery' : 'table'); 

  if (!view.isContextModalOpen) return null;

  const handleTableSelect = (tableId) => {
    setContext({ type: 'dine-in', tableId, delivery: null });
  };

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const deliveryData = {
      phone: formData.get('phone'),
      name: formData.get('name'),
      address: formData.get('address')
    };
    setContext({ type: 'delivery', tableId: null, delivery: deliveryData });
  };

  const handleCancel = () => {
    if (!context.type) {
      // Cannot cancel if no context, must go back to orders
      navigate('/orders');
    } else {
      closeContextModal();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(21,28,34,0.4)] backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_24px_64px_rgba(0,0,0,0.15)] border border-[var(--surface-high)] overflow-hidden animate-pos-entrance flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--surface-mid)] bg-[var(--surface)]">
          <div>
            <h2 className="font-headline font-bold text-xl text-[var(--text-primary)]">
              {context.type === 'delivery' ? 'بيانات التوصيل' : 'اختيار الطاولة'}
            </h2>
            <p className="text-sm font-bold text-[var(--text-muted)] mt-1">يجب تحديد السياق قبل الإرسال للمطبخ</p>
          </div>
          <button onClick={handleCancel} className="w-11 h-11 bg-white shadow-sm flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px]">
           {context.type !== 'delivery' && (
             <div className="animate-fade-in">
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                 {[1, 2, 3, 4, 5, 6, 7, 8].map(tid => (
                   <button 
                     key={tid}
                     onClick={() => handleTableSelect(tid)}
                     className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                       context.tableId === tid ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg' : 'border-[var(--surface-mid)] hover:border-[var(--color-primary)] bg-white'
                     }`}
                   >
                     <span className="text-xl font-black">T{tid}</span>
                     {context.tableId === tid && <Check size={18} />}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {context.type === 'delivery' && (
             <form onSubmit={handleDeliverySubmit} className="animate-fade-in max-w-md mx-auto space-y-4">
               <div>
                 <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">رقم الجوال</label>
                 <input name="phone" required type="tel" className="w-full bg-[var(--surface-low)] border border-[var(--surface-mid)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)]" placeholder="05xxxxxxxx" defaultValue={context.delivery?.phone || ''} />
               </div>
               <div>
                 <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">اسم العميل</label>
                 <input name="name" required type="text" className="w-full bg-[var(--surface-low)] border border-[var(--surface-mid)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)]" placeholder="محمد أحمد..." defaultValue={context.delivery?.name || ''} />
               </div>
               <div>
                 <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">العنوان التفصيلي</label>
                 <textarea name="address" required className="w-full bg-[var(--surface-low)] border border-[var(--surface-mid)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)] min-h-[80px]" placeholder="الحي، الشارع..." defaultValue={context.delivery?.address || ''} />
               </div>
               <button type="submit" className="btn-primary w-full py-4 rounded-xl mt-4">حفظ بيانات التوصيل</button>
             </form>
           )}
        </div>

      </div>
    </div>
  );
}
