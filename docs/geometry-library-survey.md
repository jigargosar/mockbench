# Geometry & Rendering Library Research

Researched 2026-04-16. 79 libraries across 9 categories.

---

## A. Comprehensive Geometry Suites

### 1. @flatten-js/core

- **npm**: `@flatten-js/core`
- **GitHub**: https://github.com/alexbol99/flatten-js
- **Primitives**: Point, Vector, Line, Ray, Segment, Arc, Circle, Box, Polygon (multi-polygon with faces as closed chains of Segment/Arc edges, supporting islands and holes)
- **Boolean ops**: Yes — unify, subtract, intersect, innerClip, outerClip (Weiler-Atherton)
- **Spatial queries**: All shape-pair intersections; DE-9IM relation model (`relate()`) with full spatial predicates (intersect, disjoint, equal, touch, inside, contain, covered, cover); distance with shortest-segment result; PlanarSet container backed by interval tree
- **Transforms**: Affine (translate, rotate, scale) — chainable
- **TypeScript**: Ships `index.d.ts` (not native TS but maintained declarations)
- **Last publish**: Apr 2026 (v1.6.12). 646 GitHub stars.
- **Weekly downloads**: ~6K
- **API style**: OOP with shortcut factory functions (`point()` instead of `new Point()`). Chainable transforms. Rich method set on each shape.
- **Additional packages**: `@flatten-js/boolean-op`, `@flatten-js/polygon-offset`, `@flatten-js/interval-tree`
- **No bezier/path support** — arcs and segments only.

### 2. 2d-geometry (romgrk)

- **npm**: `2d-geometry`
- **GitHub**: https://github.com/romgrk/2d-geometry
- **Primitives**: All of flatten-js + Bezier (cubic), Quadratic (quadratic bezier), Path (sequence of Arc/Segment/Quadratic/Bezier), Rect, RoundedRect
- **Boolean ops**: Yes (inherited from flatten-js fork)
- **Spatial queries**: Yes (intersections, inclusion, distance, PlanarSet)
- **TypeScript**: Native TypeScript source, ships `.d.ts`
- **Last publish**: ~1 year ago (v3.0.0)
- **Weekly downloads**: ~2 (very low adoption)
- **API style**: OOP, fork of flatten-js. Immutable by default; mutable variants via `*Mut` suffix. All classes have `svg()` method.
- **Notable**: Only flatten-js variant with bezier curves and paths. Low adoption is a concern.

### 3. jsts (JavaScript Topology Suite)

- **npm**: `jsts`
- **GitHub**: https://github.com/bjornharrtell/jsts
- **Primitives**: Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection. No circles, arcs, or beziers.
- **Boolean ops**: Yes — union, intersection, difference, symmetric difference (full JTS port)
- **Spatial queries**: contains, within, intersects, overlaps, touches, crosses, disjoint, distance, buffer, convex hull, centroid, envelope; spatial index (STRtree, Quadtree)
- **TypeScript**: Via `@types/jsts` (community, ~2 years old)
- **Last publish**: ~1 year ago (v2.12.1)
- **Weekly downloads**: ~45K
- **API style**: OOP, port of Java JTS. Mutable. ESM only. Verbose Java-style API.
- **Notable**: Most complete topology library. Enterprise-grade.

### 4. Paper.js

- **npm**: `paper`
- **GitHub**: https://github.com/paperjs/paper.js
- **Standalone geometry?**: Partial. Can create `new paper.Project()` without canvas. Must pass `{insert: false}` to avoid scene-graph side effects. Pulls full rendering engine (~300KB).
- **Primitives**: Point, Size, Rectangle, Matrix, Path (arbitrary bezier paths), CompoundPath, Shape (Circle, Rectangle, Ellipse), Curve, Segment, CurveLocation
- **Boolean ops**: Yes — unite, subtract, intersect, exclude, divide
- **Intersections**: Path intersections, hit testing
- **Transforms**: Affine + `matrix.decompose()` into `{scaling, rotation, skewing}`
- **TypeScript**: Built-in `.d.ts` since v0.12.1 (reported as incomplete). `@types/paper` is stale.
- **Weekly downloads**: ~441K
- **Maintenance**: Slow/stalled. Core is mature.
- **API style**: Rich OOP. Operator overloading via PaperScript (optional).

---

## B. Transform / Matrix Libraries

### 5. transformation-matrix

- **npm**: `transformation-matrix`
- **GitHub**: https://github.com/chrvadala/transformation-matrix
- **Provides**: 2D affine matrices only. Compose, invert, applyToPoint/applyToPoints, translate, rotate, scale, shear/skew, fromString/toString (CSS matrix), fromTriangles, fromMovingPoints (gesture support).
- **Decomposition**: Yes — `decomposeTSR()` into translation, scaling, rotation with optional flip detection
- **Interpolation**: No built-in
- **TypeScript**: Built-in types (ships `.d.ts`)
- **Last publish**: v3.0.0 ~mid-2025 (active)
- **Weekly downloads**: ~783K
- **API style**: Functional, immutable. Matrices are plain `{a,b,c,d,e,f}` objects. Pure functions, tree-shakeable. No dependencies.
- **Notable**: Gesture helpers (`fromMovingPoints`). Purpose-built for 2D affine.

