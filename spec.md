# giftNaura

## Current State
- Admin panel at `/admin` uses Internet Identity (ICP login) for authentication
- AdminDashboard at `/admin/dashboard` checks `isCallerAdmin()` via the actor tied to the II identity
- Backend uses `MixinAuthorization` / `AccessControl` with Principal-based roles
- Frontend has `useInternetIdentity` hook driving all auth state
- Users cannot log in because no Principal has been granted admin role

## Requested Changes (Diff)

### Add
- Hardcoded username/password login on the frontend (`admin` / `rjun0016`)
- A `localStorage`-based session flag (`giftnAura_admin_session`) to persist login across page reloads
- Password-based admin gate: if correct credentials entered, set session and redirect to `/admin/dashboard`

### Modify
- `AdminLogin.tsx`: Replace Internet Identity button with a username + password form; validate against hardcoded credentials; on success set session flag and navigate to `/admin/dashboard`
- `AdminDashboard.tsx`: Replace `useInternetIdentity` auth guard with session flag check; logout clears session flag and redirects to `/admin`
- `useActor.ts`: Remove dependency on `identity` from `useInternetIdentity`; always use anonymous actor (orders are fetched via admin-privileged backend calls driven by the Caffeine admin token already in `getSecretParameter`)
- Backend `main.mo`: No changes needed -- `_initializeAccessControlWithSecret` with the Caffeine admin token already grants admin access to the anonymous principal in preview/dev; this is sufficient

### Remove
- Internet Identity login flow from admin pages (no more `login()` / `clear()` calls in admin context)
- Admin check via `isCallerAdmin()` on the login page (replaced by frontend credential check)

## Implementation Plan
1. Update `AdminLogin.tsx`: add username/password form, validate against `admin`/`rjun0016`, store `giftnAura_admin_session=true` in localStorage on success, navigate to `/admin/dashboard`
2. Update `AdminDashboard.tsx`: on mount, check `localStorage.getItem('giftnAura_admin_session')`; if missing, redirect to `/admin`; logout clears the key and redirects
3. Keep `useActor.ts` using the anonymous actor path (already works with Caffeine admin token for admin operations)
4. Validate and deploy
