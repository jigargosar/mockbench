## Clicking the selection-border halo starts a new draw

`SelectionBorder` draws at `sel.x - 4, sel.y - 4, sel.w + 8, sel.h + 8`. `hitTest` uses rect bounds only, so a click in the 4px halo misses the rect, clears selection, starts a new draw. Accepted for now.

## `crypto.randomUUID()` throws on non-secure contexts

`finishDrawing` calls `crypto.randomUUID()`, undefined on plain HTTP origins (except `localhost`/`127.0.0.1`). Accepted: deployment is HTTPS, dev uses `localhost`. Swap to `uuid`/`nanoid` when an actual non-secure-context access path is needed.

## `window` keydown handler fires inside inputs

App has no text inputs today. When the first `<input>` / `<textarea>` / contenteditable is added, pressing Delete/Backspace inside it will both edit text AND delete the selected rect. Visible on first use — will fix then by adding a target guard in App.tsx before forwarding to `store.handleKeyDown`.

## `previewRect` doesn't guard against NaN coords

Theoretical concern only. No realistic path produces NaN: `e.clientX/Y` is always numeric on real events, and `getBoundingClientRect()` returns zeros (not NaN) on detached / `display: none` elements. Skipped.

## `toMouseInput` doesn't handle SVG viewBox / CSS transforms

Works today because the SVG has no `viewBox` and no ancestor transforms. Will offset every click when pan/zoom / infinite canvas lands — revisit with that feature using `getScreenCTM().inverse()` to map client coords to SVG user-space.
