# Restaurant Management System :fork_and_knife:

## Mini App Technical Specification

---

## :sparkles: Introduction

Welcome to the **Restaurant Management System** — a comprehensive digital platform designed to transform restaurant operations through seamless integration and intelligent automation.

**مرحباً بك في نظام إدارة المطاعم** — منصة رقمية شاملة مصممة لتحويل عمليات المطعم من خلال التكامل السلس والأتمتة الذكية.

---

## 1. System Architecture Overview :building_construction:

The Restaurant Management System is built on a **four-tier architecture**, each component serving a distinct purpose in the operational workflow.

**النظام مبني على بنية من أربعة مستويات، كل مكون يخدم غرضاً مميزاً في سير العمل التشغيلي.**

---

### 1.1 Marketing & Subscription Website :globe_with_meridians:

**Purpose:** Customer acquisition and subscription management.

**الغرض:** اكتساب العملاء وإدارة الاشتراكات.

**Key Features:**

- Account creation (Manual / Google OAuth / Phone OTP)
- Restaurant profile setup
- Subscription plan selection
- Automated account activation post-payment

> :information_source: **System Entry Point**  
> This is where restaurant owners **begin their journey**. After successful payment, accounts are marked as active in the backend, unlocking access to the Dashboard and Mini App.
>
> **نقطة الدخول إلى النظام:**  
> هنا يبدأ أصحاب المطاعم **رحلتهم**. بعد الدفع الناجح، يتم وضع علامة نشط على الحسابات في الخلفية، مما يفتح الوصول إلى لوحة التحكم والتطبيق الصغير.

---

### 1.2 Dashboard (Web Application) :desktop_computer:

**Purpose:** Central configuration hub for restaurant operations.

**الغرض:** مركز التكوين المركزي لعمليات المطعم.

**Core Capabilities:**


| Function                | Description                                   |
| ----------------------- | --------------------------------------------- |
| **Employee Management** | Create, edit, and manage staff accounts       |
| **Role Configuration**  | Define permissions and access levels          |
| **Menu Engineering**    | Build categories, items, recipes, ingredients |
| **Inventory Control**   | Track stock levels and supplies               |
| **Table Management**    | Design floor layout and table assignments     |
| **Workflow Automation** | Configure order routing and processing rules  |


> :bulb: **Data Authority**  
> The Dashboard serves as the **single source of truth**. All configurations made here propagate automatically to the Mini App in real-time.
>
> **سلطة البيانات:**  
> لوحة التحكم هي **المصدر الوحيد للحقيقة**. جميع الإعدادات التي تتم هنا تنتشر تلقائياً إلى التطبيق الصغير في الوقت الفعلي.

---

### 1.3 Mini App (Staff Application) :iphone:

**Purpose:** Operational interface for restaurant staff.

**الغرض:** واجهة تشغيلية لموظفي المطعم.

**Platform:** Optimized for tablets and desktop computers used on-premises.

**المنصة:** محسّن للأجهزة اللوحية وأجهزة الكومبيوتر المستخدمة في المقر.

**Supported Roles:**

- Waiter (نادل)
- Chef (طاهي)
- Barista (باريستا)
- Cashier (كاشير)

**Auto-Synchronized Data:**

- :white_check_mark: Role definitions and permissions
- :white_check_mark: Complete menu catalog
- :white_check_mark: Table layout and availability
- :white_check_mark: Order workflow configuration

---

### 1.4 IT Dashboard (Internal Operations Tool) :wrench:

**Purpose:** System monitoring and analytics for the development team.

**الغرض:** مراقبة النظام والتحليلات لفريق التطوير.

**Capabilities:**

- Restaurant registry overview
- Subscription lifecycle tracking
- Usage analytics and metrics
- System-wide data management

**القدرات:**

- نظرة عامة على سجل المطاعم
- تتبع دورة حياة الاشتراك
- تحليلات الاستخدام والمقاييس
- إدارة البيانات على مستوى النظام

---

## 2. Mini App Deep Dive :mag:

This section provides comprehensive technical specifications for the **Mini App** — the operational heart of the system.

**هذا القسم يوفر مواصفات تقنية شاملة للتطبيق الصغير — القلب التشغيلي للنظام.**

---

### 2.1 Authentication & Session Management :closed_lock_with_key:

#### New Authentication Flow

**Step 1: Single Sign-On**  
User authenticates **once** using centralized credentials.

**الخطوة 1: تسجيل دخول موحد**  
المستخدم يصادق **مرة واحدة** باستخدام بيانات الاعتماد المركزية.

