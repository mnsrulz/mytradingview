# Hedge Strategy Builder

## Purpose

Provides a custom strategy builder UI for creating and editing option hedge strategies, with a Lightweight Charts visualization of net value over time.

## Requirements

### Requirement: Custom strategy builder opens per position
The system SHALL provide a "Build Custom" button on each HedgePositionCard that opens a strategy builder dialog for that symbol.

#### Scenario: User opens strategy builder
- **WHEN** user clicks "Build Custom" on a position card
- **THEN** system opens a dialog with a strategy builder pre-configured for that symbol

#### Scenario: User closes strategy builder
- **WHEN** user closes the strategy builder dialog
- **THEN** any configured strategies are saved to sessionStorage and appear in the position card

### Requirement: Strategy builder supports all strategy types
The system SHALL support building put spread, call spread, collar, single leg, two leg, three leg, and four leg strategies.

#### Scenario: User builds put spread
- **WHEN** user selects "Put Spread" strategy type
- **THEN** system shows two leg rows (buy put + sell put) with strike and expiry selectors populated from the options chain

#### Scenario: User builds single leg
- **WHEN** user selects "Single Leg" strategy type
- **THEN** system shows one leg row with buy/sell, call/put, strike, and expiry selectors

#### Scenario: User builds four leg strategy
- **WHEN** user selects "Four Leg" strategy type
- **THEN** system shows four independent leg rows with full configuration options

### Requirement: Leg configuration uses options chain data
The system SHALL populate strike prices and expiration dates from the fetched options chain for the symbol.

#### Scenario: Strike selector populated
- **WHEN** user opens strike dropdown for a leg
- **THEN** system displays all available strikes from the options chain for the selected expiry

#### Scenario: Expiry selector populated
- **WHEN** user opens expiry dropdown for a leg
- **THEN** system displays all available expiration dates from the options chain

### Requirement: Strategy chart displays net value over time
The system SHALL display a Lightweight Charts line chart showing the strategy's net premium value over time, calculated from historical OHLC data via mzdata API. The chart SHALL use the convention that positive values represent net debits (cost paid) and negative values represent net credits (premium received).

#### Scenario: Chart rendered for completed strategy
- **WHEN** user has configured at least one leg with valid strike and expiry
- **THEN** system fetches OHLC data for each leg via `getOptionHistoricalOhlc()` and renders a line chart showing net premium value

#### Scenario: Debit strategy shown as positive
- **WHEN** strategy has a net debit (costs money to open)
- **THEN** chart shows values above zero (positive y-axis)

#### Scenario: Credit strategy shown as negative
- **WHEN** strategy has a net credit (receives money to open)
- **THEN** chart shows values below zero (negative y-axis)

#### Scenario: No OHLC data available
- **WHEN** OHLC data is not available for a leg's contract
- **THEN** system shows a message indicating chart data is unavailable for that strategy

### Requirement: Custom strategies persist in session
The system SHALL persist custom strategies in sessionStorage so they survive page reloads within the same browser session.

#### Scenario: Custom strategy saved
- **WHEN** user completes a custom strategy in the builder
- **THEN** strategy configuration is stored in sessionStorage with symbol, legs, and metadata

#### Scenario: Custom strategies restored on load
- **WHEN** user returns to hedge tracker page
- **THEN** previously built custom strategies are restored from sessionStorage and displayed in position cards

### Requirement: Custom strategies appear alongside auto-suggestions
The system SHALL display custom strategies in the same HedgePositionCard as auto-suggested strategies, with a visual distinction.

#### Scenario: Custom strategy listed
- **WHEN** user has built custom strategies for a position
- **THEN** they appear below auto-suggested strategies with a "Custom" badge or label

#### Scenario: Auto-suggest and custom coexist
- **WHEN** position has both auto-suggested and custom strategies
- **THEN** both are visible in the card, auto-suggested first, custom second
