import { useMemo } from 'react'
import rough from 'roughjs'
import type { WireframeElement } from './store'

const generator = rough.generator()

function roughPaths(width: number, height: number, seed: number) {
    const drawable = generator.rectangle(0, 0, width, height, {
        roughness: 1.5,
        stroke: '#374151',
        strokeWidth: 2,
        seed,
    })
    return generator.toPaths(drawable)
}

export default function RoughRect({ element, onPointerDown }: {
    element: WireframeElement
    onPointerDown: (e: React.PointerEvent) => void
}) {
    const paths = useMemo(
        () => roughPaths(element.width, element.height, element.seed),
        [element.width, element.height, element.seed],
    )

    return (
        <g
            transform={`translate(${element.x}, ${element.y})`}
            onPointerDown={onPointerDown}
            style={{ cursor: 'pointer' }}
        >
            {/* Hit area */}
            <rect
                width={element.width}
                height={element.height}
                fill="transparent"
                stroke="none"
            />

            {/* Border — all types except text get a rough rectangle */}
            {element.type !== 'text' && paths.map((p, i) => (
                <path
                    key={i}
                    d={p.d}
                    fill={p.fill ?? 'none'}
                    stroke={p.stroke}
                    strokeWidth={p.strokeWidth}
                />
            ))}

            {/* Label */}
            {element.label && (
                <text
                    x={element.type === 'input' ? 10 : element.width / 2}
                    y={element.height / 2}
                    textAnchor={element.type === 'input' ? 'start' : 'middle'}
                    dominantBaseline="central"
                    fill={element.type === 'input' ? '#9ca3af' : '#374151'}
                    fontSize={element.type === 'text' ? 18 : 14}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    pointerEvents="none"
                >
                    {element.label}
                </text>
            )}

            {/* Input underline */}
            {element.type === 'input' && (
                <line
                    x1={8}
                    y1={element.height - 10}
                    x2={element.width - 8}
                    y2={element.height - 10}
                    stroke="#9ca3af"
                    strokeWidth={1}
                />
            )}
        </g>
    )
}
