## Context

The hedge tracker page (`/portfolio/hedge`) currently renders auto-suggested strategies inline for every position. The `PositionWithHedges` component fetches options chains, generates suggestions, and renders them all directly in the card. Custom strategies are stored separately via `useCustomStrategies`. The page uses `useDialogs` from `@toolpad/core` is already available (DialogsProvider is wired up in app.tsx).

## Goals / Non-Goals

**Goals:**
- Separate saved strategies from unsaved suggestions
- Hedge icon on each position card opens a Toolpad dialog for exploring/saving strategies
- Custom strategies render identically to auto-suggested strategies on the main screen (with chart)
- Unified storage for both suggested and custom saved strategies

**Non-Goals:**
- Real-time price updates on saved strategies
- Portfolio-level aggregation of saved strategies
- Strategy execution or order placement

## Decisions

### 1. Use Toolpad `useDialogs` for the Hedge Dialog

**Decision:** Use `useDialogs().open(HedgeStrategyDialog, payload)` to open the strategy dialog imperatively from `HedgePositionCard`.

**Rationale:** DialogsProvider is already wired up. The imperative API avoids managing open/close state in the parent. The dialog returns a `SavedStrategy` on save, which the parent can react to.

**Alternative considered:** Regular MUI Dialog with useState — rejected because useDialogs is already available and provides a cleaner API.

### 2. Unified `SavedStrategy` Type

**Decision:** Create a `SavedStrategy` type that represents any saved strategy (auto-suggested or custom):

```typescript
type SavedStrategy = {
  id: string;
  symbol: string;
  name: string;
  source: 'suggested' | 'custom';
  strategyType: string;
  legs: HedgeLeg[];
}
```

**Rationale:** Both auto-suggested and custom strategies render the same way on the main screen (row + chart). Using a unified type simplifies rendering logic.

**Alternative considered:** Keep separate types and convert on render — rejected because it adds unnecessary complexity.

### 3. localStorage Schema

**Decision:** Store saved strategies in a single localStorage key `hedge-tracker-saved-strategies` as `Record<string, SavedStrategy[]>`.

**Rationale:** Simple, consistent with existing `useCustomStrategies` pattern. Keyed by symbol for easy per-symbol CRUD.

### 4. Dialog Has Two Tabs, Not Two Dialogs

**Decision:** Single dialog with MUI Tabs: "Suggested" and "Custom Builder".

**Rationale:** Keeps the UX simple — one entry point for all strategy exploration. Tabs are a familiar pattern for this kind of dual-purpose UI.

## Risks / Trade-offs

- **[Risk] Stale saved strategies** → Mitigation: Saved strategies store the legs with strikes/expirations. The chart fetches fresh OHLC data on render. Users can delete and re-save if strategies become outdated.

- **[Risk] localStorage size** → Mitigation: Strategies are small objects. Even with many positions, storage footprint is negligible.

- **[Trade-off] No financial metrics on custom strategies** → Accepted: Custom strategies show name/type/legs only. Auto-suggested strategies show cost/credit/max values. This is by design — custom strategies are user-defined and don't have computed metrics.
