# giftNaura

## Current State
The app has a username/password admin login (`admin` / `rjun0016`) that is entirely frontend-only. On successful login, it stores `giftnAura_admin_session=true` in localStorage. The backend uses the Caffeine authorization system (`_initializeAccessControlWithSecret`) to grant admin role, but this is only called inside `useActor` when an Internet Identity is present — which never happens since II was replaced with username/password auth. As a result, all backend calls are made as anonymous principal, and `createOrder`, `getAllOrders`, `deleteOrder`, `updateOrderStatus` all fail with "Unauthorized: Only admins can create orders".

The `caffeineAdminToken` is available via URL hash / sessionStorage (`getSecretParameter`), but it is never used in the current flow.

## Requested Changes (Diff)

### Add
- A context (`AdminAuthContext`) that tracks: whether admin token initialization with the backend has been completed, and whether the actor has called `_initializeAccessControlWithSecret` successfully.
- A flag (`adminInitialized`) in sessionStorage so the initialization call is only made once per session.
- On login form submit: after credential check passes, call `actor._initializeAccessControlWithSecret(adminToken)` before navigating to dashboard. Store result in sessionStorage.

### Modify
- `useActor.ts`: Always call `_initializeAccessControlWithSecret` with the admin token regardless of whether Internet Identity is active. Currently it only does this when `identity` is present.
- `AdminLogin.tsx`: After credential validation, get the actor, call `_initializeAccessControlWithSecret(adminToken)`, store a flag in sessionStorage, then navigate to dashboard.
- `AdminDashboard.tsx`: Replace the localStorage session guard with a backend-verified admin check (`isCallerAdmin()`). If not admin, redirect to login.

### Remove
- The hardcoded credential check in `AdminLogin.tsx` is not removed (it is the gating mechanism), but the login must also call backend initialization.
- The exclusive dependence on localStorage for auth state.

## Implementation Plan
1. Update `useActor.ts`: remove the `if (!isAuthenticated)` guard around `_initializeAccessControlWithSecret`. Always call it with the admin token from `getSecretParameter('caffeineAdminToken')` after actor creation.
2. Update `AdminLogin.tsx`: after credential check passes, create an actor and call `_initializeAccessControlWithSecret(adminToken)`, set `giftnAura_admin_initialized=true` in sessionStorage, then navigate.
3. Update `AdminDashboard.tsx`: use `useIsAdmin()` query to verify admin status from backend. If not admin (and not loading), redirect to `/admin`.
