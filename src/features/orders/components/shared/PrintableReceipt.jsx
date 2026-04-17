import React from 'react';
import { formatIQD } from '../../../../utils/currencyFormatter';

export default function PrintableReceipt({ order, isPrinting }) {
  if (!order || !isPrinting) return null;

  // Calculate totals correctly from backend data
  const totalAmount = order.totalAmount ?? order.items?.reduce((sum, item) => sum + ((item.price || item.unitPrice || 0) * (item.quantity || 1)), 0) ?? 0;

  return (
    <div className={`receipt-printable text-black bg-white p-4 font-sans ${isPrinting ? 'block' : 'hidden'}`} dir="rtl">
      <div className="text-center mb-4 border-b-2 border-black pb-4 border-dashed">
        <h1 className="text-xl font-black mb-1">مطعم سيرفكس</h1>
        <p className="text-xs mt-1">{new Date().toLocaleString('ar-IQ')}</p>
      </div>

      <div className="mb-4 text-[13px] font-bold flex justify-between">
         <span>الطلب: {String(order.id).split('-')[0]}</span>
         <span>
           {order.tableNumber || order.table ? `طاولة: T${order.tableNumber || order.table}` : (order.type === 'takeaway' || order.orderType === 'TakeAway' ? 'سفري' : 'توصيل')}
         </span>
      </div>

      <div className="border-b-2 border-black pb-2 mb-2 border-dashed">
        <div className="flex justify-between text-xs font-black mb-2">
           <span className="w-1/2">الصنف</span>
           <span className="w-1/4 text-center">الكمية</span>
           <span className="w-1/4 text-left">المجموع</span>
        </div>
        
        {(order._rawItems || order.items)?.map((item, idx) => {
          // Handle both string fallback and unnormalized objects
          const name = typeof item === 'string' ? item : (item.menuItemName || item.name || 'الصنف');
          const qty = typeof item === 'string' ? 1 : (item.quantity || 1);
          const price = typeof item === 'string' ? '' : (item.price || item.unitPrice || 0);
          const itemTotal = price ? price * qty : '';

          return (
            <div key={idx} className="flex justify-between text-xs mb-1 font-bold">
               <span className="w-1/2 break-words leading-tight">{name}</span>
               <span className="w-1/4 text-center">{qty}</span>
               <span className="w-1/4 text-left">{itemTotal ? formatIQD(itemTotal).replace(' د.ع', '') : ''}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1 mb-4">
         <div className="flex justify-between text-lg font-black mt-2 pt-2">
            <span>الإجمالي:</span>
            <span>{formatIQD(totalAmount)}</span>
         </div>
      </div>

      <div className="text-center mt-6 text-xs font-bold">
         <p>شكراً لزيارتكم! نتمنى لكم يوماً سعيداً.</p>
      </div>
    </div>
  );
}