### 6. gl-matrix

- **npm**: `gl-matrix`
- **GitHub**: https://github.com/toji/gl-matrix
- **Provides**: Full suite — vec2/3/4, mat2/mat2d/mat3/mat4, quat, quat2. `mat2d` is 2x3 (6-element) 2D affine matrix. 3D perspective/orthographic projection.
- **Decomposition**: Partial — `mat4` has getTranslation/getRotation/getScaling; `mat2d` does NOT.
- **Interpolation**: Quaternion slerp for 3D; no 2D matrix interpolation.
- **TypeScript**: Ships `types.d.ts` (Float32Array-based)
- **Last publish**: v3.4.4 (~mid-2025). v4 in development (OOP class-based API).
- **Weekly downloads**: ~1.3M
- **API style**: Functional with output-parameter convention (`mat2d.multiply(out, a, b)`). Mutable. All ops on Float32Array/plain arrays.
- **Notable**: WebGL-oriented, extremely fast. Overkill for pure 2D.

### 7. @thi.ng/matrices

- **npm**: `@thi.ng/matrices`
- **GitHub**: https://github.com/thi-ng/umbrella/tree/develop/packages/matrices
- **Provides**: 160+ operations for 2D/3D matrices and quaternions. Companion to `@thi.ng/vectors`.
- **Decomposition**: Yes (2D and 3D)
- **Interpolation**: Yes (quaternion interpolation, matrix lerp)
- **TypeScript**: Written in TypeScript, ESM-only (ES2020)
- **Last publish**: v3.0.20 (~Apr 2026, actively maintained)
- **Weekly downloads**: ~1.3K
- **API style**: Functional. Matrices are plain arrays/typed arrays. Output-parameter convention. Part of thi.ng/umbrella (~210 packages).
- **Notable**: Very comprehensive. Low adoption. Best for projects already in thi.ng ecosystem.

### 8. @thednp/dommatrix

- **npm**: `@thednp/dommatrix`
- **GitHub**: https://github.com/thednp/dommatrix
- **Provides**: DOMMatrix shim for Node.js/legacy browsers. Parses CSS transform strings via `.fromString()`. Full 4x4 matrix with `is2D` detection. W3C DOMMatrix interface.
- **TypeScript**: Written in TypeScript
- **Weekly downloads**: ~68K
- **API style**: OOP, matches browser DOMMatrix API. Mutable (`translateSelf`, `rotateSelf`) + immutable variants.
- **Notable**: Bridges CSS transforms and matrix math. Not a math library per se.

### 9. mathjs

- **npm**: `mathjs`
- **GitHub**: https://github.com/josdejong/mathjs
- **Provides**: General math — arbitrary-precision, complex numbers, units, NxN matrices, linear algebra (det, inv, transpose, eigenvalues, LU/QR).
- **TypeScript**: Ships type definitions
- **Weekly downloads**: ~1.3-2.5M
- **API style**: Functional (`math.multiply(A, B)`, `math.inv(A)`). Generic NxN.
- **Notable**: Very heavy (~150KB min). Zero awareness of affine transforms or geometry. Raw matrix ops only.

### 10. rematrix

- **npm**: `rematrix`
- **GitHub**: https://github.com/jlmakes/rematrix
- **Provides**: CSS-oriented 4x4 matrix transforms — translate, rotate, scale, skew, compose, invert, toString (CSS).
- **TypeScript**: Ships type definitions
- **Last publish**: v0.7.2 (inactive)
- **Weekly downloads**: ~53K
- **API style**: Functional, immutable. 16-element arrays (4x4).
- **Notable**: Clean CSS-modeled API. Inactive. Uses 4x4 even for 2D.

### 11. kld-affine

- **npm**: `kld-affine`
- **GitHub**: https://github.com/thelonious/kld-affine
- **Provides**: Point2D, Vector2D, Matrix2D. Translate, scale, rotate, skew, multiply, inverse, transform points.
- **TypeScript**: Has `types/` directory with declarations
- **Last publish**: v2.1.1 (6 years ago — unmaintained)
- **Weekly downloads**: Low
- **API style**: OOP, mutable. Point2D has `lerp()`.

### 12. vecti

- **npm**: `vecti`
- **Provides**: 2D vectors only — add, subtract, multiply, dot, cross, Hadamard, normalize, rotate.
- **TypeScript**: Written in TypeScript, fully typed
- **API style**: OOP, immutable, chainable.
- **Notable**: No matrix class. Vector-only.

### 13. ts-matrix

- **npm**: `ts-matrix`
- **Provides**: Vector (any dimension), Matrix (any dimension), Quaternion.
- **TypeScript**: Written in TypeScript
- **Weekly downloads**: ~121
- **Notable**: Very low adoption. Generic NxN without 2D affine specialization.

### 14. transformation-matrix-js

