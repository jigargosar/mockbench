import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import rough from 'roughjs'
import { CanvasStore, type MouseInput, type Rect } from './store'

const generator = rough.generator()

function RoughRect({ x, y, w, h, seed }: { x: number; y: number; w: number; h: number; seed: number }) {
    const paths = generator.toPaths(generator.rectangle(x, y, w, h, { seed }))
    return (
        <g>
            {paths.map((p, i) => (
                <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
            ))}
        </g>
    )
}

const RectItem = observer(function RectItem({ rect }: { rect: Rect }) {
    return <RoughRect x={rect.x} y={rect.y} w={rect.w} h={rect.h} seed={rect.seed} />
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
    return <RoughRect x={p.x} y={p.y} w={p.w} h={p.h} seed={p.seed} />
})

const SelectionBorder = observer(function SelectionBorder({ store }: { store: CanvasStore }) {
    const sel = store.selectedRect
    if (!sel) return null
    return (
        <rect
            x={sel.x - 4}
            y={sel.y - 4}
            width={sel.w + 8}
            height={sel.h + 8}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="4 2"
        />
    )
})

export default function App() {
    const [store] = useState(() => new CanvasStore())

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => store.handleKeyDown({ key: e.key })
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [store])

    const toMouseInput = (e: MouseEvent<SVGSVGElement>): MouseInput => {
        const box = e.currentTarget.getBoundingClientRect()
        return { x: e.clientX - box.left, y: e.clientY - box.top, button: e.button }
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
            </svg>
        </div>
    )
}
