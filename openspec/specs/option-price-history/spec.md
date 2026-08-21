# Option Price History

## ADDED Requirements

### Requirement: Contract price history data source
The system SHALL expose a price-history data source for a specific option contract that accepts contract details (`symbol`, `expiration`, `strike`, and put/call type) and returns a daily OHLC series (`open`, `high`, `low`, `close`) together with `volume` per day, plus the date for each day. The system SHALL resolve the contract details to an OCC contract id and fetch the series from `GET /api/options/contracts/:contractId/ohlc` on the MZDATA app, exposing it through a hook contract so consumers stay decoupled from the transport.

#### Scenario: Requesting price history for a contract
- **WHEN** the system is asked for price history of a contract with a given symbol, expiration, strike, and put/call type
- **THEN** it builds the OCC contract id from those details
- **AND** it returns a response containing dates plus matching `open`, `high`, `low`, `close`, and `volume` arrays where all arrays have equal length

#### Scenario: No data for the contract
- **WHEN** the MZDATA endpoint returns no data for the contract id
- **THEN** the data source reports `hasError` with the endpoint error message

#### Scenario: Loading and error states
- **WHEN** a price-history request is in flight
- **THEN** the data source reports an `isLoading` state
- **AND** if the request fails, it reports `hasError` and an `error` message

### Requirement: Contract selection from the pricing grid
The pricing page SHALL let the user select an individual option contract from the options chain by clicking a strike cell for the active PUT/CALL tab. The selection SHALL capture the row's expiration and the column's strike price for the active tab, and the price-history panel SHALL appear directly beneath the pricing grid showing that contract's price history.

#### Scenario: Clicking a strike cell opens the price history
- **WHEN** the user clicks a strike cell in the options pricing grid for a given expiration and active PUT/CALL tab
- **THEN** a price-history panel appears beneath the grid for that contract (expiration + strike + active tab type) showing its OHLC and volume

#### Scenario: Closing the price history
- **WHEN** the user closes the price-history panel
- **THEN** the pricing grid remains in its current state and no selection persists

### Requirement: Price history chart display
The price-history view SHALL render the selected contract's OHLC as a candlestick series and its volume as a separate volume series, using the same lightweight-charts charting approach as the IV page. The view SHALL expose a timeframe control (`YTD`, `6M`, `1Y`, `ALL`) that filters the displayed series.

#### Scenario: Rendering OHLC and volume
- **WHEN** the price history for a contract has loaded
- **THEN** the chart renders daily candlesticks for the OHLC data and a corresponding volume series aligned to the same dates

#### Scenario: Filtering by timeframe
- **WHEN** the user selects a timeframe from the control
- **THEN** the chart shows only the series points within that timeframe, where `YTD` starts at the current year, `6M`/`1Y` look back 6/12 months, and `ALL` shows the full fetched series

#### Scenario: Identifying the contract
- **WHEN** the price-history view is open
- **THEN** it shows a header identifying the contract, including the symbol, strike, put/call type, and expiration

#### Scenario: Empty data
- **WHEN** the price-history view loads but the data source returns no data
- **THEN** the view shows an empty state instead of a broken chart

### Requirement: No dependency on a live backend
The price-history feature SHALL not require the MZINGEST socket service. The data source SHALL be implemented behind a hook interface so that changing the transport (e.g., swapping the endpoint) does not require changes to the chart or grid components.

#### Scenario: Feature works with only the MZDATA REST endpoint
- **WHEN** the user opens a contract's price history in the running app
- **THEN** it displays a chart using the MZDATA contract OHLC endpoint, without any socket connection