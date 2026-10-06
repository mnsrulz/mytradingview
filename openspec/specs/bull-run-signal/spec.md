# Bull-Run Signal

## Purpose

Weekly bull-run entry signal for the Symbol Explorer: a cheap-vol/positioning/wing checklist with an uptrend gate, its ON/OFF status for the latest week, derived in-sample backtest statistics, and the widget, header chip, and detail-page surfaces that present it.

## Requirements

### Requirement: Latest-week signal status
The system SHALL determine the bull-run signal status for a symbol from the latest weekly series row, where the signal is ON if and only if `score >= 3 AND b_cheap = 1 AND trend_up = true`, and SHALL label the status with the week it is as of.

#### Scenario: Signal is on
- **WHEN** the latest weekly row has score ≥ 3, b_cheap = 1, and trend_up = true
- **THEN** the system reports the signal as ON for that week

#### Scenario: Signal is off despite some boxes passing
- **WHEN** the latest weekly row has score ≥ 3 but b_cheap = 0 or trend_up = false
- **THEN** the system reports the signal as OFF

#### Scenario: Numeric fields arrive as strings from the query service
- **WHEN** the query result returns `score`, `b_*`, `vol_z`, `ivpct`, or `fwd*` values as JSON strings
- **THEN** the system normalizes them to numbers before computing or displaying status

### Requirement: Bull-run signal widget
The Symbol Explorer Metrics grid SHALL include a "Bull-Run Signal" widget that shows the ON/OFF state for the latest week, the as-of week, the score out of 4, the four checklist boxes, the trend gate, and a backtest summary line containing hit count, sample size, and mean forward return.

#### Scenario: Widget renders a live signal
- **WHEN** a symbol's query returns rows and the latest row passes the rule
- **THEN** the widget shows an ON chip, the as-of week, `score/4`, each box marked as passing or failing, the trend state, and the backtest summary

#### Scenario: Widget loading and error states
- **WHEN** the query is in flight
- **THEN** the widget shows a loading skeleton
- **WHEN** the query fails
- **THEN** the widget shows an error message instead of a status

#### Scenario: Insufficient history
- **WHEN** the series has too few weeks to compute z-scores and the trend gate
- **THEN** the widget shows an insufficient-history message and no ON/OFF status

### Requirement: Header status chip
The `/beta/[symbol]` header SHALL display a compact ON/OFF chip for the bull-run signal next to the symbol price, and the chip SHALL link to the signal detail page.

#### Scenario: Chip navigates to detail
- **WHEN** the user clicks the chip
- **THEN** the user is taken to `/beta/<symbol>/signal`

#### Scenario: Chip state matches widget
- **WHEN** the widget and header chip are rendered on the same page
- **THEN** both show the same ON/OFF state from a single query result

### Requirement: Signal detail page
The Symbol Explorer SHALL provide a detail page at `/beta/<symbol>/signal`, reachable from an Analytics feature card on `/beta/<symbol>`, that shows: the status header (ON/OFF, as-of week, price, 4-week change), the full checklist with the rule expression, backtest statistics for the full-signal set and the cheap+trend variant (n, hits, mean, worst), price and score charts with ON-weeks marked, and a weekly history table where unevaluated forward returns display as open.

#### Scenario: Detail page reached from feature card
- **WHEN** the user opens the "Bull-Run Signal" card on `/beta/<symbol>`
- **THEN** the user lands on `/beta/<symbol>/signal` rendered with the symbol's data

#### Scenario: Unevaluated forward returns
- **WHEN** a signal week has no price data 4 weeks ahead yet
- **THEN** its forward return cells display as open/pending rather than a value

### Requirement: Backtest figures are labeled in-sample
Any displayed backtest statistics SHALL include the sample size used to compute them and SHALL be labeled as in-sample research, not as a performance guarantee.

#### Scenario: Summary line shows sample size
- **WHEN** the widget or detail page renders backtest statistics
- **THEN** the displayed figures include the number of evaluated signals and an in-sample indicator
