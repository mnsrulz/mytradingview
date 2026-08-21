## 1. Data hook

- [x] 1.1 Add `usePutPremiumData(symbols, refreshToken)` to `src/lib/hooks.ts` that calls `getOptionsPricing(symbol)` for each symbol via `Promise.all` and exposes `{ data: Map<symbol, OptionsPricingDataResponse>, isLoading, warnings }`, handling per-symbol failures as warnings
- [x] 1.2 Verify the hook re-fetches when the symbol list or a refresh token changes (mirror `useOptionTrackerV2` effect at `src/lib/hooks.ts:635`)

## 2. Page route

- [x] 2.1 Create `src/app/put-premium/page.tsx` as a client page rendering a single `PutPremiumScreener` component

## 3. Controls

- [x] 3.1 Build symbol chip input (MUI `Autocomplete` + `useTickerSearch`) that adds validated symbols up to a hard cap of 10, disabling further additions with a hint at the cap
- [x] 3.2 Add a two-value move % range control (slider or number fields) producing a `NumberRange` of downside percents (e.g. `-10%` to `-35%`), with min/max clamping
- [x] 3.3 Add an expiry dropdown built from the sorted union of expiry keys across all loaded symbols
- [x] 3.4 Add a price mode dropdown using `PriceModeTypeEnum` (LAST/BID/ASK/AVG), defaulting to `BID_PRICE`
- [x] 3.5 Wire all control state through `nuqs` `useQueryState` (symbols as comma-joined string, moveMin, moveMax, expiry, pricemode)
- [x] 3.6 Add symbol-list persistence via the existing `useLocalStorage` hook (`@uidotdev/usehooks`, as used in `src/lib/hooks.ts:104,143`) under a fixed key (e.g. `put-premium-symbols`), with defensive dedupe and cap to 10
- [x] 3.7 Initialize the symbol input from the `useLocalStorage` value and update it on every add/remove
- [x] 3.8 Add a reset button that clears the symbol list back to the default empty value

## 4. Computation

- [x] 4.1 Create a pure helper (e.g. `buildPutPremiumPoints`) that, per symbol/expiry, filters real strikes whose `movePct = (spot - strike)/spot * 100` falls within the selected range and computes `premium = priceByMode(quote.p[strike], priceMode)` and `premiumPct = premium / strike * 100`, reusing `getPriceByMode` from `src/lib/optionsPricing/calculator.ts`
- [x] 4.2 Resolve the selected expiry per symbol to the closest expiry `>=` the selection (or exact), and mark symbols without one as warnings

## 5. Chart

- [x] 5.1 Render an MUI X `ScatterChart` with x = move %, y = premium %, one series per symbol (distinct color), one dot per real strike
- [x] 5.2 Configure `ChartsTooltip` to show symbol, strike, move %, premium %, and premium $ per dot (tooltip only, no click navigation)
- [x] 5.3 Add loading (`LinearProgress`), empty (no data/expiry/strikes), and warnings states under the chart

## 6. Verification

- [ ] 6.1 Run `npm run lint` and fix any issues
- [ ] 6.2 Manually verify the page with multiple symbols: default bid pricing, move range changes recompute dots, expiry dropdown filters, warning list for symbols with no matching expiry
- [ ] 6.3 Manually verify persistence: symbols restore after reload, add/remove updates `localStorage`, and the reset button clears the saved list