## Tasks

- [ ] 1. Create `SavedStrategy` type and rename `useCustomStrategies` → `useSavedStrategies`
  - Define `SavedStrategy` type with id, symbol, name, source, strategyType, legs
  - Update hook to support both suggested and custom strategies
  - Add `saveSuggestedStrategy()` method
  - Update `addStrategy()` to accept `SavedStrategy`
  - Keep backward compatibility during transition

- [ ] 2. Create `HedgeStrategyDialog` component
  - Use Toolpad `DialogProps<P, R>` interface
  - Accept payload: `{ symbol, hedgeRatio, optionsChain }`
  - Tab 1: Suggested — call `generateHedgeSuggestions()`, render rows with Save button
  - Tab 2: Custom Builder — embed existing `HedgeStrategyBuilder`
  - Save action calls `onClose(savedStrategy)` to return result to caller
  - Cancel action calls `onClose(undefined)`

- [ ] 3. Create `SavedStrategyRow` component
  - Accept `SavedStrategy` and `symbol` props
  - Render type chip, name/label
  - For suggested (source='suggested'): show cost/credit, max loss, max gain, score
  - For custom (source='custom'): show legs summary
  - Toggle `HedgeStrategyChart` on click
  - Delete button to remove from saved list

- [ ] 4. Update `HedgePositionCard`
  - Add hedge icon button (Shield icon from MUI icons)
  - Use `useDialogs().open(HedgeStrategyDialog, payload)` on click
  - Render saved strategies via `SavedStrategyRow` list
  - Remove inline children slot and "Build Custom" button
  - Import `useSavedStrategies` for saved strategies

- [ ] 5. Simplify `HedgeTracker`
  - Remove `PositionWithHedges` component (or simplify to just pass saved strategies)
  - Remove inline suggestion rendering
  - Remove `useOptionsChain` from PositionWithHedges (moved to dialog)
  - Position card handles its own saved strategies via `useSavedStrategies`

- [ ] 6. Update exports in `index.ts`
  - Export new components: `HedgeStrategyDialog`, `SavedStrategyRow`
  - Export `SavedStrategy` type
  - Remove old exports if renamed

- [ ] 7. Clean up unused components
  - Remove `HedgeStrategyRow.tsx` (replaced by `SavedStrategyRow`)
  - Update any imports referencing old component names

- [ ] 8. Build and verify
  - Run `npm run build` to check for type errors
  - Verify page loads at `/portfolio/hedge`
  - Verify dialog opens on hedge icon click
  - Verify save/persist flow works
