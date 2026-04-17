import { Plus, Minus, Trash2, SplitSquareHorizontal, Store, Bike, Utensils, Printer, Undo2, MapPin, Map, ShoppingBasket, Phone, User, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useAppState } from '../../../../hooks/useAppState';
import { formatIQD } from '../../../../utils/currencyFormatter';
import PrintableReceipt from '../../components/shared/PrintableReceipt';

export default function OrderCart({ roleKey }) {
   const { 
     cart, lifecycle, undoLastAction, undoStack, updateQuantity, removeItem, splitItem, 
     context, setContext, submitOrder, orderNote, setOrderNote, openContextModal
   } = useOrderStore();
   const { addNewOrderToState } = useAppState();
   const navigate = useNavigate();
   const [isPrinting, setIsPrinting] = useState(false);

   // Waiter: auto-enforce dine-in context on mount
   const effectiveContext = roleKey === 'waiter' && !context.type
     ? { ...context, type: 'dine-in' }
     : context;
   
   
   const total = cart.reduce((sum, item) => {
     const itemPrice = Number(item.unitPrice) || 0;
     const modPrice = (item.modifiers?.reduce((mSum, m) => mSum + (Number(m.priceAdjust) || 0), 0) || 0);
     return sum + ((itemPrice + modPrice) * (item.qty || 1));
   }, 0);
   const grandTotal = total;

   const handlePrintCart = () => {
     setIsPrinting(true);
     setTimeout(() => {
       window.print();
       setIsPrinting(false);
     }, 100);
   };

   const printOrderMock = {
     id: 'مسودة',
     table: 'سفري',
     type: 'takeaway',
     items: cart.map(c => `${c.qty}x ${c.name}`),
     status: 'draft'
   };

   return (
    <div className="h-full w-full bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.03)] flex flex-col z-20">
      
         {/* Configuration Ribbon (Order Type + Table) */}
         <div className="bg-[var(--surface-mid)] p-2 rounded-2xl mb-4 flex flex-col gap-2 shadow-sm border border-[var(--surface-high)]">
            
            {/* Cashier Order Type Toggles */}
            {roleKey !== 'waiter' && (
              <div className="flex bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-1 w-full relative">
                 <button 
                   onClick={() => setContext({ type: 'dine-in', tableId: null, tableCode: null, delivery: null })}
                   className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold transition-all ${
                     context.type === 'dine-in' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-low)] hover:text-[var(--text-secondary)]'
                   }`}
                 >
                   <Utensils size={13}/> صالة
                 </button>
                 
                 <button 
                   onClick={() => setContext({ type: 'takeaway', tableId: null, tableCode: null, delivery: null })}
                   className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold transition-all ${
                     context.type === 'takeaway' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-low)] hover:text-[var(--text-secondary)]'
                   }`}
                 >
                   <Store size={13}/> سفري
                 </button>

                 <button 
                   onClick={() => setContext({ type: 'delivery', tableId: null, tableCode: null, delivery: null })}
                   className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold transition-all ${
                     context.type === 'delivery' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-low)] hover:text-[var(--text-secondary)]'
                   }`}
                 >
                   <Bike size={14}/> توصيل
                 </button>
              </div>
            )}

            {/* Table Selector - dine-in only */}
            {(context.type === 'dine-in' || (roleKey === 'waiter' && !context.type)) && (
               <div className="flex items-center justify-between py-1">
                   <span className="text-xs font-bold text-[var(--color-primary)] opacity-80 px-2 flex items-center gap-1"><MapPin size={14} /> اختر الطاولة</span>
                   <button 
                     onClick={() => openContextModal()}
                     className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-all shadow-sm flex items-center gap-1"
                   >
                     {context.tableId ? `[T${context.tableCode || context.tableId.split('-')[0]}]` : <><Map size={14} /> الخريطة</>}
                   </button>
               </div>
            )}

            {/* Delivery Inline Form */}
            {context.type === 'delivery' && (
               <div className="space-y-2 pt-1 border-t border-[var(--surface-high)] animate-fade-in">
                 <input
                   type="tel"
                   placeholder="رقم الجوال"
                   className="w-full bg-white border border-[var(--surface-high)] rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[var(--color-primary)] transition-all text-right"
                   value={context.delivery?.phone || ''}
                   onChange={(e) => setContext({ type: 'delivery', tableId: null, tableCode: null, delivery: { ...context.delivery, phone: e.target.value } })}
                 />
                 <input
                   type="text"
                   placeholder="اسم العميل"
                   className="w-full bg-white border border-[var(--surface-high)] rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[var(--color-primary)] transition-all text-right"
                   value={context.delivery?.name || ''}
                   onChange={(e) => setContext({ type: 'delivery', tableId: null, tableCode: null, delivery: { ...context.delivery, name: e.target.value } })}
                 />
                 <input
                   type="text"
                   placeholder="العنوان"
                   className="w-full bg-white border border-[var(--surface-high)] rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[var(--color-primary)] transition-all text-right"
                   value={context.delivery?.address || ''}
                   onChange={(e) => setContext({ type: 'delivery', tableId: null, tableCode: null, delivery: { ...context.delivery, address: e.target.value } })}
                 />
                 <div className="flex gap-2 text-[10px] text-[var(--text-muted)] font-bold px-1">
                    <Phone size={12} /> <User size={12} /> <MapPin size={12} />
                 </div>
               </div>
            )}
         </div>


      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar relative bg-[#FCFDFE]">
         {cart.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
             <div className="w-24 h-24 mb-4 rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center bg-white shadow-sm">
               <ShoppingBasket size={48} />
             </div>
             <p className="font-bold text-[15px]">الطلب فارغ حالياً</p>
             <p className="text-xs mt-1">اضغط على الأصناف لإضافتها</p>
           </div>
         ) : (
           cart.map((item, i) => {
             const modsTotal = item.modifiers?.reduce((s, m) => s + (m.priceAdjust || 0), 0) || 0;
             const unitTotal = item.unitPrice + modsTotal;
             
             return (
               <div key={item.id} className="bg-white border border-[var(--surface-mid)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-3 rounded-[1.25rem] flex flex-col gap-3 animate-scale-in" style={{ animationDelay: `${Math.min(i * 30, 200)}ms` }}>
                  <div className="flex justify-between items-start gap-2">
                     <div className="flex items-start gap-3 max-w-[75%]">
                       <div className="w-12 h-12 shrink-0 bg-[var(--surface-low)] rounded-xl flex items-center justify-center text-2xl mt-1">
                         {item.product?.image}
                       </div>
                       <div>
                         <p className="font-bold text-[13px] text-[var(--text-primary)] leading-tight">{item.name}</p>
                         
                         {/* Display Modifiers & Notes */}
                         {(item.modifiers?.length > 0 || item.notes) && (
                           <div className="mt-1 text-[10px] font-bold text-[var(--text-muted)] leading-relaxed">
                             {item.modifiers?.map((m, idx) => (
                               <span key={idx} className="bg-[var(--surface-mid)] px-1.5 py-0.5 rounded mr-1 mb-1 inline-block">
                                 {m.value} {m.priceAdjust > 0 ? `(+${formatIQD(m.priceAdjust)})` : ''}
                               </span>
                             ))}
                             {item.notes && <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-1"><FileText size={10}/> {item.notes}</p>}
                           </div>
                         )}

                         <p className="text-[11px] mt-1 font-bold text-[var(--color-primary)] opacity-80">{formatIQD(unitTotal)} / للقطعة</p>
                       </div>
                     </div>
                     <button onClick={() => removeItem(item.groupId)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1.5 bg-[var(--surface-low)] hover:bg-red-50 rounded-lg">
                       <Trash2 size={15} />
                     </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-mid)]">
                     <div className="flex items-center gap-2">
                       <div className="font-black text-[var(--color-primary)] text-sm tracking-tight">{formatIQD(unitTotal * item.qty)}</div>
                       {item.qty > 1 && (
                         <button onClick={() => splitItem(item.groupId)} className="text-[10px] bg-indigo-50 text-indigo-500 font-bold px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1" title="فصل القطعة لتخصيصها">
                           <SplitSquareHorizontal size={10}/> فصل
                         </button>
                       )}
                     </div>
                     
                     <div className="flex items-center gap-3 bg-[var(--surface-low)] rounded-xl px-1.5 py-1.5 border border-[var(--surface-mid)]">
                        <button onClick={() => updateQuantity(item.groupId, -1)} className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-[0.6rem] hover:text-[var(--color-primary)] transition-colors"><Minus size={14} strokeWidth={3} /></button>
                        <span className="font-black text-sm w-5 text-center leading-none">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.groupId, 1)} className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-[0.6rem] hover:text-[var(--color-primary)] transition-colors"><Plus size={14} strokeWidth={3}/></button>
                     </div>
                  </div>
               </div>
             );
           })
         )}
      </div>

      {/* Global Order Note section rendered tight at the bottom of the items area */}
      {cart.length > 0 && (
         <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[var(--surface-high)] shrink-0 z-0 shadow-[0_-2px_6px_rgba(0,0,0,0.015)]">
           <textarea 
             placeholder={roleKey === 'cashier' ? "ملاحظات الطلب العامة (اختياري)..." : "ملاحظات للطاهي / الباريستا (اختياري)..."}
             value={orderNote}
             onChange={(e) => setOrderNote(e.target.value)}
             dir="auto"
             className="w-full bg-white rounded-xl text-[12.5px] p-3 font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[#E2E8F0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none transition-all duration-200"
             rows="2"
           />
         </div>
      )}

      {/* Footer Summary & Checkout */}
      <div className="shrink-0 p-5 bg-white border-t border-[var(--surface-mid)] shadow-[0_-4px_24px_rgba(0,0,0,0.02)] z-10 relative">
         
         <div className="space-y-2 mb-4 px-1">
           <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
              <span>المجموع</span>
              <span>{formatIQD(total)}</span>
           </div>
           <div className="h-px bg-[var(--surface-mid)] my-2 w-full"></div>
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <span className="font-extrabold text-sm text-[var(--text-primary)]">الإجمالي النهائي</span>
                 {undoStack.length > 0 && lifecycle === 'draft' && (
                   <button 
                     onClick={undoLastAction} 
                     className="w-6 h-6 flex items-center justify-center bg-[var(--surface-high)] rounded-full text-[var(--text-secondary)] hover:text-white hover:bg-black transition-all shadow-sm animate-scale-in" 
                     title="تراجع (Undo)"
                   >
                     <Undo2 size={13} strokeWidth={2.5}/>
                   </button>
                 )}
               </div>
               <span className="font-black text-xl text-[var(--color-primary)] tracking-tight">{formatIQD(grandTotal)}</span>
            </div>
         </div>
         
         <div className="flex gap-2">
           <button 
             onClick={async () => {
                await submitOrder(async (result) => {
                  if (result) addNewOrderToState(result);
                  navigate('/orders');
                });
             }}
             disabled={cart.length === 0 || lifecycle === 'sending' || lifecycle === 'sent' || !effectiveContext.type}
             className={`flex-1 btn-primary py-4 text-[15px] rounded-2xl justify-center shadow-lg transition-all ${
               (cart.length === 0 || !effectiveContext.type) ? 'opacity-50 cursor-not-allowed shadow-none' : 
               lifecycle === 'sending' ? 'animate-pulse opacity-90' : 
               lifecycle === 'sent' ? 'bg-green-500 shadow-green-500/30' : 
               'shadow-[var(--color-primary)]/20 hover:shadow-xl hover:shadow-[var(--color-primary)]/30 active:scale-[0.98]'
             }`}
           >
              {lifecycle === 'sending' ? 'جاري الإرسال...' : 
               lifecycle === 'sent' ? (
                 <span className="flex items-center gap-2">تم الإرسال بنجاح <CheckCircle2 size={18} /></span>
               ) :
               !effectiveContext.type ? 'حدد نوع الطلب أولاً' :
               'تأكيد وإرسال للمطبخ'}
           </button>
           
           {effectiveContext.type === 'takeaway' && cart.length > 0 && (
             <button
               onClick={handlePrintCart}
               className="w-[4.2rem] shrink-0 bg-orange-100 text-[#ea580c] rounded-2xl flex items-center justify-center hover:bg-orange-200 transition-all hover:scale-[1.02] active:scale-95 shadow-sm border border-orange-200 animate-slide-in-right"
               title="طباعة الفاتورة"
             >
               <Printer size={22} strokeWidth={2.5}/>
             </button>
           )}
         </div>
         {isPrinting && <PrintableReceipt order={printOrderMock} isPrinting={isPrinting} />}
      </div>
    </div>
   );
}
