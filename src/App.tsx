import { useEffect, useMemo, memo } from 'react'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import rough from 'roughjs'

const generator = rough.generator()

type Rect = {
    id: string
    x: number
    y: number
    w: number
    h: number
    seed: number
}

type Drawing = {
    x0: number
    y0: number
    x1: number
    y1: number
    seed: number
}

function drawingBounds(d: Drawing) {
    return {
        x: Math.min(d.x0, d.x1),
        y: Math.min(d.y0, d.y1),
        w: Math.abs(d.x1 - d.x0),
        h: Math.abs(d.y1 - d.y0),
    }
}

function hitTest(rects: Rect[], x: number, y: number): Rect | undefined {
    for (let i = rects.length - 1; i >= 0; i--) {
        const r = rects[i]
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r
    }
    return undefined
}

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

const Preview = observer(function Preview({ store }: { store: { drawing: Drawing | null } }) {
    if (!store.drawing) return null
    const b = drawingBounds(store.drawing)
    if (b.w <= 0 || b.h <= 0) return null
    return <RoughRect x={b.x} y={b.y} w={b.w} h={b.h} seed={store.drawing.seed} />
})

const SelectionBorder = observer(function SelectionBorder({ store }: { store: { selectedId: string | null; rects: Rect[] } }) {
    if (!store.selectedId) return null
    const sel = store.rects.find(r => r.id === store.selectedId)
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
    const store = useLocalObservable(() => ({
        rects: [] as Rect[],
        drawing: null as Drawing | null,
        selectedId: null as string | null,

        selectRect(id: string | null) {
            this.selectedId = id
        },
        deleteSelected() {
            if (!this.selectedId) return
            this.rects = this.rects.filter(r => r.id !== this.selectedId)
            this.selectedId = null
        },
        startDrawing(x: number, y: number) {
            this.selectedId = null
            this.drawing = {
                x0: x, y0: y, x1: x, y1: y,
                seed: Math.floor(Math.random() * 10000),
            }
        },
        updateDrawing(x: number, y: number) {
            if (!this.drawing) return
            this.drawing.x1 = x
            this.drawing.y1 = y
        },
        finishDrawing() {
            if (!this.drawing) return
            const b = drawingBounds(this.drawing)
            if (b.w > 2 && b.h > 2) {
                this.rects.push({ id: crypto.randomUUID(), ...b, seed: this.drawing.seed })
            }
            this.drawing = null
        },
        handleMouseDown(x: number, y: number) {
            const hit = hitTest(this.rects, x, y)
            if (hit) {
                this.selectRect(hit.id)
                return
            }
            this.startDrawing(x, y)
        },
        handleMouseMove(x: number, y: number) {
            this.updateDrawing(x, y)
        },
        handleKeyDown(key: string) {
            if (key === 'Delete' || key === 'Backspace') {
                this.deleteSelected()
            } else if (key === 'Escape') {
                this.selectRect(null)
            }
        },
    }))

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedId) {
                e.preventDefault()
            }
            store.handleKeyDown(e.key)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
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
                onMouseUp={() => store.finishDrawing()}
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
