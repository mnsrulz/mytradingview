## Context

The pricing page (`/options/pricing/[symbol]`) shows a full option chain for a single symbol via `useOptionTrackerV2` → `getOptionsPricing` (`src/lib/mzDataService.ts:92`), which hits the external MZ data service `https://mztradingdata.netlify.app/api/options/{symbol}/pricing` and returns `OptionsPricingDataResponse = { spotPrice, options[expiry].c|p[strike], timestamp }` (`src/lib/types.ts:213`). Each quote is `OptionsQuote = { a, b, l, oi, v }` (ask, bid, last, open interest, volume) — no greeks.

Put return math already exists in `src/lib/optionsPricing/calculator.ts`: total return for a put is `premium / strike` (capital at risk = strike). This change reuses that concept across many symbols at once.

Constraints:
- Client must not hit external services directly in RSC pages; existing pattern is client components calling `mzDataService` functions (see `StockOptionsView`, `useOptionTrackerV2`).
- Charts are rendered with MUI X Charts (already a dependency); the project also has uPlot and lightweight-charts, but a scatter is not their strength.
- `nuqs` is the established URL-state pattern (`useQueryState`) for page controls.

## Goals / Non-Goals

**Goals:**
- Compare put-selling premium % across up to 10 symbols in one view.
- Let the user choose the move % band (two-value range), expiry, and price mode.
- Answer: "if the stock moves X%, I collect Y% premium by selling the put."
- One dot per real strike inside the chosen move range.

