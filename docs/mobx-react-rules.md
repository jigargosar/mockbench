# MobX + React Rules

Dos and don'ts for using MobX with React. Two sections: integration
rules (where MobX and React meet), then pure MobX rules.

Format per rule: 2-3 lines that clearly state the rule and its
reasoning, followed by a permalink to the authoritative docs.
Numbering is continuous across sections.

---

## MobX × React integration

1. Wrap every component that reads observable data with `observer`
   Why: Without `observer`, the component doesn't subscribe to the observables it reads — it renders stale data and no error fires.
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

41. Use `enforceActions: 'observed'` (the default)
    Why: `'observed'` requires actions for any mutation to already-observed state. `'always'` additionally requires actions even for observable construction. The default covers real bugs without getting in the way at setup time.
    [docs](https://mobx.js.org/configuration.html#linting-options)

42. Use `isObservableArray()` for type checks on observable arrays
    Why: Observable arrays aren't real arrays. Under `useProxies: 'never'` they fail `Array.isArray()`; `isObservableArray()` is the safe check across proxy modes.
    [docs](https://mobx.js.org/api.html#isobservablearray)

43. Prefer `replace()`, `clear()`, or `remove()` on observable arrays
    Why: MobX-documented helpers: `replace(items)` swaps the whole array, `clear()` empties, `remove(value)` drops a single item by value. Clearer intent than equivalent `splice` calls.
    [docs](https://mobx.js.org/api.html#observablearray)

44. Reactions shouldn't update other observables — use `computed` instead
    Why: Docs: "Reactions should not compute new data, but only cause effects." If a reaction writes to another observable, you're computing derived data imperatively — chains of these are harder to reason about than declarative `computed` graphs.
    [docs](https://mobx.js.org/reactions.html#use-reactions-sparingly)
