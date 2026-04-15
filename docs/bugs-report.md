1. [MITIGATED — 83f10da] mouseup outside the SVG orphans `drawing` forever. `src/App.tsx:80`, `src/store.ts:39, 84-91`. `onMouseUp` is bound on the SVG only. Mousedown on the SVG, drag outside the element or the window, release — `mouseup` fires on whatever the cursor is over, `handleMouseUp` never runs. `drawing` stays non-null; the preview rect follows the mouse forever; the next mousedown hitting an existing rect sets `selectedId` while `drawing` is still live, violating the invariant and triggering #3. verified. Self-heal: `handleMouseDown` now calls `finishDrawing()` when `drawing !== null` before proceeding, so the next mousedown commits or discards the orphan. Ghost preview still follows the cursor until the next click — structural fix (pointer capture) deferred.

2. [DONE — 08b6126] Right-click / middle-click on empty canvas starts a draw. Guard `if (button !== 0) return` moved into `handleMouseDown` via the new `MouseInput` type. Right/middle clicks are now no-ops. verified.

3. [DONE — b7c6d4e] Invariant reaction throws with no error boundary. Reaction removed; replaced with a DEV-gated `intercept(this, ...)` in the constructor that vetoes invalid mutations synchronously before they commit. No prod crash path — the entire invariant block is gated on `import.meta.env.DEV`.

4. [DONE — b7c6d4e] `reaction` in `CanvasStore` constructor is never disposed. Intercepts are scoped to the observable and die with it, no disposer to track. Rule 37 no longer relevant for this code path.

5. [DONE — b7c6d4e] Invariant guarded by the reaction is already maintained by the actions. The reaction is gone; the replacement intercept is a dev-only assertion (per CLAUDE.md scope implies invariants will multiply as the app grows, a standing tripwire is worth keeping).

8. [DONE — 08b6126] Escape mid-draw doesn't cancel the draw. `handleKeyDown` Escape branch now drops `drawing` if non-null, otherwise clears `selectedId`.

10. [DEFERRED] No `touch-action` or `user-select: none`. `src/App.tsx:74-85`, `src/global.css:1`. Touch devices scroll instead of drawing (mouse-only handlers + missing `touch-action: none`). Desktop click-drag can select adjacent text mid-stroke. verified. Revisit when pan/zoom / infinite canvas lands — that's when scroll behavior becomes relevant.

12. [DONE] `App` wrapped in `observer`. Reads no observables today, but the first direct read added to `App` would throw in DEV (via `observableRequiresReaction`) and silently return stale data in PROD. Wrapping is a cheap defense against a known dev/prod-asymmetric failure mode — YAGNI is for speculative features, not landmines.

13. [PENDING] `rects` field is public — breaks the "encapsulate store" invariant. `src/store.ts:38`. Commit `f0b905b` ("Encapsulate store — private state, handle* public API") made `drawing` and `selectedId` private but left `rects` public. Any caller can `store.rects.push(...)`, bypassing action enforcement and the invariant intercept. verified.

14. [PENDING] `key={i}` for rough.js path list. `src/App.tsx:13`. `generator.toPaths(...)` returns a variable-length array. Index keys are forbidden by rule 9/25. If roughjs ever returns a different path count for the same rect (upgrade, option change), React reuses the wrong `<path>` node for a frame. verified.

15. [PENDING] Seed space is only 10,000 values; seed=0 is special-cased by roughjs. `src/store.ts:74`. `Math.floor(Math.random() * 10000)`. At ~30 rects the birthday-paradox collision probability is ~4%; collisions produce visually identical stroke jitter. If the result is exactly 0, roughjs treats seed=0 as "generate a new random seed each call" — strokes jitter on every re-render. verified (10k space); looks-right (seed=0 behavior).

16. [PENDING] `previewRect` guard allows `NaN` coordinates through. `src/store.ts:58-63`. Guard is `b.w <= 0 || b.h <= 0`. `NaN <= 0` is `false`, so if `x` or `y` is ever `NaN` (e.g., `getBoundingClientRect()` returns zeros during a layout race on mount), the computed returns a rect with `NaN` fields, which roughjs passes through to a broken SVG path silently. sure.

17. [PENDING] `toMouseInput` uses `getBoundingClientRect` with no handling of SVG `viewBox` or CSS transforms. `src/App.tsx:69-72`. Works today because the SVG has no `viewBox` and no ancestor transforms. The moment either is added (zoom, pan, responsive scaling), client-pixel coords no longer match SVG user-space coords, and every mouse position is offset by the `viewBox / box.width` ratio. looks-right.

18. [PENDING] Three overlapping shapes for the same conceptual rect. `src/store.ts:3-10, 20-27, 58`, `src/App.tsx:9`. `Rect { id, x, y, w, h, seed }`, `drawingBounds` return `{ x, y, w, h }`, `previewRect` return `{ x, y, w, h, seed }`, `RoughRect` props `{ x, y, w, h, seed }`. Each is declared ad-hoc; none reference each other. Adding a field means editing four sites, easy to miss one. looks-right.

19. [PARTIAL — 08b6126] `pointFromEvent` defined inside `App` but depends on nothing App-specific. Renamed to `toMouseInput` and returns the shared `MouseInput` type from the store — output is no longer ad-hoc. Still physically defined inside the App function; move-to-util is pending if we ever need it from elsewhere.

20. [PARTIAL — b7c6d4e / 08b6126] Zero comments in either file. Added: invariant-intercept purpose (`store.ts`), Delete/Backspace platform reason, and Escape-cancel semantics (`store.ts handleKeyDown`). Still magic: the `w > 2 && h > 2` threshold in `finishDrawing` and the 4px inflation in `SelectionBorder`. Seed `10000` has been noted in #15.

21. [DONE — 08b6126] Three inline mouse handlers had near-identical shape but weren't symmetric. All three now uniform: `store.handleXxx(toMouseInput(e))`. Store-side handlers all take `MouseInput`.

22. [PENDING] `RoughRect` takes five positional-in-type props that are always dereferenced from the same shape. `src/App.tsx:9, 21, 37`. Any new rect attribute has to be added in three places: `RoughRect` type, `RectItem`'s dereference, `Preview`'s dereference. After the list-extraction refactor this is already down from four sites to three; one more step (pass `rect` or `preview` as a single prop) would bring it to one. Design pressure, not a bug. verified.
