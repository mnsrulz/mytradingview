## ADDED Requirements

### Requirement: Perspective settings are stored with saved queries
The system SHALL store perspective viewer settings (xaxis, groupby, split-by, aggregates, filters, sort) as a JSON object in the `SavedQuery` database record when a query is saved.

#### Scenario: Save query with perspective settings
- **WHEN** user saves a query while perspective viewer has custom settings (e.g., xaxis="strike", groupby=["type"])
- **THEN** the `SavedQuery` record SHALL contain a `perspectiveSettings` JSON field with the viewer's current configuration

#### Scenario: Save query without perspective settings
- **WHEN** user saves a query with perspective viewer at default settings
- **THEN** the `perspectiveSettings` field SHALL be null or contain default values

### Requirement: Perspective settings are restored when loading a query
The system SHALL restore perspective viewer settings from the database when a saved query is loaded into a tab.

#### Scenario: Load query with saved settings
- **WHEN** user loads a saved query that has `perspectiveSettings` populated
- **THEN** the perspective viewer SHALL be configured to match the stored settings (xaxis, groupby, split-by, etc.)

#### Scenario: Load query without saved settings
- **WHEN** user loads a saved query with null `perspectiveSettings`
- **THEN** the perspective viewer SHALL use its default configuration

### Requirement: API supports perspective settings field
The `/api/queries` endpoints SHALL accept and return the `perspectiveSettings` field in request and response bodies.

#### Scenario: Create query with settings via API
- **WHEN** a POST request to `/api/queries` includes `perspectiveSettings` in the body
- **THEN** the created `SavedQuery` record SHALL include the provided settings

#### Scenario: Update query settings via API
- **WHEN** a PUT request to `/api/queries/[queryId]` includes `perspectiveSettings` in the body
- **THEN** the updated `SavedQuery` record SHALL reflect the new settings
