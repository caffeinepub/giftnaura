# giftNaura Tracking App

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Admin authentication (login with username + password)
- Admin dashboard to create, view, delete orders
- Order model: Customer Name, Order ID, Tracking Link (URL), Status (Shipped/Delivered), Created timestamp
- Order list with search, view, delete, and copy-link buttons
- "Generate Tracking Page" button that creates a shareable link per order
- Customer-facing tracking page at `/track/<orderId>` showing brand, customer name, order ID, status, and a "Track Shipment" button
- Unique shareable links per order (e.g. `/track/order123`)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `authorization` component for admin login/session management
2. Backend: Motoko actor with methods:
   - `createOrder(customerName, orderId, trackingLink)` → order record
   - `getOrders()` → list of all orders (admin only)
   - `getOrderById(orderId)` → single order (public, for tracking page)
   - `deleteOrder(orderId)` → remove order (admin only)
   - `updateOrderStatus(orderId, status)` → change Shipped/Delivered (admin only)
3. Frontend:
   - `/login` — admin login page
   - `/admin` — dashboard with order list, search, add-order form
   - `/track/:orderId` — public customer tracking page
   - React Router for client-side routing
   - Mobile-first, minimal premium design per design preview
