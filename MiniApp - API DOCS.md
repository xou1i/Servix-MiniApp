# Mini App API Documentation

> يغطي كل شيء يحتاجه الميني اب لأربعة رولز: Cashier, Waiter, Chef, Barista > تحديثات **Real-time** عبر SignalR أو WebSockets

---

## 1. Auth – تسجيل الدخول والتوثيق

### Login

- **Endpoint:** `**POST** /api/v1/Auth/login`
- **الوصف:** لتسجيل دخول الموظف باستخدام حسابه الذي أنشأه Admin. يعطي **JWT** token لاستخدامه في الـ headers.
- **Request Body:**

```json
{
    *email*: *[user@example.com](mailto:user@example.com)*,
    *password*: *string*
}
```

- **Response:**

```json
{
    *token*: *JWT_TOKEN*,
    *user*: {
    *id*: *uuid*,
    *firstName*: *string*,
    *lastName*: *string*,
    *role*: *Cashier | Waiter | Chef | Barista*,
    *departmentId*: *uuid*
    }
}
```

- **ملاحظات:**

  * يجب تخزين الـ token لاستخدامه في كل request محمي.

### Get Current User

- **Endpoint:** `**GET** /api/v1/Auth/me`
- **الوصف:** للحصول على معلومات المستخدم الحالي.
- **Headers:**

``` Authorization: Bearer {JWT_TOKEN} ```

- **Response:**

```json
{
    *id*: *uuid*,
    *firstName*: *string*,
    *lastName*: *string*,
    *role*: *Cashier | Waiter | Chef | Barista*,
    *departmentId*: *uuid*
}
```

---

## 2. Menu – عرض المنيو

### Get All Menu Items

- **Endpoint:** `**GET** /api/v1/Menu`
- **الوصف:** جلب جميع الأصناف الموجودة في المنيو مع التفاصيل والوصفات.
- **Response:**

```json
[
    {
    *id*: *uuid*,
    *name*: *string*,
    *description*: *string*,
    *price*: 0.0,
    *imageUrl*: *string*,
    *categoryId*: *uuid*,
    *isAvailable*: true,
    *calories*: 0,
    *preparationTime*: 0,
    *ingredients*: [*string*]
    }
]
```

- **ملاحظات:**

    * يستخدم عند فتح قائمة الطلبات في الميني اب.
    * المكونات تساعد على التحقق من المخزون قبل الطلب.

### Get Menu by Category

- **Endpoint:** `**GET** /api/v1/Menu/category/{categoryId}`
- **الوصف:** جلب أصناف المنيو المرتبطة بفئة محددة.
- **Parameters:**

  * `categoryId` (path): ID الفئة المطلوبة
- **Response:** نفس صيغة Get All Menu Items لكن مصفاة حسب الفئة.

---

## 3. Tables – الطاولات

### Get All Tables

- **Endpoint:** `**GET** /api/v1/Tables`
- **الوصف:** عرض كل الطاولات الموجودة بالمطعم مع حالتها ومعلوماتها.
- **Response:**

```json
[
    {
    *id*: *uuid*,
    *tableNumber*: 1,
    *capacity*: 4,
    *location*: *string*,
    *status*: *Available | Occupied | Reserved | Maintenance*,
    *notes*: *string*
    }
]
```

### Get Available Tables

- **Endpoint:** `**GET** /api/v1/Tables/available`
- **الوصف:** عرض الطاولات المتاحة فقط لاستخدامها عند إنشاء الطلبات DineIn.
- **Response:** نفس صيغة Get All Tables لكن فقط للطاولات المتاحة.

---

## 4. Orders – إدارة الطلبات

### Create Order

- **Endpoint:** `**POST** /api/v1/Orders`
- **الوصف:** إنشاء طلب جديد من قبل Cashier أو Waiter.
- **Request Body:**

```json
{
    *userId*: *uuid*,
    *tableId*: *uuid*,
    *orderType*: *DineIn | TakeAway | Delivery*,
    *items*: [
    {
    *menuItemId*: *uuid*,
    *quantity*: 1,
    *specialInstructions*: *string*
    }
    ],
    *specialNotes*: *string*
}
```

