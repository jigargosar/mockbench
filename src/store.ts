import { makeAutoObservable } from 'mobx'
import { BoundingBox2d } from './geom/BoundingBox2d'
import { Point2d } from './geom/Point2d'
import { Vector2d } from './geom/Vector2d'
import { assertNever } from './utils'

export type Rect = {
    id: string
    box: BoundingBox2d
    seed: number
}

// rough.js treats seed=0 as "re-seed on every call", so we exclude it via `|| 1`.
function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31) || 1
}

export type MouseInput = {
    x: number
    y: number
    button: number
}

export type KeyboardInput = {
    key: string
}

type Mode =
    | { tag: 'idle' }
    | { tag: 'drawing'; start: Point2d; current: Point2d; seed: number }
    | { tag: 'selected'; selectedId: string }
    | { tag: 'moving'; selectedId: string; lastPoint: Point2d }

export class CanvasStore {
    rects: Rect[] = []
    private mode: Mode = { tag: 'idle' }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get selectedRect(): Rect | undefined {
        const m = this.mode
        switch (m.tag) {
            case 'selected':
            case 'moving':
                return this.rects.find(r => r.id === m.selectedId)
            case 'idle':
            case 'drawing':
                return undefined
            default:
                assertNever(m)
        }
    }

    get previewRect(): { box: BoundingBox2d; seed: number } | null {
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const box = BoundingBox2d.from(m.start, m.current)
                return box.isEmpty() ? null : { box, seed: m.seed }
            }
            case 'idle':
            case 'selected':
            case 'moving':
                return null
            default:
                assertNever(m)
        }
    }

    handleMouseDown({ x, y, button }: MouseInput) {
        if (button !== 0) return
        const point = Point2d.xy(x, y)
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                this.finishDrawing()
                return
            case 'moving':
                this.mode = { tag: 'selected', selectedId: m.selectedId }
                return
            case 'idle':
            case 'selected':
                break
            default:
                assertNever(m)
        }
        const hit = this.findTopmostAt(point)
        if (hit) {
            this.mode = { tag: 'moving', selectedId: hit.id, lastPoint: point }
        } else {
            this.mode = { tag: 'drawing', start: point, current: point, seed: randomSeed() }
        }
    }

    handleMouseMove({ x, y }: MouseInput) {
        const point = Point2d.xy(x, y)
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                m.current = point
                break
            case 'moving': {
                const rect = this.rects.find(r => r.id === m.selectedId)
                if (rect) rect.box = rect.box.translateBy(Vector2d.from(m.lastPoint, point))
                m.lastPoint = point
                break
            }
            case 'idle':
            case 'selected':
                break
            default:
                assertNever(m)
        }
    }

    handleMouseUp(_: MouseInput) {
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                this.finishDrawing()
                break
            case 'moving':
                this.mode = { tag: 'selected', selectedId: m.selectedId }
                break
            case 'idle':
            case 'selected':
                break
            default:
                assertNever(m)
        }
    }

    handleKeyDown({ key }: KeyboardInput) {
        // Mac uses Backspace as the delete key; Windows/Linux use Delete. Accept both.
        if (key === 'Delete' || key === 'Backspace') this.deleteSelected()
        // Escape cancels the current gesture.
        else if (key === 'Escape') this.mode = { tag: 'idle' }
    }

    private findTopmostAt(point: Point2d): Rect | undefined {
        for (let i = this.rects.length - 1; i >= 0; i--) {
            const r = this.rects[i]
            if (r.box.contains(point)) return r
        }
        return undefined
    }

    private finishDrawing() {
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const box = BoundingBox2d.from(m.start, m.current)
                if (box.width > 2 && box.height > 2) {
                    this.rects.push({ id: crypto.randomUUID(), box, seed: m.seed })
                }
                this.mode = { tag: 'idle' }
                break
            }
            case 'idle':
            case 'selected':
            case 'moving':
                break
            default:
                assertNever(m)
        }
    }

    private deleteSelected() {
        const m = this.mode
        switch (m.tag) {
            case 'selected': {
                const idx = this.rects.findIndex(r => r.id === m.selectedId)
                if (idx >= 0) this.rects.splice(idx, 1)
                this.mode = { tag: 'idle' }
                break
            }
            case 'idle':
            case 'drawing':
            case 'moving':
                break
            default:
                assertNever(m)
        }
    }
}
