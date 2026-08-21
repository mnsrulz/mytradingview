## Why

The current hedge tracker shows all auto-suggested strategies inline for every position, creating visual clutter. Users need a clear separation between strategies they've committed to (saved) vs. available options to consider. The hedge icon should act as a focused entry point to explore and save strategies, while the default view shows only what's been saved.

## What Changes

- **Default position card view** shows only saved/favorited strategies as compact rows (not auto-suggestions)
- **Hedge icon button** on each position card opens a dialog via Toolpad `useDialogs`
- **Dialog contains two tabs:**
  - **Suggested**: algorithmic strategies with a "Save" action to persist them
  - **Custom Builder**: existing builder for manual strategy creation
- **Save/favorite action**: clicking save persists the strategy to localStorage and adds it to the position's saved list
- **Remove action**: users can remove saved strategies from the position card
- Auto-suggestions are no longer rendered inline on the page — they only appear in the dialog
- Custom strategies render identically to auto-suggested strategies on the main screen (with chart)

## Capabilities

### New Capabilities
- `hedge-strategy-dialog`: Dialog (via Toolpad useDialogs) that displays auto-suggested strategies and custom builder, with save/favorite functionality

### Modified Capabilities
- `portfolio-hedge-tracker`: Position card default view changes to show only saved strategies; hedge icon triggers dialog

## Impact

- `src/components/HedgeTracker/HedgeTracker.tsx` — PositionWithHedges restructured, auto-suggestions moved to dialog
- `src/components/HedgeTracker/HedgePositionCard.tsx` — Add hedge icon button, use useDialogs, render saved strategies
- `src/components/HedgeTracker/HedgeStrategyDialog.tsx` — New Toolpad dialog component
- `src/components/HedgeTracker/SavedStrategyRow.tsx` — New component for rendering saved strategies
- `src/lib/useSavedStrategies.ts` — Renamed from useCustomStrategies, unified CRUD for both suggested and custom
- localStorage schema extended to track saved algorithmic strategy IDs per symbol
