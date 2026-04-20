import { makeAutoObservable } from 'mobx'
import rough from 'roughjs'
import { BoundingBox2d } from './geom/BoundingBox2d'
import { Point2d } from './geom/Point2d'
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
// ViewItems carry an origin for <g transform="translate(ox,oy)"> positioning.
// Paths are always generated in widget-local coords (0,0,w,h) so that translation
// doesn't change `d` strings → no layout/style recalc per mousemove, only transform.
export type ViewItem =
    | { readonly tag: 'rect'; readonly id: string; readonly origin: Point2d; readonly width: number; readonly height: number; readonly paths: ReadonlyArray<PathSpec> }
    | { readonly tag: 'button'; readonly id: string; readonly origin: Point2d; readonly width: number; readonly height: number; readonly paths: ReadonlyArray<PathSpec>; readonly text: TextSpec }
    | { readonly tag: 'browser'; readonly id: string; readonly origin: Point2d; readonly width: number; readonly height: number; readonly paths: ReadonlyArray<PathSpec> }

// ── Path builders ─────────────────────────────────
function rectPaths(w: number, h: number, seed: number, parentId: string, opacity: number): ReadonlyArray<PathSpec> {
    return generator.toPaths(generator.rectangle(0, 0, w, h, { seed })).map((p, i) => ({
        id: `${parentId}:${i}`,
        svgProps: {
            d: p.d,
            stroke: p.stroke,
            strokeWidth: p.strokeWidth,
            fill: p.fill ?? 'none',
            opacity,
        },
    }))
}

function rectViewItem(origin: Point2d, width: number, height: number, seed: number, id: string, opacity: number): ViewItem {
    return {
        tag: 'rect',
        id,
        origin,
        width,
        height,
        paths: rectPaths(width, height, seed, id, opacity),
    }
}

function buttonBoxAt(cursor: Point2d): BoundingBox2d {
    return BoundingBox2d.withDimensions(140, 44, cursor)
}

