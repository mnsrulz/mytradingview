## Context

The `/portfolio/hedge` page is currently publicly accessible. The project uses NextAuth v5 beta with a credentials provider already configured in `src/lib/auth.ts`. The auth setup includes `handlers`, `signIn`, `signOut`, and `auth` exports from NextAuth.

## Goals / Non-Goals

**Goals:**
- Protect the `/portfolio/hedge` route so only authenticated users can access it
- Use Next.js middleware for route protection (consistent with NextAuth v5 patterns)

**Non-Goals:**
- Changing the login flow or auth provider
- Protecting other routes (can be done later using the same pattern)
- Adding role-based access control

## Decisions

**Use Next.js middleware for route protection**

Next.js middleware runs before the page renders and is the standard pattern for auth guards. NextAuth v5 provides a `auth` wrapper for middleware that checks session validity.

Alternative considered: Route-level `getServerSideProps` auth check — rejected because it doesn't prevent the page from loading and requires per-page boilerplate.

**Configuration approach: matcher in middleware**

Add the hedge route to the middleware matcher config. This is simpler than maintaining a separate protected routes list and aligns with Next.js conventions.

## Risks / Trade-offs

- **Middleware overhead** → Minimal; middleware runs at the edge and is fast
- **Session token handling** → NextAuth v5 handles this automatically via the `auth` wrapper
