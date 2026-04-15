# 🧾 Restaurant Mini App – API Documentation (v2)

> Real-time, role-based Restaurant POS system  
> Uses Axios + JWT Authentication + SignalR

---

# 🔐 1. Authentication

## POST /api/v1/Auth/login

Login staff user (Cashier, Waiter, Chef, Barista)

### Request
```json
{
  "email": "user@example.com",
  "password": "string"
}
Response
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "role": "Cashier | Waiter | Chef | Barista"
  }
}
Notes
Store token in localStorage
Use in all protected requests

🇸🇦 شرح: تسجيل دخول الموظف ويرجع توكن + معلوماته

GET /api/v1/Auth/me

Get current logged-in user

Headers
Authorization: Bearer {token}
Response
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "role": "Cashier | Waiter | Chef | Barista"
}

🇸🇦: تجيب معلومات المستخدم الحالي

🍽️ 2. Menu
GET /api/v1/Menu

Get all menu items

Response
[
  {
    "id": "uuid",
    "name": "Burger",
    "price": 10.5,
    "target_department": "kitchen | barista",
    "isAvailable": true
  }
]
Notes
target_department مهم لتقسيم الطلب

🇸🇦: عرض المنيو + تحديد القسم (مطبخ/باريستا)

GET /api/v1/Menu/category/{categoryId}

Filter menu by category

🇸🇦: فلترة حسب التصنيف

🪑 3. Tables
GET /api/v1/Tables

Get all tables (used for Table Map)

Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tableNumber": "T1",
      "capacity": 4,
      "zone": "A",
      "floorNumber": 1,
      "status": "Available | Occupied | Reserved | Maintenance",
      "isOrderingEnabled": true,
      "activeOrdersCount": 0
    }
  ]
}
Notes
Used for visual table map
status يتحكم باللون

🇸🇦: بيانات الطاولات لخريطة الصالة

GET /api/public/tables/by-code/{code}

Get table via QR

🇸🇦: جلب طاولة عن طريق QR

🧾 4. Orders (Core System)
GET /api/v1/Orders

Get orders (filtered by role/department)

Query (optional)
status
departmentId

🇸🇦: عرض الطلبات حسب الحالة أو القسم

GET /api/v1/Orders/{id}

Get full order details

🇸🇦: تفاصيل طلب واحد

POST /api/v1/Orders

Create new order (Waiter / Cashier)

Request
{
  "tableId": "uuid",
  "orderType": "dine-in | takeaway | delivery",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2
    }
  ]
}
Notes
Backend splits items by target_department

🇸🇦: إنشاء طلب ويتم تقسيمه تلقائيًا للمطبخ والباريستا

PATCH /api/v1/Orders/{id}/status

Update order status

Request
{
  "status": "preparing | ready | served | completed"
}
Important Rules
❌ لا تعدل global_status مباشرة
✅ النظام يحسبها تلقائيًا

🇸🇦: تحديث الحالة لكن اللوجك داخل الباك

👨‍🍳 5. Kitchen / Barista Logic
Same Orders endpoints
Filter by department internally
Behavior
Chef يرى kitchen items فقط
Barista يرى drinks فقط

🇸🇦: كل قسم يشوف الأصناف الخاصة بيه فقط

💳 6. Payments (Cashier)
POST /api/v1/Payments

Create payment

{
  "orderId": "uuid",
  "amount": 25.5,
  "method": "cash | card"
}
PATCH /api/v1/Payments/{id}/status

Update payment status

POST /api/v1/Payments/{id}/refund

Refund payment

🇸🇦: الكاشير يدير الدفع والاسترجاع

🔗 7. Team 6 Integration (QR System)
GET /api/public/team6/orders/{partnerOrderId}/status

Track external order

GET /api/public/team6/restaurants/{partnerRestaurantId}/users/{partnerUserId}/orders

Get user order history

🇸🇦: ربط الطلبات الجاية من QR (Team 6)

⚡ 8. Real-Time (SignalR)
Hub: /orderHub
Events
NewOrderPlaced
OrderStatusChanged
NewItemsToPrepare
MyOrderStatusUpdate
Example
{
  "event": "OrderStatusChanged",
  "orderId": "uuid",
  "status": "Ready"
}

🇸🇦: تحديث لحظي بدون refresh

🔐 Common Headers
Authorization: Bearer {JWT_TOKEN}
📦 Axios Example
import axios from "axios";

const api = axios.create({
  baseURL: "https://your-api-url.com/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
✅ Summary
Role-based system
Real-time updates
Department-based order splitting
External QR integration (Team 6)

🇸🇦:
نظام احترافي:

حسب الدور
لحظي
يقسم الطلبات حسب القسم
مربوط ويا QR خارجي