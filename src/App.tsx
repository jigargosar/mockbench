import { useMemo } from 'react'
import rough from 'roughjs'
import { useCanvasStore } from './store'

const generator = rough.generator()

export default function App() {
    const elements = useCanvasStore((s) => s.elements)

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-white">
            <svg className="absolute inset-0 w-full h-full">
                {elements.map((el) => (
                    <RoughRect key={el.id} element={el} />
                ))}
            </svg>
        </div>
    )
}

function RoughRect({ element }: { element: { x: number; y: number; width: number; height: number; seed: number } }) {
    const paths = useMemo(() => {
        const drawable = generator.rectangle(0, 0, element.width, element.height, {
            roughness: 1.5,
            stroke: '#374151',
            strokeWidth: 2,
            seed: element.seed,
        })
        return generator.toPaths(drawable)
    }, [element.width, element.height, element.seed])

    return (
        <g transform={`translate(${element.x}, ${element.y})`}>
            {paths.map((p, i) => (
                <path
                    key={i}
                    d={p.d}
                    fill={p.fill ?? 'none'}
                    stroke={p.stroke}
                    strokeWidth={p.strokeWidth}
                />
            ))}
        </g>
    )
}
