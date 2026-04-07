# giftNaura

## Current State
- Motoko backend with `authorization` component for role-based access control
- Admin operations (createOrder, getAllOrders, deleteOrder, updateOrderStatus) require admin principal
- Frontend login: credentials checked in-browser, then `_initializeAccessControlWithSecret` called on a temporary anonymous actor that is immediately discarded
- `useActor.ts` only calls `_initializeAccessControlWithSecret` when Internet Identity is active -- so after username/password login, the persisted actor is NEVER initialized as admin
- Result: all admin API calls are rejected with "Unauthorized" because the actor used for mutations is anonymous, not admin
- `AdminDashboard.tsx` calls `isCallerAdmin()` which always returns false for the anonymous actor, causing an infinite redirect loop back to login

## Requested Changes (Diff)

### Add
- `useActor.ts`: Always initialize actor with admin token from URL params on every actor creation (not gated on Internet Identity)
- `AdminLogin.tsx`: After credential check, verify admin status by calling `isCallerAdmin()` on the properly initialized actor; store session only if backend confirms admin
- A shared `initAdminActor` utility that creates and initializes an actor with the admin token, reused in both login and the actor hook

### Modify
- `useActor.ts`: Remove the `isAuthenticated` gate -- always call `_initializeAccessControlWithSecret` with the admin token regardless of identity state
- `AdminLogin.tsx`: Use the actor from the query (via a callback) rather than creating a throwaway actor instance
- `AdminDashboard.tsx`: Simplify -- keep localStorage session guard, remove the redundant `isCallerAdmin()` backend re-check (it will always be correct now since the actor is properly initialized)

### Remove
- The separate throwaway actor instantiation in `AdminLogin.tsx`
- The `isCallerAdmin()` gate in `AdminDashboard.tsx` (simplification; login already verified admin)

## Implementation Plan
1. Fix `useActor.ts`: always call `_initializeAccessControlWithSecret(adminToken)` on every actor, not just when II is active
2. Fix `AdminLogin.tsx`: after credential check, call `isCallerAdmin()` on the actor from context (via a passed-in callback or by importing the actor directly after initialization), set localStorage only if it returns true
3. Fix `AdminDashboard.tsx`: remove the backend `isCallerAdmin()` re-check that was causing the redirect loop; keep only localStorage guard
4. Validate and deploy
