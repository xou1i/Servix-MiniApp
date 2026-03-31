import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { FOOD_ITEMS, DRINK_ITEMS } from '../../data/menu';
import { useAppState } from '../../hooks/useAppState';

function MenuSelector({ onClose }) {
  const { addOrder, language } = useAppState();
  const isAr = language !== 'en';
  const labelKey = isAr ? 'labelAr' : 'labelEn';

  const [selected, setSelected] = useState(new Set());
  const [table, setTable] = useState('');
  const [notes, setNotes] = useState('');

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    addOrder({ selectedIds: [...selected], table: table.trim() || 'T?', notes: notes.trim() });
    onClose();
  };

  const ItemButton = ({ item }) => {
    const active = selected.has(item.id);
    return (
      <button
        type="button"
        onClick={() => toggle(item.id)}
        className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] ${
          active
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'bg-[var(--surface-low)] text-[var(--text-primary)] hover:bg-[var(--surface-mid)]'
        }`}
      >
        {item[labelKey]}
      </button>
    );
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="glass-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-[var(--text-primary)]">
            {isAr ? 'إنشاء طلب جديد' : 'New Order'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost rounded-xl p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Food section */}
        <div className="mb-4">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-teal)]">
            {isAr ? '🍽 أطباق — المطبخ' : '🍽 Food — Chef'}
          </p>
          <div className="flex flex-wrap gap-2">
            {FOOD_ITEMS.map((item) => <ItemButton key={item.id} item={item} />)}
          </div>
        </div>

        {/* Drinks section */}
        <div className="mb-5">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-purple)]">
            {isAr ? '☕ مشروبات — الباريستا' : '☕ Drinks — Barista'}
          </p>
          <div className="flex flex-wrap gap-2">
            {DRINK_ITEMS.map((item) => <ItemButton key={item.id} item={item} />)}
          </div>
        </div>

        {/* Table + Notes */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
              {isAr ? 'رقم الطاولة' : 'Table No.'}
            </label>
            <input
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder={isAr ? 'مثل: T3' : 'e.g. T3'}
              className="w-full rounded-xl bg-[var(--surface-low)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-shadow"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
              {isAr ? 'ملاحظات' : 'Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'بدون بصل، مثلاً...' : 'e.g. no onions'}
              className="w-full rounded-xl bg-[var(--surface-low)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-shadow"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected.size === 0}
            className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            {isAr ? 'إرسال الطلب' : 'Send Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuSelector;
