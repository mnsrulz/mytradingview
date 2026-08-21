## ADDED Requirements

### Requirement: Symbol list input
The system SHALL allow the user to enter a list of stock symbols to screen, with a maximum of 10 symbols at a time.

#### Scenario: Add symbols to the list
- **WHEN** the user adds symbols to the input
- **THEN** the symbols appear in a chip list and are used for the premium comparison

#### Scenario: Exceeding symbol limit
- **WHEN** the user attempts to add an 11th symbol
- **THEN** the system rejects the addition and indicates the 10-symbol limit has been reached

#### Scenario: Clearing the list
- **WHEN** the user removes a symbol from the chip list
- **THEN** the symbol is excluded from the next computation

### Requirement: Symbol list persistence
The system SHALL persist the symbol list in browser `localStorage` and restore it when the page loads. The system SHALL provide a reset button that clears the persisted list.

#### Scenario: Restoring symbols on reload
- **WHEN** the user loads the page and a previously saved symbol list exists in `localStorage`
- **THEN** the saved symbols are restored into the chip list and used for the premium comparison

#### Scenario: Saving on change
- **WHEN** the user adds or removes a symbol
- **THEN** the updated list is written to `localStorage`

#### Scenario: Resetting the list
- **WHEN** the user clicks the reset button
- **THEN** the symbol list is cleared from the UI and `localStorage`

### Requirement: Move range selection
The system SHALL provide a two-value range control letting the user set a move percentage range below the spot price (e.g., -10% to -35%), which defines the strikes to evaluate.

#### Scenario: Setting a move range
- **WHEN** the user sets a move range such as -10% to -35%
- **THEN** the system evaluates every real strike whose move percentage from spot falls within that range

#### Scenario: Invalid range
- **WHEN** the user sets a range where the minimum is greater than the maximum
- **THEN** the system either normalizes the range or prevents the selection and shows a validation message

### Requirement: Expiry selection
The system SHALL provide a dropdown of expiries, built from the union of expiries across the loaded symbols, and use the selected expiry when computing premiums.

#### Scenario: Selecting an expiry
- **WHEN** the user picks an expiry from the dropdown
- **THEN** the system recomputes the chart using put quotes for that expiry

#### Scenario: Missing expiry for a symbol
- **WHEN** a symbol has no expiry at or after the selected date
- **THEN** the system skips that symbol and lists it as a warning

### Requirement: Price mode selection
The system SHALL provide a price mode selector (last / bid / ask / mid) and SHALL default to bid for computing the premium.

#### Scenario: Choosing a price mode
- **WHEN** the user selects a price mode
- **THEN** the premium is computed from the corresponding quote field for all symbols

#### Scenario: Default price mode
- **WHEN** the page loads without a user price-mode choice
- **THEN** the premium is computed from the bid price

### Requirement: Premium computation
The system SHALL compute, for each symbol and each real strike within the selected move range, a move percentage and a premium percentage.

#### Scenario: Computing move percentage
- **WHEN** a strike is evaluated
- **THEN** the move percentage is computed as `(spotPrice − strike) / spotPrice`

#### Scenario: Computing premium percentage
- **WHEN** a strike is evaluated
- **THEN** the premium percentage is computed as `premium / strike`, where premium is the selected price-mode quote for the put at that strike and expiry

### Requirement: Scatter chart visualization
The system SHALL render the results as a dotted scatter chart with move percentage on the x-axis and premium percentage on the y-axis, with one dot per real strike.

#### Scenario: Rendering the chart
- **WHEN** premium data is available
- **THEN** the system renders a scatter chart where each dot represents one real strike for one symbol

#### Scenario: Hovering a dot
- **WHEN** the user hovers over a dot
- **THEN** a tooltip shows the symbol, strike, move percentage, premium percentage, and premium value

#### Scenario: Empty chart state
- **WHEN** no dots can be plotted (e.g., no symbols, no expiries, or no strikes in range)
- **THEN** the system shows an empty state message instead of a blank chart

### Requirement: Data source
The system SHALL fetch pricing for each symbol using the same data source as the pricing page (`getOptionsPricing`), one request per symbol.

#### Scenario: Fetching pricing for a symbol
- **WHEN** pricing is needed for a symbol
- **THEN** the system requests that symbol's option pricing data from the pricing data source

#### Scenario: Symbol with no data
- **WHEN** a symbol returns no pricing data
- **THEN** the system skips that symbol and lists it as a warning rather than failing the whole request