## MODIFIED Requirements

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
