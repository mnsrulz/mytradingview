## Context

The Symbol Explorer (`/beta`) is the app's per-symbol hub: a header with live price, Analytics feature cards, and a Metrics `WidgetGrid`. Options data widgets fetch through client hooks that ultimately hit the existing dynamic query capability — `runDynamicQuery(symbol, sql)` → POST `dynamic-sql-query` to `NEXT_PUBLIC_MZINGEST_URL` (`https://mzamqp.netlify.app/api`) → `{hasError, value}` with columnar results converted to row objects.

The bull-run signal has been developed and back-tested outside the app as SQL files (`mz-signal-series.sql` et al.) executed via `mzworker-go` against local ODATA parquet. The same SQL has been verified to run unchanged through `dynamic-sql-query` (92 rows, ~1.4s for IBIT), because both paths expose the same symbol-scoped `dataset` CTE.

Two quirks shape the design:

1. The service returns some integer columns (`score`, `b_*`, `vol_z`, …) as **strings**, while booleans (`trend_up`, `rule_pass`) arrive as real booleans.
2. The service dataset can be fresher than local ODATA, and may include a partial current week.

## Goals / Non-Goals

**Goals:**
- Show whether the bull-run signal is ON for the latest week on `/beta/[symbol]` (widget + header chip) with a full detail page behind a new feature card
- Reuse the existing dynamic query capability end-to-end — no new API routes, backend, env vars, or dependencies
- One request per symbol per page-view (shared cache across chip, widget, detail page)
- Graceful degradation: loading, query error, and insufficient-history states

**Non-Goals:**
- Universe-wide screening / signal column on the `/beta` home list
- Alerts or notifications when a signal turns ON
- Server-side caching or persistence of signal results
- Promoting the SQL into a backend request type or `mzworker-go` command (tracked as follow-up)

## Decisions

**D1 — Data path: client-side `runDynamicQuery`, not a new API route.**
An earlier draft shelled out to `mzworker-go` from a Next.js route (only works on the dev machine; Netlify prod has no binary/data). The app already owns a hosted dynamic SQL capability that executes the exact same scaffold. Reusing it works everywhere the app works and removes an entire server surface.
*Alternative rejected:* execFile-based API route (duplicates existing capability, local-only).

**D2 — SQL lives as a TS constant (`src/lib/bullrun/bullRunSeriesSql.ts`).**
Next/webpack has no `.sql` import loader; a template-literal constant keeps the query in one file, reviewable in diffs, and makes the follow-up refactor (swap constant for `mzworker-go signal` / dedicated request type) a one-file change.

**D3 — Normalize once at the boundary (`normalizeWeek`).**
All numeric fields are coerced with `Number()` and `NaN`/invalid rows are dropped; booleans pass through. Every consumer (widget, chip, charts, tally) sees a typed `BullRunWeek` with no string/number ambiguity. Rationale: the service's JSON typing is not under our control and may drift.

**D4 — Derive badge and tallies client-side from the full series.**
The series response already contains everything needed: latest row → badge; `score >= 3` rows with non-null `fwd4w_pct` → evaluable signals; `tally()` over all / cheap∧trend / cheap∧trend∧drought variants. Verified to reproduce `mz-signal-tally.sql` exactly. Keeps the contract to a single query.
*Alternative rejected:* separate status/tally queries (3× requests, more surface).

**D5 — Module-level same-day cache keyed `symbol` + data date.**
The chip, widget, and detail page all mount on the same navigation and would otherwise triple the query. A simple in-memory `Map` with a same-`asOfWeek` key (data updates daily) is sufficient; `sessionStorage`-level persistence is not needed for v1. Stale results within a day are acceptable — the badge is labeled with its `as of` week.

**D6 — ON/OFF is `rule_pass` of the latest row: `score >= 3 AND b_cheap AND trend_up`.**
This is the vetted rule (65% hit, +5.9% mean fwd4w in-sample on the original cross-section). Displayed backtest numbers always carry sample size and an "in-sample" hint so the beta is not mistaken for a guarantee.

## Risks / Trade-offs

- [Service schema drift (scaffold columns change)] → The SQL references only the documented `knownColumns` already listed in `SqlPlayground`; a failure surfaces as the widget's error state, not a crash.
- [String/number JSON typing varies by column or over time] → Single normalization point (D3) + row guard drops malformed rows; empty result renders as insufficient-history, not a wrong badge.
- [Partial current-week row changes the badge intraday] → Badge is labeled `as of {wk}`; cache keyed by week avoids flapping within a session.
- [Short-history symbols (e.g. XLU: 8 sessions)] → Insufficient-history state when rows < ~20 or z-scores are null; never renders a false OFF.
- [In-sample stats overstated by small n / overlapping windows] → Stats render with `n=` and an in-sample caption; spec requires it.
- [Query latency ~1.4s per symbol] → Single cached request per symbol; loading state in `WidgetShell`.

## Migration Plan

Purely additive — no existing behavior changes; rollback = remove the new files/registrations. No DB, env, or build changes.

## Open Questions

- Should the detail page chart also plot `ivpct`/skew series (query already returns them)? Deferred until after first visual review.
