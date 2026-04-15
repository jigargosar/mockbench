1. [MITIGATED — 83f10da] mouseup outside the SVG orphans `drawing` forever. `src/App.tsx:80`, `src/store.ts:39, 84-91`. `onMouseUp` is bound on the SVG only. Mousedown on the SVG, drag outside the element or the window, release — `mouseup` fires on whatever the cursor is over, `handleMouseUp` never runs. `drawing` stays non-null; the preview rect follows the mouse forever; the next mousedown hitting an existing rect sets `selectedId` while `drawing` is still live, violating the invariant and triggering #3. verified. Self-heal: `handleMouseDown` now calls `finishDrawing()` when `drawing !== null` before proceeding, so the next mousedown commits or discards the orphan. Ghost preview still follows the cursor until the next click — structural fix (pointer capture) deferred.

2. [DONE — 08b6126] Right-click / middle-click on empty canvas starts a draw. Guard `if (button !== 0) return` moved into `handleMouseDown` via the new `MouseInput` type. Right/middle clicks are now no-ops. verified.

3. [DONE — b7c6d4e] Invariant reaction throws with no error boundary. Reaction removed; replaced with a DEV-gated `intercept(this, ...)` in the constructor that vetoes invalid mutations synchronously before they commit. No prod crash path — the entire invariant block is gated on `import.meta.env.DEV`.

4. [DONE — b7c6d4e] `reaction` in `CanvasStore` constructor is never disposed. Intercepts are scoped to the observable and die with it, no disposer to track. Rule 37 no longer relevant for this code path.

5. [DONE — b7c6d4e] Invariant guarded by the reaction is already maintained by the actions. The reaction is gone; the replacement intercept is a dev-only assertion (per CLAUDE.md scope implies invariants will multiply as the app grows, a standing tripwire is worth keeping).

8. [DONE — 08b6126] Escape mid-draw doesn't cancel the draw. `handleKeyDown` Escape branch now drops `drawing` if non-null, otherwise clears `selectedId`.

10. [DEFERRED] No `touch-action` or `user-select: none`. `src/App.tsx:74-85`, `src/global.css:1`. Touch devices scroll instead of drawing (mouse-only handlers + missing `touch-action: none`). Desktop click-drag can select adjacent text mid-stroke. verified. Revisit when pan/zoom / infinite canvas lands — that's when scroll behavior becomes relevant.

12. [DONE] `App` wrapped in `observer`. Reads no observables today, but the first direct read added to `App` would throw in DEV (via `observableRequiresReaction`) and silently return stale data in PROD. Wrapping is a cheap defense against a known dev/prod-asymmetric failure mode — YAGNI is for speculative features, not landmines.

13. [DONE] `rects` field public — addressed at the discipline level: global CLAUDE.md now states "models own their state and derivations; external code should treat them as readonly." Type-level enforcement can't fully prevent element-level mutation, so the fix is a standing rule, not code.

14. [DONE] `key={i}` for rough.js path list replaced with `key={p.d}` — stable per rect+seed, distinct across outline/fill paths.

15. [DONE] Seed generator replaced with `randomSeed()` — ~2 billion distinct values (`Math.floor(Math.random() * 2 ** 31) || 1`), `|| 1` excludes rough.js's seed=0 re-seed special case.

19. [PARTIAL — 08b6126] `pointFromEvent` defined inside `App` but depends on nothing App-specific. Renamed to `toMouseInput` and returns the shared `MouseInput` type from the store — output is no longer ad-hoc. Still physically defined inside the App function; move-to-util is pending if we ever need it from elsewhere.

20. [PARTIAL — b7c6d4e / 08b6126] Zero comments in either file. Added: invariant-intercept purpose (`store.ts`), Delete/Backspace platform reason, and Escape-cancel semantics (`store.ts handleKeyDown`). Still magic: the `w > 2 && h > 2` threshold in `finishDrawing` and the 4px inflation in `SelectionBorder`. Seed `10000` has been noted in #15.

21. [DONE — 08b6126] Three inline mouse handlers had near-identical shape but weren't symmetric. All three now uniform: `store.handleXxx(toMouseInput(e))`. Store-side handlers all take `MouseInput`.

