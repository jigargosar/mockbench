import { makeAutoObservable } from 'mobx'
import { assertNever } from './utils'

// ── Rect model ─────────────────────────────────

export type Rect = {
    id: string
    x: number
    y: number
    w: number
    h: number
    seed: number
}

function hitTest(rects: readonly Rect[], x: number, y: number): Rect | undefined {
    for (let i = rects.length - 1; i >= 0; i--) {
        const r = rects[i]
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r
    }
    return undefined
}

function moveRect(r: Rect, dx: number, dy: number) {
    r.x += dx
    r.y += dy
}

// ── Drawing model ──────────────────────────────

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

// rough.js treats seed=0 as "re-seed on every call", so we exclude it via `|| 1`.
function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31) || 1
}

function createDrawing(x: number, y: number): Drawing {
    return { x0: x, y0: y, x1: x, y1: y, seed: randomSeed() }
}

function updateDrawing(d: Drawing, x: number, y: number) {
    d.x1 = x
    d.y1 = y
}

function drawingPreview(d: Drawing): { x: number; y: number; w: number; h: number; seed: number } | null {
    const b = drawingBounds(d)
    if (b.w <= 0 || b.h <= 0) return null
    return { ...b, seed: d.seed }
}

// ── Input types ────────────────────────────────

export type MouseInput = {
    x: number
    y: number
    button: number
}

export type KeyboardInput = {
    key: string
}

// ── Interaction mode ───────────────────────────

type Mode =
    | { tag: 'idle' }
    | { tag: 'drawing'; drawing: Drawing }
    | { tag: 'selected'; selectedId: string }
    | { tag: 'moving'; selectedId: string; lastX: number; lastY: number }

// ── Store ──────────────────────────────────────

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

    get previewRect(): { x: number; y: number; w: number; h: number; seed: number } | null {
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                return drawingPreview(m.drawing)
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
        const hit = hitTest(this.rects, x, y)
        if (hit) {
            this.mode = { tag: 'moving', selectedId: hit.id, lastX: x, lastY: y }
        } else {
            this.mode = { tag: 'drawing', drawing: createDrawing(x, y) }
        }
    }

    handleMouseMove({ x, y }: MouseInput) {
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                updateDrawing(m.drawing, x, y)
                break
            case 'moving': {
                const rect = this.rects.find(r => r.id === m.selectedId)
                if (rect) moveRect(rect, x - m.lastX, y - m.lastY)
                m.lastX = x
                m.lastY = y
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

    private finishDrawing() {
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const b = drawingBounds(m.drawing)
                if (b.w > 2 && b.h > 2) {
                    this.rects.push({ id: crypto.randomUUID(), ...b, seed: m.drawing.seed })
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
