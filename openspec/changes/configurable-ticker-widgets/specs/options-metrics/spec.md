## ADDED Requirements

### Requirement: IV30 widget displays implied volatility with sparkline
The `IV30Widget` SHALL fetch IV30 data using `useOptionHistoricalVolatility` and display the current value with a sparkline chart.

#### Scenario: IV30 widget fetches data with custom params
- **WHEN** `IV30Widget` is rendered with `symbol`, `lookbackDays`, `delta`, and `dte` props
- **THEN** it SHALL call `useOptionHistoricalVolatility` with rolling expiry mode
- **AND** display the latest `iv30` value from the response
- **AND** render a sparkline with the `iv30` array

#### Scenario: IV30 widget shows loading state
- **WHEN** data is being fetched
- **THEN** the widget SHALL display a `Skeleton` via `WidgetShell`

#### Scenario: IV30 widget shows error state
- **WHEN** the API request fails
- **THEN** the widget SHALL display an error message via `WidgetShell`

### Requirement: IV30 widget supports per-widget controls
The `IV30Widget` toolbar SHALL include controls for delta and DTE.

#### Scenario: User changes delta
- **WHEN** user selects a different delta value
- **THEN** the widget SHALL refetch data with the new delta parameter

#### Scenario: User changes DTE
- **WHEN** user selects a different DTE value
- **THEN** the widget SHALL refetch data with the new DTE parameter

### Requirement: ExpectedMove widget displays expected price movement
The `ExpectedMoveWidget` SHALL fetch data using `useExpectedMove` and display the expected move as a percentage and dollar amount. The widget SHALL accept an optional `currentPrice` prop to use as the live market price for the range bar.

#### Scenario: Expected move widget fetches data
- **WHEN** `ExpectedMoveWidget` is rendered with `symbol`, `lookbackDays`, `expiryMode`, and optional `currentPrice` props
- **THEN** it SHALL call `useExpectedMove` with those parameters
- **AND** calculate percentage from `straddle_price / currentPrice * 100`
- **AND** display the dollar amount as `straddle_price`

#### Scenario: Expected move uses live price for range bar
- **WHEN** `currentPrice` prop is provided
- **THEN** the widget SHALL use it only for the marker position on the range bar
- **AND** calculate min as `last_close - straddle_price` using API's `last_close`
- **AND** calculate max as `last_close + straddle_price` using API's `last_close`

#### Scenario: User changes expiry mode
- **WHEN** user clicks "Weekly" or "Monthly" in the ToggleButtonGroup
- **THEN** the widget SHALL refetch data with the new expiry mode

#### Scenario: Expected move displays range bar
- **WHEN** `ExpectedMoveWidget` has loaded data
- **THEN** it SHALL display a horizontal range bar showing min (`last_close - straddle_price`) and max (`last_close + straddle_price`)
- **AND** the scale SHALL extend to include the current price if it's outside the range
- **AND** a marker SHALL show the current price position on the bar

#### Scenario: Range bar color-codes the current price marker
- **WHEN** current price is in the middle 60% of the expected range
- **THEN** the marker SHALL be green
- **WHEN** current price is in the outer 20% of the expected range
- **THEN** the marker SHALL be yellow
- **WHEN** current price exceeds the expected range
- **THEN** the marker SHALL be red

#### Scenario: Range bar shows price outside range
- **WHEN** current price is below the expected range
- **THEN** the left label SHALL show current price instead of expected min
- **AND** the bar SHALL stretch from current price to expected max
- **AND** the bar SHALL turn red to indicate breach
- **AND** a label SHALL show "▼ X% outside"
- **WHEN** current price is above the expected range
- **THEN** the right label SHALL show current price instead of expected max
- **AND** the bar SHALL stretch from expected min to current price
- **AND** the bar SHALL turn red to indicate breach
- **AND** a label SHALL show "▲ X% outside"

### Requirement: DeltaIV widget displays 25-delta implied volatility
The `DeltaIVWidget` SHALL fetch options stats using `useOptionsStats` and display aggregate call and put delta values.

#### Scenario: DeltaIV widget fetches data
- **WHEN** `DeltaIVWidget` is rendered with `symbol` and `lookbackDays` props
- **THEN** it SHALL call `useOptionsStats` with those parameters
- **AND** display the latest call delta (`cd`) and put delta (`pd`) values

### Requirement: ATMDelta widget displays at-the-money delta
The `ATMDeltaWidget` SHALL fetch options stats using `useOptionsStats` and display the latest aggregate call delta.

#### Scenario: ATMDelta widget fetches data
- **WHEN** `ATMDeltaWidget` is rendered with `symbol` and `lookbackDays` props
- **THEN** it SHALL call `useOptionsStats` with those parameters
- **AND** display the latest call delta (`cd`) value
- **AND** color the value red if negative

### Requirement: IVRank widget displays volatility percentile
The `IVRankWidget` SHALL calculate IV Rank from option IV data and display call IV, put IV, and the calculated percentile with a visual bar.

#### Scenario: IVRank widget fetches data
- **WHEN** `IVRankWidget` is rendered with `symbol`, `lookbackDays`, `delta`, `expiryMode`, and `dte` props
- **THEN** it SHALL call `useOptionHistoricalVolatility` with those parameters
- **AND** display the latest call IV (`cv`) and put IV (`pv`) values as percentages
- **AND** calculate IV Rank as `(current - min) / (max - min) * 100` using the average of call and put IV over the period
- **AND** render a horizontal bar indicating the percentile position

#### Scenario: IVRank widget supports per-widget controls
- **WHEN** user changes delta or expiry settings
- **THEN** the widget SHALL refetch data with new parameters
- **AND** recalculate IV Rank based on the new option IV values
