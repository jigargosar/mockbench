import { useEffect, useRef, useState, type MouseEvent } from 'react'
import rough from 'roughjs'

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

export default function App() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [rects, setRects] = useState<Rect[]>([])
    const [drawing, setDrawing] = useState<Drawing | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        const svg = svgRef.current
        if (!svg) return
        while (svg.firstChild) svg.removeChild(svg.firstChild)
        const rc = rough.svg(svg)
        for (const r of rects) {
            svg.appendChild(rc.rectangle(r.x, r.y, r.w, r.h, { seed: r.seed }))
        }
        if (drawing) {
            const b = drawingBounds(drawing)
            if (b.w > 0 && b.h > 0) {
                svg.appendChild(rc.rectangle(b.x, b.y, b.w, b.h, { seed: drawing.seed }))
            }
        }
        if (selectedId) {
            const sel = rects.find(r => r.id === selectedId)
            if (sel) {
                const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
                border.setAttribute('x', String(sel.x - 4))
                border.setAttribute('y', String(sel.y - 4))
                border.setAttribute('width', String(sel.w + 8))
                border.setAttribute('height', String(sel.h + 8))
                border.setAttribute('fill', 'none')
                border.setAttribute('stroke', '#3b82f6')
                border.setAttribute('stroke-width', '1')
                border.setAttribute('stroke-dasharray', '4 2')
                svg.appendChild(border)
            }
        }
    }, [rects, drawing, selectedId])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    e.preventDefault()
                    setRects(prev => prev.filter(r => r.id !== selectedId))
                    setSelectedId(null)
                }
            } else if (e.key === 'Escape') {
                setSelectedId(null)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selectedId])

    const pointFromEvent = (e: MouseEvent<SVGSVGElement>) => {
        const box = e.currentTarget.getBoundingClientRect()
        return { x: e.clientX - box.left, y: e.clientY - box.top }
    }

    const onMouseDown = (e: MouseEvent<SVGSVGElement>) => {
        const { x, y } = pointFromEvent(e)
        const hit = hitTest(rects, x, y)
        if (hit) {
            setSelectedId(hit.id)
            return
        }
        setSelectedId(null)
        setDrawing({
            x0: x,
            y0: y,
            x1: x,
            y1: y,
            seed: Math.floor(Math.random() * 10000),
        })
    }

    const onMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        if (!drawing) return
        const { x, y } = pointFromEvent(e)
        setDrawing({ ...drawing, x1: x, y1: y })
    }

    const onMouseUp = () => {
        if (!drawing) return
        const b = drawingBounds(drawing)
        if (b.w > 2 && b.h > 2) {
            setRects(prev => [
                ...prev,
                { id: crypto.randomUUID(), ...b, seed: drawing.seed },
            ])
        }
        setDrawing(null)
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-white">
            <svg
                ref={svgRef}
                className="h-full w-full"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            />
        </div>
    )
}
