# CLAUDE.md

MockBench — a wireframing tool with a sketchy hand-drawn aesthetic.

A wireframe is a document of intent, not a visual asset. The tool should be as fast as a pencil, as smart as an outline, and as presentable as a slide deck. Show people the minimum they need to think clearly. Let them discover depth when they're ready. Ship less, reveal gradually, and never let the interface outgrow the idea it's trying to capture.

## Commands

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Production build
pnpm typecheck        # TypeScript strict check (no emit)
pnpm typecheck:watch  # Watch mode
```

No linter or test runner. TypeScript strict mode is the safety net.

## Stack

- Vite + React + TypeScript (strict)
- Tailwind v4
- Zustand (state management)
- RoughJS (hand-drawn SVG rendering)
- pnpm

## Architecture

### Rendering

Pure SVG. Not canvas. Every wireframe element is a React component rendering `<path>` and `<text>` inside `<g>` tags.

RoughJS `RoughGenerator` + `toPaths()` produces path data (pure data, no DOM). A shared `RoughPathsView` component renders these as `<path>` elements.

Elements are generated at origin (0,0) and positioned via SVG `transform` on the parent `<g>`. This means rough paths only recompute when seed or size changes, never on position change.

### State — Zustand stores

Three independent stores. Each follows the same pattern:

1. Pure state-transition functions live OUTSIDE the store (exported, testable)
2. Store actions are thin wrappers that call `set(s => pureFn(s, args))`
3. Derived values are selectors, not stored state

Stores:
- `camera.ts` — pan, zoom, viewport
- `elements.ts` — element CRUD, selection (`selectedIds: string[]`)
- `tools.ts` — active tool

### Zustand rules

- NEVER call `.getState()` from outside a store
- Inside store actions: `set(s => pureFn(s, ...))` — never `get().action()`
- Derived values as exported selector functions, not stored state
- Actions are domain events (addElement, moveElement), not setters (setX, setY)

### Element types

Discriminated union on `type` field. All elements share: `id, type, seed, x, y, width, height`.

```typescript
type WireElement = RectangleElement | TextElement | LineElement | ContainerElement
```

Each type gets a factory function (e.g. `createRectangle(x, y, w, h)`) that generates `id` via `crypto.randomUUID()` and `seed` via `newSeed()`.

### Interaction

Single `useCanvasInteraction` hook owns all pointer/keyboard events. Uses `InteractionMode` discriminated union (`idle | panning | drawing | moving | resizing`) tracked via ref (not state — avoids re-renders during drag).

Screen-to-canvas coordinate conversion: `movementX / zoom`.

Element `<g>` handlers call `stopPropagation()` to distinguish element clicks from canvas clicks.

### File structure

```
src/
  main.tsx          # Entry point, render App
  App.tsx           # Layout shell
  Workspace.tsx     # SVG canvas + interaction hook
  Toolbar.tsx       # Tool selection UI
  ZoomControls.tsx  # Zoom UI
  camera.ts         # Camera store
  elements.ts       # Elements store
  tools.ts          # Tools store
  roughPaths.ts     # RoughJS path generation (pure functions)
  RoughPathsView.tsx # Renders rough path data as <path> elements
  WireframeElement.tsx # Dispatches to element-type renderers
  utils.ts          # assertNever, newSeed, id generation
  types.ts          # All shared types
```

One concern per file. If a file exceeds ~200 lines, it should split.

## Type conventions

- `Readonly<{...}>` for type declarations
- Exhaustive switches with `assertNever()` on discriminated unions
- No `any`. No `as` casts unless unavoidable (comment why).
- No enums. Use string literal unions.

## Color Palette

Light theme only. No dark mode. No theme switching.

- Canvas background: `#faf9f7` (warm white)
- Container fill: `#efeeeb`
- Element fill: `#f7f6f4`
- Container stroke: `#9a9590`
- Element stroke: `#504a44`
- Text: `#605a52`
- Accent (selection, grid, dots): `#1E90FF` (dodger blue)
- Grid dot radius: ~1px, opacity ~0.30
- Graph paper line width: 0.5px, opacity ~0.25

Blue = editor tool (grid, selection, handles). Gray/brown = wireframe content. These two worlds never mix.

## Formatting

Prettier: 4-space indent, single quotes, no semicolons, trailing commas, 120 char width.

```json
{
    "semi": false,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 120,
    "tabWidth": 4
}
```

## Forbidden Directories

NEVER read, reference, or open files in the `user-notes-ai-must-never-read/` directory. This folder contains the user's private notes. Ignore its existence entirely. Do not list its contents, do not summarize it, do not use it for context. Pretend it does not exist.

## Rules for AI

- ONE change at a time. Do not modify files you were not asked to touch.
- Run `pnpm typecheck` after every change. Fix errors before moving on.
- Do NOT add features, libraries, or abstractions not explicitly requested.
- Do NOT refactor existing code unless asked. Refactoring is a separate task.
- Do NOT create "helper" or "utility" abstractions preemptively.
- When stuck or unsure, STOP and ask. Do not guess and iterate in loops.
- Keep files under 200 lines. If a file grows past that, mention it.
- Prefer explicit code over clever code. No magic. No indirection for its own sake.
