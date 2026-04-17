import rough from 'roughjs'

const generator = rough.generator()

const FONT_SAMPLES: ReadonlyArray<{ name: string; family: string }> = [
    // { name: 'Caveat', family: '"Caveat", cursive' },
    // { name: 'Architects Daughter', family: '"Architects Daughter", cursive' },
    // { name: 'Patrick Hand', family: '"Patrick Hand", cursive' },
    { name: 'Kalam', family: '"Kalam", cursive' },
]

function FontSampleButton({ x, y, name, family }: { x: number; y: number; name: string; family: string }) {
    const W = 220
    const H = 48
    const seed = 1
    const paths = generator.toPaths(generator.rectangle(x, y, W, H, { seed }))
    return (
        <g>
            {paths.map((p) => (
                <path key={p.d} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
            ))}
            <text x={x + W / 2} y={y + H / 2} textAnchor="middle" dominantBaseline="central" fontFamily={family} fontSize={20} fill="#111">
                {name}
            </text>
        </g>
    )
}

export const FontSamples = () => (
    <g>
        {FONT_SAMPLES.map((f, i) => {
            const col = i % 3
            const row = Math.floor(i / 3)
            return <FontSampleButton key={f.name} x={20 + col * 232} y={20 + row * 60} name={f.name} family={f.family} />
        })}
    </g>
)