- **npm**: `transformation-matrix-js`
- **Provides**: 2D affine 3x3 — rotate, scale, translate, skew, inverse, decompose, SVG/DOM conversion, animation helpers, from-triangles.
- **Decomposition**: Yes — translate/rotate/scale/skew
- **Interpolation**: Has animation/interpolation helpers
- **TypeScript**: No built-in types
- **Notable**: Feature-rich but officially abandoned by author.

---

## C. Spatial Indexing

### 15. rbush

- **npm**: `rbush`
- **GitHub**: https://github.com/mourner/rbush
- **Type**: R*-tree, dynamic (insert/remove/update)
- **TypeScript**: Built-in `.d.ts`
- **Last publish**: v4.0.1 (2024-08)
- **Weekly downloads**: ~3M
- **Notable**: The go-to mutable spatial index. Used by Leaflet, MapLibre. Author: Vladimir Agafonkin (Mapbox).

### 16. flatbush

- **npm**: `flatbush`
- **GitHub**: https://github.com/mourner/flatbush
- **Type**: Packed Hilbert R-tree, static (bulk-loaded, immutable after construction)
- **TypeScript**: Built-in `.d.ts`
- **Last publish**: v4.5.1 (2026-03)
- **Weekly downloads**: ~500K
- **Notable**: 2-5x faster than rbush for static datasets. Single flat ArrayBuffer — cache-friendly.

### 17. kdbush

- **npm**: `kdbush`
- **GitHub**: https://github.com/mourner/kdbush
- **Type**: kd-tree, static, points only
- **TypeScript**: Built-in `.d.ts`
- **Last publish**: v4.0.2 (2023-04)
- **Weekly downloads**: ~8M
- **Notable**: Points only. Range + radius queries. Used by `supercluster`.

---

## D. Hit-Testing & Intersection

### 18. intersects

- **npm**: `intersects`
- **GitHub**: https://github.com/davidfig/intersects
- **Coverage**: point-point, point-line, point-rect, point-circle, point-polygon, point-ellipse, line-line, line-rect, line-circle, line-polygon, circle-circle, circle-rect, circle-polygon, rect-rect, polygon-polygon, ellipse-line
- **Returns**: Boolean only (no intersection points)
- **TypeScript**: No
- **Weekly downloads**: ~4K
- **Notable**: Broadest shape-pair coverage in a single focused library.

### 19. kld-intersections

- **npm**: `kld-intersections`
- **GitHub**: https://github.com/thelonious/kld-intersections
- **Coverage**: All SVG shape permutations — arc, quadratic bezier, cubic bezier, circle, ellipse, line, path, polygon, polyline, rectangle
- **Returns**: Intersection points (x, y coordinates). Parses SVG path data.
- **TypeScript**: No
- **Last publish**: v0.7.0 (2020-05, dormant)
- **Weekly downloads**: ~27K
- **Notable**: Most comprehensive SVG intersection library. Known bezier-bezier instability.

### 20. path-intersection

- **npm**: `path-intersection`
- **GitHub**: https://github.com/bpmn-io/path-intersection
- **Coverage**: SVG path-to-path intersection
- **Returns**: Intersection points with segment info. Derived from Snap.svg.
- **TypeScript**: Built-in types
- **Last publish**: v4.1.0 (2026-01, actively maintained)
- **Weekly downloads**: ~80K
- **Notable**: Simplest SVG path-path intersection. Supports path pre-parsing and caching.

### 21. detect-collisions

- **npm**: `detect-collisions`
- **GitHub**: https://github.com/Prozi/detect-collisions
- **Coverage**: Points, lines, boxes, polygons (including concave), ellipses, circles
- **Returns**: Boolean + response vectors (penetration depth + direction)
- **Spatial indexing**: Built-in BVH (Bounding Volume Hierarchy) for broad-phase
- **TypeScript**: Built-in types
- **Last publish**: v10.10.2025 (active)
- **Weekly downloads**: ~8K
- **Notable**: Most complete collision detection system. BVH + SAT. Handles concave polygons. Zero dependencies.

### 22. bezier-js

- **npm**: `bezier-js`
- **GitHub**: https://github.com/Pomax/bezierjs
- **Coverage**: Quadratic/cubic bezier — split, offset, project, intersect (curve-curve, curve-line), bounding box, arc length, tangent/normal, extrema, de Casteljau, outline generation
- **TypeScript**: Via `@types/bezier-js`
- **Last publish**: ~2023 (v6.1.4)
- **Weekly downloads**: ~200K
- **Notable**: The definitive bezier library. Author wrote "A Primer on Bezier Curves."

### 23. point-in-polygon

- **npm**: `point-in-polygon`
- **Coverage**: Point-in-polygon via ray casting. Simple polygons, no holes.
- **TypeScript**: `@types/point-in-polygon` available
- **Weekly downloads**: ~200K
- **Notable**: Simple, fast, tiny. Not numerically robust on edges.

### 24. robust-point-in-polygon

- **npm**: `robust-point-in-polygon`
- **Coverage**: Point-in-polygon with exact boundary detection. Returns -1 (inside), 0 (boundary), 1 (outside).
- **TypeScript**: No
- **Weekly downloads**: ~35K
- **Notable**: Uses robust predicates (exact arithmetic). Handles all degenerate cases.

