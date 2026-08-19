## Why

Manually checking put-selling premium symbol-by-symbol on the pricing page is tedious. Sellers need to compare multiple stocks at a glance to find which ones pay the best premium for a given expected move — e.g., "if this stock moves 10%, I collect 1% in premium." Today there is no way to compare put premium across tickers in one view.

## What Changes

- Add a new top-level page that screens put-selling candidates across up to 10 symbols at once.
- Allow the user to enter a list of symbols (capped at 10) and set:
  - a move % range (two-value control, e.g., -10% to -35% below spot),
  - an expiry chosen from a dropdown,
  - a price mode (last / bid / ask / mid), defaulting to bid.
- Fetch pricing for each symbol using the same data source as the pricing page (`getOptionsPricing`).
- For each real strike within the move % range, compute `move% = (spot − strike) / spot` and `premium% = premium / strike` and plot one dot on a scatter chart.
- Render the results as a dotted scatter chart (MUI X `ScatterChart`) with tooltips; symbols with no applicable data are surfaced as warnings instead of failing the whole request.
- Persist the symbol list in `localStorage` so it survives page reloads and browser sessions, with a reset button to clear it.

## Capabilities

### New Capabilities
- `put-premium-screener`: Multi-symbol put premium comparison — symbol list input, move % range, expiry and price mode selection, per-strike premium % computation, and scatter chart visualization with tooltips. The symbol list persists locally and can be reset.

### Modified Capabilities
<!-- No existing specs are changing. -->

## Impact

- New top-level page/route under `src/app/` (e.g. `/put-premium`).
- New client component(s) under `src/components/` for symbol list input, controls, and the scatter chart.
- Browser `localStorage` for persisting the symbol list between sessions.
- Reuses existing data plumbing: `getOptionsPricing` (`src/lib/mzDataService.ts`), `OptionsPricingDataResponse` (`src/lib/types.ts`), and MUI X Charts (already a dependency).
- No changes to existing API routes, database schema, or external services.