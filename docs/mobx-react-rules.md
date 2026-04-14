# MobX + React Rules

Dos and don'ts for using MobX with React. Two sections: integration
rules (where MobX and React meet), then pure MobX rules.

Format per rule: 2-3 lines that clearly state the rule and its
reasoning, followed by a permalink to the authoritative docs.
Numbering is continuous across sections.

---

## MobX × React integration

1. Wrap every component that reads observable data with `observer`
   Why: Without observer, the component won't re-render on observable changes. Silent staleness.
   [docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

2. Don't wrap `observer(Component)` in `React.memo`
   Why: observer auto-applies memo — wrapping again is redundant and adds extra comparisons with no benefit.
   [docs](https://mobx.js.org/react-integration.html#observer-or-reactmemo)

3. Render lists in dedicated observer components
   Why: Without isolation, parent's other state changes force the entire list to reconcile.
   [docs](https://mobx.js.org/react-optimizations.html#render-lists-in-dedicated-components)

4. Dereference observable values as late as possible
   Why: Reading rect.x in the parent makes the parent re-render on rect.x change.
   [docs](https://mobx.js.org/react-optimizations.html#dereference-values-late)

5. Pass observable objects only to observer-wrapped components — or dereference to plain values first
   Why: Non-observer children don't subscribe; observable changes won't trigger their re-render.
   [docs](https://mobx.js.org/react-integration.html#dont-pass-observables-into-components-that-arent-observer)

6. Use `<Observer>` wrapper for callback children passed to non-observer libraries
   Why: A render-prop callback runs in the parent library's render cycle, not the observer's.
   [docs](https://mobx.js.org/react-integration.html#callback-components-might-require-observer)

7. Use `useLocalObservable` for component-local state
   Why: Shorthand for `useState(() => observable(initializer(), annotations, { autoBind: true }))`.
   [docs](https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/README.md#uselocalobservable)

8. Don't capture component props inside `useLocalObservable` initializer
   Why: Props aren't observable, and the initializer runs once (it's a `useState` lazy init); props read there freeze at mount. Sync via `useEffect`/reaction if they need to drive local state.
   [docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

9. Don't use array indexes as React keys
   Why: When items are added/removed/reordered, index keys break React's identity tracking — components lose state and DOM gets recreated.
   [docs](https://mobx.js.org/react-optimizations.html#dont-use-array-indexes-as-keys)

10. Always pair `addEventListener` with `removeEventListener` in cleanup
    Why: Without cleanup, listener accumulates on every effect re-run.
    [docs](https://react.dev/learn/synchronizing-with-effects#subscribing-to-events)

11. Cleanup must undo exactly what setup did
    Why: StrictMode's extra setup→cleanup→setup cycle stress-tests that cleanup "mirrors" setup. For `addEventListener`, that means `removeEventListener` with the same handler reference.
    [docs](https://react.dev/reference/react/useEffect#caveats)

12. Never suppress the exhaustive-deps lint
    Why: Stale closures captured in suppressed effects fire forever with old values.
    [docs](https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code)

13. Object/function dependencies in deps array cause needless re-runs
    Why: Object literals and inline functions get new identity each render. Move static objects out of the component or destructure to primitives.
    [docs](https://react.dev/learn/removing-effect-dependencies#does-some-reactive-value-change-unintentionally)

14. Don't derive state in useEffect when it can be computed during render
    Why: Effect-driven state causes an extra render cycle.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

15. Use `useSyncExternalStore` for browser APIs and external stores
    Why: Designed for subscribing to external mutable sources (e.g., `navigator.onLine`, stores) without manual `useEffect`/`useState` mirroring.
    [docs](https://react.dev/reference/react/useSyncExternalStore)

16. Put interaction-triggered side effects in event handlers, not Effects
    Why: Logic caused by a specific user interaction belongs in the handler; logic caused by the component being displayed belongs in an Effect.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request)

17. Keep StrictMode enabled in dev
    Why: React runs an extra setup+cleanup cycle before the first real setup. If your effect breaks under double-invocation, the cleanup is incomplete.
    [docs](https://react.dev/reference/react/useEffect#caveats)

18. Pass a function to `useState` for expensive initialization, not the result
    Why: `useState(createStore())` runs createStore on every render. `useState(createStore)` runs it once.
    [docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

19. Initializer function must be pure (StrictMode calls it twice)
    Why: StrictMode invokes initializers twice in dev to detect impurities.
    [docs](https://react.dev/reference/react/useState#caveats)

20. Use `useRef` for values that should NOT trigger re-renders
    Why: Mutating ref.current doesn't re-render. Right for timer IDs, DOM nodes, drag-state.
    [docs](https://react.dev/learn/referencing-values-with-refs)

21. Don't read or write `ref.current` during render (except lazy init)
    Why: Render must be pure. Reading/writing during render makes component output non-deterministic.
    [docs](https://react.dev/reference/react/useRef#caveats)

22. `useMemo` and `useCallback` earn their keep in three cases
    Why: (a) slow calculations with stable deps, (b) props to `memo`-wrapped children, (c) values used as Hook dependencies. Elsewhere they add ceremony without meaningful benefit.
    [docs](https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere)

23. Don't create new objects/arrays/functions as props to memo'd components
    Why: React.memo uses Object.is shallow compare. Inline literals get new identity each render — memo always sees "different."
    [docs](https://react.dev/reference/react/memo#minimizing-props-changes)

24. Custom `arePropsEqual` must compare every prop, including functions
    Why: Functions close over parent props/state; returning true when they differ makes handlers see stale props/state.
    [docs](https://react.dev/reference/react/memo#specifying-a-custom-comparison-function)

25. Keys must be stable, unique among siblings, derived from data
    Why: Index keys / Math.random keys cause React to recreate DOM and lose user input.
    [docs](https://react.dev/learn/rendering-lists#rules-of-keys)

26. To reset a component's state, change its `key`
    Why: React preserves state by position+key. Same position + new key = teardown + fresh mount.
    [docs](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key)

27. Keep component bodies pure
    Why: StrictMode double-invokes component functions in development to detect impurity. Side effects during render run twice.
    [docs](https://react.dev/learn/keeping-components-pure)

28. Store observable instances via lazy `useState(() => new Store())`, never `useState(new Store())`
    Why: Non-lazy `new Store()` runs on every render, constructing a fresh instance each time. Lazy init runs once.
    [docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

29. Keep MobX as the source of truth — don't mirror observable values into `useState`
    Why: `useState`/`useRef` should hold the stable observable instance, not copies of its values. Mirroring desyncs the two stores and forces effect chains to keep them aligned.
    [docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

30. Wrap event handlers in `action(...)` if they do multiple mutations
    Why: The outermost transaction batches updates. Multiple sequential actions = multiple commits.
    [docs](https://mobx.js.org/actions.html#wrapping-functions-using-action)

31. Create `autorun`/`reaction` once inside `useEffect`, never in event handlers
    Why: Each call to `autorun` creates a new reaction. Calling it in a handler spawns undisposed reactions = leak. `useEffect` gives you a cleanup hook to dispose.
    [docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

32. Don't destructure observables outside an observer's render
    Why: Destructuring reads the property eagerly, outside MobX's tracking — the observer won't subscribe to the field.
    [docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

33. `observer` must be the innermost (first-applied) HOC in a chain
    Why: If another HOC wraps the component first, observer's reaction might do nothing at all.
    [docs](https://mobx.js.org/react-integration.html)

---

## Pure MobX

34. Use `makeAutoObservable(this)` in class constructors
    Why: Auto-infers fields as observable, getters as computed, setters as action, methods as autoAction, generators as flow.
    [docs](https://mobx.js.org/observable-state.html#makeautoobservable)

35. Never subclass a class that uses `makeAutoObservable`
    Why: makeAutoObservable cannot be used on classes with super or subclasses.
    [docs](https://mobx.js.org/observable-state.html#limitations)

36. Call `make(Auto)Observable` unconditionally and after fields are initialized
    Why: Unconditional calls let MobX cache inference across instances; conditional or pre-init calls produce incorrect annotations.
    [docs](https://mobx.js.org/observable-state.html#limitations)

37. Always dispose `autorun`/`reaction`/`when` returns
    Why: Reactions hold references to observables they watch — undisposed = memory leak.
    [docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

38. Use `runInAction` after every `await` in async code
    Why: Action wrapping doesn't extend across await ticks.
    [docs](https://mobx.js.org/actions.html#asynchronous-actions)

39. Consider `flow` (generators) as an alternative to async/await for MobX actions
    Why: flow auto-wraps each yield (no runInAction needed) and supports cancellation via `.cancel()`.
    [docs](https://mobx.js.org/actions.html#using-flow-instead-of-asyncawait)

40. Prefer reading computed values from inside a reaction (observer/autorun/reaction)
    Why: Computeds memoize only while an active observer tracks them; outside one, each read recomputes. Use `keepAlive` to memoize standalone reads.
    [docs](https://mobx.js.org/computeds.html#tips)

41. Use `enforceActions: 'observed'` (the default)
    Why: Strict enough to catch mutations to observed state, loose enough to allow construction.
    [docs](https://mobx.js.org/configuration.html#linting-options)

42. Use `isObservableArray()` instead of `Array.isArray()` for observable arrays
    Why: With `useProxies: 'never'`, observable arrays fail `Array.isArray` because they aren't real arrays.
    [docs](https://mobx.js.org/configuration.html#limitations-without-proxy-support)

43. Prefer `replace()`, `clear()`, or `remove()` on observable arrays
    Why: MobX-documented helpers that emit a single change notification.
    [docs](https://mobx.js.org/api.html#observablearray)

44. Reactions shouldn't update other observables — use `computed` instead
    Why: Reaction-driven mutations create derivation chains that can loop or fire reactions out of order.
    [docs](https://mobx.js.org/reactions.html#reactions-shouldnt-update-other-observables)
