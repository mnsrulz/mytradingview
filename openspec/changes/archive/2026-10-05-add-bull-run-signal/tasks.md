## 1. Data Layer

- [x] 1.1 Create `src/lib/bullrun/bullRunSeriesSql.ts` with the series SQL as a TS constant
- [x] 1.2 Create `src/lib/bullrun/types.ts` (`BullRunWeek`, `BullRunSummary`, `BullRunTally`)
- [x] 1.3 Create `src/lib/bullrun/normalize.ts` — coerce string numerics, drop invalid rows
- [x] 1.4 Create `src/lib/bullrun/derive.ts` — badge, signals, `tally()` for all / cheap∧trend / +drought variants
- [x] 1.5 Create `src/lib/bullrun/useBullRunSignal.ts` — abortable hook over `runDynamicQuery` with same-week module cache

## 2. Widget

- [x] 2.1 Create `src/components/widgets/BullRunSignalWidget.tsx` (ON/OFF chip, as-of week, score/4, boxes, trend, backtest summary with n + in-sample label, loading/error/insufficient states)
- [x] 2.2 Register the widget in `WidgetGrid.tsx`

## 3. Symbol Overview Surfaces

- [x] 3.1 Add ON/OFF header chip next to the price in `SymbolOverview.tsx`, linking to `/beta/<symbol>/signal`
- [x] 3.2 Add fifth Analytics feature card "Bull-Run Signal" → `signal` route

## 4. Detail Page

- [x] 4.1 Create `/beta/[symbol]/signal` page with `SymbolPageLayout`
- [x] 4.2 Status header (ON/OFF, as-of week, price, px4w) and checklist with rule expression
- [x] 4.3 Backtest stats (n/hits/mean/worst × 3 variants) with in-sample labeling
- [x] 4.4 Price chart with ON-week markers and score chart
- [x] 4.5 Weekly history DataGrid with signals-only toggle and "open" forward returns

## 5. Verification

- [x] 5.1 `npm run lint` passes (also `npx tsc --noEmit` clean)
- [ ] 5.2 Manual: IBIT shows ON on widget, chip, and detail page; NVDA shows OFF
- [ ] 5.3 Manual: short-history symbol shows insufficient-history state; query failure shows error state
