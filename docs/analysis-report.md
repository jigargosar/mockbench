# Analysis Reports

## store.ts and App.tsx audit

**Date:** 2026-04-13 08:05 IST
**Commit:** f0b905bf4ddf27c6986bcaa30af2de50b6d8b5ec (Encapsulate store — private state, handle* public API, state invariant)
**Branch:** main
**Working tree:** clean

### store.ts observations

1. handleKeyDown on line 97-106 has inline delete logic that
   doesn't read like it belongs next to mouse handlers.
   The mouse handlers talk about drawing; this one talks about
   keys AND array splicing AND selectedId management.

2. Two different "reset selectedId" patterns:
   — this.selectedId = null  (handleMouseDown, handleKeyDown Escape)
   — Same thing written twice in handleKeyDown Delete branch
   Reading the 'Delete' branch requires parsing 3 separate checks
   and 2 mutations.

3. drawingBounds return type vs Rect type:
   bounds: { x, y, w, h }
   Rect:   { id, x, y, w, h, seed }
   When constructing a Rect, we spread bounds + id + seed.
   Works, but reader has to connect three shapes mentally.

4. previewRect return shape (line 62) is Rect minus id.
   This shape is unnamed. Appears again as the prop type of RoughRect.
   Shape is implicit across three locations.

5. The reaction on line 44-49 guards an invariant that the three
   actions (handleMouseDown, handleMouseUp, handleKeyDown) already
   maintain. It's a safety net for bugs that don't exist yet.

6. Magic number 10000 in seed generation (line 78).
   Same pattern would exist for any new shape type with a seed.

### App.tsx observations

7. Three mouse handlers in JSX (lines 77-79) have near-identical
   shape. Two of them are the same pattern, the third is different.
   Visual weight doesn't match structural weight.

8. RoughRect is called three times with 5 positional props each
   (lines 27, 82). The prop list repeats {x, y, w, h, seed}
   exactly. Any new shape attribute has to be added in 4 places:
   RoughRect type, three call sites.

9. pointFromEvent is defined inside App (line 68) but doesn't
   depend on anything App-specific. Reads like a pure util
   buried in a component.

10. The autorun+ref+local-variable pattern on lines 50-66 works
    but is architecturally loud — 7 lines of machinery to avoid
    one MobX warning.

11. Preview and SelectionBorder take store as prop, then
    immediately read one property off it. Feels like they
    should take the property directly, but that would break
    reactivity.

### Cross-cutting

12. Three shapes floating around with overlapping fields:
    — Rect { id, x, y, w, h, seed }
    — previewRect return { x, y, w, h, seed }
    — RoughRect props { x, y, w, h, seed }
    — drawingBounds return { x, y, w, h }
    Each is ad-hoc. None reference each other.

13. Comments: zero. Not necessarily bad, but means intent has
    to be inferred from names for everything (e.g., why
    w > 2 && h > 2 in handleMouseUp — minimum rect size?).
