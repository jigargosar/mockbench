# MobX + React Guide

Concrete rules. Examples linked, not inlined.

1. Use `makeAutoObservable(this)` in class constructors
   Why: Auto-infers properties as observable, getters as computed, methods as autoAction.
   [docs](https://mobx.js.org/observable-state.html#makeautoobservable)

2. Never subclass a class that uses `makeAutoObservable`
   Why: makeAutoObservable cannot be used on classes with super or subclasses.
   [docs](https://mobx.js.org/observable-state.html#limitations)

3. Call `make(Auto)Observable` unconditionally and after fields are initialized
   Why: Skipping fields or conditional calls cache invalid inference results — silent breakage.
   [docs](https://mobx.js.org/observable-state.html#limitations)

4. Always dispose `autorun`/`reaction`/`when` returns
   Why: Reactions hold references to observables they watch — undisposed = memory leak.
   [docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

5. Use `runInAction` after every `await` in async code
   Why: Action wrapping doesn't extend across await ticks.
   [docs](https://mobx.js.org/actions.html#asynchronous-actions)

6. Use `flow` (generators) for non-trivial async, not async/await
   Why: flow auto-wraps each yield, supports cancellation.
   [docs](https://mobx.js.org/actions.html#using-flow-instead-of-async--await-)

7. Read computed values only inside a reaction (observer/autorun/reaction)
   Why: Computeds memoize only when an active observer tracks them. Outside = full recompute every read.
   [docs](https://mobx.js.org/computeds.html#tips)

8. Use `enforceActions: 'observed'` (the default)
   Why: Strict enough to catch mutations to observed state, loose enough to allow construction.
   [docs](https://mobx.js.org/configuration.html#linting-options)

9. Use `isObservableArray()` instead of `Array.isArray()` for observable arrays
   Why: With `useProxies: 'never'`, observable arrays fail Array.isArray.
   [docs](https://mobx.js.org/api.html#isobservablearray)

10. Use `replace()` / `clear()` / `splice()` on observable arrays — not direct `.length =`
    Why: Direct length manipulation has historical issues; named methods are documented and safe.
    [docs](https://mobx.js.org/api.html#observablearray)

11. Wrap every component that reads observable data with `observer`
    Why: Without observer, the component won't re-render on observable changes. Silent staleness.
    [docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

12. Never wrap `observer(Component)` in `React.memo` again
    Why: observer auto-applies memo. Double-wrapping throws a runtime error.
    [docs](https://mobx.js.org/react-integration.html#observer-or-reactmemo)

13. Render lists in dedicated observer components
    Why: Without isolation, parent's other state changes force the entire list to reconcile.
    [docs](https://mobx.js.org/react-optimizations.html#render-lists-in-dedicated-components)

14. Dereference observable values as late as possible
    Why: Reading rect.x in the parent makes the parent re-render on rect.x change.
    [docs](https://mobx.js.org/react-optimizations.html#dereference-values-late)

15. Don't pass observable objects to non-observer components
    Why: Non-observer children won't subscribe — observable changes won't trigger their re-render.
    [docs](https://mobx.js.org/react-integration.html#dont-pass-observables-into-components-that-arent-observer)

16. Use `<Observer>` wrapper for callback children passed to non-observer libraries
    Why: A render-prop callback runs in the parent library's render cycle, not the observer's.
    [docs](https://mobx.js.org/react-integration.html#callback-components-might-require-observer)

17. Use `useLocalObservable` for component-local state
    Why: One-line shorthand for `useState(() => observable(initializer(), {}, { autoBind: true }))`.
    [docs](https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/README.md#uselocalobservable)

18. Don't reference component props inside `useLocalObservable` initializer
    Why: Initializer runs once. Captured props become stale on later renders.
    [docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

19. Don't use array indexes as React keys for observable lists
    Why: When items are added/removed/reordered, index-keyed components reuse the wrong instances — ghost state.
    [docs](https://mobx.js.org/react-optimizations.html#dont-use-array-indexes-as-keys)

20. Always pair `addEventListener` with `removeEventListener` in cleanup
    Why: Without cleanup, listener accumulates on every effect re-run.
    [docs](https://react.dev/learn/synchronizing-with-effects#subscribing-to-events)

21. Cleanup function must mirror setup exactly
    Why: addEventListener ↔ removeEventListener with the SAME handler reference.
    [docs](https://react.dev/reference/react/useEffect#parameters)

22. Never suppress the exhaustive-deps lint
    Why: Stale closures captured in suppressed effects fire forever with old values.
    [docs](https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code)

23. Object/function dependencies in deps array cause needless re-runs
    Why: Object literals are reference-different each render. Move static objects out of component or destructure to primitives.
    [docs](https://react.dev/learn/removing-effect-dependencies#do-you-want-to-read-a-value-without-reacting-to-its-changes)

24. Don't derive state in useEffect when it can be computed during render
    Why: Effect-driven state causes an extra render cycle.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

25. Use `useSyncExternalStore` for browser APIs and external stores
    Why: Concurrent-safe and tear-free. useEffect+useState mirroring can show stale values during concurrent renders.
    [docs](https://react.dev/reference/react/useSyncExternalStore)

26. Put user-triggered side effects in event handlers, not Effects
    Why: Effects re-run on render. A notification triggered by a click belongs in the click handler, or it fires on every render.
    [docs](https://react.dev/learn/you-might-not-need-an-effect#sending-an-analytics-event)

27. Keep StrictMode enabled in dev
    Why: Effects run setup → cleanup → setup in dev. If your effect breaks under double-invocation, the cleanup is incomplete.
    [docs](https://react.dev/reference/react/useEffect#caveats)

28. Pass a function to `useState` for expensive initialization, not the result
    Why: `useState(createStore())` runs createStore on every render. `useState(createStore)` runs it once.
    [docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

29. Initializer function must be pure (StrictMode calls it twice)
    Why: StrictMode invokes initializers twice in dev to detect impurities.
    [docs](https://react.dev/reference/react/useState#caveats)

30. Use `useRef` for values that should NOT trigger re-renders
    Why: Mutating ref.current doesn't re-render. Right for timer IDs, DOM nodes, drag-state.
    [docs](https://react.dev/learn/referencing-values-with-refs)

31. Don't read or write `ref.current` during render (except lazy init)
    Why: Render must be pure. Reading/writing during render makes component output non-deterministic.
    [docs](https://react.dev/reference/react/useRef#caveats)

32. `useMemo` and `useCallback` are only for `memo`-wrapped consumers or hook deps
    Why: Otherwise they add overhead without benefit.
    [docs](https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere)

33. Don't create new objects/arrays/functions as props to memo'd components
    Why: React.memo uses Object.is shallow compare. Inline literals get new identity each render — memo always sees "different."
    [docs](https://react.dev/reference/react/memo#minimizing-props-changes)

34. Custom `arePropsEqual` must compare every prop, including functions
    Why: If a function comparison returns true incorrectly, the closure freezes — handlers see stale state.
    [docs](https://react.dev/reference/react/memo#specifying-a-custom-comparison-function)

35. Keys must be stable, unique among siblings, derived from data
    Why: Index keys / Math.random keys cause React to mismatch components → wrong state, lost input.
    [docs](https://react.dev/learn/rendering-lists#rules-of-keys)

36. To reset a component's state, change its `key`
    Why: React preserves state by position+key. Same position + new key = teardown + fresh mount.
    [docs](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key)

37. Keep component bodies pure
    Why: StrictMode double-invokes render to detect impurity. Side effects during render run twice or more.
    [docs](https://react.dev/learn/keeping-components-pure)

38. Don't store, store's instances via non-lazy `useState(new Store())`
    Why: `new Store()` runs every render; `makeAutoObservable` counts as mutation; React throws "Maximum update depth exceeded."
    [docs](https://github.com/mobxjs/mobx/issues/3728)

39. Don't mirror observable state into React useState
    Why: MobX is the source of truth. Mirroring desyncs and forces effect chains.
    [docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

40. Wrap event handlers in `action(...)` if they do multiple mutations
    Why: The outermost transaction batches updates. Multiple sequential actions = multiple commits.
    [docs](https://mobx.js.org/actions.html#wrapping-functions-using-action)

41. `autorun` belongs in `useEffect`, never in event handlers
    Why: Calling autorun in a handler creates a new reaction every time, never disposed = leak.
    [docs](https://mobx.js.org/reactions.html)

42. Reactions shouldn't mutate observables — use computed instead
    Why: Reaction-driven mutations create derivation chains that can loop or fire reactions out of order.
    [docs](https://mobx.js.org/reactions.html#reactions-shouldnt-update-other-observables)

43. Don't destructure observables in render or in effect deps
    Why: Destructuring reads the property eagerly outside the observer's tracking, breaking reactivity.
    [docs](https://github.com/mobxjs/mobx/issues/2992)

44. Apply `observer` last (innermost) in HOC chains
    Why: If wrapped by another HOC first, observer's reaction may not be set up correctly.
    [docs](https://mobx.js.org/react-integration.html)
