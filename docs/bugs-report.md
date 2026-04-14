1. mouseup outside the SVG orphans `drawing` forever. `src/App.tsx:80`, `src/store.ts:39, 84-91`. `onMouseUp` is bound on the SVG only. Mousedown on the SVG, drag outside the element or the window, release — `mouseup` fires on whatever the cursor is over, `handleMouseUp` never runs. `drawing` stays non-null; the preview rect follows the mouse forever; the next mousedown hitting an existing rect sets `selectedId` while `drawing` is still live, violating the invariant and triggering #3. verified.

2. Right-click / middle-click on empty canvas starts a draw. `src/App.tsx:78`, `src/store.ts:65-76`. No `event.button` guard. Right-click assigns `drawing`, then the context menu consumes the follow-up `mouseup` — same orphaned-draw state as #1. verified.

3. Invariant reaction throws with no error boundary. `src/store.ts:44-49`, `src/main.tsx:13, 20-24`. No `ErrorBoundary` anywhere. In DEV, `disableErrorBoundaries: true` propagates the throw out of MobX synchronously; in PROD the `configure` block is skipped but the tree still has no boundary — React unmounts the whole app. The reaction also fires after the offending action commits, so it can only crash in response to bad state, not prevent it. Combined with #1, a single drag-outside-canvas crashes production. verified.

4. `reaction` in `CanvasStore` constructor is never disposed. `src/store.ts:44-49`, `src/App.tsx:58`, `src/main.tsx:21`. Disposer discarded. Under `StrictMode`, `App` mounts → unmounts → mounts; each mount's `useState(() => new CanvasStore())` constructs a fresh store, but the discarded store's reaction is still subscribed and pins the discarded instance in memory. Violates rule 37. verified.

5. Invariant guarded by the reaction is already maintained by the actions themselves. `src/store.ts:44-49, 65-76`. `handleMouseDown` sets `selectedId = null` before assigning `drawing`. No action path leaves both non-null. The reaction is a safety net for bugs that don't exist — but it is the mechanism by which #1 and #2 escalate from "stuck preview" to "crashed tab." The reaction is actively harmful, not just redundant. verified.

6. `SelectionBorder` extends 4px past the rect, but `hitTest` uses rect bounds only. `src/App.tsx:40-55, 78`, `src/store.ts:29-35`. Border is drawn at `sel.x - 4, sel.y - 4, sel.w + 8, sel.h + 8`. Clicking on the visible dashed border (in the 4px ring outside the rect) misses `hitTest`, so `handleMouseDown` clears the selection and starts a new draw. The visual cue is a landmine — clicking it does the opposite of what it signals. verified.

7. `window` keydown listener steals Delete / Backspace / Escape from inputs. `src/App.tsx:60-67`. No `event.target` check. The app has no text inputs today, but the workspace scope in `CLAUDE.md` implies label editing, toolbar search, command palette. The first `<input>` added will have Delete/Backspace both edit text and delete the selected rect. verified.

8. Escape mid-draw doesn't cancel the draw. `src/App.tsx:63`, `src/store.ts:100-102`. `clearSelection` only nulls `selectedId`. During an active draw, `selectedId` is already null — Escape is a no-op. The preview rect keeps following the mouse until `mouseup`. Violates the universal "Escape cancels the current gesture" expectation. verified.

9. `crypto.randomUUID()` is undefined on non-secure contexts and older Safari. `src/store.ts:88`. Absent on plain `http://` origins (except localhost) and Safari < 15.4. The first `mouseup` that creates a rect throws `TypeError`. Landmine for any non-HTTPS staging / `file://` demo / corporate-HTTP deploy. verified.

10. No `touch-action` or `user-select: none`. `src/App.tsx:74-85`, `src/global.css:1`. Touch devices scroll instead of drawing (mouse-only handlers + missing `touch-action: none`). Desktop click-drag can select adjacent text mid-stroke. verified.

11. `enforceActions: 'always'` contradicts project rule 41. `src/main.tsx:9`. Rule 41 prescribes `'observed'`. Code uses `'always'` with no justifying comment. Trips the first time anyone constructs observable state outside an action. verified.

