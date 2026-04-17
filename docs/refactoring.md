# Refactoring Backlog

Technical improvements that don't add user-visible features.

1. Move rough.js `generator` from `src/App.tsx` into `src/store.ts`. Expose a minimal path/stroke list (e.g., `{ d, stroke, strokeWidth, fill, key }[]`) from the store. View becomes a thin SVG path renderer with no knowledge of `Rect`, `BoundingBox2d`, or rough.js internals. Decouples rendering intermediate from the model and sets up the clean-wireframe skin toggle (scope #60) without view rewrites.
