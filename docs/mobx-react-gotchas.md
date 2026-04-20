# MobX + React Gotchas

Dos and don'ts for using MobX with React. Called "gotchas" because each
item has a real cost if ignored — not abstract style preferences. Four
sections: debugging toolbox (what's available to diagnose), integration
(where MobX and React meet), pure MobX, and debugging recipes.

Format per gotcha: 2-3 lines that clearly state the rule and its
reasoning, followed by a permalink to the authoritative docs.
Numbering is continuous across sections.

---

## Debugging toolbox

No fixed order — pick by symptom. Having the list prevents zig-zag.

### Used in this codebase

1. React DevTools — "Highlight updates when components render" toggle.
2. Prod build + preview — exposed dev-tooling cost (50% → 10%).
3. Chrome Performance — layout/style per second counter (150/sec).
4. Chrome Performance — flame graph top self-time (removeChild/appendChild).
5. React DevTools Profiler — ranked view (per-component render counts).
6. `useRef` render-count logs in components.
7. Browser console isolation test.
8. MobX devtools extension — close before perf traces; it distorts them.
9. `console.log` for render debug — last resort, lean on `trace()` or React DevTools Profiler first; reaching for `console.log` usually means better tools got skipped.

### Unused — worth reaching for

1. Chrome Performance — event log "reason" field on Layout / Recalc Style.
2. `trace()` inside a computed or observer body.
3. `trace(true)` to drop into debugger at fire site.
4. `spy(e => ...)` at app startup for global event stream.
5. `why-did-you-render` library.
6. `getDependencyTree` / `getObserverTree` for reactivity-graph dumps.
7. Grep for React keys derived from mutating data.

**Discipline**: one change at a time, measure before/after, revert if no improvement.

---

## MobX × React integration

1. Wrap every React component in `observer` — even ones that don't currently read observables
   Why: This convention helps us from a potential landmine when we start using observable in that component. Also without `observer`, the component doesn't subscribe to the observables it reads — it renders stale data and no error fires in prod.
   Config Aside: 
      1. `observableRequiresReaction`: Enable in dev — catches reads of observables outside a reaction, so you know immediately when a component forgot `observer`. This doesnt violate YAGNI.
      2. `reactionRequiresObservable`: Don't enable in dev, creates Noise. It warns when an `observer` doesn't access any observables. Keep disabled (default `false`).
   [docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

2. Don't wrap `observer(Component)` in `React.memo`
   Why: `observer` auto-applies `memo`, so wrapping again adds a redundant shallow compare with no benefit.
   [docs](https://mobx.js.org/react-integration.html#observer-vs-memo)

3. Render lists in dedicated observer components
   Why: React's reconciler has to evaluate every element produced by the list on each collection change. Isolating the `.map()` in its own `observer` keeps unrelated parent changes from forcing that work.
   [docs](https://mobx.js.org/react-optimizations.html#render-lists-in-dedicated-components)

4. Dereference observable values as late as possible
   Why: Pass objects, not fields. Reading `rect.x` in a parent observer re-renders the parent on every `x` change; reading it inside a child observer re-renders only the child.
   [docs](https://mobx.js.org/react-optimizations.html#dereference-values-late)

5. Pass observable objects only to observer-wrapped components — or dereference to plain values first
   Why: Only `observer` components subscribe to the observables they read. A plain child receiving an observable won't re-render when its fields mutate — either wrap the child in `observer` or pass already-dereferenced primitives.
   [docs](https://mobx.js.org/react-integration.html#dont-pass-observables-into-components-that-arent-observer)

6. Use `<Observer>` wrapper for callback children passed to non-observer libraries
   Why: A render-prop callback runs inside the consuming component's render, not inside the observer that syntactically declared it. Subscriptions land on the wrong component unless the callback body is wrapped in `<Observer>`.
   [docs](https://mobx.js.org/react-integration.html#callback-components-might-require-observer)

7. Use `useLocalObservable` for component-local state
   Why: Shorthand for `useState(() => observable(initializer(), annotations, { autoBind: true }))`. Creates one observable store per component, bound to its instance.
   [docs](https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/README.md#uselocalobservable)

8. Don't capture component props inside `useLocalObservable` initializer
   Why: The initializer runs once (it's a `useState` lazy init). Prop values read there freeze at mount. If the store needs props, sync them in via `useEffect` after mount.
   [docs](https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/README.md#uselocalobservable)

9. Don't use array indexes as React keys
   Why: When items shift positions (insert, delete, reorder), index keys make React reuse the wrong component instances — state and DOM map to the wrong items. Generate stable IDs from the data.
   [docs](https://mobx.js.org/react-optimizations.html#dont-use-array-indexes-as-keys)

10. Always pair `addEventListener` with `removeEventListener` in cleanup
    Why: Each effect re-run adds another listener. Without cleanup, the handler fires N times after N renders.
    [docs](https://react.dev/learn/synchronizing-with-effects#subscribing-to-events)

11. Cleanup must undo exactly what setup did
    Why: StrictMode runs setup → cleanup → setup in dev to stress-test that cleanup mirrors setup. For `addEventListener`, that means `removeEventListener` with the same handler reference — otherwise subscriptions leak.
    [docs](https://react.dev/reference/react/useEffect#caveats)

12. Never suppress the exhaustive-deps lint
    Why: Suppressing lies to React about what the effect reads. The effect closes over first-render values and fires with stale state forever.
    [docs](https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code)

13. Object/function dependencies in deps array cause needless re-runs
    Why: Object and function literals get fresh identity every render, so the effect re-runs even when nothing logically changed. Move static values out of the component or destructure to primitives.
    [docs](https://react.dev/learn/removing-effect-dependencies#does-some-reactive-value-change-unintentionally)

14. Don't derive state in useEffect when it can be computed during render
    Why: If a value can be computed from props/state during render, do it there. Setting it in an effect causes an extra render cycle and may flash the old value first.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

15. Use `useSyncExternalStore` when subscribing to non-React sources
    Why: For browser APIs (e.g., `navigator.onLine`) or external stores, `useSyncExternalStore` is concurrent-safe without manual `useEffect`/`useState` mirroring. Prefer plain `useState`/`useReducer` for React-owned state.
    [docs](https://react.dev/reference/react/useSyncExternalStore)

16. Put interaction-triggered side effects in event handlers, not Effects
    Why: Logic caused by a specific user interaction belongs in the handler; logic caused by the component being displayed belongs in an Effect.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request)

17. Keep StrictMode enabled in dev
    Why: StrictMode runs an extra setup → cleanup → setup cycle before the first real setup. Any effect that breaks under this cycle has incomplete cleanup — catching it in dev is cheaper than in prod.
    [docs](https://react.dev/reference/react/StrictMode)

18. Pass a function to `useState` for expensive initialization, not the result
    Why: `useState(createStore())` runs `createStore` on every render. `useState(createStore)` runs it once.
    [docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

19. Initializer function must be pure (StrictMode calls it twice)
    Why: StrictMode calls initializers twice in dev to catch impurities. Mutations, ID generation, and logging inside the initializer will run twice — keep it pure.
    [docs](https://react.dev/reference/react/useState#caveats)

20. Use `useRef` for values that should NOT trigger re-renders
    Why: Mutating `ref.current` doesn't re-render. Right for timer IDs, DOM nodes, drag-state — things the render output doesn't depend on.
    [docs](https://react.dev/learn/referencing-values-with-refs)

21. Don't read or write `ref.current` during render (except lazy init)
    Why: Render must be pure. Reading/writing `ref.current` during render makes output depend on render order — breaks StrictMode and concurrent rendering.
    [docs](https://react.dev/reference/react/useRef#caveats)

22. `useMemo` has three valid cases; `useCallback` has two
    Why: `useMemo` helps when (a) a calculation is measurably slow with stable deps, (b) the value is a prop to a `memo`-wrapped child, or (c) it feeds another Hook's deps. `useCallback` applies only to (b) and (c) — it caches a function, not a computation. Elsewhere both add ceremony without benefit.
    [docs](https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere)

23. Don't create new objects/arrays/functions as props to memo'd components
    Why: `React.memo` uses `Object.is` shallow compare. Inline literals get new identity every render — memo always sees "different" and never bails out.
    [docs](https://react.dev/reference/react/memo#minimizing-props-changes)

24. Custom `arePropsEqual` must compare every prop, including functions
    Why: Functions close over parent props/state. Returning `true` when they differ makes handlers "see" stale props/state from a previous render.
    [docs](https://react.dev/reference/react/memo#specifying-a-custom-comparison-function)

25. Keys must be stable, unique among siblings, derived from data
    Why: Index keys or `Math.random()` keys cause React to recreate DOM and lose user input when the list shifts. Use a stable ID from the data.
    [docs](https://react.dev/learn/rendering-lists#rules-of-keys)

26. To reset a component's state, change its `key`
    Why: React preserves state by position + key. Same position + new key = teardown + fresh mount.
    [docs](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key)

27. Keep component bodies pure
    Why: StrictMode calls component functions twice in dev to detect impurity. Any side effect in the body — mutation, logging, API call — runs multiple times.
    [docs](https://react.dev/learn/keeping-components-pure)

28. Store observable instances via lazy `useState(() => new Store())`, never `useState(new Store())`
    Why: Non-lazy `new Store()` constructs a fresh instance every render — local state is lost and `makeAutoObservable` re-runs, which can produce "Maximum update depth" loops. Lazy init runs once.
    [docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

29. Keep MobX as the source of truth — don't mirror observable values into `useState` [project convention]
    Why: `useState`/`useRef` may hold the observable instance itself, but not copies of its values. Mirroring forks the truth: two stores drift apart and need effect chains to reconcile.
    [related](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

30. Wrap event handlers in `action(...)` if they do multiple mutations
    Why: Only the outermost action boundary batches updates into one transaction. A handler calling two already-annotated actions produces two transactions (two reaction firings) unless the handler itself is wrapped.
    [docs](https://mobx.js.org/actions.html#wrapping-functions-using-action)

31. Create `autorun`/`reaction` once inside `useEffect`, never in event handlers
    Why: Each call creates a new reaction. Calling from a handler spawns an undisposed subscription on every click — a guaranteed leak. `useEffect` gives you a cleanup hook to dispose.
    [docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

32. Don't destructure observables outside an observer's render
    Why: Destructuring reads the property eagerly at the destructure site. If that site isn't inside an `observer`'s render (e.g., a handler, an effect body, module scope), MobX records no subscription and the component never re-renders for that field.
    [docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

33. `observer` must be the innermost decorator when paired with `inject`
    Why: mobx-react docs explicitly require `observer` inside, `inject` outside. Generalized: any HOC wrapping `observer` from the outside risks interfering with its reaction tracking.
    [docs](https://github.com/mobxjs/mobx-react)

---

## Pure MobX

34. Use `makeAutoObservable(this)` in class constructors
    Why: Auto-infers fields → `observable`, getters → `computed`, setters → `action`, methods → `autoAction`, generators → `flow`. Skips hand-annotating each member.
    [docs](https://mobx.js.org/observable-state.html#makeautoobservable)

35. Never subclass a class that uses `makeAutoObservable`
    Why: `makeAutoObservable` cannot be used on classes with `super` or subclasses. Use `makeObservable` + explicit annotations if inheritance is required.
    [docs](https://mobx.js.org/observable-state.html#limitations)

36. Call `make(Auto)Observable` unconditionally and after fields are initialized
    Why: Unconditional calls let MobX cache inference across instances of the same class. Conditional or pre-init calls produce incorrect annotations that persist silently.
    [docs](https://mobx.js.org/observable-state.html#limitations)

37. Always dispose `autorun`/`reaction`/`when` returns
    Why: Reactions hold strong references to the observables they watch. If you never call the disposer, the reaction (and everything it captures) can't be garbage-collected.
    [docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

38. Use `runInAction` after every `await` in async code
    Why: An `action` wrapper only covers the synchronous part. After an `await`, you're back in plain tick scope — mutations there must be re-wrapped in `runInAction`.
    [docs](https://mobx.js.org/actions.html#asynchronous-actions)

39. Consider `flow` (generators) as an alternative to async/await for MobX actions
    Why: `flow` wraps each `yield` resolution in action scope (no manual `runInAction`) and returns a promise with a `.cancel()` method for cooperative cancellation.
    [docs](https://mobx.js.org/actions.html#using-flow-instead-of-async--await-)

40. Prefer reading computed values from inside a reaction (observer/autorun/reaction)
    Why: Computeds memoize only while an active observer is tracking them. Outside tracking, every read recomputes from scratch. `keepAlive` avoids this but risks memory leaks — scoping reads inside reactions is safer.
    [docs](https://mobx.js.org/computeds.html#tips)

41. Use `enforceActions: 'always'` in DEV mode to catch non-action observable writes
    Why: Creation or mutation outside an action would otherwise slip past the `'observed'` default when nothing is subscribed yet, only surfacing later as latent bugs once subscription begins. The MobX docs wording is easy to misread as recommending `'observed'`; read carefully, `'always'` is the goal-aligned option.
    [docs](https://mobx.js.org/configuration.html#enforceactions)

42. Use `isObservableArray()` for type checks on observable arrays
    Why: Observable arrays aren't real arrays. Under `useProxies: 'never'` they fail `Array.isArray()`; `isObservableArray()` is the safe check across proxy modes.
    [docs](https://mobx.js.org/api.html#isobservablearray)

43. Prefer `replace()`, `clear()`, or `remove()` on observable arrays
    Why: MobX-documented helpers: `replace(items)` swaps the whole array, `clear()` empties, `remove(value)` drops a single item by value. Clearer intent than equivalent `splice` calls.
    [docs](https://mobx.js.org/api.html#observablearray)

44. Reactions shouldn't update other observables — use `computed` instead
    Why: Docs: "Reactions should not compute new data, but only cause effects." If a reaction writes to another observable, you're computing derived data imperatively — chains of these are harder to reason about than declarative `computed` graphs.
    [docs](https://mobx.js.org/reactions.html#use-reactions-sparingly)

45. Dev-only invariant intercepts are fine as a safety net on top of action-level validation
    Why: Docs call general `intercept` use an AOP anti-pattern. Our narrow use differs: the intercept sits in the constructor next to the actions it guards (not cross-cutting-by-stealth), fires only in DEV (`import.meta.env.DEV`), and exists to catch a future mutation site that forgets to maintain the invariant. Actions still enforce the invariant by construction — the intercept is the tripwire, not the primary guard. Defense in depth, not "validate during mutation instead of before."
    [docs](https://mobx.js.org/intercept-and-observe.html)

---

## Debugging reactivity issues

Recommended rhythm: React Profiler → find the component rendering too
often → drop `trace()` in its body → MobX prints which observable
triggered the re-run → fix granularity at the source. Clean up trace
calls before committing.

46. `trace()` inside a computed or observer body
    Why: On the next invalidation, MobX logs *why* it re-ran — which observable changed and what derivation was triggered. Pass `trace(true)` to drop into the debugger at the fire site. Targeted, minimal noise. Best first tool for "why is this re-running?"
    [docs](https://mobx.js.org/analyzing-reactivity.html#trace)

47. Render-count ref logs in suspect components
    Why: `const r = useRef(0); r.current++; console.log('Foo', r.current)` answers "which component is re-rendering per frame, and how often?" without guessing. Orthogonal to MobX — but the combination (React Profiler heatmap → render-count log → `trace()`) pinpoints reactivity leaks fast. Remove after investigation.
    [docs](https://react.dev/reference/react/useRef)

48. `spy(event => ...)` at app startup for global firing order
    Why: Logs every MobX event — actions, reactions, observable writes, computed evaluations. Noisy (hundreds/sec during drag) but shows chain order. Filter by `event.type === 'update'` or `'action'` to cut noise. Call the returned disposer when done. Use for "what chain fired between click X and broken state Y?"
    [docs](https://mobx.js.org/analyzing-reactivity.html#spy)

49. `configure({ observableRequiresReaction: true })` in dev
    Why: Warns when an observable is read outside a reactive context — usually means a component forgot `observer` or a handler is reading state it shouldn't. Catches the bug class where a component silently renders stale data in prod because it never subscribed. See gotcha #1 for the same rule from the opposite side.
    [docs](https://mobx.js.org/configuration.html#observablerequiresreaction)

50. `configure({ enforceActions: 'always' })` in dev
    Why: Warns on observable writes outside an action. Default `'observed'` misses mutations while nothing is subscribed yet, surfacing later as latent bugs. `'always'` catches them at origin. See gotcha #41 for the full reasoning.
    [docs](https://mobx.js.org/configuration.html#enforceactions)

51. `configure({ disableErrorBoundaries: true })` in dev only
    Why: Without this, MobX errors are swallowed by React's error-boundary machinery and you lose the stack trace. Flipping it on surfaces the real stack. Dev only — in prod it's the wrong trade-off (user sees a broken app instead of a fallback).
    [docs](https://mobx.js.org/configuration.html#disableerrorboundaries)

52. `getDependencyTree` / `getObserverTree` for graph dumps
    Why: Low-level API that returns the dependency graph of a reaction/computed at a point in time. Useful when `trace()` shows an unexpected dep and you need to walk the actual graph to find where the extra subscription was created.
    [docs](https://mobx.js.org/analyzing-reactivity.html#getobservertree-getdependencytree)

53. mobx-devtools browser extension — close before perf traces
    Why: Useful for interactive inspection of stores and mutations. But it serializes store state on every action to stream to the panel — at 60-120Hz drag rates, that alone can dominate CPU and distort any perf trace. Always close the panel before recording a Chrome Performance trace.
    [docs](https://github.com/mobxjs/mobx-devtools)

54. Dev-mode overhead dwarfs prod in perf measurements
    Why: StrictMode double-renders, `observableRequiresReaction`/`enforceActions` checks, and MobX devtools all add real CPU in dev. Observed 5× swings between dev and prod in real use. Always measure perf concerns against `pnpm build && pnpm preview`, not the dev server. If prod is fine, the problem is dev tooling, not the app.
    [docs](https://react.dev/reference/react/StrictMode)
