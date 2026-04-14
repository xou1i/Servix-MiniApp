import React from 'react';
import { formatIQD } from '../../../../utils/currencyFormatter';

export default function PrintableReceipt({ order, isPrinting }) {
  if (!order || !isPrinting) return null;

  // Calculate totals
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price || 100), 0) || 0; // Mock calculation fallback
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className={`receipt-printable text-black bg-white p-4 font-sans ${isPrinting ? 'block' : 'hidden'}`} dir="rtl">
      <div className="text-center mb-4 border-b-2 border-black pb-4 border-dashed">
        <h1 className="text-xl font-black mb-1">مطعم سيرفكس</h1>
        <p className="text-xs">رقم الضريبي: 300000000000</p>
        <p className="text-xs mt-1">{new Date().toLocaleString('ar-IQ')}</p>
      </div>

      <div className="mb-4 text-sm font-bold flex justify-between">
         <span>الطلب: {order.id}</span>
         <span>الطاولة: {order.table || 'تيك أوي'}</span>
      </div>

      <div className="border-b-2 border-black pb-2 mb-2 border-dashed">
        <div className="flex justify-between text-xs font-black mb-2">
           <span className="w-1/2">الصنف</span>
           <span className="w-1/4 text-center">الكمية</span>
           <span className="w-1/4 text-left">السعر</span>
        </div>
        
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs mb-1 font-bold">
             <span className="w-1/2 truncate">{item.name || item}</span>
             <span className="w-1/4 text-center">1</span>
             <span className="w-1/4 text-left">{formatIQD(item.price || 15000).replace(' د.ع', '')}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-4">
         <div className="flex justify-between text-xs font-bold">
            <span>المجموع:</span>
            <span>{formatIQD(subtotal)}</span>
         </div>
         <div className="flex justify-between text-xs font-bold">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span>{formatIQD(tax)}</span>
         </div>
         <div className="flex justify-between text-sm font-black mt-2 pt-2 border-t-2 border-black border-dashed">
            <span>الإجمالي المستحق:</span>
            <span>{formatIQD(total)}</span>
         </div>
      </div>

      <div className="text-center mt-6 text-xs font-bold">
         <p>طريقة الدفع: شبكة (بطاقة)</p>
         <p className="mt-2">شكراً لزيارتكم! نتمنى لكم يوماً سعيداً.</p>
      </div>
    </div>
  );
}
