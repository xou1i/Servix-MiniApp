import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { MENU_ITEMS } from '../../data/menu';

const categories = [
  {
    name: "أطباق – المطبخ",
    items: [
      "برجر",
      "بيتزا",
      "باستا",
      "بطاطس",
      "دجاج مشوي",
      "سلطة",
      "ستيك"
    ]
  },
  {
    name: "مشروبات – الباريستا",
    items: [
      "إسبريسو",
      "لاتيه",
      "كابتشينو",
      "أمريكانو",
      "موكا",
      "شاي",
      "مشروب غازي",
      "عصير طازج"
    ]
  }
];

const tables = [
  { id: 1, label: "T1", status: "available", shape: "round" },
  { id: 2, label: "T2", status: "occupied", shape: "square" },
  { id: 3, label: "T3", status: "available", shape: "square" },
  { id: 4, label: "T4", status: "reserved", shape: "rectangle" },
  { id: 5, label: "T5", status: "available", shape: "rectangle" },
  { id: 6, label: "T6", status: "available", shape: "round" }
];

function MenuSelector({ onClose }) {
  const { addOrder } = useAppState();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [notes, setNotes] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const toggle = (item) => {
    setSelectedItems((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleTableSelect = (id) => {
    setSelectedTableId(id);
    setIsMapOpen(false); // Close map automatically after selection
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;

    // lookup IDs from the selected strings to correctly link back to AppState
    const selectedIds = selectedItems.map(str => {
      const found = MENU_ITEMS.find(m => m.labelAr === str);
      return found ? found.id : null;
    }).filter(Boolean);

    addOrder({
      selectedIds,
      table: selectedTableId ? `T${selectedTableId}` : 'T?',
      notes: notes.trim()
    });

    console.log({
      items: selectedItems,
      tableId: selectedTableId,
      notes: notes
    });

    onClose();
  };

  const ItemButton = ({ item }) => {
    const active = selectedItems.includes(item);
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] ${
          active
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'bg-[var(--surface-low)] text-[var(--text-primary)] hover:bg-[var(--surface-mid)]'
        }`}
      >
        {item}
      </button>
    );
  };

  const renderChairs = (shape, statusClass) => {
    const chairColor = statusClass === 'green' ? 'bg-[#5eb78c]' : statusClass === 'red' ? 'bg-[#e26464]' : 'bg-[#f4c259]';
    if (shape === 'round') {
      return (
        <>
          <div className={`absolute -top-2 left-1/2 w-4 h-3 rounded-t-full -translate-x-1/2 ${chairColor}`}></div>
          <div className={`absolute -bottom-2 left-1/2 w-4 h-3 rounded-b-full -translate-x-1/2 ${chairColor}`}></div>
        </>
      );
    } else if (shape === 'square') {
      return (
        <>
          <div className={`absolute -top-2 left-2 w-4 h-3 rounded-t-full ${chairColor}`}></div>
          <div className={`absolute -top-2 right-2 w-4 h-3 rounded-t-full ${chairColor}`}></div>
          <div className={`absolute -bottom-2 left-2 w-4 h-3 rounded-b-full ${chairColor}`}></div>
          <div className={`absolute -bottom-2 right-2 w-4 h-3 rounded-b-full ${chairColor}`}></div>
        </>
      );
    } else {
      return (
        <>
          <div className={`absolute -top-2 left-3 w-4 h-3 rounded-t-full ${chairColor}`}></div>
          <div className={`absolute -top-2 right-3 w-4 h-3 rounded-t-full ${chairColor}`}></div>
          <div className={`absolute -top-2 left-1/2 w-4 h-3 rounded-t-full -translate-x-1/2 ${chairColor}`}></div>
          <div className={`absolute -bottom-2 left-3 w-4 h-3 rounded-b-full ${chairColor}`}></div>
          <div className={`absolute -bottom-2 right-3 w-4 h-3 rounded-b-full ${chairColor}`}></div>
          <div className={`absolute -bottom-2 left-1/2 w-4 h-3 rounded-b-full -translate-x-1/2 ${chairColor}`}></div>
        </>
      );
    }
  };

  const selectedTableLabel = tables.find(t => t.id === selectedTableId)?.label;

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose}>
        <div
          className="glass-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-[var(--text-primary)]">
              إنشاء طلب جديد
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost rounded-xl p-2"
            >
              <X size={18} />
            </button>
          </div>

          {/* Categories */}
          {categories.map((category, idx) => (
            <div key={idx} className="mb-5">
              <p className={`mb-2.5 text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-[var(--color-teal)]' : 'text-[var(--color-purple)]'}`}>
                {category.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <ItemButton key={item} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Table + Notes */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">
                رقم الطاولة
              </label>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="w-full h-[calc(100%-24px)] flex items-center justify-center rounded-xl bg-[var(--surface-low)] border border-dashed border-[var(--text-muted)] text-sm font-bold text-[var(--text-primary)] outline-none hover:bg-[var(--surface-mid)] transition-colors"
              >
                {selectedTableId ? `الطاولة المختارة: ${selectedTableLabel}` : 'اختيار طاولة'}
              </button>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">
                ملاحظات
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="بدون بصل مثلا..."
                rows={1}
                className="w-full resize-none rounded-xl bg-[var(--surface-low)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-shadow"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center py-3">
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary flex-1 justify-center py-3"
            >
              إرسال الطلب <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Table Map Overlay Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsMapOpen(false)}>
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#f0f0f0] border-4 border-[#354359]/30 shadow-2xl animate-scale-in"
            style={{
               backgroundImage: 'linear-gradient(45deg, #e4e4e4 25%, transparent 25%, transparent 75%, #e4e4e4 75%, #e4e4e4), linear-gradient(45deg, #e4e4e4 25%, transparent 25%, transparent 75%, #e4e4e4 75%, #e4e4e4)',
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 10px 10px'
             }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="rounded-xl bg-white p-2 text-black shadow hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 place-items-center">
                {tables.map((t) => {
                  const isSelected = selectedTableId === t.id;
                  let statusClass = 'green';
                  let tableBg = 'bg-[#315d58]';
                  let tableBorder = 'border-transparent';
                  let textColor = 'text-white';
                  
                  if (t.status === 'occupied') {
                    statusClass = 'red';
                    tableBg = 'bg-[#5e5861]'; 
                    tableBorder = 'border-[#e26464]';
                    textColor = 'text-white';
                  } else if (t.status === 'reserved') {
                    statusClass = 'yellow';
                    tableBg = 'bg-[#5e5861]';
                    tableBorder = 'border-dashed border-[#f4c259]';
                    textColor = 'text-[#f4c259]';
                  }

                  let shapeClass = t.shape === 'round' ? 'rounded-full aspect-square w-20' : 
                                   t.shape === 'square' ? 'rounded-lg aspect-square w-24' : 
                                   'rounded-lg w-40 h-20 col-span-2 md:col-span-1 border-[3px]';

                  return (
                    <div key={t.id} className="relative flex items-center justify-center p-3 cursor-pointer transition-transform hover:scale-105" onClick={() => handleTableSelect(t.id)}>
                      {renderChairs(t.shape, statusClass)}
                      <div className={`relative z-10 flex items-center justify-center font-bold text-xl select-none shadow-xl ${tableBg} ${shapeClass} ${tableBorder} ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-blue-500 scale-105' : 'border-2'}`}>
                        <span className={textColor}>{t.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MenuSelector;
