import { makeAutoObservable } from 'mobx'

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
    | { kind: 'idle' }
    | { kind: 'drawing'; drawing: Drawing }
    | { kind: 'selected'; selectedId: string }

// ── Store ──────────────────────────────────────

export class CanvasStore {
    rects: Rect[] = []
    private mode: Mode = { kind: 'idle' }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get selectedRect(): Rect | undefined {
        if (this.mode.kind !== 'selected') return undefined
        const { selectedId } = this.mode
        return this.rects.find(r => r.id === selectedId)
    }

    get previewRect(): { x: number; y: number; w: number; h: number; seed: number } | null {
        if (this.mode.kind !== 'drawing') return null
        return drawingPreview(this.mode.drawing)
    }

    handleMouseDown({ x, y, button }: MouseInput) {
        if (button !== 0) return
        if (this.mode.kind === 'drawing') {
            this.finishDrawing()
            return
        }
        const hit = hitTest(this.rects, x, y)
        if (hit) {
            this.mode = { kind: 'selected', selectedId: hit.id }
            return
        }
        this.mode = { kind: 'drawing', drawing: createDrawing(x, y) }
    }

    handleMouseMove({ x, y }: MouseInput) {
        if (this.mode.kind !== 'drawing') return
        updateDrawing(this.mode.drawing, x, y)
    }

    handleMouseUp(_: MouseInput) {
        this.finishDrawing()
    }

    handleKeyDown({ key }: KeyboardInput) {
        // Mac uses Backspace as the delete key; Windows/Linux use Delete. Accept both.
        if (key === 'Delete' || key === 'Backspace') this.deleteSelected()
        // Escape cancels the current gesture.
        else if (key === 'Escape') this.mode = { kind: 'idle' }
    }

    private finishDrawing() {
        if (this.mode.kind !== 'drawing') return
        const b = drawingBounds(this.mode.drawing)
        if (b.w > 2 && b.h > 2) {
            this.rects.push({ id: crypto.randomUUID(), ...b, seed: this.mode.drawing.seed })
        }
        this.mode = { kind: 'idle' }
    }

    private deleteSelected() {
        if (this.mode.kind !== 'selected') return
        const { selectedId } = this.mode
        const idx = this.rects.findIndex(r => r.id === selectedId)
        if (idx >= 0) this.rects.splice(idx, 1)
        this.mode = { kind: 'idle' }
    }
}
