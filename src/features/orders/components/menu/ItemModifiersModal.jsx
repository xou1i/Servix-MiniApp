import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatIQD } from '../../../../utils/currencyFormatter';

export default function ItemModifiersModal({ item, onClose }) {
  const { addItem } = useOrderStore();
  
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock sizes
  const sizes = [
    { label: 'صغير', value: 'Small', add: 0 },
    { label: 'وسط', value: 'Medium', add: 0 },
    { label: 'كبير', value: 'Large', add: 5 },
  ];

  const handleAdd = () => {
    // Generate modifiers array
    const modifiers = [];
    if (selectedSize !== 'Medium') {
      const sizeObj = sizes.find(s => s.value === selectedSize);
      if (sizeObj) {
        modifiers.push({ type: 'size', value: sizeObj.label, priceAdjust: sizeObj.add });
      }
    }
    
    // Add item N times
    for (let i = 0; i < quantity; i++) {
      addItem(item, modifiers, notes);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(21,28,34,0.4)] backdrop-blur-sm animate-fade-in" dir="rtl" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.12)] border border-[var(--surface-high)] overflow-hidden animate-pos-entrance flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--surface-mid)] bg-[var(--surface)]">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
               {item.image}
             </div>
             <div>
               <h2 className="font-headline font-bold text-lg text-[var(--text-primary)]">{item.name}</h2>
               <p className="text-sm font-bold text-[var(--color-primary)]">{formatIQD(item.price)}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
           {/* Size Selection */}
           <div>
             <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-3">الحجم</h3>
             <div className="flex gap-3">
               {sizes.map(size => (
                 <button 
                   key={size.value}
                   onClick={() => setSelectedSize(size.value)}
                   className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                     selectedSize === size.value 
                     ? 'border-[var(--color-primary)] bg-[var(--surface-low)] text-[var(--color-primary)]' 
                     : 'border-[var(--surface-mid)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                   }`}
                 >
                   {size.label}
                   {size.add > 0 && <span className="block text-xs font-semibold opacity-70 mt-1">+{formatIQD(size.add)}</span>}
                 </button>
               ))}
             </div>
           </div>

           {/* Notes */}
           <div>
             <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-3">ملاحظات خاصة</h3>
             <textarea 
               value={notes}
               onChange={e => setNotes(e.target.value)}
               placeholder="بدون بصل، اكسترا صوص..."
               className="w-full bg-[var(--surface-low)] border border-[var(--surface-mid)] rounded-2xl p-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all resize-none min-h-[100px]"
             />
           </div>
           
           {/* Quantity */}
           <div>
             <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-3">الكمية</h3>
             <div className="flex items-center gap-4 bg-[var(--surface-low)] p-2 rounded-2xl w-fit border border-[var(--surface-mid)]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-black text-xl w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Plus size={18} />
                </button>
             </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--surface-mid)] bg-white">
           <button 
             onClick={handleAdd}
             className="w-full btn-primary py-4 rounded-2xl text-[15px] shadow-[0_8px_24px_rgba(29,78,137,0.15)] flex justify-between items-center px-6"
           >
             <span>إضافة للسلة</span>
             <span className="font-black">{formatIQD((item.price * quantity) + (sizes.find(s=>s.value===selectedSize)?.add * quantity || 0))}</span>
           </button>
        </div>
      </div>
    </div>
  );
}
