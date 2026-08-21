## MODIFIED Requirements

### Requirement: Position card shows only saved strategies
The system SHALL display only saved/favorited strategies on each position card by default. Auto-suggested strategies are NOT shown inline.

#### Scenario: Position has saved strategies
- **WHEN** user views a position card with saved strategies
- **THEN** system displays each saved strategy as a row with type chip, name, and a delete button

#### Scenario: Position has no saved strategies
- **WHEN** user views a position card with no saved strategies
- **THEN** system shows no strategy rows (empty state)

### Requirement: Saved strategy rows show chart on click
The system SHALL display the strategy chart when a saved strategy row is clicked, for both suggested and custom strategies.

#### Scenario: User clicks saved strategy row
- **WHEN** user clicks a saved strategy row
- **THEN** system toggles the HedgeStrategyChart below the row showing net strategy value over time

### Requirement: User can remove saved strategies
The system SHALL allow users to remove saved strategies from the position card.

#### Scenario: User removes a saved strategy
- **WHEN** user clicks the delete button on a saved strategy row
- **THEN** system removes the strategy from localStorage and the row disappears
