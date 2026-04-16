# Side Tracts

Ideas and leads to explore later. Each entry is a snapshot from a conversation — not a commitment.

---

## React component library for Rough.js

**Context:** MockBench uses roughjs for its sketchy aesthetic. Existing React wrappers are either dead (react-rough, archived 2021) or fragile (react-rough-fiber, depends on React fiber internals via `its-fine`). A thin custom library using `RoughGenerator.toPaths()` to render pure SVG `<path>` elements would be simpler and more stable.

**API sketch:**

```
<RoughRect x={10} y={10} w={100} h={80} fill="red" seed={42} />
<RoughCircle cx={50} cy={50} diameter={80} roughness={2} />
<RoughLine x1={0} y1={0} x2={100} y2={100} />
<RoughPolygon vertices={[[0,0],[50,80],[100,0]]} fillStyle="zigzag" />
<RoughPath d="M37,17v15H14V17z" simplification={0.5} />
<RoughArc x={50} y={50} w={100} h={80} start={0} stop={Math.PI} closed />
<RoughCurve points={[[0,0],[50,80],[100,0]]} />
```

**Key design points:**
1. Each component maps 1:1 to a roughjs drawing method
2. All 23 roughjs options become optional props
3. `seed` prop ensures stable rendering across re-renders
4. Output is `<g>` containing `<path>` elements — composable in any SVG tree
5. No canvas dependency — pure SVG via `rough.generator()` + `toPaths()`

**Tooling options for building it:**

1. Bit.dev — full platform: define, develop, document, publish. Per-component versioning. Heaviest option.
2. Storybook — dev/docs tool. Isolated component development, visual testing, interactive docs. v8+. Not a bundler — pairs with any build pipeline.
3. Turborepo — monorepo orchestrator by Vercel. Caching, task pipelines. Has a design-system starter template.
4. tsup — zero-config TS bundler (esbuild). ESM/CJS + .d.ts. Most common "just bundle my library" choice.
5. Vite library mode — build.lib option. Good if already using Vite. Rollup-based.
6. Rollup — the original. Still the engine under Vite. Used directly less often now.
7. shadcn/ui model — copy-paste registries. Components are copied into your project, not installed as a dependency.

**For MockBench:** internal library, not a public npm package. Lightest setup: tsup + Storybook, or Vite library mode (already using Vite).
