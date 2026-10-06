## ADDED Requirements

### Requirement: WidgetShell renders a card wrapper
The system SHALL provide a `WidgetShell` component that wraps metric content in a styled card with title, loading skeleton, and error state.

#### Scenario: Shell renders with title and content
- **WHEN** `WidgetShell` is rendered with `title` and `children`
- **THEN** it SHALL display a `Card` with the title and children content

#### Scenario: Shell renders header action on the right
- **WHEN** `WidgetShell` is rendered with `headerAction` prop
- **THEN** it SHALL display the `headerAction` element on the same row as the title, aligned to the right

#### Scenario: Shell shows loading state
- **WHEN** `loading` prop is true
- **THEN** the shell SHALL display a `Skeleton` placeholder instead of children

#### Scenario: Shell shows error state
- **WHEN** `error` prop is a string
- **THEN** the shell SHALL display an error message within the card

### Requirement: Sparkline renders SVG mini chart
The system SHALL provide a `Sparkline` component that renders an SVG polyline from an array of numbers.

#### Scenario: Sparkline renders data points
- **WHEN** `Sparkline` is rendered with `data={[10, 20, 15, 25, 30]}`
- **THEN** it SHALL render an SVG with a polyline and gradient fill

#### Scenario: Sparkline handles empty data
- **WHEN** `data` is an empty array
- **THEN** the component SHALL render nothing

### Requirement: TimeframeSelector toggles global timeframe
The system SHALL provide a `TimeframeSelector` component using MUI `ToggleButtonGroup` with options: 1m, 3m, 6m, 1y.

#### Scenario: User selects timeframe
- **WHEN** user clicks "6m" button
- **THEN** the component SHALL call `onChange` with `lookbackDays` value (180)

#### Scenario: Default timeframe is 6m
- **WHEN** `TimeframeSelector` mounts
- **THEN** the "6m" button SHALL be selected by default

### Requirement: DeltaSelector provides delta value selection
The system SHALL provide a `DeltaSelector` component with options: 10, 15, 20, 25, 30, 40, 50, 70.

#### Scenario: User selects delta
- **WHEN** user selects a delta value from the dropdown
- **THEN** the component SHALL call `onChange` with the selected number

#### Scenario: Default delta is 25
- **WHEN** `DeltaSelector` mounts
- **THEN** value 25 SHALL be selected by default

### Requirement: WidgetGrid renders responsive layout
The system SHALL render widgets in a CSS Grid with `auto-fill` and `minmax(280px, 1fr)`.

#### Scenario: Grid renders normal and wide widgets
- **WHEN** `WidgetGrid` renders with a mix of `size="normal"` and `size="wide"` widgets
- **THEN** wide widgets SHALL span 2 columns and normal widgets SHALL span 1 column
