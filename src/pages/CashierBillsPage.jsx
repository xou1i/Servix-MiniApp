import { useMemo, useState } from 'react';
import { Receipt, Check, Printer, X, Loader2 } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { ORDER_STATUS } from '../utils/status';
import { formatIQD } from '../utils/currencyFormatter';
import PrintableReceipt from '../features/orders/components/shared/PrintableReceipt';
import { paymentsService } from '../services/payments.service';

function CashierBillsPage({ roleKey }) {
  const { orders, language, refetchOrders } = useAppState();
  const isAr = language !== 'en';
  const [printOrder, setPrintOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [paidIds, setPaidIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('servix_paid_invoices') || '[]');
    } catch {
      return [];
    }
  });

  // Cashier Bills track ALL non-terminated orders automatically 
  const filterOrders = useMemo(() => {
    return (orders || []).filter(o => 
      o.status !== ORDER_STATUS.paid && 
      o.status !== ORDER_STATUS.cancelled &&
      !paidIds.includes(o.id)
    );
  }, [orders, paidIds]);

  const handlePay = async (orderId, amount) => {
    if (processingId === orderId) return;
    setProcessingId(orderId);
    try {
      await paymentsService.create({
        orderId,
        amount,
        paymentMethod: 'Cash',
        transactionReference: 'cash-' + Date.now(),
        notes: ''
      });
      
      const newPaidIds = [...paidIds, orderId];
      setPaidIds(newPaidIds);
      localStorage.setItem('servix_paid_invoices', JSON.stringify(newPaidIds));
      
      if (refetchOrders) await refetchOrders();
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  if (roleKey !== 'cashier') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-red-500 font-bold">
        <X size={48} className="mb-4" />
        <p>{isAr ? 'عطل في الصلاحيات. الصفحة مخصصة للكاشير فقط.' : 'Access Denied. Cashier Only.'}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in relative">
      {/* Hidden Print Anchor */}
      {printOrder && <PrintableReceipt order={printOrder} isPrinting={true} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-[var(--color-primary)]">
            {isAr ? 'إدارة الفواتير' : 'Billing Management'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr ? 'متابعة الدفعيات وطباعة الإيصالات' : 'Track payments and print receipts'}
          </p>
        </div>
      </div>

      {filterOrders.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[var(--surface-low)] py-12 text-center">
          <Receipt size={32} className="text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">
            {isAr ? 'لا توجد فواتير' : 'No Bills'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterOrders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--surface-high)] flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex justify-between items-start border-b border-[var(--surface-mid)] pb-4">
                <div>
                  <h2 className="font-bold text-[var(--text-primary)]">رقم الطلب: {order.id.split('-')[0]}</h2>
                  <p className="text-[13px] text-[var(--text-muted)] font-black mt-1"> 
                    {order.tableNumber 
                      ? `الطاولة: T${order.tableNumber}` 
                      : (order.type === 'takeaway' || order.orderType === 'TakeAway' ? 'سفري 🛍️' : 'توصيل 🛵')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === ORDER_STATUS.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {order.status === ORDER_STATUS.paid ? (isAr ? 'تم الدفع ✓' : 'Paid ✓') : (isAr ? 'بانتظار الدفع' : 'Awaiting Payment')}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[120px] pr-2 text-xs font-semibold space-y-2 text-[var(--text-secondary)] no-scrollbar">
                {(order._rawItems || order.items)?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    {/* Fallback to string display if `item` is magically still just a string */}
                    <span className="truncate w-2/3">{typeof item === 'string' ? item : (item.menuItemName || item.name || 'الصنف')}</span>
                    <span>{typeof item === 'string' ? '' : formatIQD(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--surface-mid)] space-y-3">
                <div className="flex justify-between items-center font-black text-lg text-[var(--color-primary)]">
                  <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span>{formatIQD(order.totalAmount || 0)}</span>
                </div>

                <div className="flex gap-2 w-full">
                  {order.status !== ORDER_STATUS.paid && (
                    <button 
                      onClick={() => handlePay(order.id, order.totalAmount)} 
                      disabled={processingId === order.id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-colors text-sm"
                    >
                      {processingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                      {isAr ? 'تأكيد الدفع' : 'Confirm Payment'}
                    </button>
                  )}
                  <button onClick={() => handlePrint(order)} className={`${order.status === ORDER_STATUS.paid ? 'w-full' : 'w-14'} bg-[var(--surface-low)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-colors text-sm`}>
                    <Printer size={18} /> {order.status === ORDER_STATUS.paid ? (isAr ? 'طباعة الإيصال' : 'Print Receipt') : ''}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CashierBillsPage;
