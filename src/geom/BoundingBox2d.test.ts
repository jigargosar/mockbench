import { describe, it, expect } from 'vitest'
import { BoundingBox2d } from './BoundingBox2d'
import { Point2d } from './Point2d'

describe('BoundingBox2d', () => {
    describe('from', () => {
        it('produces a box with expected minX/minY/width/height from two distinct points', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.minX).toBe(1)
            expect(box.minY).toBe(2)
            expect(box.width).toBe(3)
            expect(box.height).toBe(4)
        })

        it('produces an equal box when p1 and p2 are swapped', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(4, 6), Point2d.xy(1, 2))
            expect(a.equals(b)).toBe(true)
        })

        it('produces a zero-size box when p1 equals p2', () => {
            const box = BoundingBox2d.from(Point2d.xy(3, 5), Point2d.xy(3, 5))
            expect(box.width).toBe(0)
            expect(box.height).toBe(0)
        })
    })

    describe('contains', () => {
        it('returns true for a point strictly inside the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(5, 5))).toBe(true)
        })

        it('returns false for a point to the left of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(-1, 5))).toBe(false)
        })

        it('returns false for a point to the right of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(11, 5))).toBe(false)
        })

        it('returns false for a point above the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(5, -1))).toBe(false)
        })

        it('returns false for a point below the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(5, 11))).toBe(false)
        })

        it('returns true for a point exactly on a corner', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(0, 0))).toBe(true)
        })

        it('returns true for a point on an edge', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            expect(box.contains(Point2d.xy(5, 0))).toBe(true)
        })
    })

    describe('translateBy', () => {
        it('returns a new box shifted by dx/dy', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const moved = box.translateBy(10, 20)
            expect(moved.minX).toBe(11)
            expect(moved.minY).toBe(22)
            expect(moved.width).toBe(3)
            expect(moved.height).toBe(4)
        })

        it('leaves the original box unchanged', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            box.translateBy(10, 20)
            expect(box.minX).toBe(1)
            expect(box.minY).toBe(2)
            expect(box.width).toBe(3)
            expect(box.height).toBe(4)
        })

        it('returns an equal box when translating by (0, 0)', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const moved = box.translateBy(0, 0)
            expect(box.equals(moved)).toBe(true)
        })
    })

    describe('expandBy', () => {
        it('returns a new box grown by margin on all sides', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const grown = box.expandBy(1)
            expect(grown.minX).toBe(0)
            expect(grown.minY).toBe(1)
            expect(grown.width).toBe(5)
            expect(grown.height).toBe(6)
        })

        it('leaves the original box unchanged', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            box.expandBy(1)
            expect(box.minX).toBe(1)
            expect(box.minY).toBe(2)
            expect(box.width).toBe(3)
            expect(box.height).toBe(4)
        })

        it('returns an equal box when expanding by 0', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const grown = box.expandBy(0)
            expect(box.equals(grown)).toBe(true)
        })

        it('shrinks the box when margin is negative', () => {
            const box = BoundingBox2d.from(Point2d.xy(0, 0), Point2d.xy(10, 10))
            const shrunk = box.expandBy(-1)
            expect(shrunk.minX).toBe(1)
            expect(shrunk.minY).toBe(1)
            expect(shrunk.width).toBe(8)
            expect(shrunk.height).toBe(8)
        })
    })

    describe('width', () => {
        it('returns the width of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.width).toBe(3)
        })
    })

    describe('height', () => {
        it('returns the height of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.height).toBe(4)
        })
    })

    describe('minX', () => {
        it('returns the minimum x coordinate of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.minX).toBe(1)
        })
    })

    describe('minY', () => {
        it('returns the minimum y coordinate of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.minY).toBe(2)
        })
    })

    describe('maxX', () => {
        it('returns the maximum x coordinate of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.maxX).toBe(4)
        })
    })

    describe('maxY', () => {
        it('returns the maximum y coordinate of the box', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(box.maxY).toBe(6)
        })
    })

    describe('toPoints', () => {
        it('returns a tuple of two Point2d instances', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const [min, max] = box.toPoints()
            expect(min).toBeInstanceOf(Point2d)
            expect(max).toBeInstanceOf(Point2d)
        })

        it('returns the min corner as the first point and max corner as the second', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const [min, max] = box.toPoints()
            expect(min.equals(Point2d.xy(1, 2))).toBe(true)
            expect(max.equals(Point2d.xy(4, 6))).toBe(true)
        })
    })

    describe('toObject', () => {
        it('returns { x, y, w, h } with correct values', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const obj = box.toObject()
            expect(obj.x).toBe(1)
            expect(obj.y).toBe(2)
            expect(obj.w).toBe(3)
            expect(obj.h).toBe(4)
        })
    })

    describe('toExtrema', () => {
        it('returns { minX, maxX, minY, maxY } with correct values', () => {
            const box = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const ext = box.toExtrema()
            expect(ext.minX).toBe(1)
            expect(ext.maxX).toBe(4)
            expect(ext.minY).toBe(2)
            expect(ext.maxY).toBe(6)
        })
    })

    describe('equals', () => {
        it('returns true for two boxes constructed with the same corners', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(a.equals(b)).toBe(true)
        })

        it('returns false when minX differs', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(2, 2), Point2d.xy(5, 6))
            expect(a.equals(b)).toBe(false)
        })

        it('returns false when minY differs', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(1, 3), Point2d.xy(4, 7))
            expect(a.equals(b)).toBe(false)
        })

        it('returns false when width differs', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(5, 6))
            expect(a.equals(b)).toBe(false)
        })

        it('returns false when height differs', () => {
            const a = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            const b = BoundingBox2d.from(Point2d.xy(1, 2), Point2d.xy(4, 7))
            expect(a.equals(b)).toBe(false)
        })
    })
})
