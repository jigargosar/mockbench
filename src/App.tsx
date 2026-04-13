import { useEffect, useMemo, memo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { autorun } from 'mobx'
import { type MouseEvent } from 'react'
import rough from 'roughjs'
import { CanvasStore } from './store'

const generator = rough.generator()

const RoughRect = memo(function RoughRect({ x, y, w, h, seed }: { x: number; y: number; w: number; h: number; seed: number }) {
    const paths = useMemo(
        () => generator.toPaths(generator.rectangle(x, y, w, h, { seed })),
        [x, y, w, h, seed],
    )
    return (
        <g>
            {paths.map((p, i) => (
                <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
            ))}
        </g>
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

export default observer(function App() {
    const [store] = useState(() => new CanvasStore())

    useEffect(() => {
        let hasSelection = false
        const dispose = autorun(() => {
            hasSelection = store.hasSelection
        })
        const onKey = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
                e.preventDefault()
            }
            store.handleKeyDown(e.key)
        }
        window.addEventListener('keydown', onKey)
        return () => {
            dispose()
            window.removeEventListener('keydown', onKey)
        }
    }, [store])

    const pointFromEvent = (e: MouseEvent<SVGSVGElement>) => {
        const box = e.currentTarget.getBoundingClientRect()
        return { x: e.clientX - box.left, y: e.clientY - box.top }
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-white">
            <svg
                className="h-full w-full"
                onMouseDown={e => { const { x, y } = pointFromEvent(e); store.handleMouseDown(x, y) }}
                onMouseMove={e => { const { x, y } = pointFromEvent(e); store.handleMouseMove(x, y) }}
                onMouseUp={() => store.handleMouseUp()}
            >
                {store.rects.map(r => (
                    <RoughRect key={r.id} x={r.x} y={r.y} w={r.w} h={r.h} seed={r.seed} />
                ))}
                <Preview store={store} />
                <SelectionBorder store={store} />
            </svg>
        </div>
    )
})
