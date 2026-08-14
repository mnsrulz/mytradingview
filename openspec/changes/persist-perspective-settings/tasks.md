## 1. Database Schema

- [ ] 1.1 Add `perspectiveSettings Json?` field to `SavedQuery` model in `prisma/schema.prisma`
- [ ] 1.2 Run `npx prisma migrate dev --name add_perspective_settings` to create migration
- [ ] 1.3 Run `npx prisma generate` to regenerate client

## 2. API Layer

- [ ] 2.1 Update `POST /api/queries` route to accept and store `perspectiveSettings` field
- [ ] 2.2 Update `PUT /api/queries/[queryId]` route to accept and store `perspectiveSettings` field
- [ ] 2.3 Update `GET /api/queries` and `GET /api/queries/[queryId]` routes to return `perspectiveSettings` field

## 3. PerspectiveWrapper Component

- [ ] 3.1 Add `onSettingsChange` callback prop to `PerspectiveWrapper` component
- [ ] 3.2 Subscribe to perspective viewer config change events and invoke callback with serialized settings
- [ ] 3.3 Add `initialSettings` prop to restore viewer configuration on mount

## 4. SQL Playground State

- [ ] 4.1 Add `perspectiveSettings?: Record<string, unknown>` field to `PlaygroundTab` type
- [ ] 4.2 Update tab creation to initialize `perspectiveSettings` as undefined
- [ ] 4.3 Wire `PerspectiveWrapper` `onSettingsChange` to update active tab's `perspectiveSettings` state

## 5. Save/Load Integration

- [ ] 5.1 Update `saveQuery` call in SqlPlayground to include `perspectiveSettings` from active tab
- [ ] 5.2 Update `useSavedQueries` hook to pass `perspectiveSettings` in save payload
- [ ] 5.3 Update query load handler to restore `perspectiveSettings` into tab state
- [ ] 5.4 Pass loaded `perspectiveSettings` to `PerspectiveWrapper` as `initialSettings`

## 6. Cleanup

- [ ] 6.1 Verify lint passes (`npm run lint`)
- [ ] 6.2 Test save/load cycle with perspective settings
- [ ] 6.3 Test tab switching preserves per-tab settings
