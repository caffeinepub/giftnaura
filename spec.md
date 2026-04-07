# giftNaura

## Current State
The app uses username/password login (admin/rjun0016) stored in localStorage. The backend uses Caffeine's authorization system where `createOrder`, `getAllOrders`, `deleteOrder`, and `updateOrderStatus` all require the caller to be an admin.

The `useActor` hook was only calling `_initializeAccessControlWithSecret(adminToken)` when an Internet Identity session existed. Since this app uses username/password (no Internet Identity), `identity` is always null, so the actor was always anonymous. This caused all admin backend calls to fail with "Unauthorized: Only admins can create orders".

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `useActor.ts`: Always call `_initializeAccessControlWithSecret(adminToken)` regardless of whether Internet Identity is in use, so the admin token from `getSecretParameter("caffeineAdminToken")` is applied on every actor creation.

### Remove
- Nothing removed

## Implementation Plan
1. In `useActor.ts`, restructure the `queryFn` to always call `_initializeAccessControlWithSecret` after creating the actor, regardless of `identity` state.
2. Validate and deploy.