### 25. sat (SAT.js)

- **npm**: `sat`
- **Coverage**: Circle-circle, polygon-polygon (convex only), circle-polygon, point-in-circle, point-in-polygon
- **Returns**: Collision response vectors (overlap, normal)
- **TypeScript**: No built-in types
- **Last publish**: v0.9.0 (2021, dormant)
- **Weekly downloads**: ~15K
- **Notable**: Convex-only. Game-oriented.

---

## E. Boolean / Clipping Operations

### 26. polygon-clipping

- **npm**: `polygon-clipping`
- **GitHub**: https://github.com/mfogel/polygon-clipping
- **Ops**: Union, intersection, difference, xor on coordinate arrays (GeoJSON format)
- **Algorithm**: Martinez-Rueda-Feito
- **TypeScript**: Bundled types
- **Weekly downloads**: ~200K (used internally by Turf.js)
- **API style**: Functional, pure.

### 27. polyclip-ts

- **npm**: `polyclip-ts`
- **GitHub**: https://github.com/luizbarboza/polyclip-ts
- **Ops**: Union, intersection, difference, xor
- **TypeScript**: Native TypeScript (rewrite of polygon-clipping)
- **Weekly downloads**: ~15K

### 28. @countertype/clipper2-ts

- **npm**: `@countertype/clipper2-ts`
- **GitHub**: https://github.com/countertype/clipper2-ts
- **Ops**: Intersect, union, difference, xor + polygon offsetting (inflate/deflate) + triangulation
- **TypeScript**: Native TypeScript
- **Last publish**: ~5 months ago
- **Notable**: High-fidelity Clipper2 port. 258 tests against reference. Supports round/miter/square joins for offset.

### 29. clipper-lib

- **npm**: `clipper-lib`
- **Ops**: Union, intersection, difference, xor (integer-only coordinates)
- **TypeScript**: None
- **Last publish**: 6 years ago (legacy Clipper1)
- **Weekly downloads**: ~17K
- **Notable**: Superseded by clipper2-ts.

### 30. clipper2-wasm

- **npm**: `clipper2-wasm`
- **Ops**: Same as clipper2-ts but WASM for performance
- **TypeScript**: Yes

---

## F. Single-Purpose Utilities

### 31. robust-predicates

- **npm**: `robust-predicates`
- **GitHub**: https://github.com/mourner/robust-predicates
- **Purpose**: orient2d, orient3d, incircle, insphere — numerically robust geometric predicates
- **TypeScript**: Bundled types
- **Weekly downloads**: ~3M
- **Notable**: Building block used by Delaunator, earcut, etc.

### 32. earcut

- **npm**: `earcut`
- **GitHub**: https://github.com/mapbox/earcut
- **Purpose**: Polygon triangulation. Single function — flat vertex array + hole indices → triangle indices.
- **TypeScript**: Bundled types (v3)
- **Weekly downloads**: ~21M
- **Notable**: Fastest JS triangulation. 3KB gzipped.

### 33. poly-decomp / poly-decomp-es

- **npm**: `poly-decomp`, `poly-decomp-es`
- **Purpose**: Concave → convex polygon decomposition. Two algorithms: optimal (slow) + approximate (fast).
- **TypeScript**: No
- **Weekly downloads**: ~30K
- **Notable**: Used by matter.js physics.

### 34. geometric

- **npm**: `geometric`
- **GitHub**: https://github.com/HarryStevens/geometric
- **Purpose**: Functional point/line/polygon utilities — area, centroid, convex hull, point-in-polygon, line intersection, angles, distances, reflections.
- **TypeScript**: Bundled types
- **Weekly downloads**: ~5K
- **API style**: Functional, pure. All `[x,y]` arrays.

### 35. potpack

- **npm**: `potpack`
- **Purpose**: Rectangle packing into smallest square.
- **TypeScript**: Yes
- **Notable**: Tiny, by Mapbox. Auto-arrange / sprite atlas.

---

## G. Rendering Engines with Extractable Geometry

### 36. @pixi/math (PixiJS v7)

- **npm**: `@pixi/math`
- **Standalone**: v7 only (deprecated in v8, merged into core)
- **Primitives**: Point, ObservablePoint, Rectangle, Circle, Ellipse, Polygon, RoundedRectangle, Matrix (2D affine), Transform
- **Ops**: Point arithmetic (via math-extras), Matrix ops, shape `contains(x,y)`
- **TypeScript**: Written in TypeScript
- **Notable**: Thin geometry surface. No intersections, no booleans. v8 does not export separately.

### 37. Fabric.js v6

- **npm**: `fabric`
- **Standalone geometry**: Partial. Exposes `Point`, `Intersection` (bbox only), and `util` (transformPoint, multiplyTransformMatrices, invertTransform).
- **TypeScript**: v6 fully written in TypeScript
- **Notable**: Geometry utilities are minimal. Large bundle (~200KB+) for small geometry subset.

### 38. Two.js

