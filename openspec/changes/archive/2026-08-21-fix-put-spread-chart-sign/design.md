## Context

The hedge page's historical net value chart (`HedgeStrategyChart.tsx`) calculates strategy value by summing each leg's close price multiplied by a BUY/SELL multiplier. The current multiplier is `leg.mode === 'BUY' ? -1 : 1`, which inverts the sign convention. The desired convention is: positive values = net debit (cost paid), negative values = net credit (premium received).

## Goals / Non-Goals

**Goals:**
- Correct the sign convention so debits show as positive and credits show as negative
- Apply uniformly across all strategy types (put spreads, call spreads, collars, multi-leg)

**Non-Goals:**
- Changing the chart rendering library or visual design
- Modifying the options pricing data source
- Refactoring the strategy builder UI or save logic
- Chart visual enhancements (zero line, labels) — to be addressed separately

## Decisions

**Decision: Flip the multiplier entirely**

Current code:
```typescript
const multiplier = leg.mode === 'BUY' ? -1 : 1
```

Proposed fix:
```typescript
const multiplier = leg.mode === 'BUY' ? 1 : -1
```

Rationale: The chart tracks net premium cost. A BUY leg adds to the cost (positive), a SELL leg reduces it (negative). Flipping the multiplier achieves the desired convention: debit strategies (net cost > 0) show positive, credit strategies (net cost < 0) show negative.

Alternatives considered:
- Per-type branching based on PUT/CALL — unnecessary since the simple flip works for all types
- Using a net credit/debit calculation — same result, more code

## Risks / Trade-offs

- [Risk] Existing saved strategies in localStorage may display with flipped signs → Mitigation: Chart recalculates from OHLC data on render, so saved data is unaffected. No migration needed.
- [Risk] Users accustomed to old sign convention may be confused → Mitigation: The old convention was wrong; this is a bug fix.
