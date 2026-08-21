# Hedge Suggestion Algorithm

## Purpose

Generates ranked hedge strategy suggestions for portfolio positions based on options chain data, using delta-based selection and cost-effectiveness scoring.

## Requirements

### Requirement: Algorithm generates put debit spread suggestions
The system SHALL generate put debit spread hedge suggestions by selecting a long put near ATM (delta −0.35 to −0.45) and a short put further OTM (delta −0.15 to −0.25).

#### Scenario: Put debit spread generated
- **WHEN** algorithm processes a position with valid put options
- **THEN** system generates put debit spread with long put at higher strike, short put at lower strike, and calculates net debit, protection amount, and max loss

#### Scenario: No suitable puts available
- **WHEN** options chain lacks puts in the target delta range
- **THEN** system skips put debit spread for that expiration

### Requirement: Algorithm generates call credit spread suggestions
The system SHALL generate call credit spread hedge suggestions by selecting a short call OTM (delta +0.25 to +0.35) and a long call further OTM (delta +0.10 to +0.20).

#### Scenario: Call credit spread generated
- **WHEN** algorithm processes a position with valid call options
- **THEN** system generates call credit spread with short call at lower strike, long call at higher strike, and calculates net credit, max gain, and max loss

#### Scenario: No suitable calls available
- **WHEN** options chain lacks calls in the target delta range
- **THEN** system skips call credit spread for that expiration

### Requirement: Algorithm generates deep ITM call suggestions
The system SHALL generate deep ITM call (synthetic covered call) suggestions by selecting a call with delta +0.75 to +0.85.

#### Scenario: Deep ITM call generated
- **WHEN** algorithm processes a position with valid deep ITM calls
- **THEN** system generates deep ITM call suggestion with premium received, upside cap at strike price, and effective cost basis

#### Scenario: No suitable deep ITM calls available
- **WHEN** options chain lacks calls in the target delta range
- **THEN** system skips deep ITM call for that expiration

### Requirement: Algorithm selects multiple expirations
The system SHALL generate suggestions across 2-3 expirations closest to 30, 45, and 60 DTE.

#### Scenario: Multiple expirations available
- **WHEN** options chain has expirations near 30, 45, and 60 DTE
- **THEN** system generates suggestions for each of these expirations

#### Scenario: Limited expirations available
- **WHEN** options chain has fewer than 3 expirations in the target range
- **THEN** system generates suggestions for available expirations only

### Requirement: Strategies are ranked by cost-effectiveness
The system SHALL rank strategies by cost-effectiveness score: protection amount divided by net cost for debit spreads, credit received divided by max loss for credit spreads.

#### Scenario: Ranking displayed
- **WHEN** suggestions are generated for a position
- **THEN** top 3 strategies per expiration are displayed, sorted by cost-effectiveness score descending

#### Scenario: Equal scores
- **WHEN** multiple strategies have the same cost-effectiveness score
- **THEN** system displays them in no particular order (stable sort)

### Requirement: Hedge metrics are displayed
The system SHALL display the following metrics for each hedge suggestion: strategy type, expiration, strikes, premiums, contracts needed, total cost or credit, max loss or max gain, protection amount (if applicable), and cost as percentage of position value.

#### Scenario: Debit spread metrics shown
- **WHEN** put debit spread is suggested
- **THEN** display shows: strategy name, expiration, long/short strikes and premiums, contracts, net debit, total cost, protection amount, max loss, cost as % of position

#### Scenario: Credit spread metrics shown
- **WHEN** call credit spread is suggested
- **THEN** display shows: strategy name, expiration, short/long strikes and premiums, contracts, net credit, total credit, max gain, max loss

#### Scenario: Deep ITM call metrics shown
- **WHEN** deep ITM call is suggested
- **THEN** display shows: strategy name, expiration, strike, premium, contracts, total premium received, upside cap, effective cost basis
