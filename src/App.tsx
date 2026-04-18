import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import { CanvasStore, type MouseInput, type PathSpec } from './store'
import { Point2d } from './geom/Point2d'
import { FontSamples } from './FontSamples'

function RoughRect({ paths }: { paths: ReadonlyArray<PathSpec> }) {
    return (
        <g>
            {paths.map(p => (
                <path key={p.key} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
            ))}
        </g>
    )
}

const RectsView = observer(function RectsView({ store }: { store: CanvasStore }) {
    return (
        <>
            {store.committedShapes.map(s => (
                <RoughRect key={s.id} paths={s.paths} />
            ))}
        </>
    )
})

const Preview = observer(function Preview({ store }: { store: CanvasStore }) {
    const paths = store.previewPaths
    if (!paths) return null
    return <RoughRect paths={paths} />
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
        <div className="h-screen w-screen overflow-hidden bg-white">
            <svg
                className="h-full w-full"
                onMouseDown={e => store.handleMouseDown(toMouseInput(e))}
                onMouseMove={e => store.handleMouseMove(toMouseInput(e))}
                onMouseUp={e => store.handleMouseUp(toMouseInput(e))}
            >
                <RectsView store={store} />
                <Preview store={store} />
                <SelectionBorder store={store} />
                <FontSamples />
            </svg>
        </div>
    )
})
