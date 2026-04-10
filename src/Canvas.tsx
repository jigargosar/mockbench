import { useEffect, useRef, useState } from 'react'
import RoughRect from './RoughRect'
import { useCanvasStore } from './store'

const HANDLE_SIZE = 8
const HANDLE_HALF = HANDLE_SIZE / 2
const HIT_SIZE = 20
const HIT_HALF = HIT_SIZE / 2

const RESIZE_DIR: Record<string, { dx: number; dy: number; dw: number; dh: number }> = {
    nw: { dx: 1, dy: 1, dw: -1, dh: -1 },
    n:  { dx: 0, dy: 1, dw:  0, dh: -1 },
    ne: { dx: 0, dy: 1, dw:  1, dh: -1 },
    e:  { dx: 0, dy: 0, dw:  1, dh:  0 },
    se: { dx: 0, dy: 0, dw:  1, dh:  1 },
    s:  { dx: 0, dy: 0, dw:  0, dh:  1 },
    sw: { dx: 1, dy: 0, dw: -1, dh:  1 },
    w:  { dx: 1, dy: 0, dw: -1, dh:  0 },
}

const CURSOR_MAP: Record<string, string> = {
    nw: 'nwse-resize', se: 'nwse-resize',
    ne: 'nesw-resize', sw: 'nesw-resize',
    n: 'ns-resize', s: 'ns-resize',
    e: 'ew-resize', w: 'ew-resize',
}

const SNAP_THRESHOLD = 5

type Gesture =
    | { type: 'drag'; elementId: string; startX: number; startY: number; elX: number; elY: number }
    | { type: 'resize'; elementId: string; dir: string; startX: number; startY: number; elX: number; elY: number; elW: number; elH: number }
    | { type: 'pan'; startX: number; startY: number; panX: number; panY: number }

interface SnapLine { axis: 'h' | 'v'; pos: number }

function computeSnap(
    bounds: { x: number; y: number; width: number; height: number },
    others: Array<{ x: number; y: number; width: number; height: number }>,
): { x: number; y: number; lines: SnapLine[] } {
    let { x, y } = bounds
    const lines: SnapLine[] = []
    const edges = {
        l: x, cx: x + bounds.width / 2, r: x + bounds.width,
        t: y, cy: y + bounds.height / 2, b: y + bounds.height,
    }

    for (const o of others) {
        const oe = { l: o.x, cx: o.x + o.width / 2, r: o.x + o.width, t: o.y, cy: o.y + o.height / 2, b: o.y + o.height }

        for (const [mine, theirs] of [[edges.l, oe.l], [edges.l, oe.r], [edges.r, oe.l], [edges.r, oe.r], [edges.cx, oe.cx]] as const) {
            if (Math.abs(mine - theirs) < SNAP_THRESHOLD) {
                x += theirs - mine
                edges.l = x; edges.cx = x + bounds.width / 2; edges.r = x + bounds.width
                lines.push({ axis: 'v', pos: theirs })
                break
            }
        }

        for (const [mine, theirs] of [[edges.t, oe.t], [edges.t, oe.b], [edges.b, oe.t], [edges.b, oe.b], [edges.cy, oe.cy]] as const) {
            if (Math.abs(mine - theirs) < SNAP_THRESHOLD) {
                y += theirs - mine
                edges.t = y; edges.cy = y + bounds.height / 2; edges.b = y + bounds.height
                lines.push({ axis: 'h', pos: theirs })
                break
            }
        }
    }

    return { x, y, lines }
}