**Step 2: Role Selection Screen**  
After successful login, a role picker interface appears.

**الخطوة 2: شاشة اختيار الدور**  
بعد تسجيل الدخول الناجح، تظهر واجهة اختيار الدور.

**Step 3: Role Activation**  
User selects their current working role (Waiter, Chef, Barista, or Cashier).

**الخطوة 3: تفعيل الدور**  
المستخدم يختار دوره الوظيفي الحالي (نادل، طاهي، باريستا، أو كاشير).

**Step 4: System Entry**  
User enters the Mini App with role-specific permissions and interface.

**الخطوة 4: الدخول إلى النظام**  
المستخدم يدخل التطبيق الصغير بصلاحيات وواجهة خاصة بالدور.

> :information_source: **Session-Based Architecture**
>
> **Key Principles:**
>
> - Roles are **session-scoped**, not account-scoped
> - **No separate profiles** required per role
> - Role selection occurs **post-authentication**
> - Users can **switch roles** by logging out and re-selecting
> - **Single account** serves all roles
>
> **البنية القائمة على الجلسة:**
>
> **المبادئ الأساسية:**
>
> - الأدوار **محددة النطاق بالجلسة**، وليس بالحساب
> - **لا حاجة لملفات تعريف منفصلة** لكل دور
> - اختيار الدور يحدث **بعد المصادقة**
> - يمكن للمستخدمين **تبديل الأدوار** بتسجيل الخروج وإعادة الاختيار
> - **حساب واحد** يخدم جميع الأدوار

---

### 2.2 Role-Based Access Control (RBAC) :key:

The Mini App implements **granular permission control** based on staff roles.

**التطبيق الصغير ينفذ التحكم في الأذونات الدقيقة بناءً على أدوار الموظفين.**

---

#### 2.2.1 Waiter (نادل)

**Primary Function:** Dine-in service management.

**الوظيفة الأساسية:** إدارة خدمة تناول الطعام داخل الصالة.

**Permissions:**


| Action                 | Status             |
| ---------------------- | ------------------ |
| Create new orders      | :white_check_mark: |
| View menu catalog      | :white_check_mark: |
| Access table map       | :white_check_mark: |
| Manage dine-in orders  | :white_check_mark: |
| Create takeaway orders | :x:                |
| Create delivery orders | :x:                |
| Modify order status    | :x:                |


**الصلاحيات:**

- :check_mark_button: إنشاء طلبات جديدة
- :check_mark_button: عرض كتالوج القائمة
- :check_mark_button: الوصول إلى خريطة الطاولات
- :check_mark_button: إدارة طلبات تناول الطعام داخل الصالة
- :cross_mark: إنشاء طلبات الطعام الجاهز
- :cross_mark: إنشاء طلبات التوصيل
- :cross_mark: تعديل حالة الطلب

---

#### 2.2.2 Cashier (كاشير)

**Primary Function:** Multi-channel order creation and payment processing.

**الوظيفة الأساسية:** إنشاء الطلبات متعددة القنوات ومعالجة الدفع.

**Permissions:**


| Action                 | Status             |
| ---------------------- | ------------------ |
| Create new orders      | :white_check_mark: |
| View menu catalog      | :white_check_mark: |
| Access table map       | :white_check_mark: |
| Create dine-in orders  | :white_check_mark: |
| Create takeaway orders | :white_check_mark: |
| Create delivery orders | :white_check_mark: |
| Modify order status    | :x:                |


> :bulb: **Scope Distinction**  
> The Cashier has the **broadest order creation privileges** across all service channels (dine-in, takeaway, delivery) but **cannot alter preparation status**.
>
> **تمييز النطاق:**  
> الكاشير لديه **أوسع امتيازات إنشاء الطلبات** عبر جميع قنوات الخدمة (تناول الطعام داخل الصالة، الطعام الجاهز، التوصيل) لكنه **لا يمكنه تغيير حالة التحضير**.

---

#### 2.2.3 Chef (طاهي)

**Primary Function:** Food preparation and order lifecycle management.

**الوظيفة الأساسية:** تحضير الطعام وإدارة دورة حياة الطلب.

**Permissions:**


| Action                | Status             |
| --------------------- | ------------------ |
| View assigned orders  | :white_check_mark: |
| Update order status   | :white_check_mark: |
| Mark as **Preparing** | :white_check_mark: |
| Mark as **Ready**     | :white_check_mark: |
| Mark as **Completed** | :white_check_mark: |
| Create new orders     | :x:                |


