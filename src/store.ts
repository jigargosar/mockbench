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

// ── View model — pure render data, no identity ───
export type WidgetViewModel =
    | { readonly tag: 'rect'; readonly paths: ReadonlyArray<PathSpec> }
    | { readonly tag: 'button'; readonly paths: ReadonlyArray<PathSpec>; readonly text: TextSpec }

// ── Shared path builder ──────────────────────────
// Used by both Rect and Button (button is visually a rect + text) and by the preview/ghost
// builders. React key = pathIndex (stable across drag — see commit d71f931).
function rectPaths(box: BoundingBox2d, seed: number, opacity: number): ReadonlyArray<PathSpec> {
    const { x, y, w, h } = box.toObject()
    return generator.toPaths(generator.rectangle(x, y, w, h, { seed })).map((p, i) => ({
        id: `${i}`,
        svgProps: {
            d: p.d,
            stroke: p.stroke,
            strokeWidth: p.strokeWidth,
            fill: p.fill ?? 'none',
            opacity,
        },
    }))
}

// ── Widget domain classes ────────────────────────
// Each widget is its own observable unit (defining-data-stores L53). Its `viewModel`
// is a per-instance computed — WidgetView subscribes to ONE widget's fields, so dragging
// one widget only re-renders that widget's view. Widget-specific geometry/construction
// lives on the class as static factories (boxAt, placeAt, fromDrag, ghost/preview
// view models); free functions were eliminated to keep all knowledge of "what is a
// Button" on Button itself.

export class Rect {
    readonly tag = 'rect' as const

    static fromDrag(start: Point2d, current: Point2d, seed: number): Rect | null {
        const box = BoundingBox2d.from(start, current)
        if (box.width <= MIN_COMMIT_PX || box.height <= MIN_COMMIT_PX) return null
        return new Rect(crypto.randomUUID(), box, seed)
    }

    static previewViewModel(start: Point2d, current: Point2d, seed: number): WidgetViewModel | null {
        const box = BoundingBox2d.from(start, current)
        if (box.isEmpty()) return null
        return { tag: 'rect', paths: rectPaths(box, seed, 1) }
    }

    constructor(
        readonly id: string,
        private box: BoundingBox2d,
        private seed: number,
    ) {
        makeAutoObservable(this)
    }

    get viewModel(): WidgetViewModel {
        return { tag: 'rect', paths: rectPaths(this.box, this.seed, 1) }
    }

    contains(point: Point2d): boolean {
        return this.box.contains(point)
    }

    translate(delta: Vector2d): void {
        this.box = this.box.translateBy(delta)
    }

    expandedBox(px: number): BoundingBox2d {
        return this.box.expandBy(px)
    }
}

export class Button {
    readonly tag = 'button' as const

    static boxAt(cursor: Point2d): BoundingBox2d {
        return BoundingBox2d.withDimensions(140, 44, cursor)
    }

    static placeAt(cursor: Point2d, label = 'Button'): Button {
        return new Button(crypto.randomUUID(), Button.boxAt(cursor), randomSeed(), label)
    }

    static ghostViewModel(cursor: Point2d, label = 'Button'): WidgetViewModel {
        const box = Button.boxAt(cursor)
        return {
            tag: 'button',
            paths: rectPaths(box, 1, 0.4),
            text: Button.textSpec(box, label, 'ghost', 0.4),
        }
    }

    private static textSpec(box: BoundingBox2d, label: string, parentId: string, opacity: number): TextSpec {
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

    constructor(
        readonly id: string,
        private box: BoundingBox2d,
        private seed: number,
        private label: string,
    ) {
        makeAutoObservable(this)
    }

    get viewModel(): WidgetViewModel {
        return {
            tag: 'button',
            paths: rectPaths(this.box, this.seed, 1),
            text: Button.textSpec(this.box, this.label, this.id, 1),
        }
    }

    contains(point: Point2d): boolean {
        return this.box.contains(point)
    }

    translate(delta: Vector2d): void {
        this.box = this.box.translateBy(delta)
    }

    expandedBox(px: number): BoundingBox2d {
        return this.box.expandBy(px)
    }
}

export type Widget = Rect | Button

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
    private _widgets: Widget[] = []
    private mode: Mode = { tag: 'idle' }
    // Last cursor position over the canvas, tracked across all mouse events. Used so the
    // button ghost can appear immediately on `B` keydown at the user's current cursor,
    // without waiting for the first mousemove after the keypress.
    private lastMousePoint: Point2d | null = null

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get widgets(): ReadonlyArray<Widget> {
        return this._widgets
    }

    private get selectedWidget(): Widget | undefined {
        const m = this.mode
        switch (m.tag) {
            case 'selected':
            case 'moving':
                return this._widgets.find((w) => w.id === m.selectedId)
            case 'idle':
            case 'drawing':
            case 'placingButton':
                return undefined
            default:
                assertNever(m)
        }
    }

    get selectionBox(): BoundingBox2d | null {
        return this.selectedWidget?.expandedBox(SELECTION_BORDER_PX) ?? null
    }

    get previewViewModel(): WidgetViewModel | null {
        const m = this.mode
        if (m.tag !== 'drawing') return null
        return Rect.previewViewModel(m.start, m.current, m.seed)
    }

    get ghostViewModel(): WidgetViewModel | null {
        const m = this.mode
        if (m.tag !== 'placingButton' || !m.cursor) return null
        return Button.ghostViewModel(m.cursor)
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
                // Stamping: mode stays `placingButton` so the user can place multiple buttons
                // rapidly; Escape exits.
                this._widgets.push(Button.placeAt(point))
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
        this.lastMousePoint = point
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                m.current = point
                break
            case 'moving': {
                const widget = this._widgets.find((w) => w.id === m.selectedId)
                if (widget) widget.translate(Vector2d.from(m.lastPoint, point))
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
        switch (key) {
            // Mac uses Backspace as delete; Windows/Linux use Delete. Accept both.
            case 'Delete':
            case 'Backspace':
                this.deleteSelected()
                break
            case 'Escape':
                this.mode = { tag: 'idle' }
                break
            case 'b':
            case 'B':
                this.mode = { tag: 'placingButton', cursor: this.lastMousePoint }
                break
            case 'r':
            case 'R':
                this.mode = { tag: 'idle' }
                break
            default:
                break
        }
    }

    private findTopmostAt(point: Point2d): Widget | undefined {
        for (let i = this._widgets.length - 1; i >= 0; i--) {
            const w = this._widgets[i]
            if (w.contains(point)) return w
        }
        return undefined
    }

    private finishDrawing() {
        const m = this.mode
        switch (m.tag) {
            case 'drawing': {
                const rect = Rect.fromDrag(m.start, m.current, m.seed)
                if (rect) this._widgets.push(rect)
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
                const idx = this._widgets.findIndex((w) => w.id === m.selectedId)
                if (idx >= 0) this._widgets.splice(idx, 1)
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
