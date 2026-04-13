# Known Concerns

## All RectItem components re-render when a new rect is added

**Observed:** When `store.rects.push(...)` adds a new rect, React DevTools
Profiler shows ALL existing RectItem components re-rendering, not just the
new one mounting.

**Expected:** Only the new RectItem should mount. Existing RectItems should
be skipped by observer's auto-memo because their `rect` prop reference
should be stable across renders.

**Verified ruled out:**
- Not StrictMode amplification (disabled, behavior unchanged)
- Console.log statements (removed, behavior unchanged)
- Selection change does NOT trigger this (only array mutation does)

**Impact:** Low. Output is visually identical — all rects use stable seeds,
so rough.js produces identical paths. Only wasted React reconciliation
work, no visible flicker.

**Hypothesis (unverified):** observer's auto-memo may not skip when the
parent's MobX reaction triggered the re-render, OR the observable array
iteration may return non-stable rect references in some condition.

**To investigate:** Add `trace()` inside RectItem to identify which
observable triggered each re-render. Compare rect references across
renders to confirm reference stability.
