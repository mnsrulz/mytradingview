## ADDED Requirements

### Requirement: Hedge strategy dialog opens via hedge icon
The system SHALL provide a hedge icon button on each position card that opens a strategy dialog using Toolpad `useDialogs`.

#### Scenario: User clicks hedge icon
- **WHEN** user clicks the hedge icon on a position card
- **THEN** system opens a dialog with two tabs: Suggested and Custom Builder

#### Scenario: Dialog displays suggested strategies
- **WHEN** dialog opens on the Suggested tab
- **THEN** system fetches options chain and displays auto-suggested strategies with a Save button for each

#### Scenario: Dialog displays custom builder
- **WHEN** user switches to the Custom Builder tab
- **THEN** system displays the existing strategy builder UI

### Requirement: User can save strategies from dialog
The system SHALL allow users to save both suggested and custom strategies from the dialog.

#### Scenario: Save suggested strategy
- **WHEN** user clicks Save on a suggested strategy
- **THEN** system persists the strategy to localStorage and closes the dialog

#### Scenario: Save custom strategy
- **WHEN** user builds a custom strategy and clicks Save
- **THEN** system persists the strategy to localStorage and closes the dialog

### Requirement: Dialog renders suggested strategies with financial metrics
The system SHALL display cost/credit, max loss, max gain, and score for suggested strategies in the dialog.

#### Scenario: Suggested strategy display
- **WHEN** dialog shows suggested strategies
- **THEN** each strategy row shows type chip, label, cost/credit, max loss, max gain, and score
