## 1. Shared Components

- [x] 1.1 Create `src/components/widgets/DeltaSelector.tsx` — MUI Select with delta options (10, 15, 20, 25, 30, 40, 50, 70), default 25

## 2. Hook Up Real API Data

- [x] 2.1 Update `IV30Widget.tsx` — replace dummy data with `useOptionHistoricalVolatility`, add toolbar with delta/expiry/DTE controls
- [x] 2.2 Update `ExpectedMoveWidget.tsx` — replace dummy data with `useExpectedMove`, add expiry mode dropdown
- [x] 2.3 Update `DeltaIVWidget.tsx` — replace dummy data with `useOptionsStats`, use `cd`/`pd` arrays
- [x] 2.4 Update `ATMDeltaWidget.tsx` — replace dummy data with `useOptionsStats`, use `cd` array
- [x] 2.5 Update `IVRankWidget.tsx` — replace dummy data with `useOptionHistoricalVolatility`, add toolbar with delta/expiry/DTE controls

## 3. Polish

- [x] 3.1 Verify loading and error states display correctly
- [x] 3.2 Verify no TypeScript errors
- [x] 3.3 Test with a real symbol (e.g., AAPL) to confirm data loads
