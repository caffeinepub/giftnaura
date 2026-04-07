# giftNaura Order Tracking App

## Current State
New project. Scaffold only — empty Motoko actor and no frontend yet.

## Requested Changes (Diff)

### Add
- Admin panel at `/admin` route with username + password login
- Admin dashboard: add order form (Customer Name, Order ID, Tracking Link, Status), view all orders list, delete order, copy customer tracking link
- Customer tracking page at `/track/:orderId` — public, no login, shows branding, customer name, order ID, status, and a "Track Shipment" button
- Authorization component for role-based access (admin vs. public)
- Backend: store orders (orderId, customerName, trackingLink, status, createdAt)
- Backend: admin CRUD operations (create, read, delete, update order)
- Backend: public read-only endpoint to get single order by orderId

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Select `authorization` component for admin authentication
2. Generate Motoko backend with order storage, admin CRUD, and public single-order lookup
3. Build frontend:
   - React Router with routes: `/`, `/admin`, `/admin/dashboard`, `/track/:orderId`
   - Admin login form with username/password (wired to authorization component)
   - Admin dashboard with order list table, add order form, delete button, copy link button
   - Customer tracking page — branded, minimal, shows order details and track button
   - Redirect unauthenticated admin access to `/admin` login
   - No admin links or navigation visible on public pages
4. Design: beige/white/black palette, optional gold accents, clean minimal premium feel, mobile-first
