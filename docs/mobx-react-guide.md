# MobX + React Guide

Concrete rules. Examples are linked, not inlined.

## MobX core

### Use `makeAutoObservable(this)` in class constructors
Why: Auto-infers properties as observable, getters as computed, methods as autoAction. No manual annotation.
[docs](https://mobx.js.org/observable-state.html#makeautoobservable)

### Never subclass a class that uses `makeAutoObservable`
Why: makeAutoObservable cannot be used on classes with super or subclasses. Throws at runtime.
[docs](https://mobx.js.org/observable-state.html#limitations)

### Call `make(Auto)Observable` unconditionally and after fields are initialized
Why: Skipping fields or conditional calls cache invalid inference results — silent breakage.
[docs](https://mobx.js.org/observable-state.html#limitations)

### Always dispose `autorun`/`reaction`/`when` returns
Why: Reactions hold references to the observables they watch — undisposed = memory leak.
[docs](https://mobx.js.org/reactions.html#always-dispose-of-reactions)

### Use `runInAction` after every `await` in async code
Why: action wrapping doesn't extend across await ticks. Each post-await block needs its own action.
[docs](https://mobx.js.org/actions.html#asynchronous-actions)

### Use `flow` (generators) for non-trivial async, not async/await
Why: flow auto-wraps each yield, supports cancellation. async/await needs manual runInAction per tick.
[docs](https://mobx.js.org/actions.html#using-flow-instead-of-async--await-)

### Computed values are NOT cached when read outside a reaction
Why: computeds memoize only when an active observer (autorun/reaction/observer) tracks them. Otherwise: full recompute every read.
[docs](https://mobx.js.org/computeds.html#tips)

### `enforceActions: 'observed'` is the recommended default
Why: Strict enough to catch mutations to observed state, loose enough to allow construction. `'always'` is overkill.
[docs](https://mobx.js.org/configuration.html#linting-options)

### Use `isObservableArray()` instead of `Array.isArray()` for observable arrays
Why: With `useProxies: 'never'`, observable arrays fail Array.isArray. isObservableArray works in all configurations.
[docs](https://mobx.js.org/api.html#isobservablearray)

### Use `replace()` / `clear()` / `splice()` on observable arrays — not direct `.length =` assignment
Why: Direct length manipulation has historical issues; the named methods are documented and safe.
[docs](https://mobx.js.org/api.html#observablearray)

## mobx-react-lite

### Wrap every component that reads observable data with `observer`
Why: Without observer, the component won't re-render when observables change. Silent staleness, no error. Most common mistake.
[docs](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components)

### Never wrap `observer(Component)` in `React.memo` again
Why: observer auto-applies memo. Double-wrapping throws a runtime error.
[docs](https://mobx.js.org/react-integration.html#observer-or-reactmemo)

### Render lists in dedicated observer components
Why: When the parent's other state changes, the entire list reconciles — expensive even if items are memoized.
[docs](https://mobx.js.org/react-optimizations.html#render-lists-in-dedicated-components)

### Dereference observable values as late as possible
Why: Reading rect.x in the parent makes the parent re-render on rect.x change. Reading rect.x in the leaf scopes the re-render to the leaf.
[docs](https://mobx.js.org/react-optimizations.html#dereference-values-late)

### Don't pass observable objects to non-observer components
Why: Non-observer children won't subscribe — observable changes won't trigger their re-render. Convert to plain values or wrap them.
[docs](https://mobx.js.org/react-integration.html#dont-pass-observables-into-components-that-arent-observer)

### Use `<Observer>` wrapper for callback children passed to non-observer libraries
Why: A render-prop callback runs in the parent library's render cycle, not the observer's. Wrap the callback body in <Observer>.
[docs](https://mobx.js.org/react-integration.html#callback-components-might-require-observer)

### Use `useLocalObservable` for component-local state
Why: One-line shorthand for `useState(() => observable(initializer(), {}, { autoBind: true }))`. Auto-binds methods.
[docs](https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/README.md#uselocalobservable)

### Don't reference component props inside `useLocalObservable` initializer
Why: Initializer runs once. Captured props become stale on later renders. Sync via useEffect.
[docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

### Don't use array indexes as React keys for observable lists
Why: When items are added/removed/reordered, index-keyed components reuse the wrong instances — ghost state.
[docs](https://mobx.js.org/react-optimizations.html#dont-use-array-indexes-as-keys)

## React useEffect

### Window event listener: subscribe in setup, unsubscribe in cleanup
Why: Without cleanup, listener accumulates on every effect re-run; StrictMode double-invocation makes the leak immediate.
[docs](https://react.dev/learn/synchronizing-with-effects#subscribing-to-events)

### Cleanup function must mirror setup exactly
Why: addEventListener ↔ removeEventListener with the SAME handler reference. Different references = no removal.
[docs](https://react.dev/reference/react/useEffect#parameters)

### Never suppress the exhaustive-deps lint
Why: Stale closures captured in suppressed effects fire forever with old values — bugs that span components, hard to find.
[docs](https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code)

### Object/function dependencies in deps array cause needless re-runs
Why: Object literals are reference-different each render. Move static objects out of component, or destructure to primitives.
[docs](https://react.dev/learn/removing-effect-dependencies#do-you-want-to-read-a-value-without-reacting-to-its-changes)

### Don't derive state in useEffect when it can be computed during render
Why: Effect-driven state causes an extra render cycle. Compute derived values inline; use useMemo only if measurably expensive.
[docs](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

### Use `useSyncExternalStore` for browser APIs and external stores
Why: Concurrent-safe and tear-free. useEffect+useState mirroring can show stale values during concurrent renders.
[docs](https://react.dev/reference/react/useSyncExternalStore)

### Effects = side effects from rendering. Event handlers = side effects from interactions.
Why: Notifications/messages on user click belong in handlers, not effects. Effects re-run when component renders.
[docs](https://react.dev/learn/you-might-not-need-an-effect#sending-an-analytics-event)

### Test with StrictMode on. Effects run setup → cleanup → setup in dev.
Why: If your effect breaks under double-invocation, the cleanup is incomplete. Production will eventually hit the same scenario.
[docs](https://react.dev/reference/react/useEffect#caveats)

## React hooks

### Pass a function to `useState` for expensive initialization, not the result
Why: `useState(createStore())` runs createStore on every render. `useState(createStore)` runs it once.
[docs](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

### Initializer function must be pure (StrictMode calls it twice)
Why: StrictMode invokes initializers twice in dev to detect impurities. Side effects in initializer run twice.
[docs](https://react.dev/reference/react/useState#caveats)

### Use `useRef` for values that should NOT trigger re-renders
Why: Mutating ref.current doesn't re-render. Right for timer IDs, DOM nodes, drag-state during a gesture.
[docs](https://react.dev/learn/referencing-values-with-refs)

### Don't read or write `ref.current` during render (except lazy init)
Why: Render must be pure. Reading/writing during render makes component output non-deterministic.
[docs](https://react.dev/reference/react/useRef#caveats)

### `useMemo` and `useCallback` are only for `memo`-wrapped consumers or hook deps
Why: Otherwise they add overhead without benefit. Single "always new" prop defeats memoization downstream anyway.
[docs](https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere)

### `React.memo` does shallow Object.is comparison
Why: New object/array/function references each render = memo always sees "different." Stabilize via useMemo/useCallback if needed.
[docs](https://react.dev/reference/react/memo#minimizing-props-changes)

### Custom `arePropsEqual` must compare every prop, including functions
Why: If a function comparison returns true incorrectly, the closure freezes — handlers see stale state.
[docs](https://react.dev/reference/react/memo#specifying-a-custom-comparison-function)

### Keys must be stable, unique among siblings, derived from data
Why: Index keys / Math.random keys cause React to mismatch components → wrong state, lost input, full DOM recreation.
[docs](https://react.dev/learn/rendering-lists#rules-of-keys)

### To reset a component's state, change its `key`
Why: React preserves state by position+key. Same position + new key = teardown + fresh mount.
[docs](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key)

### Component bodies must be pure (StrictMode renders twice)
Why: StrictMode double-invokes render to detect impurity. Side effects during render run twice or more in concurrent mode.
[docs](https://react.dev/learn/keeping-components-pure)

## MobX + React intersection

### Don't store store instances via non-lazy `useState(new Store())`
Why: `new Store()` runs on every render; `makeAutoObservable` counts as mutation; React throws "Maximum update depth exceeded."
[docs](https://github.com/mobxjs/mobx/issues/3728)

### Don't mirror observable state into React useState
Why: MobX is the source of truth. Mirroring desyncs and forces effect chains. Use `observer` to read directly.
[docs](https://mobx.js.org/react-integration.html#using-local-observable-state-in-observer-components)

### Wrap event handlers in `action(...)` if they do multiple mutations
Why: The outermost transaction batches updates. Multiple sequential actions = multiple commits.
[docs](https://mobx.js.org/actions.html#wrapping-functions-using-action)

### `autorun` belongs in `useEffect`, never in event handlers
Why: Calling autorun in a handler creates a new reaction every time, never disposed = guaranteed leak.
[docs](https://mobx.js.org/reactions.html)

### Reactions shouldn't mutate observables — use computed instead
Why: Reaction-driven mutations create derivation chains that can loop or fire reactions out of order.
[docs](https://mobx.js.org/reactions.html#reactions-shouldnt-update-other-observables)

### Don't destructure observables in render or in effect deps
Why: Destructuring reads the property eagerly outside the observer's tracking, breaking reactivity. Triggers `observableRequiresReaction` warnings.
[docs](https://github.com/mobxjs/mobx/issues/2992)

### `observer` is the innermost (first applied) decorator
Why: If wrapped by another HOC first, observer's reaction may not be set up correctly. Apply observer last.
[docs](https://mobx.js.org/react-integration.html)
