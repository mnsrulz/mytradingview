## Why

Perspective viewer settings (xaxis, groupby, split-by) in the SQL Playground are lost on page reload and shared across all tabs. Each tab should maintain independent viewer settings, and those settings should persist in the database alongside the saved query data.

## What Changes

- Add a `perspectiveSettings` JSON field to the `SavedQuery` Prisma model to store viewer configuration (xaxis, groupby, split, aggregates, filters, sort)
- Update `PerspectiveWrapper` to expose its current settings via a callback prop when settings change
- Store per-tab perspective settings in the `PlaygroundTab` state
- Persist perspective settings when saving a query (create/update)
- Restore perspective settings when loading a saved query
- Add auto-save for perspective settings changes without requiring explicit save action

## Capabilities

### New Capabilities

- `perspective-settings-persistence`: Store and retrieve Perspective viewer settings (xaxis, groupby, split, aggregates, filters, sort) per saved query in the database

### Modified Capabilities

- `sql-playground-tabs`: Extend tab state to include perspective settings; sync settings between PerspectiveWrapper and tab state

## Impact

- **Prisma schema**: Add `perspectiveSettings Json?` field to `SavedQuery` model, new migration
- **API**: Update `/api/queries` routes to handle `perspectiveSettings` field
- **Components**: `PerspectiveWrapper.tsx` needs settings change callback; `SqlPlayground.tsx` needs to manage per-tab settings state and persistence
- **Database**: Existing saved queries will have null settings (backward compatible)
