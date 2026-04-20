import { makeAutoObservable } from 'mobx'
import rough from 'roughjs'
import { BoundingBox2d } from './geom/BoundingBox2d'
import { Point2d } from './geom/Point2d'
import { Vector2d } from './geom/Vector2d'
import { assertNever } from './utils'

// ── Shared constants ──────────────────────────────
const SELECTION_BORDER_PX = 4
const MIN_COMMIT_PX = 2

// ── rough.js generator ────────────────────────────
const generator = rough.generator()

// ── Seed ──────────────────────────────────────────
// rough.js treats seed=0 as "re-seed on every call", so we exclude it via `|| 1`.
function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31) || 1
}

// ── SVG render specs ──────────────────────────────
export type PathSpec = {
    readonly id: string
    readonly svgProps: {
        readonly d: string
        readonly stroke: string
        readonly strokeWidth: number
        readonly fill: string
        readonly opacity: number
    }
}

export type TextSpec = {
    readonly id: string
    readonly center: Point2d
    readonly text: string
    readonly svgProps: {
        readonly fontFamily: '"Kalam", cursive'
        readonly fontSize: 20
        readonly fill: '#111'
        readonly opacity: number
        readonly textAnchor: 'middle'
        readonly dominantBaseline: 'central'
    }
}

// ── View items ────────────────────────────────────
export type ViewItem =
    | { readonly tag: 'rect'; readonly id: string; readonly paths: ReadonlyArray<PathSpec> }
    | { readonly tag: 'button'; readonly id: string; readonly paths: ReadonlyArray<PathSpec>; readonly text: TextSpec }

// ── Rect ──────────────────────────────────────────
type Rect = {
    tag: 'rect'
    id: string
    box: BoundingBox2d
    seed: number
}

function rectPaths(box: BoundingBox2d, seed: number, opacity: number): ReadonlyArray<PathSpec> {
    const { x, y, w, h } = box.toObject()
    return generator.toPaths(generator.rectangle(x, y, w, h, { seed })).map((p) => ({
        // Using the path `d` string as the React key. Not ideal — long, and two widgets
        // with identical box+seed would collide — but we have no simple per-path id
        // from rough.js. Deferred; not a real problem at current scale.
        id: p.d,
        svgProps: {
            d: p.d,
            stroke: p.stroke,
            strokeWidth: p.strokeWidth,
            fill: p.fill ?? 'none',
            opacity,
        },
    }))
}

function rectViewItem(box: BoundingBox2d, seed: number, id: string, opacity: number): ViewItem {
    return { tag: 'rect', id, paths: rectPaths(box, seed, opacity) }
}

// ── Button ────────────────────────────────────────
type Button = {
    tag: 'button'
    id: string
    box: BoundingBox2d
    seed: number
    label: string
}

function buttonBoxAt(cursor: Point2d): BoundingBox2d {
    return BoundingBox2d.withDimensions(140, 44, cursor)
}

function buttonText(box: BoundingBox2d, label: string, parentId: string, opacity: number): TextSpec {
    return {
        id: `${parentId}:text`,
        center: box.centerPoint(),
        text: label,
        svgProps: {
            fontFamily: '"Kalam", cursive',
            fontSize: 20,
            fill: '#111',
            opacity,
            textAnchor: 'middle',
            dominantBaseline: 'central',
        },
    }
}

function buttonViewItem(box: BoundingBox2d, seed: number, label: string, id: string, opacity: number): ViewItem {
    return {
        tag: 'button',
        id,
        paths: rectPaths(box, seed, opacity),
        text: buttonText(box, label, id, opacity),
    }
}

// ── Widget ────────────────────────────────────────
type Widget = Rect | Button

// ── Input ─────────────────────────────────────────
export type MouseInput = {
    point: Point2d
    button: number
}

export type KeyboardInput = {
    key: string
}

// ── Mode ──────────────────────────────────────────
type Mode =
    | { tag: 'idle' }
    | { tag: 'drawing'; start: Point2d; current: Point2d; seed: number }
    | { tag: 'selected'; selectedId: string }
    | { tag: 'moving'; selectedId: string; lastPoint: Point2d }
    | { tag: 'placingButton'; cursor: Point2d | null }

// ── Store ─────────────────────────────────────────
export class CanvasStore {
    private widgets: Widget[] = []
    private mode: Mode = { tag: 'idle' }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    private get selectedWidget(): Widget | undefined {
        const m = this.mode
        switch (m.tag) {
            case 'selected':
            case 'moving':
                return this.widgets.find((w) => w.id === m.selectedId)
            case 'idle':
            case 'drawing':
            case 'placingButton':
                return undefined
            default:
                assertNever(m)
        }
    }

