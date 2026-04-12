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