12. `App` is not wrapped in `observer`. `src/App.tsx:57`. Reads no observables today, so not currently broken. But `observableRequiresReaction: true` in DEV means the first direct observable read added to `App` throws in DEV and silently returns stale data in PROD — asymmetric dev/prod failure. Violates rule 1. verified.

13. `rects` field is public — breaks the "encapsulate store" invariant. `src/store.ts:38`. Commit `f0b905b` ("Encapsulate store — private state, handle* public API") made `drawing` and `selectedId` private but left `rects` public. Any caller can `store.rects.push(...)`, bypassing action enforcement and the invariant reaction. verified.

14. `key={i}` for rough.js path list. `src/App.tsx:13`. `generator.toPaths(...)` returns a variable-length array. Index keys are forbidden by rule 9/25. If roughjs ever returns a different path count for the same rect (upgrade, option change), React reuses the wrong `<path>` node for a frame. verified.

15. Seed space is only 10,000 values; seed=0 is special-cased by roughjs. `src/store.ts:74`. `Math.floor(Math.random() * 10000)`. At ~30 rects the birthday-paradox collision probability is ~4%; collisions produce visually identical stroke jitter. If the result is exactly 0, roughjs treats seed=0 as "generate a new random seed each call" — strokes jitter on every re-render. verified (10k space); looks-right (seed=0 behavior).

16. `previewRect` guard allows `NaN` coordinates through. `src/store.ts:58-63`. Guard is `b.w <= 0 || b.h <= 0`. `NaN <= 0` is `false`, so if `x` or `y` is ever `NaN` (e.g., `getBoundingClientRect()` returns zeros during a layout race on mount), the computed returns a rect with `NaN` fields, which roughjs passes through to a broken SVG path silently. sure.

17. `pointFromEvent` uses `getBoundingClientRect` with no handling of SVG `viewBox` or CSS transforms. `src/App.tsx:69-72`. Works today because the SVG has no `viewBox` and no ancestor transforms. The moment either is added (zoom, pan, responsive scaling), client-pixel coords no longer match SVG user-space coords, and every mouse position is offset by the `viewBox / box.width` ratio. looks-right.

18. Three overlapping shapes for the same conceptual rect. `src/store.ts:3-10, 20-27, 58`, `src/App.tsx:9`. `Rect { id, x, y, w, h, seed }`, `drawingBounds` return `{ x, y, w, h }`, `previewRect` return `{ x, y, w, h, seed }`, `RoughRect` props `{ x, y, w, h, seed }`. Each is declared ad-hoc; none reference each other. Adding a field means editing four sites, easy to miss one. looks-right.

19. `pointFromEvent` defined inside `App` but depends on nothing App-specific. `src/App.tsx:69-72`. Reads like a pure util buried in a component; also couples the util's signature to `MouseEvent<SVGSVGElement>` when it could take coords directly. Not a bug, but makes the event-model migration in #1 (pointer events) more invasive than it needs to be. verified.

20. Zero comments in either file. `src/store.ts`, `src/App.tsx`. Intent has to be inferred from names. The `w > 2 && h > 2` threshold in `handleMouseUp:87`, the 4px inflation in `SelectionBorder:45-48`, and the `10000` seed range in `store.ts:74` are all magic numbers whose intent is not in version control. Low priority but these numbers are exactly the kind that get blindly copied when the code is extended. verified.

21. Three inline mouse handlers on the `<svg>` have near-identical shape but aren't symmetric. `src/App.tsx:78-80`. `onMouseDown` and `onMouseMove` both do `const { x, y } = pointFromEvent(e); store.handleX(x, y)`; `onMouseUp` takes no args. Visual weight suggests three equivalent handlers, structural weight says two-plus-one. Mild readability trap for anyone skimming. verified.

22. `RoughRect` takes five positional-in-type props that are always dereferenced from the same shape. `src/App.tsx:9, 21, 37`. Any new rect attribute has to be added in three places: `RoughRect` type, `RectItem`'s dereference, `Preview`'s dereference. After the list-extraction refactor this is already down from four sites to three; one more step (pass `rect` or `preview` as a single prop) would bring it to one. Design pressure, not a bug. verified.
