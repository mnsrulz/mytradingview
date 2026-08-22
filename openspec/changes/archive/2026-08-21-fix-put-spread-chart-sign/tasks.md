## 1. Fix chart sign multiplier

- [x] 1.1 Flip the multiplier in `calculateNetValue` in `src/components/HedgeTracker/HedgeStrategyChart.tsx` from `leg.mode === 'BUY' ? -1 : 1` to `leg.mode === 'BUY' ? 1 : -1`

## 2. Verify

- [x] 2.1 Run `npm run lint` to confirm no lint errors
