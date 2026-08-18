## ADDED Requirements

### Requirement: Option pricing view renders an expiry-by-strike chain grid

The pricing page for a symbol SHALL render an option chain grid where each row is an option expiration date and each column is a strike price. Rows SHALL exclude expirations before today. The first column SHALL link each expiry to a Put/Call Ratio dialog.

#### Scenario: Grid is rendered for a symbol

- **WHEN** the pricing page loads for a valid symbol with option data
- **THEN** a DataGrid is shown with one row per future expiration and one column per strike within the selected strike range, with the expiry shown in the first column

#### Scenario: Grid excludes past expirations

- **WHEN** the option data contains expirations before the current date
- **THEN** those expirations are not rendered as rows

#### Scenario: No option data

- **WHEN** the symbol has no option data or loading completes with no data
- **THEN** a message indicating no option data is shown

### Requirement: Price and value modes are selectable

The view SHALL provide a price mode selector with options Last, Bid, Ask, and Mid, and a value mode selector with options Price, Annual Return, Total Return, OI, and Volume. The selected modes SHALL determine the value shown in each strike cell, and SHALL be reflected in the URL query params `pricemode` and `valuemode` respectively, defaulting to `BID_PRICE` and `ANNUAL_RETURN`.

#### Scenario: Selecting a price mode

- **WHEN** the user changes the price mode selector
- **THEN** the grid cells recompute using the selected price (last, bid, ask, or mid) and the URL query param `pricemode` is updated

#### Scenario: Selecting a value mode

- **WHEN** the user changes the value mode selector
- **THEN** the grid cells display the selected value (price, annual return, total return, OI, or volume) and the URL query param `valuemode` is updated

#### Scenario: Return values are conditionally formatted

- **WHEN** the value mode is Annual Return, Total Return, or OI
- **THEN** each cell is rendered with conditional formatting based on its value

### Requirement: PUT/CALL toggle

The view SHALL provide PUT and CALL tabs. The active tab SHALL be persisted in the URL query param `tab` (default `PUT`) and SHALL determine whether put or call contract data is shown.

#### Scenario: Switching between PUT and CALL

- **WHEN** the user selects the CALL tab
- **THEN** cells compute from call contract data and the URL query param `tab` is set to `CALL`, and a Cost Basis input is shown

#### Scenario: PUT tab hides cost basis

- **WHEN** the PUT tab is active
- **THEN** the Cost Basis input is not shown

### Requirement: Strike range slider

The view SHALL render a strike price slider bounded by the minimum and maximum strikes of the symbol. The selected range SHALL limit which strike columns are displayed, with the grid recomputing on change.

#### Scenario: Adjusting the strike range

- **WHEN** the user moves the slider handles
- **THEN** only strike columns within the new range are shown and cells recompute accordingly

### Requirement: Target price and cost basis inputs

The view SHALL provide numeric inputs for target price and, in CALL mode, cost basis. These values SHALL feed the Annual Return and Total Return calculations.

#### Scenario: Editing target price

- **WHEN** the user changes the target price
- **THEN** return-based values recompute against the new target price

### Requirement: Stale data refresh

When the underlying option data is stale, the view SHALL display a refresh control that re-fetches the option pricing data for the symbol.

#### Scenario: Refreshing stale data

- **WHEN** the data timestamp is older than the staleness threshold and the user clicks the refresh control
- **THEN** the pricing data is re-fetched and the grid is repopulated

### Requirement: Put/Call Ratio dialog

Clicking an expiry in the first column SHALL open a dialog showing a Put/Call Ratio bar chart for that expiration, with a strike range slider, the current stock price, and the computed ratio with bullish/bearish sentiment.

#### Scenario: Opening the ratio dialog

- **WHEN** the user clicks an expiry link
- **THEN** a dialog opens with a bar chart of put and call open interest by strike, the current price, and the put/call ratio with sentiment label

### Requirement: Organization of the pricing view

The pricing view SHALL be organized into distinct modules: a thin orchestrator component, a header (ticker search, spot price, refresh), a controls bar (price mode, value mode, target price, cost basis), and a grid component. All pricing-related types and enums SHALL live in shared type definitions rather than component files. No user-facing behavior SHALL change as a result of this organization.

#### Scenario: Shared types

- **WHEN** `StrikePriceSlider` and pricing components reference pricing prop types such as `IStrikePriceSliderPorps`
- **THEN** the types resolve from the shared types module, not from `StockOptionsView`

#### Scenario: Behavior preserved

- **WHEN** the view is refactored into modules
- **THEN** grid output, URL params, defaults, and interactions remain identical to the pre-refactor behavior