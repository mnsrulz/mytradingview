## Context

The MyTradingView app already has a portfolio page (`/portfolio`) that shows stock positions with live prices via SSE. It also has options analysis pages (DEX/GEX, pricing, IV) and a spread strategy builder in the screener. This change adds a dedicated hedge tracker page that combines portfolio positions with options chain analysis to auto-suggest hedging strategies and allows users to build custom strategies.

Current state: Users must manually check each symbol's options chain, pick strikes/expirations, and calculate hedge costs across multiple strategies. There's no integrated view that shows positions alongside hedge recommendations.

## Goals / Non-Goals

**Goals:**
- Display portfolio positions with auto-suggested hedge strategies for each held symbol
- Support three strategy types: put debit spreads, call credit spreads, deep ITM calls
- Provide custom strategy builder supporting all strategy types (put spread, call spread, collar, single leg, 2/3/4 leg)
- Show strategy charts using Lightweight Charts with mzdata OHLC API
- Chart shows net strategy value over time with debit as negative and credit as positive
- Show suggestions across multiple expirations (30, 45, 60 DTE)
- Rank strategies by cost-effectiveness (protection per dollar spent)
- Allow user to adjust hedge ratio (default 25% of position)
- Persist selected hedges and custom strategies in sessionStorage (DB persistence later)

**Non-Goals:**
- Real-time hedge execution or order placement
- Portfolio-level risk metrics (VaR, beta hedging, etc.)
- Historical hedge performance tracking
- Multi-leg strategies beyond 4 legs

## Decisions

### 1. Component Architecture

**Decision:** Create a `HedgeTracker` orchestrator component with sub-components:
- `HedgePositionCard` — per-position card showing stock info + suggested hedges + custom strategies
- `HedgeStrategyRow` — individual strategy with strikes, expiry, cost, protection
- `HedgeSummary` — portfolio-level summary of total hedge cost and coverage
- `HedgeStrategyBuilder` — dialog for building custom strategies per position
- `HedgeStrategyLeg` — individual leg row in the builder (buy/sell, call/put, strike, expiry, quantity)
- `HedgeStrategyChart` — Lightweight Charts line chart showing strategy value over time
- `HedgeStrategyList` — lists custom strategies in the position card

**Rationale:** Follows the existing Portfolio component pattern. Keeps components focused and testable. Each card handles one position's data independently.

**Alternative considered:** Single monolithic component — rejected because it would be hard to maintain and wouldn't scale with the number of positions.

### 2. Data Fetching Strategy

**Decision:** Fetch options chains lazily per symbol as positions load. Use the existing `GET /api/symbols/[symbol]/options` route which returns Tradier option chain data. For strategy charting, use `getOptionHistoricalOhlc()` from mzdata API.

**Rationale:** Avoids fetching options chains for symbols the user doesn't view. The existing API route already returns strikes, expiration dates, bid/ask, and Greeks. No new API routes needed.

**Alternative considered:** Pre-fetch all chains on page load — rejected because it would be slow with many positions and waste API calls for positions the user doesn't scroll to.

### 3. Auto-Suggest Algorithm Design

**Decision:** Run the hedge suggestion algorithm client-side after fetching options chains. The algorithm:
1. Filters expirations to 30, 45, 60 DTE (closest available)
2. Generates strategies using delta-based strike selection (−0.35 to −0.45 for puts, +0.25 to +0.35 for calls)
3. Scores by cost-effectiveness: `protection / netDebit` for debit spreads, `credit / maxLoss` for credit spreads
4. Returns top 3 strategies per expiration, sorted by score

**Rationale:** Client-side computation keeps the API layer simple. Delta-based strike selection is a standard options trading heuristic. Scoring by cost-effectiveness gives the best protection per dollar.

**Alternative considered:** Server-side algorithm — rejected because it would require new API endpoints and the computation is lightweight enough for the client.

### 4. Custom Strategy Builder

**Decision:** Build custom strategy as a dialog opened from each `HedgePositionCard`. Supports all strategy types: put spread, call spread, collar, single leg, 2/3/4 leg. Each leg has: buy/sell, call/put, strike (from options chain), expiry, quantity.

**Rationale:** Reuses the data model from OptionSpreadPricingWrapper (LineItemModel) but builds a new UI tailored for hedging context. Users can configure any strategy they want beyond the auto-suggestions.

**Alternative considered:** Reuse OptionSpreadPricingWrapper directly — rejected because it's designed for the screener page and doesn't integrate well with the hedge tracker card layout.

### 5. Strategy Charting

**Decision:** Use Lightweight Charts (already in project) to render strategy value over time as a line chart. Data sourced from `getOptionHistoricalOhlc()` via mzdata API.

**Chart behavior:**
- Fetch OHLC for each leg via `getOptionHistoricalOhlc(contractId)`
- For each timestamp: `netValue = Σ(close × multiplier)` where BUY=+1, SELL=−1
- Plot as line series with time on x-axis
- Debit strategies show negative values (you paid), credit strategies show positive values (you received)
- Zero baseline clearly marked

**Rationale:** Lightweight Charts is already used in the project (OptionPriceHistoryChart, ExpectedMoveChart). mzdata OHLC API provides reliable historical data. Line chart clearly shows strategy value trajectory.

**Alternative considered:** uPlot (used by OptionSpreadPricingWrapper) — rejected because Lightweight Charts is already used for similar purposes and has a cleaner API for line charts.

### 6. State Management

**Decision:** Use `nuqs` for URL state (hedge ratio, selected expiration filter) and `sessionStorage` for persisting selected hedges and custom strategies.

**Rationale:** Follows existing patterns (OptionsExposure uses nuqs extensively). SessionStorage is simple, persists across page reloads, and doesn't require DB changes. DB persistence is planned for later.

**Alternative considered:** Zustand/Redux — rejected because it's overkill for this feature and the codebase doesn't use global state stores.

### 7. Navigation Placement

**Decision:** Add hedge tracker under the Portfolio section in navigation, at `/portfolio/hedge`.

**Rationale:** The feature is portfolio-aware — it shows positions and their hedges. Placing it under Portfolio makes it discoverable alongside the existing portfolio view.

**Alternative considered:** `/options/hedge` — rejected because it's more about portfolio risk management than pure options analysis.

## Risks / Trade-offs

- **[Risk] Options chain data freshness** → Mitigation: Options chains are fetched on page load and can be refreshed. Stale data could suggest outdated strategies. Future: add auto-refresh or cache invalidation.

- **[Risk] Algorithm accuracy** → Mitigation: Delta-based strike selection is a heuristic, not financial advice. Show a disclaimer. Allow users to manually adjust strikes.

- **[Risk] Performance with many positions** → Mitigation: Lazy loading per symbol. Could be slow with 20+ positions. Future: add pagination or virtual scrolling.

- **[Risk] OHLC data availability** → Mitigation: Some options may not have historical OHLC data. Show chart only when data is available, otherwise show a message.

- **[Trade-off] SessionStorage vs DB** → Accepted: Hedges are lost on browser clear. DB persistence is planned for v2.

- **[Trade-off] Three strategy types for auto-suggest** → Accepted: Covers the most common hedging approaches. Custom builder allows any strategy.