    get selectionBox(): BoundingBox2d | null {
        return this.selectedWidget?.box.expandBy(SELECTION_BORDER_PX) ?? null
    }

    // Perf note (deferred, unmeasured): mousemove in `placingButton` invalidates `viewItems`
    // and re-runs `rectPaths` (rough.js) for every committed widget. If this shows up in
    // profiling, split the ghost into its own computed, or cache paths on the widget.
    get viewItems(): ReadonlyArray<ViewItem> {
        const items: ViewItem[] = []
        for (const w of this.widgets) {
            items.push(this.widgetViewItem(w))
        }
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const box = BoundingBox2d.from(m.start, m.current)
                if (!box.isEmpty()) items.push(rectViewItem(box, m.seed, 'preview', 1))
                break
            }
            case 'placingButton': {
                if (m.cursor) {
                    const box = buttonBoxAt(m.cursor)
                    items.push(buttonViewItem(box, 1, 'Button', 'ghost', 0.4))
                }
                break
            }
            case 'idle':
            case 'selected':
            case 'moving':
                break
            default:
                assertNever(m)
        }
        return items
    }

    private widgetViewItem(widget: Widget): ViewItem {
        switch (widget.tag) {
            case 'rect':
                return rectViewItem(widget.box, widget.seed, widget.id, 1)
            case 'button':
                return buttonViewItem(widget.box, widget.seed, widget.label, widget.id, 1)
            default:
                assertNever(widget)
        }
    }

    handleMouseDown({ point, button }: MouseInput) {
        if (button !== 0) return
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                this.finishDrawing()
                return
            case 'moving':
                this.mode = { tag: 'selected', selectedId: m.selectedId }
                return
            case 'placingButton': {
                // Stamping: mode stays `placingButton` after each click so the user can place
                // multiple buttons rapidly; Escape exits. Whether this or one-shot (exit after
                // first place) is a better default needs real user A/B testing — leaving as
                // stamping for now.
                const box = buttonBoxAt(point)
                this.widgets.push({
                    tag: 'button',
                    id: crypto.randomUUID(),
                    box,
                    seed: randomSeed(),
                    label: 'Button',
                })
                m.cursor = point
                return
            }
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

    handleMouseMove({ point }: MouseInput) {
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                m.current = point
                break
            case 'moving': {
                const widget = this.widgets.find((w) => w.id === m.selectedId)
                if (widget) widget.box = widget.box.translateBy(Vector2d.from(m.lastPoint, point))
                m.lastPoint = point
                break
            }
            case 'placingButton':
                m.cursor = point
                break
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
            case 'placingButton':
                break
            default:
                assertNever(m)
        }
    }

    handleKeyDown({ key }: KeyboardInput) {
        // No modifier-key filtering yet. Letter shortcuts (b, r) will fire under Ctrl/Cmd
        // and when typing in text inputs. Deferred — no text inputs exist; revisit when one is added.
        // Mac uses Backspace as the delete key; Windows/Linux use Delete. Accept both.
        if (key === 'Delete' || key === 'Backspace') this.deleteSelected()
        else if (key === 'Escape') this.mode = { tag: 'idle' }
        else if (key === 'b' || key === 'B') this.mode = { tag: 'placingButton', cursor: null }
        else if (key === 'r' || key === 'R') this.mode = { tag: 'idle' }
    }

    private findTopmostAt(point: Point2d): Widget | undefined {
        for (let i = this.widgets.length - 1; i >= 0; i--) {
            const w = this.widgets[i]
            if (w.box.contains(point)) return w
        }
        return undefined
    }

    private finishDrawing() {
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const box = BoundingBox2d.from(m.start, m.current)
                if (box.width > MIN_COMMIT_PX && box.height > MIN_COMMIT_PX) {
                    this.widgets.push({ tag: 'rect', id: crypto.randomUUID(), box, seed: m.seed })
                }
                this.mode = { tag: 'idle' }
                break
            }
            case 'idle':
            case 'selected':
            case 'moving':
            case 'placingButton':
                break
            default:
                assertNever(m)
        }
    }

    private deleteSelected() {
        const m = this.mode
        switch (m.tag) {
            case 'selected': {
                const idx = this.widgets.findIndex((w) => w.id === m.selectedId)
                if (idx >= 0) this.widgets.splice(idx, 1)
                this.mode = { tag: 'idle' }
                break
            }
            case 'idle':
            case 'drawing':
            case 'moving':
            case 'placingButton':
                break
            default:
                assertNever(m)
        }
    }
}
