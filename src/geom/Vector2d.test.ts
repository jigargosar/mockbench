import { describe, it, expect } from 'vitest'
import { Point2d } from './Point2d'
import { Vector2d } from './Vector2d'

describe('Vector2d', () => {
    describe('from', () => {
        it('produces the displacement from p1 to p2', () => {
            const v = Vector2d.from(Point2d.xy(1, 2), Point2d.xy(4, 6))
            expect(v.xComponent).toBe(3)
            expect(v.yComponent).toBe(4)
        })

        it('produces a negative displacement when p2 precedes p1', () => {
            const v = Vector2d.from(Point2d.xy(5, 5), Point2d.xy(2, 1))
            expect(v.xComponent).toBe(-3)
            expect(v.yComponent).toBe(-4)
        })

        it('produces a zero vector for identical points', () => {
            const p = Point2d.xy(7, 7)
            const v = Vector2d.from(p, p)
            expect(v.xComponent).toBe(0)
            expect(v.yComponent).toBe(0)
        })
    })

    describe('equals', () => {
        it('returns true for two vectors with matching components', () => {
            const a = Vector2d.from(Point2d.xy(0, 0), Point2d.xy(3, 4))
            const b = Vector2d.from(Point2d.xy(1, 1), Point2d.xy(4, 5))
            expect(a.equals(b)).toBe(true)
        })

        it('returns false for two vectors that differ', () => {
            const a = Vector2d.from(Point2d.xy(0, 0), Point2d.xy(3, 4))
            const b = Vector2d.from(Point2d.xy(0, 0), Point2d.xy(3, 5))
            expect(a.equals(b)).toBe(false)
        })
    })
})
