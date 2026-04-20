# CLAUDE.md

MockBench — a wireframing tool with a sketchy hand-drawn aesthetic.

A wireframe is a document of intent, not a visual asset. The tool should be as fast as a pencil, as smart as an outline, and as presentable as a slide deck. Show people the minimum they need to think clearly. Let them discover depth when they're ready. Ship less, reveal gradually, and never let the interface outgrow the idea it's trying to capture.

The design direction is progressive disclosure: the first-time surface stays small, and depth reveals itself as users reach for it. This principle governs feature delivery as much as UX — ship the minimum, add depth only as real need appears.

A wireframing tool is a thinking tool with deliberate constraints; a design tool is a production tool with deliberate capabilities. MockBench is the former. Its core value is semantic UI widgets (buttons, dropdowns, data grids — not just rectangles), deliberate low fidelity that prevents premature visual discussions, and speed-of-thought screen layout. Features that invite polish (gradients, shadows, pen tools, pixel-perfect positioning) are out of scope — they undermine the forcing function that makes wireframes useful.

Scope: a full workspace, not a minimal utility.

## Library docs

Authoritative documentation for the following libraries lives in docs/external-lib-docs/.

1. MobX — mobx/docs/
2. MobX-utils — mobx-utils/README.md
3. Rough.js — roughjs-wiki/Home.md
4. elm-geometry — elm-geometry/src/ (Elm 2D/3D geometry, API design reference)
5. MDN web docs — search via QMD MCP (`mdn-web-*` collections, e.g. `mdn-web-svg`, `mdn-web-api-<interface>`). Raw markdown at mdn-content/files/en-us/web/

## Workflow files

1. `docs/scope.md` — ship-first feature list, then unsorted backlog.
2. `docs/refactoring.md` — technical improvements that don't add user-visible features.

## Development rhythm

Prefer shipping features. Note refactor ideas for later. After each feature ships, 2–3 refactor items are fair game.

## Dev watchers

If running, read their output instead of spawning one-shot runs: `pnpm typecheck:watch` (recompile on save), `pnpm test:ui` (rerun tests on save), `pnpm dev` (HMR).

If none running, start all three in background.

## Geometry

Move geometry-related computations into the `src/geom/` package. Adding new geom models and expanding the API is encouraged — if an operation or type is missing, add a method or introduce a new one rather than inlining the computation at the call site. Any geometry library (e.g. elm-geometry in `docs/external-lib-docs/`) can serve as a reference for naming ideas; none is authoritative.

## Gotchas maintenance

When a bug surfaces — whether newly discovered or a variant of something already known — capture the lesson in `docs/mobx-react-gotchas.md`. Add a new gotcha if the lesson is orthogonal to existing ones; merge into the closest existing gotcha if it's a variant. The gotchas file is the canonical dos-and-don'ts ledger; keep it current.
