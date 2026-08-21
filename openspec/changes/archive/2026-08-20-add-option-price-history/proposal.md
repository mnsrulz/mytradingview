## Why

On the options pricing page (`/options/pricing/[symbol]`) a user can only see the current option chain snapshot. There is no way to see how a specific option contract traded over time (price and volume), which is essential for understanding liquidity and price action before trading a strike.

## What Changes

- Add the ability to click a specific option contract (expiry + strike, for the active PUT/CALL tab) in the pricing grid and view its historical price (OHLC) and volume in a chart.
- Reuse the charting approach already used on the IV page (lightweight-charts react components) to render the option ticker's OHLC plus a volume series.
- Introduce a mocked data source for the future "option price history" API: pass in contract details (symbol, expiry, strike, put/call) and receive OHLC + volume for that option ticker. No real API wiring yet — data is deterministic mock data so the UI can be built and verified.

## Capabilities

### New Capabilities
- `option-price-history`: Display OHLC + volume history for a specific option contract (expiry, strike, put/call) on the pricing page, driven by a mocked price-history API that can later be swapped for a real endpoint.

### Modified Capabilities
<!-- None — no existing specs are affected. -->

## Impact

- `src/components/StockOptionsView.tsx` — wire contract selection (strike cell click) and mount the history chart view.
- `src/components/optionsPricing/OptionsPricingGrid.tsx` — make strike cells clickable for the active tab, exposing the selected expiry + strike.
- New chart component(s) under `src/components/optionsPricing/` (or `src/components/OptionsPricing/`) reusing `lightweight-charts-react-components` (`CandlestickSeries` + `HistogramSeries`) — the same library used by the IV page.
- New hook/data layer (e.g. `src/lib/optionPriceHistory.ts`) modeled on `useSubmitRequest`/`useOhlc` in `src/lib/socket.ts` and `src/lib/mzIngestService.ts`, returning a mocked `{ dt, open, high, low, close, volume }` series keyed off contract params.
- No database, auth, or external API changes.