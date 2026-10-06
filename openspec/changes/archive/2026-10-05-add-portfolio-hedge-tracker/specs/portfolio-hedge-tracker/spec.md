## ADDED Requirements

### Requirement: Hedge tracker page displays portfolio positions
The system SHALL provide a page at `/portfolio/hedge` that displays all portfolio positions with their current prices and hedge strategy suggestions.

#### Scenario: User navigates to hedge tracker
- **WHEN** user navigates to `/portfolio/hedge`
- **THEN** system displays all portfolio positions with symbol, quantity, current price, and cost basis

#### Scenario: No positions exist
- **WHEN** user navigates to `/portfolio/hedge` and has no portfolio positions
- **THEN** system displays an empty state message indicating no positions to hedge

### Requirement: Options chains are fetched per symbol
The system SHALL fetch options chain data for each held symbol from the existing `/api/symbols/[symbol]/options` route.

#### Scenario: Options chain loaded successfully
- **WHEN** hedge tracker page loads with positions
- **THEN** system fetches options chains for each unique symbol and displays hedge suggestions

#### Scenario: Options chain fetch fails
- **WHEN** options chain fetch fails for a symbol
- **THEN** system displays an error indicator for that position's hedge suggestions and continues loading other positions

### Requirement: Hedge ratio is configurable
The system SHALL allow users to adjust the hedge ratio (percentage of position to hedge) with a default of 25%.

#### Scenario: User changes hedge ratio
- **WHEN** user adjusts hedge ratio slider/input to 50%
- **THEN** system recalculates all hedge suggestions using 50% of each position's quantity

#### Scenario: Default hedge ratio
- **WHEN** hedge tracker page loads
- **THEN** hedge ratio defaults to 25%

### Requirement: Hedge selections persist in session
The system SHALL persist user-selected hedges in sessionStorage so they survive page reloads within the same browser session.

#### Scenario: User selects a hedge
- **WHEN** user clicks to select a hedge strategy for a position
- **THEN** selected hedge is stored in sessionStorage and highlighted in the UI

#### Scenario: User returns to page
- **WHEN** user navigates back to hedge tracker page
- **THEN** previously selected hedges are restored from sessionStorage

### Requirement: Navigation entry exists
The system SHALL add a "Hedge" navigation entry under the Portfolio section linking to `/portfolio/hedge`.

#### Scenario: Hedge entry visible in nav
- **WHEN** user views the navigation sidebar
- **THEN** a "Hedge" entry is visible under the Portfolio section
