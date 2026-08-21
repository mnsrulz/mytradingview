## ADDED Requirements

### Requirement: Protected routes require authentication
The system SHALL enforce authentication on designated routes, redirecting unauthenticated users to the login page.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** user navigates to a protected route without an active session
- **THEN** system redirects to the login page with a return URL parameter

#### Scenario: Authenticated user accesses protected route
- **WHEN** user navigates to a protected route with an active session
- **THEN** system renders the page normally

### Requirement: Route protection is configurable per route
The system SHALL allow specifying which routes require authentication via a centralized configuration.

#### Scenario: Route added to protected list
- **WHEN** a route path is added to the protected routes configuration
- **THEN** unauthenticated access to that route triggers a redirect to login
