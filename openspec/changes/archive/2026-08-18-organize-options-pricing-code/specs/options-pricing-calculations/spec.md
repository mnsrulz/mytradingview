## ADDED Requirements

### Requirement: Price lookup by mode

The calculation module SHALL provide a pure function that, given a contract quote (last, bid, ask) and a price mode (`LAST_PRICE`, `BID_PRICE`, `ASK_PRICE`, or `AVG_PRICE`), returns the corresponding price. `AVG_PRICE` SHALL return the midpoint of ask and bid when both are present, and null otherwise. Unknown modes SHALL default to bid price.

#### Scenario: Mid price

- **WHEN** ask and bid are both present and the mode is `AVG_PRICE`
- **THEN** the average of ask and bid is returned

#### Scenario: Missing quote side

- **WHEN** the mode is `AVG_PRICE` and either ask or bid is absent
- **THEN** null is returned

#### Scenario: Default mode

- **WHEN** the mode is not one of the known price modes
- **THEN** the bid price is returned

### Requirement: Value computation by mode

The calculation module SHALL provide a pure function that, given a price, strike, expiry, target price, cost basis, put/call type, and value mode, computes the displayed cell value. Supported modes SHALL be price, annual return, total return, OI, and volume.

#### Scenario: Annual return for a put

- **WHEN** computing annual return for a put with a strike at or above the target price
- **THEN** the result equals (premium / strike) * (365 / days-to-expiry)

#### Scenario: Annual return for a put below target

- **WHEN** computing annual return for a put whose strike is below the target price
- **THEN** the premium is reduced by the strike-to-target shortfall before computing (premium / strike) * (365 / days-to-expiry)

#### Scenario: Total return for a call

- **WHEN** computing total return for a call
- **THEN** the result equals (sell proceeds - cost basis) / cost basis, where sell proceeds is the strike plus premium when the strike is at or below the target price

#### Scenario: OI and volume modes

- **WHEN** the value mode is OI or volume
- **THEN** the raw open interest or volume of the contract is returned

#### Scenario: Price mode passthrough

- **WHEN** the value mode is price
- **THEN** the mode-selected price is returned

### Requirement: Strike filtering and grid building

The calculation module SHALL provide pure functions that derive the working strike set from a strike range, and build the DataGrid columns and rows from the chain data, price mode, value mode, put/call type, and the above lookups.

#### Scenario: Filtering strikes by range

- **WHEN** given a strike range with a start and end
- **THEN** only strikes within the inclusive range are included

#### Scenario: Columns match working strikes

- **WHEN** building columns
- **THEN** one column is created per working strike in ascending order, with a numeric header, an appropriate value formatter, and conditional-formatting cells for return/OI modes

#### Scenario: Rows map expirations to cells

- **WHEN** building rows
- **THEN** one row is produced per future expiration with a cell value for each working strike computed by the value-mode function

### Requirement: No UI or data-fetching dependencies

The calculation module SHALL contain only pure functions operating on typed inputs. It SHALL NOT import React components, hooks, or network clients, so it can be reasoned about and tested in isolation.

#### Scenario: Module independence

- **WHEN** the calculator module is imported into a non-React context
- **THEN** it loads without React, MUI, or network dependencies