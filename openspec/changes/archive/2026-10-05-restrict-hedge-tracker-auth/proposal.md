## Why

The `/portfolio/hedge` page is currently publicly accessible without authentication. Since it displays portfolio positions and options data, it should be restricted to authenticated users only.

## What Changes

- Add authentication protection to the `/portfolio/hedge` page route
- Unauthenticated users are redirected to the login page
- No changes to the hedge tracker functionality itself

## Capabilities

### New Capabilities
- `auth-protected-routes`: Middleware/route handler pattern for requiring authentication on specific pages

### Modified Capabilities
- `portfolio-hedge-tracker`: Add authentication requirement to the page

## Impact

- `src/app/portfolio/hedge/page.tsx` — add auth check
- `src/middleware.ts` or route-level auth — implement protection
- `src/lib/auth.ts` — already has NextAuth configured (no changes needed)
