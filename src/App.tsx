import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import { CanvasStore, type MouseInput, type PathSpec, type TextSpec, type WidgetViewModel, type Widget } from './store'
import { Point2d } from './geom/Point2d'
import { FontSamples } from './FontSamples'
import { BrowserMock } from './BrowserMock'
import { assertNever } from './utils'

function renderPath(p: PathSpec) {
    return <path key={p.id} {...p.svgProps} />
}

function renderText(t: TextSpec) {
    return (
        <text key={t.id} x={t.center.xCoordinate} y={t.center.yCoordinate} {...t.svgProps}>
            {t.text}
        </text>
    )
}

function renderView(vm: WidgetViewModel) {
    switch (vm.tag) {
        case 'rect':
            return <g>{vm.paths.map(renderPath)}</g>
        case 'button':
            return (
                <g>
                    {vm.paths.map(renderPath)}
                    {renderText(vm.text)}
                </g>
            )
        default:
            return assertNever(vm)
    }
}

// Per-widget observer — subscribes only to `widget.viewModel`, which depends on this
// widget's own fields. Dragging widget A invalidates only A's viewModel computed; other
// WidgetViews stay silent. "Dereference late" (react-integration L236, react-optimizations L69).
const WidgetView = observer(function WidgetView({ widget }: { widget: Widget }) {
    return renderView(widget.viewModel)
})

// Thin observer over the widgets array. Renders per-widget children; subscribes only
// to the array identity/length (add, remove, reorder), not to individual widget fields.
const WidgetsView = observer(function WidgetsView({ store }: { store: CanvasStore }) {
    return <>{store.widgets.map(w => <WidgetView key={w.id} widget={w} />)}</>
})

const Preview = observer(function Preview({ store }: { store: CanvasStore }) {
    const vm = store.previewViewModel
    return vm ? renderView(vm) : null
})

const Ghost = observer(function Ghost({ store }: { store: CanvasStore }) {
    const vm = store.ghostViewModel
    return vm ? renderView(vm) : null
})

const Canvas = observer(function Canvas({ store }: { store: CanvasStore }) {
    return (
        <>
            <WidgetsView store={store} />
            <Preview store={store} />
            <Ghost store={store} />
        </>
    )
})

const SelectionBorder = observer(function SelectionBorder({ store }: { store: CanvasStore }) {
    const box = store.selectionBox
    if (!box) return null
    return (
        <rect
            x={box.minX}
            y={box.minY}
            width={box.width}
            height={box.height}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="4 2"
        />
    )
})

export default observer(function App() {
    const [store] = useState(() => new CanvasStore())

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => store.handleKeyDown({ key: e.key })
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [store])

    // Landmine: returns SVG viewport coords. Coord-space mismatch risk when infinite canvas / pan / zoom lands.
    const toMouseInput = (e: MouseEvent<SVGSVGElement>): MouseInput => {
        const box = e.currentTarget.getBoundingClientRect()
        return { point: Point2d.xy(e.clientX - box.left, e.clientY - box.top), button: e.button }
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-white select-none">
            <svg
                className="h-full w-full"
                onMouseDown={e => store.handleMouseDown(toMouseInput(e))}
                onMouseMove={e => store.handleMouseMove(toMouseInput(e))}
                onMouseUp={e => store.handleMouseUp(toMouseInput(e))}
            >
                <Canvas store={store} />
                <SelectionBorder store={store} />
                <FontSamples />
                <BrowserMock />
            </svg>
        </div>
    )
})