- **npm**: `two.js`
- **Standalone geometry**: Partial. `Two.Vector`, `Two.Anchor`, `Two.Path`. Shapes: Circle, Ellipse, Rectangle, RoundedRectangle, Line, Polygon, Star, ArcSegment.
- **Ops**: Vector math (add, subtract, dot, distance, lerp). No intersections, no booleans.
- **TypeScript**: Ships `types.d.ts`
- **Notable**: Drawing API, not analytical geometry.

### 39. d3-shape / d3-geo

- **npm**: `d3-shape`, `d3-geo`
- **d3-shape**: Path generators for lines, areas, arcs, pies, curves (basis, cardinal, catmull-rom), links, stacks, symbols. Not geometry objects.
- **d3-geo**: Spherical geometry — projections, great-circle, GeoJSON. Geographic, not Cartesian 2D.
- **TypeScript**: Via `@types/d3-shape`, `@types/d3-geo`

### 40. Pts.js

- **npm**: `pts`
- **GitHub**: https://github.com/nicktomlin/pts
- **Standalone**: Mostly yes. `Pt` (n-dimensional point/vector), `Group` (ordered collection). Shape ops via static utility classes.
- **Ops**: Line (intersectRay2D, intersectLine2D, distanceFromPt), Circle (intersectCircle2D, intersectLine2D, withinBound), Triangle (incircle, circumcircle), Polygon (convexHull, area, centroid), Curve (bspline, catmullRom, bezier)
- **TypeScript**: Written in TypeScript (55.7% TS). Ships types.
- **API style**: Functional-static (`Line.intersectLine2D(lineA, lineB)`). Points are n-dimensional (`Pt` extends `Float32Array`).

### 41. @turf/turf

- **npm**: `@turf/turf`
- **GitHub**: https://github.com/Turfjs/turf
- **Primitives**: GeoJSON — Point, LineString, Polygon, Multi*
- **Ops**: Boolean contains/within/crosses/overlaps, point-in-polygon, nearest-point, distance, line-intersect, union/intersect/difference (via polygon-clipping)
- **TypeScript**: Native TS as of v7
- **Weekly downloads**: ~705K
- **Notable**: Geospatial (lat/lng), not screen-space. Coordinates are [longitude, latitude].

---

## H. Pan / Zoom Libraries

### 42. d3-zoom

- **npm**: `d3-zoom`
- **GitHub**: https://github.com/d3/d3-zoom
- **Gestures**: Wheel zoom, drag pan, pinch zoom, double-click zoom, smooth transitions
- **Transform output**: `ZoomTransform { x, y, k }` with `apply([x,y])` and `invert([x,y])` for screen↔world conversion. Represents matrix `[k, 0, 0, k, tx, ty]`.
- **Constraints**: `translateExtent`, `scaleExtent`
- **TypeScript**: Via `@types/d3-zoom`
- **Framework**: Agnostic (DOM, SVG, Canvas)
- **Weekly downloads**: ~3M
- **Notable**: Gold standard. DOM-agnostic core — apply to Canvas2D yourself. No minimap.

### 43. @panzoom/panzoom (timmywil)

- **npm**: `@panzoom/panzoom`
- **GitHub**: https://github.com/timmywil/panzoom
- **Gestures**: Wheel zoom, pinch zoom, drag pan. Focal point zooming.
- **Transform output**: `getScale()` + `getPan()` → `{x, y}`. CSS transform internally.
- **TypeScript**: Written in TypeScript
- **Framework**: Agnostic (vanilla DOM)
- **Weekly downloads**: ~50K
- **Notable**: ~3.7kb gzip. CSS-transform-based — DOM/SVG only, not Canvas2D.

### 44. panzoom (anvaka)

- **npm**: `panzoom`
- **GitHub**: https://github.com/anvaka/panzoom
- **Gestures**: Wheel zoom, pinch zoom, drag pan, double-click zoom
- **Transform output**: `getTransform()` → `{ scale, x, y }`. Custom `applyTransform` handlers for Canvas2D.
- **TypeScript**: Bundled types
- **Framework**: Agnostic (DOM, SVG, custom targets)
- **Weekly downloads**: ~50K
- **Notable**: "Universal" target support via custom handlers. Events: panstart, panend, zoom, transform.

### 45. react-zoom-pan-pinch

- **npm**: `react-zoom-pan-pinch`
- **GitHub**: https://github.com/BetterTyped/react-zoom-pan-pinch
- **Gestures**: Wheel zoom, pinch zoom, drag pan, double-click zoom, velocity panning
- **Transform output**: `state.scale`, `state.positionX`, `state.positionY` via hook. CSS transforms.
- **TypeScript**: Written in TypeScript
- **Framework**: React only
- **Weekly downloads**: ~500K
- **Notable**: CSS-transform-based. Not for Canvas2D.

### 46. @use-gesture/react + @use-gesture/vanilla

