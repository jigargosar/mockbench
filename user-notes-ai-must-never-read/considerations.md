# Considerations

Running log of design thinking, UX decisions, and open questions.
Not a spec. Not a plan. Things to keep in mind.

---

## Property Panel — Not Traditional

Don't use a fixed sidebar property panel. Use a contextual floating popover
that appears anchored to the selected element — like how Google Docs / Medium
show a floating toolbar when you select text.

- Selecting an element IS the trigger. No hover icon, no extra click.
- Click element → selection outline + property popover appears next to it.
- Click canvas to deselect → popover disappears.
- Popover shows only properties relevant to that element type.
- Eyes stay on the element. No glancing 800px to a sidebar.

---

## First Load — Not a Blank Canvas

The app opens with seed content already on the canvas. Never an empty state.
The seed content should teach through example, not through tooltips:

- Two screens framed in browser chrome components
- Connected by an arrow showing page flow
- Enough components to show variety without overwhelming
- Grouped elements to subtly introduce grouping concept

The user's first interaction is touching existing content, not creating from scratch.

---

## Onboarding — No Tooltip Tours

Those "6 tooltip arrows pointing at UI parts" onboarding flows are terrible.
Nobody remembers 6 descriptions at once. The seed content IS the tutorial.
Each feature is learned by interacting with the example:

- Click a screen → learn selection
- Drag it → learn movement
- Notice the arrow → understand page flow
- Try to move one element in a group → discover grouping

---

## Present Mode — First Priority for Stakeholder Demo

Present mode is the deliverable, not the editor. Stakeholders don't care about
resize handles. They care about "can I walk someone through a clickable flow?"

Build priority path: element types → pages → hotspot links → present mode.
Everything else (undo, layers, export, resize) is editor chrome — important
but invisible during a presentation.

---

## Progressive Discovery — Product + Release Strategy

Features arrive when user behavior proves they need them:

- Layer 1 (first 30 seconds): canvas, ~8 components, place/move
- Layer 2 (contextual): property popover on select, layers tab at 5+ elements
- Layer 3 (behavior-triggered): pages panel after 2nd page, present after hotlinks
- Layer 4 (explicit opt-in): shortcuts, export, history, advanced settings

Same principle applies to releases: each release ships one layer.
The entry point stays simple forever. Only the ceiling rises.

---

## Visual History Scrubber

Undo/redo is baseline. But a visual history panel with named, jumpable actions
is a real power-user differentiator borrowed from the authoring tool world
(Photoshop History panel, Google Docs revision history).

Not a headline USP but worth keeping and polishing. Key fix needed:
batch drag operations into single undo entries (v1 created one entry per pixel).