**Non-Goals:**
- No greeks/IV data (source doesn't provide it) — delta-based strike selection is out of scope.
- No click-to-navigate (tooltip only).
- Only the symbol list persists; other controls (move range, expiry, price mode) are not persisted.
- No changes to existing pricing page or API routes.

## Decisions

### 1. New top-level route: `/put-premium`
A dedicated page `src/app/put-premium/page.tsx` renders a single client component (e.g. `PutPremiumScreener`) that owns all state and the chart. Top-level (not under `/options`) per the user's choice.

Rationale: keeps the screener independent; avoids complicating the existing `/options/pricing` flow. Alternative considered (embedding in the pricing page) was rejected by the user.

### 2. Data fetching: one `getOptionsPricing` call per symbol, in parallel
A hook (e.g. `usePutPremiumData(symbols, refreshToken)`) calls `getOptionsPricing(symbol)` for each symbol with `Promise.all`, returning `{ data: Map<symbol, OptionsPricingDataResponse>, loading, errors }`. This mirrors `useOptionTrackerV2` (`src/lib/hooks.ts:628`) and reuses the exact pricing-page source.

Rationale: guarantees identical numbers between the screener and the pricing page. Alternative (a new batch endpoint on the data service) was rejected — external service is not editable in this repo and the request rate (≤10) is acceptable.

### 3. Symbol input: chip autocomplete, max 10
Reuse `useTickerSearch`/`searchTicker` (MUI `Autocomplete`, debounced) to add validated symbols; render as chips; cap at 10 with a disabled state + hint once the cap is reached.

### 4. Move % range: two-value control
A two-handle slider (or two `TextField`s) producing a range like `-10%` to `-35%` (downside moves). Internally stored as a `NumberRange` of absolute move percents (e.g. `{ start: 10, end: 35 }`). The move % is interpreted as a decline from spot: `strike = spotPrice * (1 - movePct/100)`. Strikes included are those real strikes whose `move% = (spot - strike)/spot` falls within `[start, end]`.

Rationale: matches the user's mental model ("10% up or down" band) and the existing `NumberRange` type used by `StrikePriceRangePicker`.

### 5. Expiry dropdown
Built from the **union** of expiry keys across all loaded symbols' `options` records, sorted. When the user picks an expiry, each symbol uses the closest expiry `>=` the selected date (or exact match); symbols without one are skipped and reported as warnings.

Rationale: different symbols share standard expiries but not always; a common set keeps the chart comparable. Alternative (per-symbol DTE targeting) adds complexity without a clear win here.

### 6. Price mode dropdown, default BID
Reuse `PriceModeTypeEnum` (`src/lib/types.ts:88`) with a `Select`/`ToggleButton`; map to quote fields exactly like `getPriceByMode` in `calculator.ts:10` (`a`, `b`, `l`, or `(a+b)/2`). Default `BID_PRICE` since a seller receives the bid.

### 7. Computation: `premium% = premium / strike`
For each symbol/expiry/strike triple: `premium = priceByMode(quote.p[strike])`, `movePct = (spot - strike)/spot * 100`, `premiumPct = premium / strike * 100`. Modeled directly on `getValueByMode` TOTAL_RETURN branch (`calculator.ts:39-40`), omitting the target-price/assignment-loss logic (strike is the user's chosen buffer).

### 8. Chart: MUI X `ScatterChart`
`ScatterChart` from `@mui/x-charts` renders the "dotted" chart: x = move % (decline from spot), y = premium %. One series per symbol (distinct color) so symbols are identifiable; `ChartsTooltip` shows symbol, strike, move %, premium %, and premium $ per dot.

Rationale: free (MIT), already a dependency, native scatter + tooltips, fits the MUI patterns used in `PutCallRatio`/`OptionsStats`. Alternatives considered: uPlot (time-series focus, manual tooltips) and lightweight-charts (line/candlestick only).

### 9. Warnings, not failures
Symbols that error, have no data, lack the selected expiry, or have no strikes in range are collected into a `warnings` list rendered under the chart. A failed symbol never aborts the whole screen. Empty/loading states shown via MUI `LinearProgress` and an empty-state message.

### 10. Controls state via `nuqs`
`symbols` (comma-joined), `moveMin`, `moveMax`, `expiry`, and `pricemode` held in URL search params via `useQueryState` so the view is shareable — matching `StockOptionsView` conventions.

### 11. Symbol list persistence via `localStorage`
The symbol list is mirrored to `localStorage` under a fixed key (e.g. `put-premium-symbols`) using the existing `useLocalStorage` hook from `@uidotdev/usehooks` — the same hook already used by `useMultiWatchlists`/`useMyLocalWatchList` (`src/lib/hooks.ts:104,143`). The hook handles SSR-safe hydration and re-render on change; a reset button clears the list by writing the empty/default value.

Rationale: symbols are the part of the screener most likely to be reused across visits, so persisting them saves re-entry with no server or DB changes. Reusing `useLocalStorage` keeps consistency with existing hooks and avoids custom read/write/parse code. Alternative considered (server-side persistence via Prisma/NextAuth) was rejected — this is a per-browser, anonymous preference and doesn't warrant a schema change. Only the symbol list is persisted, keeping the design minimal; other controls stay in URL params.

## Risks / Trade-offs

- [External data service is the single source; if it is down or returns no data, the screener is empty] → per-symbol warning list + clear error/empty states; same dependency the pricing page already has.
- [Rate limiting by the external service for ≤10 simultaneous calls] → `Promise.all` with `ky` retry already configured (`mzDataService.ts:16-21`); cap of 10 symbols bounds the fan-out.
- [Symbols share the same move range but strikes are discrete; some symbols may have no strikes in the range] → per-symbol warnings and empty-state handling.
- [Scatter with per-symbol series could be visually dense at 10 symbols] → distinct colors + tooltip-only; revisit with legend if needed.
- [Expiry union may be large across 10 symbols] → sorted dropdown; user picks one common expiry.
- [Stale or corrupted `localStorage` symbol list] → validate/hydrate defensively (dedupe, cap at 10, ignore parse errors) and expose the reset button.
- [`localStorage` unavailable (private mode / SSR mismatch)] → `useLocalStorage` handles SSR safety; page still works without persistence.

## Migration Plan

- Additive only: new route, new components, new hook. No existing behavior changes.
- No database, API, or dependency changes (MUI X Charts already present).
- Rollback: revert the new files; nothing else is touched.

## Open Questions

- Whether the move % range slider should use discrete steps (e.g., 5% increments) or a free slider — recommend free slider with min/max clamps (1%–50%).
- Exact page label/navigation entry (top nav or standalone route) — route chosen as `/put-premium`; nav placement can be a follow-up.