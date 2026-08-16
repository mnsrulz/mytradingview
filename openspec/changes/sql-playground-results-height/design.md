## Context

The SQL Playground (`src/components/Admin/SqlPlayground.tsx`) renders the editor and results inside a `react-resizable-panels` `Group orientation="vertical"` with a fixed `height: '75vh'`. The results panel currently contains:

- A `Paper` with `sx={{ pt: 1 }}` that does not propagate full height
- A `DataGrid` with `autoHeight` (only grows to content height, never fills the panel)
- A `Box` wrapping `PerspectiveWrapper` with a fixed `height: '65vh'` (does not track the resizable panel)
- Non-result states (error / loading / empty) rendered inline without any height fill

Because `autoHeight` and the fixed `65vh` box do not respond to panel resizing, results render with unused space or overflow regardless of splitter position.

## Goals / Non-Goals

**Goals:**

- Results content fills the full available height of the resizable results panel
- Grid view scrolls internally instead of growing to content height
- Perspective view tracks the panel height instead of using a fixed viewport
- Non-result states render cleanly within the panel area

**Non-Goals:**

- Changing the overall `75vh` group height or editor sizing
- Altering grid column behavior, pagination, or result data logic
- Changing the `PerspectiveWrapper` component itself

## Decisions

### 1. Remove `autoHeight` and let DataGrid fill the panel via flex

The `DataGrid` in MUI X with `autoHeight` sizes to content. Removing `autoHeight` makes it fill its flex container. The results `Paper` becomes a flex container (`display: 'flex'`, `flexDirection: 'column'`, `height: '100%'`), with the `DataGrid` as a flex child that fills remaining space and scrolls internally.

Rationale: MUI X `DataGrid` natively handles internal scrolling when given a bounded height, which is exactly the desired grid behavior. Alternative (setting a fixed pixel/vh height) was rejected because it would not track splitter resizing.

### 2. Replace fixed `65vh` box with `100%` height

The Perspective container changes from `height: '65vh'` to `height: '100%'`, letting it fill the results panel. `PerspectiveWrapper` already renders its own root `Box` with `height: '100%'` and the `perspective-viewer` element with `height: '100%'`, so the container change is sufficient to propagate height through.

### 3. Propagate height through the Paper chain

The results `Panel` needs its content to fill height: the `Paper` gets `height: '100%'` and the panel's flex layout ensures the child stretches. Non-result states (error, loading, empty) are centered within a full-height flex area.

## Risks / Trade-offs

- [DataGrid with bounded height may show an empty area if few rows] → Grid will still fill the panel; acceptable since results can be large. Pagination remains available.
- [Perspective viewer needs explicit height on all ancestors] → Container chain uses `height: '100%'` end to end; verified `PerspectiveWrapper` already fills its parent.
- [Flex layout regressions in non-result states] → All states share the same full-height flex container and center their content.