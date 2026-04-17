export class Point2d {
    private constructor(
        private readonly x: number,
        private readonly y: number,
    ) {}

    static xy(x: number, y: number): Point2d {
        return new Point2d(x, y)
    }

    get xCoordinate(): number {
        return this.x
    }
    get yCoordinate(): number {
        return this.y
    }

    equals(other: Point2d): boolean {
        return this.x === other.x && this.y === other.y
    }
}
