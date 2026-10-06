## Why

The beta symbol page currently shows 4 hardcoded feature cards that navigate to separate pages. Traders need to see key metrics at a glance — IV30, 25-delta IV, ATM delta, IV rank, expected move — without navigating away. A static widget grid on the symbol page provides immediate visibility into the most important options metrics, powered by real API data with configurable controls per widget.

## What Changes

- Add a widget grid section to the beta symbol page displaying 5 metric widgets
- Each widget shows a specific options metric with real API data from existing hooks
- Global timeframe selector (1m / 3m / 6m / 1y) controls data range for all widgets
- IV30 and IVRank widgets include per-widget controls: delta selector, expiry mode, DTE/expiration
- ExpectedMove widget includes expiry mode selector (weekly/monthly)
- DeltaIV and ATMDelta widgets use aggregate stats (no extra controls needed)
- IV30 widget renders as a wide card (2 columns) with sparkline

## Capabilities

### New Capabilities
- `widget-system`: Widget shell component, sparkline, timeframe selector, responsive grid layout, delta selector
- `options-metrics`: Real API integration using `useOptionHistoricalVolatility`, `useExpectedMove`, `useOptionsStats`

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- Modified components in `src/components/widgets/`
- Changes to `src/app/beta/[symbol]/SymbolOverview.tsx` to render widget grid
- Leverages existing hooks from `src/lib/socket.ts`
- Uses MUI components (Card, ToggleButton, Select, Grid) for consistent styling
