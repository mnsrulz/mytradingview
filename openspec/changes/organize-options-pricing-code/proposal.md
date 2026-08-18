## Why

The `options/pricing/[symbol]` page is rendered by `StockOptionsView.tsx`, a 248-line monolith that mixes data fetching, derived-value math (price modes, return formulas, PCR/volume), column/row building, URL state, and presentation into one component. This makes the page hard to navigate, test, and extend — and it creates awkward coupling (e.g., `StrikePriceSlider` imports a type from `StockOptionsView`). Reorganizing the page into focused modules will make it maintainable and faster to iterate on without changing its behavior.

## What Changes

- Split `StockOptionsView.tsx` into a thin orchestrator plus focused sub-components:
  - `OptionsPricingGrid` (DataGrid rendering)
  - `OptionsPricingControls` (price mode / value mode selects, target price, cost basis)
  - `OptionsPricingHeader` (ticker search dialog, spot price, stale-data refresh)
- Extract the derived-data logic into a pure, unit-testable calculator module (`src/lib/optionsPricing/calculator.ts`): price lookup by mode, value computation (annual/total return, PCR, volume), strike-range filtering, and grid row/column building.
- Move pricing-related types and enums (`PriceModeType`, `ValueModeType`, `PutCallType`, `IStrikePriceSliderPorps`, etc.) out of component files into `src/lib/types.ts`.
- Decouple `StrikePriceSlider` from `StockOptionsView` by importing the shared type from `lib/types`.
- Remove dead code and unused imports in `StockOptionsView.tsx` (unreachable search dialog, commented-out blocks, `any` casts where typed code is possible).
- Keep user-facing behavior identical; this is a code-organization refactor only.

## Capabilities

### New Capabilities

- `options-pricing-view`: The option-pricing page renders an option chain grid (expiry rows x strike columns) with PUT/CALL tabs, price mode (Last/Bid/Ask/Mid), value mode (Price/Annual Return/Total Return/OI/Volume), strike-range slider, target price & cost basis inputs, stale-data refresh, and a per-expiry Put/Call Ratio dialog. Its implementation is organized into clearly separated modules (orchestrator, header, controls, grid, calculator) with no component-level type definitions.
- `options-pricing-calculations`: A pure calculation module that derives pricing values from raw chain data — selecting price by mode, computing annual/total returns against target price and cost basis, mapping OI/volume modes, filtering strikes by range, and producing DataGrid columns/rows. It has no UI or data-fetching dependencies and can be reasoned about and tested in isolation.

### Modified Capabilities

<!-- No existing specs in openspec/specs/ are changing. -->

## Impact

- **Components**: `StockOptionsView.tsx` refactored and split into new files under `src/components/optionsPricing/`; `StrikePriceSlider.tsx` updated to import its prop type from `lib/types` instead of `StockOptionsView`.
- **Types**: New pricing types/enums added to `src/lib/types.ts`.
- **Logic**: New pure calculator module `src/lib/optionsPricing/calculator.ts`; `useOptionTrackerV2` hook stays in `src/lib/hooks.ts`.
- **Behavior**: No user-facing changes; grid output, URL params (`tab`, `pricemode`, `valuemode`), and defaults preserved.
- **Not in scope**: `OptionSpreadPricingWrapper.tsx` powers the screener page, not pricing; left untouched.