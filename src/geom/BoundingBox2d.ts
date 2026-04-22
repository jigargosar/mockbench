import { Point2d } from './Point2d'
import { Vector2d } from './Vector2d'

export class BoundingBox2d {
    private constructor(
        private readonly x: number,
        private readonly y: number,
        private readonly w: number,
        private readonly h: number,
    ) {}

    static fromPoints(p1: Point2d, p2: Point2d): BoundingBox2d {
        const minX = Math.min(p1.xCoordinate, p2.xCoordinate)
        const minY = Math.min(p1.yCoordinate, p2.yCoordinate)
        const width = Math.abs(p1.xCoordinate - p2.xCoordinate)
        const height = Math.abs(p1.yCoordinate - p2.yCoordinate)
        return new BoundingBox2d(minX, minY, width, height)
    }

    static withDimensions(width: number, height: number, center: Point2d): BoundingBox2d {
        const halfW = Math.abs(width) / 2
        const halfH = Math.abs(height) / 2
        return new BoundingBox2d(
            center.xCoordinate - halfW,
            center.yCoordinate - halfH,
            Math.abs(width),
            Math.abs(height),
        )
    }

    centerPoint(): Point2d {
        return Point2d.xy(this.x + this.w / 2, this.y + this.h / 2)
    }

    contains(point: Point2d): boolean {
        const px = point.xCoordinate
        const py = point.yCoordinate
        return (
            px >= this.x &&
            px <= this.x + this.w &&
            py >= this.y &&
            py <= this.y + this.h
        )
    }

    equals(other: BoundingBox2d): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.w === other.w &&
            this.h === other.h
        )
    }

    translateBy(v: Vector2d): BoundingBox2d {
        return new BoundingBox2d(this.x + v.xComponent, this.y + v.yComponent, this.w, this.h)
    }

    isEmpty(): boolean {
        return this.w === 0 || this.h === 0
    }

    // Negative margin shrinks (acts as a `shrinkBy`). No collapse check — a large
    // enough negative margin will produce negative dimensions. Elm-geometry differs:
    // its `expandBy` abs-es the margin, and a separate `offsetBy` returns Maybe on
    // collapse. We'll add a dedicated `shrinkBy` with guards if the need arises.
    expandBy(margin: number): BoundingBox2d {
        return new BoundingBox2d(
            this.x - margin,
            this.y - margin,
            this.w + 2 * margin,
            this.h + 2 * margin,
        )
    }

    get width(): number { return this.w }
    get height(): number { return this.h }
    get minX(): number { return this.x }
    get minY(): number { return this.y }
    get maxX(): number { return this.x + this.w }
    get maxY(): number { return this.y + this.h }

    toPoints(): readonly [Point2d, Point2d] {
        return [
            Point2d.xy(this.x, this.y),
            Point2d.xy(this.x + this.w, this.y + this.h),
        ]
    }

    toObject(): { readonly x: number; readonly y: number; readonly w: number; readonly h: number } {
        return { x: this.x, y: this.y, w: this.w, h: this.h }
    }

    toExtrema(): { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number } {
        return { minX: this.x, maxX: this.x + this.w, minY: this.y, maxY: this.y + this.h }
    }
}
