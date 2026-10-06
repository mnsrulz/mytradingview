## MODIFIED Requirements

### Requirement: Hedge tracker page displays portfolio positions
The system SHALL provide a page at `/portfolio/hedge` that displays all portfolio positions with their current prices and hedge strategy suggestions. Access to this page SHALL require authentication.

#### Scenario: User navigates to hedge tracker
- **WHEN** user navigates to `/portfolio/hedge`
- **THEN** system displays all portfolio positions with symbol, quantity, current price, and cost basis

#### Scenario: Unauthenticated user navigates to hedge tracker
- **WHEN** unauthenticated user navigates to `/portfolio/hedge`
- **THEN** system redirects to the login page

#### Scenario: No positions exist
- **WHEN** user navigates to `/portfolio/hedge` and has no portfolio positions
- **THEN** system displays an empty state message indicating no positions to hedge
