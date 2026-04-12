import { model, Model, tProp, types, idProp } from 'mobx-keystone'

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
}) {}
