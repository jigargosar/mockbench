import { create } from 'zustand'

export interface WireframeElement {
    id: string
    seed: number
    x: number
    y: number
    width: number
    height: number
}

interface CanvasStore {
    elements: WireframeElement[]
}

export const useCanvasStore = create<CanvasStore>(() => ({
    elements: [
        { id: '1', seed: 42, x: 200, y: 150, width: 240, height: 160 },
    ],
}))
