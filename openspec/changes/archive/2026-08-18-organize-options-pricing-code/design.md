## Context

`/options/pricing/[symbol]` renders `StockOptionsView.tsx` (`src/components/StockOptionsView.tsx`, 248 lines). It is a single client component responsible for:

- Fetching data through `useOptionTrackerV2` (`src/lib/hooks.ts`)
- Defining local types/enums (`PriceModeType`, `ValueModeType`, `PriceModeTypeEnum`, `ValueModeTypeEnum`, `PutCallType`, `IStrikePriceSliderPorps`, `ITickerProps`)
- Deriving the chain dataset (dates, strikes, filtered working strikes)
- Building DataGrid columns and rows, including inline return-formula math
- Rendering header, controls, tabs, grid, and the PCR dialog
- Managing URL state via nuqs (`tab`, `pricemode`, `valuemode`)

Known issues: `StrikePriceSlider` imports `IStrikePriceSliderPorps` from `StockOptionsView` (component→component type coupling), the search dialog is dead code (state set but never opened), commented-out blocks exist, and row building relies on `(o as any)`.

The refactor preserves all behavior and the existing URL param contract.

## Goals / Non-Goals

**Goals:**
- Separate data fetching, derivation, and presentation into clearly named modules
- Extract all pricing math into pure, dependency-free functions (testable, reusable)
- Move shared types/enums to `src/lib/types.ts` and break the `StrikePriceSlider` ↔ `StockOptionsView` coupling
- Eliminate dead code, commented-out blocks, and unsafe `any` casts where feasible
- Keep user-visible behavior, URL params, and defaults byte-for-byte identical

**Non-Goals:**
- Changing UI layout, styling, or behavior
- Changing the API (`/api/symbols/{symbol}/options/pricing`), data shape, or hooks API
- Refactoring `OptionSpreadPricingWrapper.tsx` (screener page, out of scope)
- Adding a test framework (no test infra currently configured)
- Performance tuning beyond incidental memoization gains

## Decisions

### 1. Split the view into a small component tree

New components under `src/components/optionsPricing/`:

- `OptionsPricingHeader.tsx` — spot price, `TickerSearchDialog`, `RefreshCboeData` trigger. Uses the search dialog (replacing the currently-dead dialog in `StockOptionsView` with a proper open trigger, or dropping it and keeping `TickerSearchDialog` which is already shown inline).
- `OptionsPricingControls.tsx` — price mode select, value mode select, target price, cost basis (CALL-only). Encapsulates the `Stack` + `FormControl` controls and the nuqs select handlers.
- `OptionsPricingGrid.tsx` — the DataGrid, fed with pre-built columns/rows; owns grid styling and the PCR-dialog wiring.
- `StockOptionsView.tsx` — becomes a thin orchestrator: calls `useOptionTrackerV2`, computes inputs, composes header/controls/grid/tabs/PCR dialog.

Rationale: mirrors the existing MUI component patterns (components in `src/components/`, page-specific components collocated) and keeps each file focused and reviewable. Alternative considered: keeping everything in one file with `useMemo` only — rejected because it does not address coupling or testability.

### 2. Extract pricing math into a pure calculator module

New module `src/lib/optionsPricing/calculator.ts` exporting pure functions:

- `getPriceByMode(quote, priceMode): number | null` — implements `LAST_PRICE`/`BID_PRICE`/`ASK_PRICE`/`AVG_PRICE` (mid = `(ask+bid)/2` when both present, else null; default bid)
- `getValueByMode(...)` — price, annual return, total return, OI, volume (formulas ported verbatim from `StockOptionsView`)
- `getWorkingStrikes(allStrikes, range)` — inclusive range filter
- `buildColumns(workingStrikes, valueMode)` — `GridColDef[]` with formatter/conditional-formatting wiring
- `buildRows(dates, chain, workingStrikes, putCallType, priceMode, valueMode, targetPrice, costBasis)` — row objects

Type helpers (`OptionsQuote`, `PriceModeType`, `ValueModeType`, `PutCallType`, `IStrikePriceSliderPorps`) move to `src/lib/types.ts`. The calculator imports only types + formatters.

Rationale: the return formulas are currently buried in JSX row-building closures; extracting them makes the contract explicit and unit-testable. Alternative: a custom hook returning memoized rows — rejected because hooks are harder to test than pure functions and would retain React coupling.

### 3. Move shared types to `src/lib/types.ts`

Port `PriceModeType`, `ValueModeType`, `PriceModeTypeEnum`, `ValueModeTypeEnum`, `PutCallType`, `IStrikePriceSliderPorps` into `types.ts` (or a `src/lib/optionsPricing/types.ts`). Update `StrikePriceSlider.tsx` to import `IStrikePriceSliderPorps` from the shared location, removing the `StockOptionsView` import.

Rationale: breaks the component→component type dependency; types become reusable and collocated with the data shapes they describe. Alternative: keep enums in a `constants.ts` — unnecessary given the existing `types.ts` conventions.

### 4. Remove dead code and unsafe casts

- Delete the unreachable `openSearchTickerDialog` Dialog block (state is never set to open)
- Delete commented-out blocks and unused imports in `StockOptionsView.tsx`
- Replace `(o as any)[strike]` row assignment with a typed `IOptionsGrid` + index-signature approach (e.g., `Record<string, number | string>` grid row type with a defined `id`)

Rationale: reduces confusion and restores type safety. Risk is low since these paths are dead or trivially typed.

## Risks / Trade-offs

- **Behavior drift during refactor** → Port formulas verbatim (copy the exact arithmetic), then manually verify grid output against the current page for a known symbol; keep URL param names and defaults unchanged.
- **Large diff / review burden** → Land as a single cohesive refactor; each extracted module preserves the existing code structure so diffs are mostly moves.
- **Shared type move breaks other consumers** → `IStrikePriceSliderPorps` is only used by `StrikePriceSlider`; grep confirms no other imports before removing old exports.
- **`todaysDate` computed at module load** → Preserve existing behavior (module-level constant) to avoid subtle day-boundary regressions; note it as a follow-up, not part of this change.

## Migration Plan

1. Add types/enums to shared types module
2. Create `calculator.ts` with ported logic
3. Extract `OptionsPricingGrid`, `OptionsPricingControls`, `OptionsPricingHeader`
4. Slim down `StockOptionsView.tsx` to an orchestrator
5. Update `StrikePriceSlider.tsx` import
6. Run `npm run lint` and `npm run build`; manually verify `/options/pricing/[symbol]` for PUT/CALL, all price/value modes, slider, refresh, and PCR dialog

No DB or API migration; deploy is a normal code push. Rollback = revert the PR.

## Open Questions

- Should the now-dead inline search `Dialog` be replaced with an "open search" affordance, or simply removed since `TickerSearchDialog` already renders inline? (Default: remove the dead dialog.)
- Type-only imports vs. value imports for the enums (`import { PutCallType }` is a value import used in comparisons — keep as value import; types can be `import type`).