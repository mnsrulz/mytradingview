## 1. Results Panel Layout

- [x] 1.1 Update the results `Paper` in `SqlPlayground.tsx` to be a full-height flex container (`height: '100%'`, `display: 'flex'`, `flexDirection: 'column'`)
- [x] 1.2 Ensure the results `Panel` propagates height to its child (full height, no overflow)

## 2. Grid View

- [x] 2.1 Remove `autoHeight` from the `DataGrid` so it fills the flex container
- [x] 2.2 Add flex sizing (`flex: 1`, `minHeight: 0`) to the `DataGrid` so it scrolls internally when rows overflow

## 3. Perspective View

- [x] 3.1 Change the Perspective container `Box` from `height: '65vh'` to `height: '100%'`
- [x] 3.2 Verify the container still enforces a minimum usable height so the viewer renders correctly on very small panels

## 4. Non-result States

- [x] 4.1 Wrap error, loading, and empty states in a full-height flex area that centers content without overflow

## 5. Verification

- [x] 5.1 Run `npm run lint`
- [x] 5.2 Manually verify Grid and Perspective views fill the results panel and resize correctly when dragging the splitter