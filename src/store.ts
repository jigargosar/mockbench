import { model, Model, tProp, types, idProp, modelAction } from 'mobx-keystone'
import { computed } from 'mobx'

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
}) {
    @computed
    get bounds() {
        return {
            x: Math.min(this.x0, this.x1),
            y: Math.min(this.y0, this.y1),
            w: Math.abs(this.x1 - this.x0),
            h: Math.abs(this.y1 - this.y0),
        }
    }
}

@model('mockbench/CanvasStore')
export class CanvasStore extends Model({
    rects: tProp(types.array(types.model(Rect)), () => []),
    selectedId: tProp(types.maybeNull(types.string), null),
    drawing: tProp(types.maybeNull(types.model(Drawing)), null),
}) {
    @computed
    get hasSelection(): boolean {
        return this.selectedId !== null
    }

    @computed
    get selectedRect(): Rect | undefined {
        return this.selectedId
            ? this.rects.find(r => r.id === this.selectedId)
            : undefined
    }

    @computed
    get previewRect(): { x: number; y: number; w: number; h: number; seed: number } | null {
        if (!this.drawing) return null
        const { bounds, seed } = this.drawing
        if (bounds.w <= 0 || bounds.h <= 0) return null
        return { ...bounds, seed }
    }

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
        const { bounds, seed } = this.drawing
        if (bounds.w > 2 && bounds.h > 2) {
            this.rects.push(new Rect({ ...bounds, seed }))
        }
        this.drawing = null
    }
}
