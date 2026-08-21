## 1. Navigation Setup

- [x] 1.1 Add "Hedge" navigation entry under Portfolio section in `src/app/nav.tsx`

## 2. Page Structure

- [x] 2.1 Create `src/app/portfolio/hedge/page.tsx` page component
- [x] 2.2 Create `src/components/HedgeTracker/HedgeTracker.tsx` main orchestrator component
- [x] 2.3 Create `src/components/HedgeTracker/index.ts` barrel export

## 3. Position Display

- [x] 3.1 Implement `HedgePositionCard` component showing symbol, quantity, price, cost basis
- [x] 3.2 Integrate `usePortfolio()` hook to fetch positions and live prices

## 4. Options Chain Fetching

- [x] 4.1 Create `useOptionsChain(symbol)` hook that fetches from `/api/symbols/[symbol]/options`
- [x] 4.2 Implement lazy loading of options chains per position as cards render

## 5. Hedge Suggestion Algorithm

- [x] 5.1 Create `src/lib/hedgeAlgorithm.ts` with expiration selection logic (30, 45, 60 DTE)
- [x] 5.2 Implement put debit spread generation using delta-based strike selection
- [x] 5.3 Implement call credit spread generation using delta-based strike selection
- [x] 5.4 Implement deep ITM call generation using delta-based strike selection
- [x] 5.5 Implement cost-effectiveness scoring and ranking
- [x] 5.6 Implement top 3 strategy selection per expiration

## 6. Strategy Display

- [x] 6.1 Create `HedgeStrategyRow` component showing strategy type, strikes, expiry, premiums
- [x] 6.2 Display hedge metrics: total cost/credit, max loss/gain, protection amount, cost as % of position
- [x] 6.3 Implement strategy selection UI (click to select/deselect)

## 7. Hedge Ratio Controls

- [x] 7.1 Add hedge ratio slider/input to `HedgeTracker` (default 25%, range 25-100%)
- [x] 7.2 Connect hedge ratio to `nuqs` URL state
- [x] 7.3 Recalculate suggestions when hedge ratio changes

## 8. Custom Strategy Builder

- [x] 8.1 Create `HedgeStrategyBuilder` dialog component with strategy type selector
- [x] 8.2 Create `HedgeStrategyLeg` component for individual leg configuration (buy/sell, call/put, strike, expiry, quantity)
- [x] 8.3 Implement strategy type options: put spread, call spread, collar, single leg, 2/3/4 leg
- [x] 8.4 Populate strike and expiry dropdowns from options chain data
- [x] 8.5 Add "Build Custom" button to `HedgePositionCard` that opens the builder

## 9. Strategy Charting

- [x] 9.1 Create `HedgeStrategyChart` component using Lightweight Charts
- [x] 9.2 Implement `fetchStrategyOHLC(legs)` function using `getOptionHistoricalOhlc()` from mzdata API
- [x] 9.3 Calculate net strategy value per timestamp: `Σ(close × multiplier)` where BUY=+1, SELL=−1
- [x] 9.4 Render line chart with time on x-axis, net value on y-axis
- [x] 9.5 Show debit strategies as negative values, credit strategies as positive values
- [x] 9.6 Add zero baseline marker on chart

## 10. Custom Strategy Persistence

- [x] 10.1 Implement sessionStorage read/write for custom strategies
- [x] 10.2 Restore custom strategies on page load from sessionStorage
- [x] 10.3 Display custom strategies in HedgePositionCard with "Custom" badge

## 11. Summary Display

- [x] 11.1 Create `HedgeSummary` component showing portfolio-level hedge cost and coverage
- [x] 11.2 Calculate total hedge cost across all positions
- [x] 11.3 Calculate percentage of portfolio value hedged

## 12. Loading & Error States

- [x] 12.1 Add loading skeletons while options chains are being fetched
- [x] 12.2 Handle empty state when no positions exist
- [x] 12.3 Handle error state when options chain fetch fails for a symbol
- [x] 12.4 Handle missing OHLC data for strategy charts
