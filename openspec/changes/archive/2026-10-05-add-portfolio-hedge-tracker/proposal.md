## Why

Hedging portfolio positions with options requires manually checking each symbol's options chain, comparing strike prices, and calculating protection costs across multiple strategies. This is time-consuming and error-prone, especially when managing multiple positions. An automated hedge tracker that analyzes options chains and suggests the best hedging strategies per position saves significant analysis time and helps make more informed risk management decisions.

## What Changes

- Add a new `/portfolio/hedge` page that displays portfolio positions with auto-suggested hedge strategies
- Implement a hedge suggestion algorithm that analyzes options chains and recommends put debit spreads, call credit spreads, and deep ITM calls
- Provide a custom strategy builder where users can configure their own multi-leg strategies per position
- Show strategy charts using Lightweight Charts with historical OHLC data from mzdata API
- Chart displays net strategy value over time with debit as negative and credit as positive
- Show hedge metrics (cost, protection amount, max loss, cost as % of position) for each suggestion
- Allow users to adjust hedge ratio (default 25% of position) and compare strategies across multiple expirations (30, 45, 60 DTE)
- Add navigation entry under the Portfolio section

## Capabilities

### New Capabilities

- `portfolio-hedge-tracker`: Core hedge tracker page that fetches portfolio positions, retrieves options chains, runs the auto-suggest algorithm, and displays hedge strategy recommendations with cost/protection metrics
- `hedge-suggestion-algorithm`: Algorithm that evaluates options chain data to generate and rank put debit spreads, call credit spreads, and deep ITM call strategies based on cost-effectiveness
- `hedge-strategy-builder`: Custom strategy builder allowing users to configure multi-leg strategies per position with a chart showing net strategy value over time using Lightweight Charts and mzdata OHLC API

### Modified Capabilities

None — no existing spec-level behavior changes.

## Impact

- **New page:** `src/app/portfolio/hedge/page.tsx`
- **New components:** Hedge tracker components in `src/components/HedgeTracker/` (HedgeTracker, HedgePositionCard, HedgeStrategyRow, HedgeSummary, HedgeStrategyBuilder, HedgeStrategyLeg, HedgeStrategyChart, HedgeStrategyList)
- **Data flow:** Reuses existing `usePortfolio()` hook for positions + live prices; adds Tradier options chain fetches per held symbol; uses `getOptionHistoricalOhlc()` from mzdata API for strategy charting
- **API:** Leverages existing `GET /api/symbols/[symbol]/options` route and `getOptionHistoricalOhlc()` — no new API routes needed
- **State:** URL params via `nuqs` for hedge ratio and expiration filter; sessionStorage for persisting selected hedges and custom strategies
- **Navigation:** New entry in `src/app/nav.tsx` under Portfolio
