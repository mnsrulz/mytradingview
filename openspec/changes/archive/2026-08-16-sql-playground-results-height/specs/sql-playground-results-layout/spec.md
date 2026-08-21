## ADDED Requirements

### Requirement: Results panel fills available height
The SQL Playground results panel SHALL render its content filling the full height of the resizable results panel, so that resizing the editor/results splitter adjusts the results area accordingly.

#### Scenario: Grid view fills panel height
- **WHEN** the user executes a query with results and switches the result view to Grid
- **THEN** the DataGrid SHALL fill the full height of the results panel and scroll internally when rows overflow the available space

#### Scenario: Perspective view fills panel height
- **WHEN** the user executes a query with results and switches the result view to Perspective
- **THEN** the perspective viewer container SHALL fill the full height of the results panel without a fixed viewport height

#### Scenario: Resizing splitter updates results height
- **WHEN** the user drags the splitter between the query editor and the results panel
- **THEN** the results content SHALL re-render to fill the newly sized panel height in both Grid and Perspective views

#### Scenario: Non-result states fill panel height
- **WHEN** the results panel shows an error message, a loading spinner, or an empty state
- **THEN** those states SHALL render within the full results panel area without layout overflow