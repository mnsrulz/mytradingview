## Why

The offline research pass produced a validated "bull-run entry" checklist (cheap IV30 percentile + quiet positioning + call-wing bid + uptrend gate) that currently lives only as SQL files outside the app. Traders browsing the Symbol Explorer have no way to see, for the symbol they are viewing, whether this entry signal is on for the latest week.

## What Changes

- Add a new client-side data layer that runs the bull-run series SQL through the existing dynamic query capability (`dynamic-sql-query` request type) and normalizes/derives the live badge, signal history, and backtest tallies.
- Add a "Bull-Run Signal" widget to the Metrics grid on `/beta/[symbol]` showing ON/OFF for the latest week, score, checklist boxes, trend gate, and a backtest summary line.
- Add an ON/OFF status chip in the `/beta/[symbol]` header next to the price, linking to the detail page.
- Add a fifth Analytics feature card ("Bull-Run Signal") on `/beta/[symbol]`.
- Add a detail page `/beta/[symbol]/signal` with the status header, checklist, backtest stats, price/score charts with signal markers, and the weekly history table.

## Capabilities

### New Capabilities
- `bull-run-signal`: The bull-run entry signal — weekly score/boxes/trend computation, the live ON/OFF rule, derived backtest statistics, and its presentation surfaces (widget, header chip, detail page) in the Symbol Explorer.

### Modified Capabilities

(No existing spec-level requirements change.)

## Impact

- `src/lib/bullrun/` (new): SQL constant, types, normalization, summary/tally derivation, `useBullRunSignal` hook
- `src/components/widgets/BullRunSignalWidget.tsx` (new) + `WidgetGrid.tsx` registration
- `src/app/beta/[symbol]/SymbolOverview.tsx`: header chip + fifth feature card
- `src/app/beta/[symbol]/signal/` (new): detail page
- Data path: existing `dynamic-sql-query` request type against `NEXT_PUBLIC_MZINGEST_URL` (no new backend, API route, or environment variables)
- Follow-up (out of scope): promote the SQL into an `mzworker-go signal` command / dedicated request type
