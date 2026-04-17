import { Point2d } from './Point2d'

export class Vector2d {
    private constructor(
        private readonly dx: number,
        private readonly dy: number,
    ) {}

    static from(p1: Point2d, p2: Point2d): Vector2d {
        return new Vector2d(p2.xCoordinate - p1.xCoordinate, p2.yCoordinate - p1.yCoordinate)
    }

    get xComponent(): number {
        return this.dx
    }
    get yComponent(): number {
        return this.dy
    }

    equals(other: Vector2d): boolean {
        return this.dx === other.dx && this.dy === other.dy
    }
}