export default function Canvas() {
    const elements = useCanvasStore((s) => s.elements)
    const selectedId = useCanvasStore((s) => s.selectedId)
    const viewport = useCanvasStore((s) => s.viewport)
    const selectElement = useCanvasStore((s) => s.selectElement)
    const updateElement = useCanvasStore((s) => s.updateElement)
    const addElement = useCanvasStore((s) => s.addElement)
    const deleteSelected = useCanvasStore((s) => s.deleteSelected)
    const panStore = useCanvasStore((s) => s.pan)
    const zoomTo = useCanvasStore((s) => s.zoomTo)
    const [cursor, setCursor] = useState('default')
    const [snapLines, setSnapLines] = useState<SnapLine[]>([])
    const gestureRef = useRef<Gesture | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const selected = selectedId ? elements.find((el) => el.id === selectedId) : undefined

    useEffect(() => { useCanvasStore.getState().load() }, [])

    useEffect(() => {
        const svg = svgRef.current
        if (!svg) return
        function onWheel(e: WheelEvent) {
            e.preventDefault()
            if (e.ctrlKey || e.metaKey) {
                const delta = -e.deltaY * 0.01
                const { zoom } = useCanvasStore.getState().viewport
                zoomTo(zoom * (1 + delta), e.clientX, e.clientY)
            } else {
                panStore(-e.deltaX, -e.deltaY)
            }
        }
        svg.addEventListener('wheel', onWheel, { passive: false })
        return () => svg.removeEventListener('wheel', onWheel)
    }, [panStore, zoomTo])

    useEffect(() => {
        const { undo, redo } = useCanvasStore.temporal.getState()
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelected()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
                e.preventDefault()
                redo()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                useCanvasStore.getState().save()
            }
            const nudge = e.shiftKey ? 10 : 1
            const sel = useCanvasStore.getState().selectedId
            if (sel && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault()
                const dx = e.key === 'ArrowLeft' ? -nudge : e.key === 'ArrowRight' ? nudge : 0
                const dy = e.key === 'ArrowUp' ? -nudge : e.key === 'ArrowDown' ? nudge : 0
                updateElement(sel, {
                    x: (useCanvasStore.getState().elements.find((el) => el.id === sel)?.x ?? 0) + dx,
                    y: (useCanvasStore.getState().elements.find((el) => el.id === sel)?.y ?? 0) + dy,
                })
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [deleteSelected])

    function startDrag(elementId: string, e: React.PointerEvent) {
        e.stopPropagation()
        selectElement(elementId)
        const el = useCanvasStore.getState().elements.find((el) => el.id === elementId)
        if (!el) throw new Error(`Element ${elementId} not found`)
        gestureRef.current = { type: 'drag', elementId, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y }
        setCursor('grabbing')
        useCanvasStore.temporal.getState().pause()
        ;(e.target as Element).setPointerCapture(e.pointerId)
    }

    function startResize(dir: string, e: React.PointerEvent) {
        e.stopPropagation()
        if (!selectedId) return
        const el = useCanvasStore.getState().elements.find((el) => el.id === selectedId)
        if (!el) throw new Error(`Element ${selectedId} not found`)
        gestureRef.current = { type: 'resize', elementId: selectedId, dir, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y, elW: el.width, elH: el.height }
        setCursor(CURSOR_MAP[dir])
        useCanvasStore.temporal.getState().pause()
        ;(e.target as Element).setPointerCapture(e.pointerId)
    }

    function onCanvasPointerDown(e: React.PointerEvent) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault()
            const v = useCanvasStore.getState().viewport
            gestureRef.current = { type: 'pan', startX: e.clientX, startY: e.clientY, panX: v.panX, panY: v.panY }
            setCursor('grabbing')
            ;(e.target as Element).setPointerCapture(e.pointerId)
            return
        }
        selectElement(null)
    }

    function onPointerMove(e: React.PointerEvent) {
        const g = gestureRef.current
        if (!g) return
        const dx = e.clientX - g.startX
        const dy = e.clientY - g.startY

        if (g.type === 'pan') {
            panStore(e.movementX, e.movementY)
            return
        }

        const sdx = dx / viewport.zoom
        const sdy = dy / viewport.zoom

        if (g.type === 'drag') {
            const el = elements.find((el) => el.id === g.elementId)
            if (!el) throw new Error(`Element ${g.elementId} not found`)
            const others = elements.filter((o) => o.id !== g.elementId)
            const snap = computeSnap({ x: g.elX + sdx, y: g.elY + sdy, width: el.width, height: el.height }, others)
            setSnapLines(snap.lines)
            updateElement(g.elementId, { x: snap.x, y: snap.y })
        } else if (g.type === 'resize') {
            const d = RESIZE_DIR[g.dir]
            updateElement(g.elementId, {
                x: g.elX + sdx * d.dx,
                y: g.elY + sdy * d.dy,
                width: Math.max(20, g.elW + sdx * d.dw),
                height: Math.max(20, g.elH + sdy * d.dh),
            })
        }
    }

    function onPointerUp() {
        gestureRef.current = null
        setCursor('default')
        setSnapLines([])
        useCanvasStore.temporal.getState().resume()
    }

    function handlePositions(el: { x: number; y: number; width: number; height: number }) {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        return {
            nw: [el.x, el.y],
            n:  [cx, el.y],
            ne: [el.x + el.width, el.y],
            e:  [el.x + el.width, cy],
            se: [el.x + el.width, el.y + el.height],
            s:  [cx, el.y + el.height],
            sw: [el.x, el.y + el.height],
            w:  [el.x, cy],
        }
    }

    return (
        <>
        <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor }}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
            {elements.map((el) => (
                <RoughRect
                    key={el.id}
                    element={el}
                    onPointerDown={(e: React.PointerEvent) => startDrag(el.id, e)}
                />
            ))}
            {selected && (
                <>
                    <rect
                        x={selected.x - 2}
                        y={selected.y - 2}
                        width={selected.width + 4}
                        height={selected.height + 4}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        strokeDasharray="6 3"
                        pointerEvents="none"
                    />
                    {Object.entries(handlePositions(selected)).map(([dir, [hx, hy]]) => (
                        <g key={dir}>
                            <rect
                                x={hx - HIT_HALF}
                                y={hy - HIT_HALF}
                                width={HIT_SIZE}
                                height={HIT_SIZE}
                                fill="transparent"
                                stroke="none"
                                style={{ cursor: CURSOR_MAP[dir] }}
                                onPointerDown={(e) => startResize(dir, e)}
                            />
                            <rect
                                x={hx - HANDLE_HALF}
                                y={hy - HANDLE_HALF}
                                width={HANDLE_SIZE}
                                height={HANDLE_SIZE}
                                fill="white"
                                stroke="#3b82f6"
                                strokeWidth={1.5}
                                pointerEvents="none"
                            />
                        </g>
                    ))}
                </>
            )}
            {snapLines.map((line, i) => (
                <line
                    key={i}
                    x1={line.axis === 'v' ? line.pos : -99999}
                    y1={line.axis === 'h' ? line.pos : -99999}
                    x2={line.axis === 'v' ? line.pos : 99999}
                    y2={line.axis === 'h' ? line.pos : 99999}
                    stroke="#f43f5e"
                    strokeWidth={0.5 / viewport.zoom}
                    strokeDasharray={`${4 / viewport.zoom} ${2 / viewport.zoom}`}
                    pointerEvents="none"
                />
            ))}
            </g>
        </svg>
        <div className="absolute top-4 left-4 flex gap-2">
            {(['rect', 'button', 'input', 'text'] as const).map((type) => (
                <button
                    key={type}
                    className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 capitalize"
                    onClick={() => addElement(type, 100 + Math.random() * 400, 100 + Math.random() * 300)}
                >
                    + {type}
                </button>
            ))}
        </div>
        </>
    )
}