function buttonText(w: number, h: number, label: string, parentId: string, opacity: number): TextSpec {
    return {
        id: `${parentId}:text`,
        center: Point2d.xy(w / 2, h / 2),
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

function buttonViewItem(origin: Point2d, width: number, height: number, seed: number, label: string, id: string, opacity: number): ViewItem {
    return {
        tag: 'button',
        id,
        origin,
        width,
        height,
        paths: rectPaths(width, height, seed, id, opacity),
        text: buttonText(width, height, label, id, opacity),
    }
}

function browserBoxAt(cursor: Point2d): BoundingBox2d {
    return BoundingBox2d.withDimensions(480, 300, cursor)
}

function squiggleRoughPaths(x: number, y: number, width: number, seed: number) {
    const amplitude = 2
    const step = 6
    const pts: [number, number][] = []
    for (let i = 0; i <= width; i += step) {
        pts.push([x + i, y + (((i / step) | 0) % 2 === 0 ? -amplitude : amplitude)])
    }
    return generator.toPaths(generator.curve(pts, { seed, roughness: 1 }))
}

function browserPaths(w: number, h: number, seed: number, parentId: string, opacity: number): ReadonlyArray<PathSpec> {
    const titleBarH = 36
    const lightR = 6
    const lightSpacing = 20
    const lightStartX = 14 + lightR
    const lightY = titleBarH / 2
    const urlBarH = 22
    const urlBarX = lightStartX + lightSpacing * 2 + lightR + 16
    const urlBarY = (titleBarH - urlBarH) / 2
    const urlBarW = w - urlBarX - 16

    const roughPaths = [
        ...generator.toPaths(generator.rectangle(0, 0, w, h, { seed, roughness: 1.2 })),
        ...generator.toPaths(generator.line(0, titleBarH, w, titleBarH, { seed: seed + 1, roughness: 1 })),
        ...generator.toPaths(generator.circle(lightStartX, lightY, lightR * 2, { seed: seed + 2, roughness: 1.5 })),
        ...generator.toPaths(generator.circle(lightStartX + lightSpacing, lightY, lightR * 2, { seed: seed + 3, roughness: 1.5 })),
        ...generator.toPaths(generator.circle(lightStartX + lightSpacing * 2, lightY, lightR * 2, { seed: seed + 4, roughness: 1.5 })),
        ...generator.toPaths(generator.rectangle(urlBarX, urlBarY, urlBarW, urlBarH, { seed: seed + 5, roughness: 1 })),
        ...squiggleRoughPaths(urlBarX + 10, urlBarY + urlBarH / 2, urlBarW - 20, seed + 6),
    ]

    return roughPaths.map((p, i) => ({
        id: `${parentId}:${i}`,
        svgProps: {
            d: p.d,
            stroke: p.stroke,
            strokeWidth: p.strokeWidth,
            fill: p.fill ?? 'none',
            opacity,
        },
    }))
}

function browserViewItem(origin: Point2d, width: number, height: number, seed: number, id: string, opacity: number): ViewItem {
    return {
        tag: 'browser',
        id,
        origin,
        width,
        height,
        paths: browserPaths(width, height, seed, id, opacity),
    }
}

// ── Widget factories ──────────────────────────────
// origin is separate from width/height so drag (translate) invalidates only `box` and `viewItem`,
// not `paths`. rough.js reruns only when the widget is resized, not when moved.

function createRect(id: string, origin: Point2d, width: number, height: number, seed: number) {
    return makeAutoObservable({
        tag: 'rect' as const,
        id,
        origin,
        width,
        height,
        seed,
        get paths(): ReadonlyArray<PathSpec> {
            return rectPaths(this.width, this.height, this.seed, this.id, 1)
        },
        get box(): BoundingBox2d {
            return BoundingBox2d.withDimensions(this.width, this.height, Point2d.xy(this.origin.xCoordinate + this.width / 2, this.origin.yCoordinate + this.height / 2))
        },
        get viewItem(): ViewItem {
            return { tag: 'rect', id: this.id, origin: this.origin, width: this.width, height: this.height, paths: this.paths }
        },
    })
}

function createButton(id: string, origin: Point2d, width: number, height: number, seed: number, label: string) {
    return makeAutoObservable({
        tag: 'button' as const,
        id,
        origin,
        width,
        height,
        seed,
        label,
        get paths(): ReadonlyArray<PathSpec> {
            return rectPaths(this.width, this.height, this.seed, this.id, 1)
        },
        get text(): TextSpec {
            return buttonText(this.width, this.height, this.label, this.id, 1)
        },
        get box(): BoundingBox2d {
            return BoundingBox2d.withDimensions(this.width, this.height, Point2d.xy(this.origin.xCoordinate + this.width / 2, this.origin.yCoordinate + this.height / 2))
        },
        get viewItem(): ViewItem {
            return { tag: 'button', id: this.id, origin: this.origin, width: this.width, height: this.height, paths: this.paths, text: this.text }
        },
    })
}

function createBrowser(id: string, origin: Point2d, width: number, height: number, seed: number) {
    return makeAutoObservable({
        tag: 'browser' as const,
        id,
        origin,
        width,
        height,
        seed,
        get paths(): ReadonlyArray<PathSpec> {
            return browserPaths(this.width, this.height, this.seed, this.id, 1)
        },
        get box(): BoundingBox2d {
            return BoundingBox2d.withDimensions(this.width, this.height, Point2d.xy(this.origin.xCoordinate + this.width / 2, this.origin.yCoordinate + this.height / 2))
        },
        get viewItem(): ViewItem {
            return { tag: 'browser', id: this.id, origin: this.origin, width: this.width, height: this.height, paths: this.paths }
        },
    })
}

export type Rect = ReturnType<typeof createRect>
export type Button = ReturnType<typeof createButton>
export type Browser = ReturnType<typeof createBrowser>
export type Widget = Rect | Button | Browser

export type Tool = 'rect' | 'button' | 'browser'

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
    | { tag: 'placing'; kind: Exclude<Tool, 'rect'> }

// ── Store ─────────────────────────────────────────
export class CanvasStore {
    private _widgets: Widget[] = []
    private mode: Mode = { tag: 'idle' }
    private cursor: Point2d | null = null

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
            case 'placing':
                return undefined
            default:
                assertNever(m)
        }
    }

    get selectionBox(): BoundingBox2d | null {
        return this.selectedWidget?.box.expandBy(SELECTION_BORDER_PX) ?? null
    }

    get previewViewItem(): ViewItem | null {
        const m = this.mode
        if (m.tag !== 'drawing') return null
        const box = BoundingBox2d.from(m.start, m.current)
        if (box.isEmpty()) return null
        return rectViewItem(Point2d.xy(box.minX, box.minY), box.width, box.height, m.seed, 'preview', 1)
    }

    get ghostViewItem(): ViewItem | null {
        const m = this.mode
        if (m.tag !== 'placing' || !this.cursor) return null
        switch (m.kind) {
            case 'button': {
                const box = buttonBoxAt(this.cursor)
                return buttonViewItem(Point2d.xy(box.minX, box.minY), box.width, box.height, 1, 'Button', 'ghost', 0.4)
            }
            case 'browser': {
                const box = browserBoxAt(this.cursor)
                return browserViewItem(Point2d.xy(box.minX, box.minY), box.width, box.height, 1, 'ghost', 0.4)
            }
            default:
                assertNever(m.kind)
        }
    }

    get activeTool(): Tool {
        return this.mode.tag === 'placing' ? this.mode.kind : 'rect'
    }

    setTool(tool: Tool) {
        switch (tool) {
            case 'rect':
                this.mode = { tag: 'idle' }
                break
            case 'button':
            case 'browser':
                this.mode = { tag: 'placing', kind: tool }
                break
            default:
                assertNever(tool)
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
            case 'placing':
                this.placeAt(m.kind, point)
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

    private placeAt(kind: Exclude<Tool, 'rect'>, cursor: Point2d) {
        switch (kind) {
            case 'button': {
                const box = buttonBoxAt(cursor)
                this._widgets.push(createButton(crypto.randomUUID(), Point2d.xy(box.minX, box.minY), box.width, box.height, randomSeed(), 'Button'))
                break
            }
            case 'browser': {
                const box = browserBoxAt(cursor)
                this._widgets.push(createBrowser(crypto.randomUUID(), Point2d.xy(box.minX, box.minY), box.width, box.height, randomSeed()))
                break
            }
            default:
                assertNever(kind)
        }
    }

    handleMouseMove({ point }: MouseInput) {
        this.cursor = point
        const m = this.mode
        switch (m.tag) {
            case 'drawing':
                m.current = point
                break
            case 'moving': {
                const widget = this._widgets.find((w) => w.id === m.selectedId)
                if (widget) {
                    const dx = point.xCoordinate - m.lastPoint.xCoordinate
                    const dy = point.yCoordinate - m.lastPoint.yCoordinate
                    widget.origin = Point2d.xy(widget.origin.xCoordinate + dx, widget.origin.yCoordinate + dy)
                }
                m.lastPoint = point
                break
            }
            case 'idle':
            case 'selected':
            case 'placing':
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
            case 'placing':
                break
            default:
                assertNever(m)
        }
    }

    handleKeyDown({ key }: KeyboardInput) {
        // Mac uses Backspace as the delete key; Windows/Linux use Delete. Accept both.
        if (key === 'Delete' || key === 'Backspace') this.deleteSelected()
        else if (key === 'Escape') this.mode = { tag: 'idle' }
        else if (key === 'b' || key === 'B') this.setTool('button')
        else if (key === 'r' || key === 'R') this.setTool('rect')
    }

    private findTopmostAt(point: Point2d): Widget | undefined {
        for (let i = this._widgets.length - 1; i >= 0; i--) {
            const w = this._widgets[i]
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
                    this._widgets.push(createRect(crypto.randomUUID(), Point2d.xy(box.minX, box.minY), box.width, box.height, m.seed))
                }
                this.mode = { tag: 'idle' }
                break
            }
            case 'idle':
            case 'selected':
            case 'moving':
            case 'placing':
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
            case 'placing':
                break
            default:
                assertNever(m)
        }
    }
}
