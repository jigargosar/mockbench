import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import rough from 'roughjs'
import { CanvasStore, type MouseInput, type Rect } from './store'
import type { BoundingBox2d } from './geom/BoundingBox2d'
import { Point2d } from './geom/Point2d'
import { FontSamples } from './FontSamples'

// AI: figure out a way to make this non-global.
const generator = rough.generator()

function RoughRect({ box, seed }: { box: BoundingBox2d; seed: number }) {
    const { x, y, w, h } = box.toObject()
    const paths = generator.toPaths(generator.rectangle(x, y, w, h, { seed }))
    return (
        <g>
            {paths.map((p) => (
                // Path `d` is stable per rect+seed and distinct across outline/fill; safe as key.
                <path key={p.d} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
            ))}
        </g>
    )
}

const RectItem = observer(function RectItem({ rect }: { rect: Rect }) {
    return <RoughRect box={rect.box} seed={rect.seed} />
})

const RectsView = observer(function RectsView({ store }: { store: CanvasStore }) {
    return (
        <>
            {store.rects.map(r => (
                <RectItem rect={r} key={r.id} />
            ))}
        </>
    )
})

const Preview = observer(function Preview({ store }: { store: CanvasStore }) {
    const p = store.previewRect
    if (!p) return null
    return <RoughRect box={p.box} seed={p.seed} />
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