- **npm**: `@use-gesture/react`, `@use-gesture/vanilla`
- **GitHub**: https://github.com/pmndrs/use-gesture
- **Provides**: Low-level gesture recognition — drag, pinch, scroll, wheel, move, hover. Raw deltas only — no camera/viewport management.
- **TypeScript**: Written in TypeScript
- **Framework**: React / vanilla (vanilla is experimental)
- **Weekly downloads**: ~2.5M
- **Notable**: Gesture-input library, not pan-zoom. Pair with your own transform state. pmndrs ecosystem.

### 47. svg-pan-zoom

- **npm**: `svg-pan-zoom`
- **GitHub**: https://github.com/bumbu/svg-pan-zoom
- **Gestures**: Wheel zoom, drag pan, touch. Fit/contain modes. Minimap via plugin.
- **Transform output**: `getPan()` → `{x, y}`, `getZoom()` → number. SVG viewBox manipulation.
- **TypeScript**: Via `@types/svg-pan-zoom`
- **Framework**: Agnostic (SVG only)
- **Notable**: SVG-only. Mature but low maintenance.

### 48. pixi-viewport

- **npm**: `pixi-viewport`
- **GitHub**: https://github.com/pixijs-userland/pixi-viewport
- **Gestures**: Drag, pinch, wheel zoom, decelerated panning (momentum), follow target, animate, snap-to-point, snap-to-zoom, clamp, bounce
- **Transform output**: PixiJS transform system (full 2D affine matrix). `toWorld(screen)` / `toScreen(world)` helpers.
- **TypeScript**: Written in TypeScript
- **Framework**: PixiJS only
- **Weekly downloads**: ~50K
- **Notable**: Most feature-rich viewport. Minimap plugin. Requires PixiJS renderer.

### 49. ef-infinite-canvas

- **npm**: `ef-infinite-canvas`
- **GitHub**: https://github.com/emilefokkema/infinite-canvas
- **Provides**: Wraps `<canvas>` to make it infinite. Returns a Context2D that auto-applies viewport transform. Zoom, pan, and rotate.
- **TypeScript**: Yes
- **Weekly downloads**: ~170
- **Notable**: Transparent Context2D proxy. Supports rotation (unusual). Very low adoption.

### 50. tldraw (full SDK)

- **npm**: `tldraw`
- **GitHub**: https://github.com/tldraw/tldraw
- **Camera**: `{ x, y, z }` (z = zoom). `screenToPage` / `pageToScreen`. Gesture handling, smooth animations, edge-scrolling, configurable `TLCameraOptions`.
- **TypeScript**: Written in TypeScript
- **Framework**: React only
- **Notable**: Full infinite canvas application framework, not standalone pan-zoom. Shapes, selection, tools, collaboration included.

---

## I. Novel / Inspirational Features

### Path Morphing / Shape Interpolation

#### 51. flubber

- **npm**: `flubber`
- **Purpose**: Morph between arbitrary SVG shapes. `interpolate(fromShape, toShape)`, `toCircle()`, `toRect()`, multi-shape `fromShapes`/`toShapes`.
- **TypeScript**: Community `@types/flubber`
- **Maintenance**: Unmaintained (~2018) but stable
- **Inspiration**: Morph wireframe shapes during transitions, animate layout variants.

#### 52. polymorph-js

- **npm**: `polymorph-js`
- **Purpose**: Same goal as flubber at 6kb vs 53kb.
- **TypeScript**: No
- **Maintenance**: Unmaintained

#### 53. d3-interpolate-path

- **npm**: `d3-interpolate-path`
- **Purpose**: Interpolate SVG path d-attributes with different point counts. Zero dependencies.
- **TypeScript**: Ships types
- **Maintenance**: Active
- **Inspiration**: Animate path changes during undo/redo or layout reflow.

### Voronoi / Delaunay

#### 54. d3-delaunay

- **npm**: `d3-delaunay`
- **Purpose**: Delaunay triangulation + dual Voronoi. 5-10x faster than old d3-voronoi. Graph traversal API. Point containment via `find()`.
- **TypeScript**: Ships types
- **Maintenance**: Active (Observable/D3)
- **Inspiration**: Proximity queries, auto-distribute elements, organic partition layouts.

#### 55. delaunator

- **npm**: `delaunator`
- **Purpose**: Fastest JS Delaunay. Flat typed-array output. In-place `update()` for Lloyd's relaxation.
- **TypeScript**: `@types/delaunator`
- **Maintenance**: Active (Mapbox)
- **Weekly downloads**: High (ecosystem foundation)

#### 56. d3-voronoi-treemap

- **npm**: `d3-voronoi-treemap`
- **Purpose**: Treemaps via Voronoi tessellation — organic, non-rectangular area layouts.
- **TypeScript**: No
- **Inspiration**: Area-proportional layouts that break from rectangular grids.

#### 57. d3-weighted-voronoi

- **npm**: `d3-weighted-voronoi`
- **Purpose**: Weighted Voronoi with variable-importance sites → variable cell sizes.
- **TypeScript**: No

### Curve Fitting / Simplification

#### 58. simplify-js

- **npm**: `simplify-js`
- **Purpose**: Douglas-Peucker + Radial Distance polyline simplification. 2D and 3D.
- **TypeScript**: `@types/simplify-js`
- **Maintenance**: Stable (Leaflet author)
- **Inspiration**: Simplify freehand paths at adjustable fidelity.

