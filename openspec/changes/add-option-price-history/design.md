## Context

The pricing page (`/options/pricing/[symbol]`) renders an option chain via `StockOptionsView` → `OptionsPricingGrid` (expiry rows × strike columns for the active PUT/CALL tab). Today the only interactive element is the expiry link, which opens the Put/Call Ratio dialog for that expiry.

The IV page (`/options/iv`) already renders rich historical charts using `lightweight-charts-react-components` (`Chart`, `Pane`, `LineSeries`, `CandlestickSeries`, `TimeScale`). `ExpectedMoveChart.tsx` uses a candlestick pane plus a secondary pane. This is the established in-repo charting pattern to reuse.

Data fetching follows a consistent pattern: `useSubmitRequest(requestType, defaults, params)` in `src/lib/mzIngestService.ts` posts `{ ...params, requestId, requestType }` to `MZINGEST_URL` and returns `{ data, isLoading, hasError, error }`. Contract-specific OHLC + volume does not exist yet anywhere.

## Goals / Non-Goals

**Goals:**
- Let a user click a specific contract (expiry + strike, per active PUT/CALL tab) on the pricing grid and view that option ticker's price history as an OHLC candlestick chart plus a volume series.
- Reuse the lightweight-charts react pattern from the IV page.
- Define a contract-detail API shape (symbol, expiry, strike, put/call → `{ dt, open, high, low, close, volume }`) and back it with deterministic mock data so the UI is fully verifiable now.
- Keep the mock isolated at the data-source layer so a real API can be swapped in without changing the UI.

**Non-Goals:**
- Implementing the real price-history API/backend (out of scope — mocked).
- Integrating with the socket/MZINGEST service.
- Adding period/lookback selectors or other chart interactions beyond display.
- Changing the existing Put/Call Ratio expiry dialog behavior.

## Decisions

### 1. Charting: reuse lightweight-charts-react-components with candlestick + volume panes
Use `Chart`, `Pane`, `CandlestickSeries` (OHLC) and `HistogramSeries` (volume) from `lightweight-charts-react-components`, matching `ExpectedMoveChart.tsx` styling (theme-aware colors, transparent background, `TimeScaleFitContentTrigger`). Volume renders in a smaller secondary pane below the candles.
- **Why**: Same library and visual language as the IV page; no new dependency.
- **Alternative considered**: MUI X `LineChart` — rejected, it cannot render candlesticks or volume.

### 2. Real API behind a hook modeled on `useSubmitRequest`
Create `src/lib/optionPriceHistory.ts` with:
- `OptionPriceHistoryParams = { symbol, expiration, strike, putCallType }`
- `OptionPriceHistoryResponse = { dt: string[]; open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }`
- `useOptionPriceHistory(params)` returning `{ data, isLoading, hasError, error }`
- `buildOptionContractId(params)` building the OCC contract id (`ROOT` + `YYMMDD` + `C|P` + strike×1000 zero-padded to 8) from the grid's contract details.

The hook fetches via `getOptionHistoricalOhlc(contractId, n)` in `src/lib/mzDataService.ts` — `GET {MZDATA_URL}/api/options/contracts/:contractId/ohlc?n=1000` (reusing the existing MZDATA `ky` client) which returns `[{ dt, open, high, low, close, volume }]`; the hook maps that into the column-aligned `OptionPriceHistoryResponse` the chart consumes. A `filterOptionPriceHistory(data, period)` helper slices the full series client-side by the selected timeframe (`YTD`, `6M`, `1Y`, `ALL`), driven by a PERIOD `Select` in the panel.

- **Why**: Matches the existing hook contract (`{ data, isLoading, hasError, error }`) and reuses the established `ky`-based MZDATA client pattern; the grid and chart stay decoupled from the transport. Fetching all data (`n=1000`) once and filtering client-side avoids a refetch per timeframe.
- **Alternative considered**: Wiring a `requestType` through the MZINGEST socket — rejected; the data lives in the MZDATA app as a REST endpoint.

### 3. Contract selection from the grid
- `OptionsPricingGrid` strike cells become clickable for the active tab. Each strike column cell is a contract for `(expiry, strike, activePutCall)`. Clicking a cell calls a new `onContractClick({ expiration, strike })` prop.
- `StockOptionsView` holds `selectedContract` state and renders an inline `OptionPriceHistoryPanel` directly beneath the pricing grid (same `Paper` container, with a header and Close button).
- The panel header shows the contract label, e.g. `AAPL $150 PUT expiring 2026-09-18`.

- **Why**: Minimal, discoverable interaction; showing the chart inline below the grid (instead of an overlay dialog) keeps the chain visible for context and avoids modal dismissal.
- **Alternative considered**: A modal dialog (like the existing `PutCallRatio`) — rejected after review in favor of an inline panel so users can compare the chart with the grid.
- **Alternative considered**: A side panel — rejected to keep the page layout stable.

## Risks / Trade-offs

- [Mock data may not look like real option price action] → Seed the random walk near the strike price and keep volume ≥ 0 so the chart reads plausibly; the chart is a visualization placeholder until the real API lands.
- [Clickable cells could collide with conditional-formatting cell rendering] → Keep the existing `ConditionalFormattingBox` visual but wrap it in a clickable container; verify hover/click UX in the grid.
- [Inline panel pushes the grid content down when opened] → The panel is a compact fixed-height chart below the grid; acceptable, and the Close button collapses it.
- [Later swap to a real API] → Contained by the hook boundary; only `optionPriceHistory.ts` changes.
- [404 / missing contract data] → The API returns HTTP 404 with `{"error": ...}`; the hook surfaces it as `hasError` with the message, and the panel renders an error state.

## Migration Plan

- Additive UI + a new REST client call to the MZDATA app. No DB, env, or deployment changes in this repo.
- Rollback: remove the click handler and panel; grid and existing dialogs unaffected.
- If the endpoint shape ever changes, only `optionPriceHistory.ts` (the mapping layer) needs updating.

## Open Questions

- Should the mock respect the selected lookback/period? No period selector in scope; the mock returns ~90 daily bars, which can be surfaced as a follow-up if a period selector is added later.