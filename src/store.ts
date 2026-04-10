import { create } from 'zustand'
import { temporal } from 'zundo'

export type ElementType = 'rect' | 'button' | 'input' | 'text'

export interface WireframeElement {
    id: string
    type: ElementType
    seed: number
    x: number
    y: number
    width: number
    height: number
    label: string
}

let nextId = 5

interface Viewport {
    panX: number
    panY: number
    zoom: number
}

interface CanvasStore {
    elements: WireframeElement[]
    selectedId: string | null
    viewport: Viewport
    selectElement: (id: string | null) => void
    updateElement: (id: string, updates: Partial<Omit<WireframeElement, 'id' | 'seed' | 'type'>>) => void
    addElement: (type: ElementType, x: number, y: number) => void
    deleteSelected: () => void
    pan: (dx: number, dy: number) => void
    zoomTo: (newZoom: number, cx: number, cy: number) => void
    save: () => void
    load: () => void
}

export const useCanvasStore = create<CanvasStore>()(temporal((set) => ({
    elements: [
        { id: '1', type: 'rect', seed: 42, x: 300, y: 200, width: 240, height: 160, label: '' },
        { id: '2', type: 'button', seed: 77, x: 650, y: 180, width: 180, height: 50, label: 'Submit' },
        { id: '3', type: 'input', seed: 13, x: 200, y: 450, width: 300, height: 40, label: 'Enter your name...' },
        { id: '4', type: 'text', seed: 99, x: 600, y: 420, width: 200, height: 30, label: 'Hello World' },
    ],
    selectedId: null,
    viewport: { panX: 0, panY: 0, zoom: 1 },
    selectElement: (id) => set({ selectedId: id }),
    updateElement: (id, updates) =>
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el,
            ),
        })),
    addElement: (type, x, y) => {
        const id = String(nextId++)
        const defaults: Record<ElementType, { width: number; height: number; label: string }> = {
            rect: { width: 200, height: 140, label: '' },
            button: { width: 160, height: 48, label: 'Button' },
            input: { width: 260, height: 40, label: 'Placeholder...' },
            text: { width: 180, height: 28, label: 'Text' },
        }
        const d = defaults[type]
        set((state) => ({
            elements: [...state.elements, { id, type, seed: Math.floor(Math.random() * 100000), x, y, ...d }],
            selectedId: id,
        }))
    },
    deleteSelected: () =>
        set((state) => ({
            elements: state.elements.filter((el) => el.id !== state.selectedId),
            selectedId: null,
        })),
    pan: (dx, dy) =>
        set((state) => ({
            viewport: { ...state.viewport, panX: state.viewport.panX + dx, panY: state.viewport.panY + dy },
        })),
    zoomTo: (newZoom, cx, cy) =>
        set((state) => {
            const clampedZoom = Math.min(5, Math.max(0.1, newZoom))
            const scale = clampedZoom / state.viewport.zoom
            return {
                viewport: {
                    zoom: clampedZoom,
                    panX: cx - (cx - state.viewport.panX) * scale,
                    panY: cy - (cy - state.viewport.panY) * scale,
                },
            }
        }),
    save: () => {
        const { elements } = useCanvasStore.getState()
        localStorage.setItem('mockbench', JSON.stringify(elements))
    },
    load: () => {
        const saved = localStorage.getItem('mockbench')
        if (!saved) return
        const elements = JSON.parse(saved) as WireframeElement[]
        nextId = Math.max(...elements.map((el) => Number(el.id))) + 1
        set({ elements, selectedId: null })
    },
}), { partialize: (state) => ({ elements: state.elements }) }))