**الصلاحيات:**

- :check_mark_button: عرض الطلبات المعينة
- :check_mark_button: تحديث حالة الطلب
- :check_mark_button: وضع علامة **قيد التحضير**
- :check_mark_button: وضع علامة **جاهز**
- :check_mark_button: وضع علامة **مكتمل**
- :cross_mark: إنشاء طلبات جديدة

---

#### 2.2.4 Barista (باريستا)

**Primary Function:** Beverage preparation and order lifecycle management.

**الوظيفة الأساسية:** تحضير المشروبات وإدارة دورة حياة الطلب.

**Permissions:**


| Action                | Status             |
| --------------------- | ------------------ |
| View assigned orders  | :white_check_mark: |
| Update order status   | :white_check_mark: |
| Mark as **Preparing** | :white_check_mark: |
| Mark as **Ready**     | :white_check_mark: |
| Mark as **Completed** | :white_check_mark: |
| Create new orders     | :x:                |


> :information_source: **Functional Parity**  
> Chef and Barista roles share **identical permission sets** but operate on different order categories (food vs. beverages).
>
> **التكافؤ الوظيفي:**  
> أدوار الطاهي والباريستا تشترك في **مجموعات أذونات متطابقة** لكنها تعمل على فئات طلبات مختلفة (الطعام مقابل المشروبات).

---

### 2.3 Order Status Management :arrows_counterclockwise:

#### 2.3.1 Status Modification Authority

**Only the following roles can change order status:**

- **Chef** (طاهي)
- **Barista** (باريستا)

**فقط الأدوار التالية يمكنها تغيير حالة الطلب:**

- **الطاهي**
- **الباريستا**

#### 2.3.2 Waiter & Cashier Capabilities

**Read-Only Access:**

- :white_check_mark: View current order status
- :white_check_mark: Track order progress in real-time

**Restricted Actions:**

- :x: Modify order status
- :x: Change preparation state
- :x: Mark orders as ready/completed

**الوصول للقراءة فقط:**

- :check_mark_button: عرض حالة الطلب الحالية
- :check_mark_button: تتبع تقدم الطلب في الوقت الفعلي

**الإجراءات المقيدة:**

- :cross_mark: تعديل حالة الطلب
- :cross_mark: تغيير حالة التحضير
- :cross_mark: وضع علامة على الطلبات كجاهزة/مكتملة

---

### 2.4 Order Lifecycle & State Transitions :recycle:

#### 2.4.1 Order State Diagram

Orders progress through a **four-stage lifecycle**:

```
1. Pending → 2. Preparing → 3. Ready → 4. Completed
```

**الطلبات تتقدم عبر دورة حياة من أربع مراحل:**

```
1. قيد الانتظار ← 2. قيد التحضير ← 3. جاهز ← 4. مكتمل
```

#### 2.4.2 State Definitions


| State         | Description                              | Arabic       |
| ------------- | ---------------------------------------- | ------------ |
| **Pending**   | Order created, awaiting assignment       | قيد الانتظار |
| **Preparing** | Currently being prepared by Chef/Barista | قيد التحضير  |
| **Ready**     | Preparation complete, ready for serving  | جاهز         |
| **Completed** | Delivered to customer                    | مكتمل        |


#### 2.4.3 Completed Order Behavior

When an order reaches **Completed** status:

**UI Actions:**

1. Order card **disappears** from the active orders screen
2. Order **transitions** to the History page
3. History page becomes accessible via navigation bar

**إجراءات واجهة المستخدم:**

1. بطاقة الطلب **تختفي** من شاشة الطلبات النشطة
2. الطلب **ينتقل** إلى صفحة السجل
3. صفحة السجل تصبح قابلة للوصول عبر شريط التنقل

> :warning: **Important Behavior**  
> Completed orders are **automatically archived** to maintain a clean active workspace. Staff can always retrieve historical data from the History section.
>
> **سلوك مهم:**  
> الطلبات المكتملة **تُؤرشف تلقائياً** للحفاظ على مساحة عمل نشطة نظيفة. يمكن للموظفين دائماً استرجاع البيانات التاريخية من قسم السجل.

---

### 2.5 User Interface Design System :art:

#### 2.5.1 Design Decision: Remove Sidebar

