## Why

The historical net value chart on the hedge page displays incorrect pricing for put credit and put debit spreads. The sign convention is inverted: debit strategies (which cost money) show as negative, and credit strategies (which receive money) show as positive. The desired convention is the opposite — debits positive, credits negative — to clearly represent net premium cost.

## What Changes

- Flip the sign multiplier in `calculateNetValue` from `BUY ? -1 : 1` to `BUY ? 1 : -1`
- Debit strategies will display as positive (above zero), credit strategies as negative (below zero)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `hedge-strategy-builder`: The chart sign convention is inverted — debits should show as positive and credits as negative

## Impact

- **Code**: `src/components/HedgeTracker/HedgeStrategyChart.tsx` — `calculateNetValue` function sign logic
- **User-facing**: All strategy charts will flip signs to correct convention
