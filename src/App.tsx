import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { type MouseEvent } from 'react'
import rough from 'roughjs'
import { CanvasStore, type MouseInput, type PathSpec, type TextSpec, type ViewItem, type Tool, type Widget } from './store'
import { Point2d } from './geom/Point2d'
import { assertNever } from './utils'

const paletteGenerator = rough.generator()

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

function renderViewItem(item: ViewItem) {
    // CSS transform (not SVG `transform` attribute) so Chrome can composite on the GPU
    // without triggering layout/style recalc per frame.
    const style = { transform: `translate(${item.origin.xCoordinate}px, ${item.origin.yCoordinate}px)`, willChange: 'transform' as const }
    switch (item.tag) {
        case 'rect':
            return <g key={item.id} style={style}>{item.paths.map(renderPath)}</g>
        case 'button':
            return (
                <g key={item.id} style={style}>
                    {item.paths.map(renderPath)}
                    {renderText(item.text)}
                </g>
            )
        case 'browser':
            return <g key={item.id} style={style}>{item.paths.map(renderPath)}</g>
        default:
            return assertNever(item)
    }
}

const WidgetView = observer(function WidgetView({ widget }: { widget: Widget }) {
    return renderViewItem(widget.viewItem)
})

const CommittedWidgets = observer(function CommittedWidgets({ store }: { store: CanvasStore }) {
    return <>{store.widgets.map(w => <WidgetView key={w.id} widget={w} />)}</>
})

const Preview = observer(function Preview({ store }: { store: CanvasStore }) {
    const item = store.previewViewItem
    return item ? renderViewItem(item) : null
})

const Ghost = observer(function Ghost({ store }: { store: CanvasStore }) {
    const item = store.ghostViewItem
    return item ? renderViewItem(item) : null
})

const SelectionBorder = observer(function SelectionBorder({ store }: { store: CanvasStore }) {
    const box = store.selectionBox
    if (!box) return null
    // CSS transform on the group — composited, no layout/style recalc per frame.
    return (
        <g style={{ transform: `translate(${box.minX}px, ${box.minY}px)`, willChange: 'transform' }}>
            <rect
                x={0}
                y={0}
                width={box.width}
                height={box.height}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="4 2"
            />
        </g>
    )
})

