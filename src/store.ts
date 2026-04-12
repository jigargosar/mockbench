import { model, Model, tProp, types, idProp, modelAction } from 'mobx-keystone'

@model('mockbench/Rect')
export class Rect extends Model({
    id: idProp,
    x: tProp(types.number),
    y: tProp(types.number),
    w: tProp(types.number),
    h: tProp(types.number),
    seed: tProp(types.number),
}) {}

@model('mockbench/Drawing')
export class Drawing extends Model({
    x0: tProp(types.number),
    y0: tProp(types.number),
    x1: tProp(types.number),
    y1: tProp(types.number),
    seed: tProp(types.number),
}) {}

@model('mockbench/CanvasStore')
export class CanvasStore extends Model({
    rects: tProp(types.array(types.model(Rect)), () => []),
    selectedId: tProp(types.maybeNull(types.string), null),
    drawing: tProp(types.maybeNull(types.model(Drawing)), null),
}) {
    @modelAction
    selectRect(id: string | null) {
        this.selectedId = id
    }

    @modelAction
    deleteSelected() {
        if (!this.selectedId) return
        const idx = this.rects.findIndex(r => r.id === this.selectedId)
        if (idx >= 0) this.rects.splice(idx, 1)
        this.selectedId = null
    }

    @modelAction
    startDrawing(x: number, y: number) {
        this.selectedId = null
        this.drawing = new Drawing({
            x0: x, y0: y, x1: x, y1: y,
            seed: Math.floor(Math.random() * 10000),
        })
    }

    @modelAction
    updateDrawing(x: number, y: number) {
        if (!this.drawing) return
        this.drawing.x1 = x
        this.drawing.y1 = y
    }

    @modelAction
    finishDrawing() {
        if (!this.drawing) return
        const d = this.drawing
        const x = Math.min(d.x0, d.x1)
        const y = Math.min(d.y0, d.y1)
        const w = Math.abs(d.x1 - d.x0)
        const h = Math.abs(d.y1 - d.y0)
        if (w > 2 && h > 2) {
            this.rects.push(new Rect({ x, y, w, h, seed: d.seed }))
        }
        this.drawing = null
    }
}