#### 59. fit-curve

- **npm**: `fit-curve`
- **Purpose**: Philip Schneider's algorithm — fit cubic Bezier curves to polylines with controllable error tolerance.
- **TypeScript**: Ships types
- **Inspiration**: Convert freehand strokes to clean Bezier curves.

#### 60. points-on-curve

- **npm**: `points-on-curve`
- **Purpose**: Discrete points on a curve with configurable tolerance.
- **TypeScript**: Yes
- **Maintenance**: Stable (roughjs ecosystem)
- **Inspiration**: Sample curves for hit-testing or even element placement.

#### 61. cardinal-spline-js

- **npm**: `cardinal-spline-js`
- **Purpose**: Cardinal/Catmull-Rom splines through control points with tension.
- **TypeScript**: No
- **Inspiration**: Smooth curves through waypoints for connectors and freeform shapes.

### Constraint / Layout Geometry

#### 62. @lume/kiwi

- **npm**: `@lume/kiwi`
- **Purpose**: Cassowary constraint solver in TypeScript (~8x faster than cassowary.js). Linear constraints with strength-based priority.
- **TypeScript**: Native TypeScript
- **Maintenance**: Active
- **Inspiration**: Smart snapping/alignment as live constraints. "A.right = B.left + 16" as a constraint, not just a snap guide.

#### 63. autolayout

- **npm**: `autolayout`
- **Purpose**: Apple Auto Layout + Visual Format Language in JS. `"|-[child1(==child2)]-[child2]-|"` → computed rects. Uses Cassowary.
- **TypeScript**: No (built on kiwi.js)
- **Inspiration**: Constraint DSL for wireframe layouts. Auto-distribute with equal spacing.

#### 64. webcola (cola.js)

- **npm**: `webcola`
- **Purpose**: Constraint-based graph layout — alignment constraints, non-overlap, grouping, flow direction.
- **TypeScript**: Ships types
- **Inspiration**: Auto-layout for diagrams and connected wireframe elements.

### Offset / Inset Paths

#### 65. @flatten-js/polygon-offset

- **npm**: `@flatten-js/polygon-offset`
- **Purpose**: Morphological offset via edge mapping + boolean ops. Handles arc segments.
- **TypeScript**: Ships `.d.ts`
- **Maintenance**: Active (flatten-js ecosystem)

#### 66. polygon-offset

- **npm**: `polygon-offset`
- **Purpose**: Lightweight (~14kb). Handles concave polygons. Uses Martinez clipping.
- **TypeScript**: No

### Skeleton / Medial Axis

#### 67. straight-skeleton

- **npm**: `straight-skeleton`
- **Purpose**: CGAL straight skeleton via WASM. Polygons with/without holes. Returns vertices + polygon decomposition.
- **TypeScript**: Native TypeScript (wrapper)
- **Inspiration**: Centerline extraction for label placement, decorative inset patterns, "bone structure" for shapes.

### Rounded Corners / Fillet

#### 68. round-polygon

- **npm**: `round-polygon`
- **Purpose**: Round corners of any 2D polygon. Auto-clamps radius when too large. Dependency-free.
- **TypeScript**: Ships types
- **Maintenance**: Active
- **Inspiration**: One-call rounded corners for wireframe shapes.

#### 69. svg-round-corners

- **npm**: `svg-round-corners`
- **Purpose**: Round corners at SVG path-command level (M, L, H, V, Z). Works on path strings.
- **TypeScript**: No

### Path Operations

#### 70. svg-path-commander

- **npm**: `svg-path-commander`
- **Purpose**: Comprehensive SVG path toolkit — `getTotalLength()`, `getPointAtLength()`, path transforms via DOMMatrix (including 3D→2D projection), normalize, reverse, split into subpaths. More accurate than native browser methods.
- **TypeScript**: Native TypeScript
- **Maintenance**: Active
- **Inspiration**: Place elements along paths, measure, transform path data without DOM.

#### 71. svg-path-properties

- **npm**: `svg-path-properties`
- **Purpose**: Pure-JS `getPointAtLength()` + `getTotalLength()` + tangent angles. No DOM needed.
- **TypeScript**: Ships types
- **Maintenance**: Active

#### 72. svgpath

- **npm**: `svgpath`
- **Purpose**: Low-level SVG path transforms — translate, scale, rotate, skew, apply matrix, round coordinates, convert arc types. Chainable.
- **TypeScript**: `@types/svgpath`
- **Maintenance**: Active (markdown-it ecosystem)

#### 73. line-interpolate-points

- **npm**: `line-interpolate-points`
- **Purpose**: Distribute N equidistant points along a polyline with optional offset.
- **TypeScript**: No
- **Inspiration**: Even spacing of markers, handles, decorations along connectors.

### Topology

#### 74. planar-face-discovery