export default observer(function App() {
    const [store] = useState(() => new CanvasStore())

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => store.handleKeyDown({ key: e.key })
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [store])

    // Cache SVG bounding rect; calling getBoundingClientRect per mousemove forces synchronous
    // layout because React has just mutated the DOM. Refresh the cache only on resize.
    const svgRef = useRef<SVGSVGElement | null>(null)
    const svgRectRef = useRef<{ left: number; top: number }>({ left: 0, top: 0 })
    useEffect(() => {
        const el = svgRef.current
        if (!el) return
        const refresh = () => {
            const r = el.getBoundingClientRect()
            svgRectRef.current = { left: r.left, top: r.top }
        }
        refresh()
        const ro = new ResizeObserver(refresh)
        ro.observe(el)
        window.addEventListener('scroll', refresh, true)
        window.addEventListener('resize', refresh)
        return () => {
            ro.disconnect()
            window.removeEventListener('scroll', refresh, true)
            window.removeEventListener('resize', refresh)
        }
    }, [])

    // Landmine: returns SVG viewport coords. Coord-space mismatch risk when infinite canvas / pan / zoom lands.
    const toMouseInput = (e: MouseEvent<SVGSVGElement>): MouseInput => {
        const { left, top } = svgRectRef.current
        return { point: Point2d.xy(e.clientX - left, e.clientY - top), button: e.button }
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-gray-200 select-none">
            <main
                className="absolute top-4 right-4 bottom-4 left-[152px] overflow-hidden rounded-xl shadow-lg bg-gray-50"
                style={{
                    backgroundImage:
                        'linear-gradient(#e5e7eb 1px, transparent 1px),' +
                        'linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            >
                <svg
                    ref={svgRef}
                    className="h-full w-full"
                    onMouseDown={e => store.handleMouseDown(toMouseInput(e))}
                    onMouseMove={e => store.handleMouseMove(toMouseInput(e))}
                    onMouseUp={e => store.handleMouseUp(toMouseInput(e))}
                >
                    <CommittedWidgets store={store} />
                    <Preview store={store} />
                    <Ghost store={store} />
                    <SelectionBorder store={store} />
                </svg>
            </main>
            <Sidebar store={store} />
        </div>
    )
})

function RectPreview() {
    // Square viewBox so the preview fills the square card. Content occupies nearly the full box.
    const paths = paletteGenerator.toPaths(paletteGenerator.rectangle(8, 8, 84, 84, { seed: 101, roughness: 1 }))
    return (
        <svg viewBox="0 0 100 100" className="block w-full h-full">
            {paths.map(p => <path key={p.d} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />)}
        </svg>
    )
}

function ButtonPreview() {
    const paths = paletteGenerator.toPaths(paletteGenerator.rectangle(12, 38, 76, 24, { seed: 102, roughness: 1 }))
    return (
        <svg viewBox="0 0 100 100" className="block w-full h-full">
            {paths.map(p => <path key={p.d} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />)}
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontFamily='"Kalam", cursive' fontSize={14} fill="#111">
                Button
            </text>
        </svg>
    )
}

function BrowserPreview() {
    const frame = paletteGenerator.toPaths(paletteGenerator.rectangle(6, 16, 88, 68, { seed: 201, roughness: 1 }))
    const titleSep = paletteGenerator.toPaths(paletteGenerator.line(6, 32, 94, 32, { seed: 202, roughness: 1 }))
    const lights = [0, 1, 2].map((i) =>
        paletteGenerator.toPaths(paletteGenerator.circle(14 + i * 7, 24, 4, { seed: 203 + i, roughness: 1.2 })),
    )
    return (
        <svg viewBox="0 0 100 100" className="block w-full h-full">
            {frame.map(p => <path key={`f${p.d}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />)}
            {titleSep.map(p => <path key={`s${p.d}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />)}
            {lights.flatMap((pths, i) => pths.map(p => <path key={`l${i}-${p.d}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />))}
        </svg>
    )
}

const Sidebar = observer(function Sidebar({ store }: { store: CanvasStore }) {
    const tools: ReadonlyArray<{ id: Tool; preview: React.ReactNode }> = [
        { id: 'rect', preview: <RectPreview /> },
        { id: 'button', preview: <ButtonPreview /> },
        { id: 'browser', preview: <BrowserPreview /> },
    ]
    return (
        <aside
            className="absolute left-4 top-4 bottom-4 w-[120px] rounded-[10px] bg-gray-50 flex flex-col overflow-hidden"
            style={{
                boxShadow:
                    '0 12px 24px -6px rgba(0,0,0,0.22), 0 4px 8px -4px rgba(0,0,0,0.14)',
            }}
        >
            <div className="flex gap-[3px] px-3 pt-3">
                {Array.from({ length: 15 }).map((_, i) => (
                    <span
                        key={i}
                        className="w-px bg-gray-700"
                        style={{
                            height: i % 2 === 0 ? 10 : 5,
                            opacity: i % 2 === 0 ? 1 : 0.4,
                        }}
                    />
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col items-center gap-3">
                {tools.map(t => {
                    const active = store.activeTool === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => store.setTool(t.id)}
                            className={
                                'rounded-md p-1.5 transition border aspect-square w-full flex items-center justify-center shadow-sm ' +
                                (active
                                    ? 'bg-blue-50 border-blue-400'
                                    : 'bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400')
                            }
                        >
                            {t.preview}
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-col items-center gap-3 pt-2 pb-3">
                <button aria-label="Add" className="opacity-60 hover:opacity-100 transition">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2v10M2 7h10" stroke="#374151" strokeWidth="1.4" strokeLinecap="square" />
                    </svg>
                </button>
                <div
                    className="text-[9px] tracking-[0.18em] text-gray-500"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                    MB · 09
                </div>
            </div>
        </aside>
    )
})
