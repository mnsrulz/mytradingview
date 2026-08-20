## 1. Mock data source

- [x] 1.1 Create `src/lib/optionPriceHistory.ts` with `OptionPriceHistoryParams` (`symbol`, `expiration`, `strike`, `putCallType`) and `OptionPriceHistoryResponse` (`dt`, `open`, `high`, `low`, `close`, `volume` arrays) types
- [x] 1.2 Implement a deterministic mock generator (seeded random walk near the strike price, non-negative volume, ~90 daily bars) with an async delay to mimic latency
- [x] 1.3 Implement `useOptionPriceHistory(params)` hook returning `{ data, isLoading, hasError, error }`, matching the `useSubmitRequest` contract and re-requesting when params change

## 2. Price history chart component

- [x] 2.1 Create `OptionPriceHistoryChart` using `lightweight-charts-react-components` (`Chart`, `Pane`, `CandlestickSeries`, `HistogramSeries`, `TimeScale`, `TimeScaleFitContentTrigger`) with theme-aware colors consistent with `ExpectedMoveChart.tsx`
- [x] 2.2 Render OHLC candles in the primary pane and volume in a smaller secondary pane aligned to the same dates
- [x] 2.3 Render a loading state while data is in flight and an empty state when no data is returned

## 3. Contract selection from the pricing grid

- [x] 3.1 Make strike cells in `OptionsPricingGrid` clickable for the active PUT/CALL tab and add an `onContractClick({ expiration, strike })` prop, preserving the existing `ConditionalFormattingBox` rendering
- [x] 3.2 In `StockOptionsView`, track the selected contract state and render an inline `OptionPriceHistoryPanel` beneath the grid (same `Paper` container, with a header identifying symbol, strike, put/call type, and expiration, plus a Close button)

## 5. Real API integration

- [x] 5.1 Build the OCC contract id (`ROOT` + `YYMMDD` + `C|P` + strike×1000 padded to 8) from `symbol`/`expiration`/`strike`/`putCallType`
- [x] 5.2 Replace the mock with `GET {MZDATA_URL}/api/options/contracts/:contractId/ohlc?n=1000` and map the `[{ dt, open, high, low, close, volume }]` response into `OptionPriceHistoryResponse`
- [x] 5.3 Run `npm run lint` and confirm the pricing page still compiles

## 6. Timeframe control

- [x] 6.1 Add `filterOptionPriceHistory(data, period)` helper (`YTD`, `6M`, `1Y`, `ALL`) slicing the fetched series client-side
- [x] 6.2 Add a PERIOD `Select` to `OptionPriceHistoryPanel` and pass the filtered series to the chart
- [x] 6.3 Run `npm run lint` and confirm the pricing page compiles

## 7. Verify

- [ ] 7.1 Manually verify a contract's OHLC + volume chart loads from the real MZDATA endpoint, the timeframe control filters the chart, and a contract with no data shows the error state