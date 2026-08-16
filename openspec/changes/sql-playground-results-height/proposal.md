## Why

In the SQL Playground, the results area (both the Grid and Perspective views) does not fill the available height of the results panel. The grid uses `autoHeight` so it only grows to match content, and the Perspective view is wrapped in a fixed `65vh` box, so results render awkwardly with unused space or overflow regardless of how the editor/results panels are resized.

## What Changes

- Make the results panel content fill the full height available within the resizable vertical group
- Change the Grid view from `autoHeight` to filling the available panel height with its own internal scrolling
- Change the Perspective view container from a fixed `65vh` height to `100%` of its parent so it tracks the resizable panel
- Ensure the results `Paper` and panel flex layout propagate height correctly (loading, error, empty, grid, and perspective states)

## Capabilities

### New Capabilities

- `sql-playground-results-layout`: The SQL Playground results panel SHALL render its results (grid, perspective, loading, error, empty) filling the full available height of the resizable results panel

### Modified Capabilities

<!-- No existing main specs to modify. -->

## Impact

- **Components**: `src/components/Admin/SqlPlayground.tsx` — results panel layout, DataGrid sizing, Perspective container height
- **CSS/layout**: Flex/height propagation for `Group` -> `Panel` -> `Paper` -> content; DataGrid `autoHeight` removal in favor of flex-based fill
- **No API or DB changes**