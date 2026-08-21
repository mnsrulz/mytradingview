## ADDED Requirements

### Requirement: Each tab maintains independent perspective settings
The SQL Playground SHALL track perspective viewer settings separately for each tab. Switching tabs SHALL restore the perspective configuration specific to that tab.

#### Scenario: Switch tabs preserves settings
- **WHEN** user configures perspective viewer on Tab A (e.g., xaxis="strike", groupby=["put_call"])
- **AND** user switches to Tab B
- **AND** user switches back to Tab A
- **THEN** Tab A's perspective viewer SHALL display the previously configured settings (xaxis="strike", groupby=["put_call"])

#### Scenario: New tab starts with default settings
- **WHEN** user creates a new tab
- **THEN** the perspective viewer for that tab SHALL use default settings

### Requirement: PerspectiveWrapper exposes settings change callback
The `PerspectiveWrapper` component SHALL accept an `onSettingsChange` callback prop and invoke it whenever the perspective viewer's configuration changes.

#### Scenario: Settings change triggers callback
- **WHEN** user modifies perspective viewer settings (e.g., changes xaxis column)
- **THEN** the `onSettingsChange` callback SHALL be called with the current viewer configuration object

#### Scenario: Initial load does not trigger callback
- **WHEN** the `PerspectiveWrapper` component mounts or receives new data
- **THEN** the `onSettingsChange` callback SHALL NOT be called (only user-initiated changes trigger it)
