## Context

The beta symbol page (`/beta/[symbol]`) shows 4 hardcoded feature cards. Traders want key metrics at a glance without navigating away. The codebase has data fetching hooks (`useOptionHistoricalVolatility`, `useExpectedMove`, `useOptionsStats`) ready to use. This change hooks the widgets to real API data and adds per-widget controls for customization.

## Goals / Non-Goals

**Goals:**
- Hook all 5 widgets to real API data from `src/lib/socket.ts`
- Add per-widget controls: delta selector, expiry mode, DTE/expiration
- IV30 and IVRank remain wide (2 cols) to accommodate toolbar
- Keep existing `WidgetShell`, `Sparkline`, `TimeframeSelector` components

**Non-Goals:**
- Widget add/remove or configuration persistence
- URL state for widget config
- Drag-and-drop or resizing

## Decisions

### 1. Real API Integration

**Decision:** Each widget calls its existing hook directly with appropriate parameters.

**Rationale:** Hooks already handle loading/error states. No wrapper layer needed.

Hook mapping:
- IV30 → `useOptionHistoricalVolatility(symbol, lookbackDays, delta, strike, expiration, mode, dte, expiryMode)`
- ExpectedMove → `useExpectedMove(symbol, lookbackDays, expiryMode)`
- DeltaIV → `useOptionsStats(symbol, lookbackDays)`
- ATMDelta → `useOptionsStats(symbol, lookbackDays)`
- IVRank → `useOptionHistoricalVolatility(symbol, lookbackDays, delta, strike, expiration, mode, dte, expiryMode)`

### 2. Per-Widget Controls

**Decision:** IV30 and IVRank get toolbar with delta, expiry mode, and DTE/expiration dropdowns. ExpectedMove gets a single expiry mode dropdown.

**Rationale:** These parameters affect the data significantly. Traders need to customize them per metric.

### 3. Default Parameters

**Decision:** Default to delta=25, rolling expiry mode, DTE=30.

**Rationale:** These are the most commonly used settings for options analysis.

### 4. Delta Selector Reuse

**Decision:** Create a shared `DeltaSelector` component used by both IV30 and IVRank widgets.

**Rationale:** Same dropdown (10, 15, 20, 25, 30, 40, 50, 70) used in both places.

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Timeframe: [1m] [3m] [6m] [1y]                    │
├───────────────────────────────────┬─────────────────┤
│  IV30  [Delta: 25▾] [Rolling▾]   │  Expected Move  │
│  ╭────────────────────╮  [DTE:30] │  [Monthly▾]     │
│  │  sparkline          │          │  3.2%            │
│  ╰────────────────────╯           │  $6.06           │
│  28.4%                            │                 │
├─────────────┬─────────────────────┼─────────────────┤
│  25Δ IV     │  ATM Delta          │  IV Rank        │
│  Call: 31.2 │  -0.48              │  ██████░░ 72    │
│  Put: 26.8  │                     │  [toolbar]      │
└─────────────┴─────────────────────┴─────────────────┘
```

## Risks / Trade-offs

- **[Risk]** Multiple widgets fetching simultaneously could hit API rate limits → **Mitigation:** Hooks handle this internally with debouncing
- **[Risk]** Hook params may fail for some symbols → **Mitigation:** Widgets show error state via WidgetShell
- **[Trade-off]** More complex widget UI with controls → Acceptable for trader workflow
