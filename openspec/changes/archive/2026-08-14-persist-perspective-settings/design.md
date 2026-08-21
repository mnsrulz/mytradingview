## Context

The SQL Playground uses a `<perspective-viewer>` web component (from `@perspective-dev/viewer` CDN) to visualize query results. The viewer has a built-in settings panel (xaxis, groupby, split-by, aggregates, filters, sort) but these settings are entirely internal to the web component — the React app has no access to read or write them.

Currently, saved queries store only `name` and `query` (SQL text). When a user loads a saved query, the perspective view resets to defaults. Each tab shares no viewer state with others.

**Current state:**
- `PerspectiveWrapper.tsx` initializes the viewer with `settings: true` but has no callback for settings changes
- `SqlPlayground.tsx` manages tabs via `PlaygroundTab[]` state — each tab has `query`, `symbol`, `result`, but no perspective settings
- `SavedQuery` Prisma model has `id`, `name`, `query` — no settings field

## Goals / Non-Goals

**Goals:**
- Persist perspective viewer settings per saved query in the database
- Each tab maintains its own independent perspective settings
- Settings are restored when loading a saved query
- Settings are saved when explicitly saving a query

**Non-Goals:**
- Auto-persisting settings for unsaved/ephemeral tabs (only saved queries get persistence)
- Syncing settings across tabs
- Migrating existing saved queries (they'll have null settings, which is fine)
- Exposing all perspective internals — only the serializable settings object

## Decisions

### 1. Store settings as JSON in SavedQuery

**Decision:** Add a `perspectiveSettings Json?` field to the `SavedQuery` Prisma model.

**Rationale:** Perspective settings are a complex nested object (xaxis, groupby, split, aggregates, filters, sort). A single JSON column is the simplest approach that avoids creating multiple related tables for what is essentially a view configuration blob. PostgreSQL's JSON type supports this well.

**Alternative considered:** Create separate tables for perspective settings. Rejected — overengineered for a config blob that's only read/written as a whole.

### 2. Expose settings via callback prop on PerspectiveWrapper

**Decision:** Add an `onSettingsChange` callback prop to `PerspectiveWrapper`. The viewer's `restore()` method can be used to read current settings, and we'll listen for config changes via the viewer's event system.

**Rationale:** The `<perspective-viewer>` web component fires events when its config changes. We can subscribe to these events and forward the settings to the parent via callback.

**Alternative considered:** Poll the viewer periodically. Rejected — wasteful and introduces latency.

### 3. Store settings in PlaygroundTab state

**Decision:** Add `perspectiveSettings?: object` to the `PlaygroundTab` type. When the user changes perspective settings, update the active tab's state.

**Rationale:** Each tab already holds its own query, symbol, and result. Adding settings to the same structure keeps the per-tab state cohesive and makes it easy to save/load with the query.

### 4. Save settings on explicit save only

**Decision:** Perspective settings are persisted only when the user explicitly saves the query (via the Save button). Auto-save for unsaved tabs is out of scope.

**Rationale:** Auto-save adds complexity (debouncing, conflict resolution) and the user's intent is unclear for unsaved queries. Explicit save is predictable.

## Risks / Trade-offs

- **[Risk]** Perspective viewer may not expose settings change events reliably → **Mitigation:** Use the `restore()` method to read config after known interactions, and fall back to manual serialization if events are unreliable.

- **[Risk]** Large settings objects could bloat the JSON column → **Mitigation:** Perspective settings are small (typically <1KB). No concern at current scale.

- **[Risk]** Backward compatibility with existing saved queries → **Mitigation:** The field is nullable. Existing queries load with null settings, which means perspective defaults apply. No migration needed.