> :x: **Deprecated Component: Sidebar**
>
> **Rationale for Removal:**
>
> - **Space Inefficiency:** Consumes excessive horizontal screen real estate
> - **Inappropriate Metaphor:** Creates a dashboard-like appearance unsuitable for operational staff tools
> - **Tablet Optimization:** Not optimized for tablet form factors
> - **Reduced Usability:** Limits content display area on smaller screens
>
> **الأساس المنطقي للإزالة:**
>
> - **عدم كفاءة المساحة:** يستهلك مساحة شاشة أفقية مفرطة
> - **استعارة غير مناسبة:** يخلق مظهراً يشبه لوحة التحكم غير مناسب لأدوات الموظفين التشغيلية
> - **تحسين الأجهزة اللوحية:** غير محسّن لعوامل شكل الأجهزة اللوحية
> - **قابلية استخدام منخفضة:** يحد من منطقة عرض المحتوى على الشاشات الأصغر

---

#### 2.5.2 New Component: Top Navigation Bar

**Design Philosophy:** Replace vertical sidebar with a modern, floating horizontal navigation bar.

**فلسفة التصميم:** استبدال الشريط الجانبي العمودي بشريط تنقل أفقي عائم حديث.

**Visual Specifications:**


| Property    | Value                                  |
| ----------- | -------------------------------------- |
| **Layout**  | Horizontal, top-aligned                |
| **Width**   | Centered with margins (not full-width) |
| **Corners** | Rounded (border-radius: 12-16px)       |
| **Height**  | Compact (48-56px)                      |
| **Padding** | Generous touch targets (12-16px)       |
| **Style**   | Glass morphism (see 2.5.3)             |


**Navigation Elements:**

- **Primary Links:** Orders, Tables, Menu
- **Secondary Actions:** History, Settings
- **Status Indicators:** Current role badge
- **Utilities:** Language toggle (EN/AR)

**عناصر التنقل:**

- **الروابط الأساسية:** الطلبات، الطاولات، القائمة
- **الإجراءات الثانوية:** السجل، الإعدادات
- **مؤشرات الحالة:** شارة الدور الحالي
- **الأدوات المساعدة:** تبديل اللغة (EN/AR)

---

#### 2.5.3 Design Language: Glass Morphism :sparkles:

**Core Aesthetic:** Liquid glass / frosted glass visual style.

**الجمالية الأساسية:** أسلوب بصري زجاجي سائل / زجاج مصنفر.

**Applied Components:**

- Cards
- Buttons
- Modals & Dialogs
- Input fields
- Navigation bar
- Dropdown menus
- Overlays

**Visual Properties:**


| Property        | Specification                                              |
| --------------- | ---------------------------------------------------------- |
| **Background**  | Semi-transparent with blur (`backdrop-filter: blur(10px)`) |
| **Border**      | Soft, subtle color with low opacity                        |
| **Shadow**      | Multi-layer shadows for depth                              |
| **Transitions** | Smooth 200-300ms ease-in-out                               |
| **Hover State** | Increased opacity + subtle glow                            |


**المكونات المطبقة:**

- البطاقات
- الأزرار
- النوافذ المنبثقة والحوارات
- حقول الإدخال
- شريط التنقل
- القوائم المنسدلة
- التراكبات

**الخصائص البصرية:**

- **الخلفية:** شبه شفافة مع بلور (`backdrop-filter: blur(10px)`)
- **الحدود:** لون ناعم وخفيف مع تعتيم منخفض
- **الظل:** ظلال متعددة الطبقات للعمق
- **الانتقالات:** سلسة 200-300 ميلي ثانية ease-in-out
- **حالة التمرير:** زيادة التعتيم + توهج خفيف

> :bulb: **Design Consistency**  
> All interactive elements **must** adhere to glass morphism principles to maintain visual coherence across the application.
>
> **اتساق التصميم:**  
> جميع العناصر التفاعلية **يجب** أن تلتزم بمبادئ التصميم الزجاجي للحفاظ على التماسك البصري عبر التطبيق.

---

### 2.6 Navigation Architecture :compass:

#### 2.6.1 Primary Navigation Sections


| Section     | Purpose                       | Arabic   |
| ----------- | ----------------------------- | -------- |
| **Orders**  | View and manage active orders | الطلبات  |
| **Tables**  | Access table map and status   | الطاولات |
| **Menu**    | Browse menu catalog           | القائمة  |
| **History** | View completed orders archive | السجل    |


#### 2.6.2 Role-Based Section Visibility

> :information_source: **Dynamic UI Adaptation**  
> Navigation sections are **dynamically rendered** based on the authenticated user's role permissions. Inaccessible sections are **automatically hidden** from the interface.
>
> **التكيف الديناميكي لواجهة المستخدم:**  
> أقسام التنقل **تُعرض ديناميكياً** بناءً على أذونات دور المستخدم المصادق عليه. الأقسام غير القابلة للوصول **تُخفى تلقائياً** من الواجهة.

