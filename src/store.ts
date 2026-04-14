import { makeAutoObservable, intercept } from 'mobx'

export type Rect = {
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

export class CanvasStore {
    rects: Rect[] = []
    private drawing: Drawing | null = null
    private selectedId: string | null = null

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        // Dev-only invariant: drawing and selectedId are mutually exclusive —
        // a user is either drawing a new rect or has one selected, never both.
        if (import.meta.env.DEV) {
            intercept(this, (change) => {
                if (change.type !== 'update') return change
                if (change.name === 'drawing' && change.newValue !== null && this.selectedId !== null) {
                    throw new Error('Invalid: drawing set while selection active')
                }
                if (change.name === 'selectedId' && change.newValue !== null && this.drawing !== null) {
                    throw new Error('Invalid: selectedId set while drawing active')
                }
                return change
            })
        }
    }

    get selectedRect(): Rect | undefined {
        return this.selectedId
            ? this.rects.find(r => r.id === this.selectedId)
            : undefined
    }

    get previewRect(): { x: number; y: number; w: number; h: number; seed: number } | null {
        if (!this.drawing) return null
        const b = drawingBounds(this.drawing)
        if (b.w <= 0 || b.h <= 0) return null
        return { ...b, seed: this.drawing.seed }
    }

    handleMouseDown(x: number, y: number) {
        const hit = hitTest(this.rects, x, y)
        if (hit) {
            this.selectedId = hit.id
            return
        }
        this.selectedId = null
        this.drawing = {
            x0: x, y0: y, x1: x, y1: y,
            seed: Math.floor(Math.random() * 10000),
        }
    }

    handleMouseMove(x: number, y: number) {
        if (!this.drawing) return
        this.drawing.x1 = x
        this.drawing.y1 = y
    }

    handleMouseUp() {
        if (!this.drawing) return
        const b = drawingBounds(this.drawing)
        if (b.w > 2 && b.h > 2) {
            this.rects.push({ id: crypto.randomUUID(), ...b, seed: this.drawing.seed })
        }
        this.drawing = null
    }

    deleteSelected() {
        if (!this.selectedId) return
        const idx = this.rects.findIndex(r => r.id === this.selectedId)
        if (idx >= 0) this.rects.splice(idx, 1)
        this.selectedId = null
    }

    clearSelection() {
        this.selectedId = null
    }
}
