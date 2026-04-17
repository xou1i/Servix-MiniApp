# Servix MiniApp - Restaurant Management System

**🚀 Live Demo:** [https://servix-mini-app.vercel.app/](https://servix-mini-app.vercel.app/)

## 📖 Overview
Servix MiniApp is a comprehensive digital solution designed to streamline restaurant operations. It seamlessly connects Front-of-House (waiters, cashiers) and Back-of-House (chefs, baristas) personnel using a modern, tablet-optimized interface and real-time backend synchronization.

## 🔑 Key Roles & Permissions
- **Admin / Manager:** Full system access, extensive menu management, staff configuration, and analytics.
- **Cashier:** Oversees billing, manages takeaway and delivery logistics, controls manual table states, and settles final payments.
- **Waiter:** Interacts with the interactive floor map, compiles digital order carts, and instantly dispatches tickets to preparation areas.
- **Chef & Barista:** Utilize specialized routing screens to receive, track, and complete specific food or beverage items.

## ⭐ Core Features
- **Smart Table Management:** Intuitive spatial floor maps with dynamic, color-coded status transitions (Available, Occupied, Reserved).
- **Flexible Order Parsing:** Unified workflows managing dynamic Dine-in assignments, Takeaway orders, and Delivery requirements.
- **Real-Time Synchronization:** Instant, bidirectional state updates between floor tablets and kitchen screens leveraging SignalR.
- **Optimistic UI Caching:** Intelligent frontend state patching ensures the application remains incredibly fast and responsive, masking slight network latencies.
- **Structured Billing:** Secure invoice handling, split functionalities, and immutable historical ledger records.

## 🔄 System Workflow
1. **Creation:** Front-of-house staff generate an order payload and link it to a contextual Table or Delivery profile.
2. **Dispatch:** Individual ordered items are instantly routed and sorted into respective Kitchen or Bar queues.
3. **Preparation:** Back-of-house teams visualize incoming tasks and actively change item flags to "In Progress" or "Completed".
4. **Fulfillment & Closure:** Waiters receive completion broadcasts. Once finished, Cashiers execute secure payment conclusions, resetting table availability automatically.

## 🛠️ Technical Stack
- **Frontend:** React.js, Vite
- **Backend:** .NET 8 Web API, Entity Framework (EF) Core, SignalR (WebSockets)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Architecture Standard:** Clean Architecture & RESTful API integration

---
*Built to digitize restaurant operations for faster service, clear communication, and seamless workflows.*
