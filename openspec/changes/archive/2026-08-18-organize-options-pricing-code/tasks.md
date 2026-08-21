## 1. Shared Types

- [x] 1.1 Add pricing types/enums (`PriceModeType`, `ValueModeType`, `PriceModeTypeEnum`, `ValueModeTypeEnum`, `PutCallType`, `IStrikePriceSliderPorps`) to `src/lib/types.ts`
- [x] 1.2 Add a typed grid row type (index-signature `Record` with `id`) and `OptionsQuote` type to `src/lib/types.ts`
- [x] 1.3 Update `StrikePriceSlider.tsx` to import `IStrikePriceSliderPorps` from the shared types module instead of `StockOptionsView`
- [x] 1.4 Grep to confirm no remaining consumers import pricing types from `StockOptionsView`

## 2. Pure Calculator Module

- [x] 2.1 Create `src/lib/optionsPricing/calculator.ts` with `getPriceByMode` (LAST/BID/ASK/AVG, mid default, null when quote side missing)
- [x] 2.2 Port `getValueByMode` returning price, annual return, total return, OI, and volume using the exact formulas from `StockOptionsView`
- [x] 2.3 Add `getWorkingStrikes` inclusive range filter
- [x] 2.4 Add `buildColumns(workingStrikes, valueMode)` producing `GridColDef[]` with numeric formatters and conditional-formatting render cells for return/OI modes
- [x] 2.5 Add `buildRows(dates, chain, workingStrikes, putCallType, priceMode, valueMode, targetPrice, costBasis)` producing typed row objects without `any` casts
- [x] 2.6 Ensure the calculator imports only types/formatters (no React, MUI, or network imports)

## 3. Extract View Components

- [x] 3.1 Create `src/components/optionsPricing/OptionsPricingControls.tsx` with price-mode select, value-mode select, target price input, and cost-basis input (CALL only), wired to nuqs
- [x] 3.2 Create `src/components/optionsPricing/OptionsPricingGrid.tsx` rendering the DataGrid with prebuilt columns/rows, grid styling, and PCR-dialog wiring
- [x] 3.3 Create `src/components/optionsPricing/OptionsPricingHeader.tsx` rendering spot price, `TickerSearchDialog`, and `RefreshCboeData`
- [x] 3.4 Slim `StockOptionsView.tsx` to an orchestrator composing header, controls, PUT/CALL tabs, grid, and PCR dialog
- [x] 3.5 Remove the dead inline search `Dialog`, commented-out blocks, unused imports, and `any` casts from `StockOptionsView.tsx`

## 4. Verification

- [x] 4.1 Run `npm run lint` and fix any errors
- [x] 4.2 Run `npm run build` and confirm it succeeds
- [x] 4.3 Manually verify `/options/pricing/[symbol]` for PUT/CALL tabs, all price/value modes, strike slider, target price/cost basis, stale-data refresh, and the PCR dialog match the pre-refactor behavior
- [x] 4.4 Verify URL params `tab`, `pricemode`, `valuemode` persist on reload with identical defaults