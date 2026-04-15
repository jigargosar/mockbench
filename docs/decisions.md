## Clicking the selection-border halo starts a new draw

`SelectionBorder` draws at `sel.x - 4, sel.y - 4, sel.w + 8, sel.h + 8`. `hitTest` uses rect bounds only, so a click in the 4px halo misses the rect, clears selection, starts a new draw. Accepted for now.