**Example Visibility Matrix:**


| Section | Waiter              | Cashier             | Chef                | Barista             |
| ------- | ------------------- | ------------------- | ------------------- | ------------------- |
| Orders  | :check_mark_button: | :check_mark_button: | :check_mark_button: | :check_mark_button: |
| Tables  | :check_mark_button: | :check_mark_button: | :cross_mark:        | :cross_mark:        |
| Menu    | :check_mark_button: | :check_mark_button: | :cross_mark:        | :cross_mark:        |
| History | :check_mark_button: | :check_mark_button: | :check_mark_button: | :check_mark_button: |


---

### 2.7 Data Synchronization & Integration :link:

#### 2.7.1 Data Flow Architecture

```
Dashboard (Source) → Backend API → Mini App (Consumer)
```

**بنية تدفق البيانات:**

```
لوحة التحكم (المصدر) ← واجهة برمجة التطبيقات الخلفية ← التطبيق الصغير (المستهلك)
```

#### 2.7.2 Synchronization Examples


| Dashboard Action         | Backend Process                | Mini App Result          |
| ------------------------ | ------------------------------ | ------------------------ |
| Menu item created        | Database insert + cache update | New item appears in menu |
| Table layout modified    | Spatial data updated           | Table map refreshes      |
| Role permissions changed | Access control list updated    | UI sections show/hide    |
| Workflow rule added      | Business logic deployed        | Order routing changes    |


**أمثلة المزامنة:**


| إجراء لوحة التحكم     | عملية الخلفية                                     | نتيجة التطبيق الصغير             |
| --------------------- | ------------------------------------------------- | -------------------------------- |
| إنشاء عنصر قائمة      | إدراج قاعدة البيانات + تحديث ذاكرة التخزين المؤقت | يظهر عنصر جديد في القائمة        |
| تعديل تخطيط الطاولة   | تحديث البيانات المكانية                           | تحديث خريطة الطاولة              |
| تغيير أذونات الدور    | تحديث قائمة التحكم في الوصول                      | إظهار/إخفاء أقسام واجهة المستخدم |
| إضافة قاعدة سير العمل | نشر منطق الأعمال                                  | تغييرات توجيه الطلب              |


> :warning: **Critical Dependency**  
> The Mini App is **entirely dependent** on Dashboard configuration. Staff cannot perform operational tasks until the Dashboard setup is complete.
>
> **الاعتماد الحرج:**  
> التطبيق الصغير **يعتمد بالكامل** على تكوين لوحة التحكم. لا يمكن للموظفين تنفيذ المهام التشغيلية حتى يكتمل إعداد لوحة التحكم.

---

## 3. Technical Summary :clipboard:

The **Mini App** serves as the operational interface for restaurant staff, providing:

**التطبيق الصغير** يعمل كواجهة تشغيلية لموظفي المطعم، مما يوفر:

### Core Capabilities

- **Role-Based Access Control** with granular permissions
- **Real-Time Order Management** across all service channels
- **Intelligent Status Tracking** with automated workflows
- **Modern Glass Morphism UI** optimized for tablets
- **Seamless Dashboard Integration** with live data synchronization
- **Multi-Language Support** (English/Arabic)

### Key Differentiators

- **Session-Based Role Switching** without multiple accounts
- **Automatic UI Adaptation** based on role permissions
- **Floating Top Navigation** for maximum screen utilization
- **Historical Order Archive** with automatic completion handling

**القدرات الأساسية:**

- **التحكم في الوصول القائم على الأدوار** مع أذونات دقيقة
- **إدارة الطلبات في الوقت الفعلي** عبر جميع قنوات الخدمة
- **تتبع الحالة الذكي** مع سير عمل آلي
- **واجهة مستخدم زجاجية حديثة** محسّنة للأجهزة اللوحية
- **تكامل سلس مع لوحة التحكم** مع مزامنة البيانات المباشرة
- **دعم متعدد اللغات** (الإنجليزية/العربية)

**المميزات الرئيسية:**

- **تبديل الأدوار القائم على الجلسة** بدون حسابات متعددة
- **التكيف التلقائي لواجهة المستخدم** بناءً على أذونات الدور
- **التنقل العلوي العائم** لأقصى استخدام للشاشة
- **أرشيف الطلبات التاريخية** مع معالجة الإكمال التلقائي

---

**END OF DOCUMENT**