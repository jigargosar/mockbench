# CLAUDE.md

MockBench — a wireframing tool with a sketchy hand-drawn aesthetic.

A wireframe is a document of intent, not a visual asset. The tool should be as fast as a pencil, as smart as an outline, and as presentable as a slide deck. Show people the minimum they need to think clearly. Let them discover depth when they're ready. Ship less, reveal gradually, and never let the interface outgrow the idea it's trying to capture.

The design direction is progressive disclosure: the first-time surface stays small, and depth reveals itself as users reach for it. This principle governs feature delivery as much as UX — ship the minimum, add depth only as real need appears.

Scope: a full workspace, not a minimal utility.

## Library docs

Authoritative documentation for the following libraries lives in docs/external-lib-docs/.

1. MobX — mobx/docs/
2. MobX-utils — mobx-utils/README.md
3. Rough.js — roughjs-wiki/Home.md
4. elm-geometry — elm-geometry/src/ (Elm 2D/3D geometry, API design reference)
5. @mathigon/euclid — mathigon-euclid/src/ (TypeScript 2D geometry, immutable classes)

## Rules maintenance

When a bug surfaces — whether newly discovered or a variant of something already known — capture the lesson in `docs/mobx-react-rules.md`. Add a new rule if the lesson is orthogonal to existing ones; merge into the closest existing rule if it's a variant. The rules file is the canonical dos-and-don'ts ledger; keep it current.