- **npm**: `planar-face-discovery`
- **Purpose**: Given planar graph (nodes + edges), enumerate all enclosed faces. Hierarchical cycle tree with area computation.
- **TypeScript**: Native TypeScript
- **Inspiration**: "Draw walls, detect rooms." Turn crossing lines into fillable regions.

#### 75. topolis

- **npm**: `topolis`
- **Purpose**: Full planar topology model (ISO SQL/MM). Nodes, edges, faces. Edge splitting, face merging, topology validation. Ported from PostGIS.
- **TypeScript**: No
- **Inspiration**: Topological editing — splitting a region automatically creates two faces.

### Cross-Cutting / Inspirational

#### 76. perfect-freehand

- **npm**: `perfect-freehand`
- **Purpose**: Pressure-sensitive variable-width stroke outlines from point input. Configurable thinning, smoothing, streamline, taper.
- **TypeScript**: Native TypeScript
- **Maintenance**: Active (Steve Ruiz / tldraw)
- **Inspiration**: Hand-drawn-feeling strokes from mouse/pen input.

#### 77. rough.js / @excalidraw/roughjs

- **npm**: `roughjs`, `@excalidraw/roughjs`
- **Purpose**: Hand-drawn sketchy rendering for any primitive (line, rect, ellipse, arc, path). Deterministic via seed. Canvas and SVG.
- **TypeScript**: Ships types
- **Maintenance**: Active (@excalidraw fork)

#### 78. points-on-curve

- (See #60 above — shared between curve fitting and cross-cutting)

#### 79. Konva (built-in Stage pan/zoom)

- **npm**: `konva`
- **Pan/zoom**: Manual via `stage.draggable`, `stage.scaleX/Y()` on wheel events. ~20 lines for zoom-to-pointer.
- **TypeScript**: Written in TypeScript
- **Notable**: No deceleration, snap, or camera animation built in. Production-proven.

---

## Decision Journal

### X1 — Discarded (2026-04-16)

Libraries confirmed dead, abandoned, or superseded. Do not re-evaluate.

| # | Discarded | Reason | Successor (stays in pool) |
|---|---|---|---|
| 14 | `transformation-matrix-js` | Author abandoned | `transformation-matrix` (#5) |
| 40 | `svg-intersections` | Dead since 2018, superseded | `kld-intersections` (#19) |
| 29 | `clipper-lib` | Legacy Clipper1, integer-only, 6yr stale | `@countertype/clipper2-ts` (#28) |
| 36 | `@pixi/math` (v7) | Deprecated, merged into pixi.js v8 | `pixi.js` v8 geometry layer |
| 52 | `polymorph-js` | Unmaintained, inferior to alternatives | `flubber` (#51) + `d3-interpolate-path` (#53) |

### X2 — elm-geometry Coverage Scoring (2026-04-16)

Benchmark: elm-geometry's 22 2D modules (Point2d, Vector2d, Direction2d, Axis2d, Frame2d, BoundingBox2d, LineSegment2d, Triangle2d, Rectangle2d, Circle2d, Ellipse2d, Arc2d, EllipticalArc2d, Polygon2d, Polyline2d, QuadraticSpline2d, CubicSpline2d, DelaunayTriangulation2d, VoronoiDiagram2d, Region2d, Set2d, SweptAngle). Each library scored per-module, then averaged.

| Rank | # | Library | Coverage | 90%+ modules | Key strength | Key gap |
|---|---|---|---|---|---|---|
| 1 | 81 | `@thi.ng/geom` | **~78%** | 11 of 22 | 60+ polymorphic ops, ~900 vector fns, tessellation, Delaunay/Voronoi, elliptic arcs | No type-safe Frame2d/Direction2d, no general boolean/CSG, no spatial shape collections |
| 2 | 4 | `paper` (Paper.js) | **~50-73%** | 11 substantial | Widest shape + curve + boolean coverage, hit-testing | Scene-graph coupled, stalled dev, no Frame2d |
| 3 | 3 | `jsts` | **~39%** | Polygon 90%, Delaunay 85%, Voronoi 80% | Full topology, spatial index (STRtree) | All curves linearized, no splines, no true circles |
| 4 | 1 | `@flatten-js/core` | **~32-39%** | 7 substantial | Booleans + DE9IM + PlanarSet spatial index | No splines, no ellipse, no triangle/rect types, no frames |
| 5 | 40 | `pts` (Pts.js) | **~32%** | Triangle 70%, Rect 65% | Triangle ops (circumcircle, incircle, medial), creative curves | No ellipse, no arc, no Delaunay/Voronoi |
| 6 | 2 | `2d-geometry` | **~30%** | None | Adds beziers/paths to flatten-js, immutable option | ~2 downloads/wk, no ellipse, no triangle, no Delaunay |

**Universal gap**: No JS/TS library has elm-geometry's Frame2d (typed coordinate frames with relativeTo/placeIn) or Direction2d (typed unit directions). These must be built.

**Emerging direction**: Use elm-geometry as API design reference. For ad-hoc math/computation, lean on established single-purpose libs. For geometry primitives (Rect, Circle, etc.), port elm-geometry's design incrementally — the source is at `docs/external-lib-docs/elm-geometry/src/`.
