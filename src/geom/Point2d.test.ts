import { describe, it, expect } from 'vitest'
import { Point2d } from './Point2d'

describe('Point2d', () => {
    describe('equals', () => {
        it('returns true for two points with the same coordinates', () => {
            const a = Point2d.xy(3, 4)
            const b = Point2d.xy(3, 4)
            expect(a.equals(b)).toBe(true)
        })

        it('returns false for two points that differ in x', () => {
            const a = Point2d.xy(3, 4)
            const b = Point2d.xy(5, 4)
            expect(a.equals(b)).toBe(false)
        })

        it('returns false for two points that differ in y', () => {
            const a = Point2d.xy(3, 4)
            const b = Point2d.xy(3, 5)
            expect(a.equals(b)).toBe(false)
        })
    })
})