- **Response:**

```json
{
    *id*: *uuid*,
    *status*: *Pending*,
    *totalAmount*: 0.0,
    *createdAt*: *datetime*
}
```

- **ملاحظات:**

    * يظهر الطلب **Real-time** لجميع الموظفين وDashboard.
    * يتحقق النظام من توفر المكونات ويرسل **تنبيه Low Stock** إذا كانت ناقصة.

### Get Orders

- **Endpoint:** `**GET** /api/v1/Orders`
- **الوصف:** عرض الطلبات حسب القسم أو الحالة.
- **Query Params (اختياري):**

    * `departmentId` → لتصفية الطلبات للقسم
    * `status` → Pending, Preparing, Ready, Delivering, Completed
- **Response:** قائمة الطلبات مع تفاصيل الأصناف والملاحظات.

### Get Order Details

- **Endpoint:** `**GET** /api/v1/Orders/{id}`
- **الوصف:** عرض تفاصيل طلب معين بالكامل.
- **Parameters:**

  * `id` (path): ID الطلب
- **Response:** تفاصيل الطلب كاملة بما فيها الأصناف والملاحظات والحالة.

### Update Order Status

- **Endpoint:** `**PATCH** /api/v1/Orders/{id}/status`
- **الوصف:** تحديث حالة الطلب أثناء دورة التحضير والتسليم.
- **Request Body:**

```json { *status*: *Preparing | Ready | Delivering | Completed* } ```

- **Response:** الطلب بعد التحديث.
- **ملاحظات:**

    * التحديثات تظهر **Real-time** لكل الموظفين وDashboard.
    * عند اكتمال الطلب، يتم خصم مكونات الأصناف من المخزون تلقائياً.

---

## 5. Inventory – تنبيهات المخزون فقط

### Get Low Stock Items

- **Endpoint:** `**GET** /api/v1/Inventory/low-stock`
- **الوصف:** عرض التنبيهات للأصناف أو المكونات التي وصلت إلى حد منخفض.
- **Response:**

```json
[
    {
    *id*: *uuid*,
    *name*: *string*,
    *quantity*: 5,
    *unit*: *kg | pcs | liter*,
    *threshold*: 10
    }
]
```

- **ملاحظات:**

  * يستخدم عند إنشاء الطلب لإظهار تنبيه إذا كانت المكونات ناقصة.

### Get Recipe for Menu Item

- **Endpoint:** `**GET** /api/v1/Inventory/recipe/{menuItemId}`
- **الوصف:** عرض مكونات صنف معين للتحقق قبل الطلب.
- **Response:**

```json
{
    *menuItemId*: *uuid*,
    *name*: *string*,
    *ingredients*: [
    {
    *ingredientId*: *uuid*,
    *name*: *string*,
    *quantity*: **200**,
    *unit*: *gram*
    }
    ]
}
```

---

## 6. Real-Time Notifications / SignalR

- **الأحداث:**

    * `OrderCreated` → عند إنشاء أي طلب جديد.
    * `OrderUpdated` → عند تغيير حالة الطلب.
    * `LowStockAlert` → عند وصول أي مكون للحد الأدنى.

**Payload Example:**

```json
{
    *event*: *OrderUpdated*,
    *orderId*: *uuid*,
    *status*: *Ready*
}
```

- **ملاحظات:**

    * كل الموظفين المرتبطين بالطلب يتلقون التحديث لحظياً.
    * الميني اب يحتاج إعداد اتصال SignalR عند فتح التطبيق.

---

### Headers المشترك لكل Endpoints المحمية

``` Authorization: Bearer {JWT_TOKEN} ```

---

✅ هذا ****README** كامل** للميني اب، يشمل:

- تسجيل الدخول والمستخدم
- المنيو والفئات
- الطاولات
- إنشاء ومتابعة الطلبات
- تنبيهات المخزون
- التحديثات Real-time

