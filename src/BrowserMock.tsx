import { observer } from 'mobx-react-lite'
import rough from 'roughjs'

const generator = rough.generator()

function renderPaths(paths: ReturnType<typeof generator.toPaths>) {
    return paths.map((p) => (
        <path key={p.d} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
    ))
}

// Wavy horizontal line — wireframe placeholder for "text goes here".
function squigglePaths(x: number, y: number, width: number, seed: number) {
    const amplitude = 2
    const step = 6
    const pts: [number, number][] = []
    for (let i = 0; i <= width; i += step) {
        pts.push([x + i, y + (((i / step) | 0) % 2 === 0 ? -amplitude : amplitude)])
    }
    return generator.toPaths(generator.curve(pts, { seed, roughness: 1 }))
}

const BrowserWindow = observer(function BrowserWindow({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
    const titleBarH = 40
    const titleBarY = y
    const contentY = y + titleBarH

    // Traffic lights
    const lightR = 7
    const lightY = titleBarY + titleBarH / 2
    const lightSpacing = 22
    const lightStartX = x + 16 + lightR

    // URL bar
    const urlBarH = 22
    const urlBarX = lightStartX + lightSpacing * 2 + lightR + 20
    const urlBarY = titleBarY + (titleBarH - urlBarH) / 2
    const urlBarW = w - (urlBarX - x) - 20

    const frame = generator.toPaths(generator.rectangle(x, y, w, h, { seed: 11, roughness: 1.2 }))
    const titleBarSep = generator.toPaths(
        generator.line(x, contentY, x + w, contentY, { seed: 12, roughness: 1 }),
    )
    const lights = [0, 1, 2].map((i) =>
        generator.toPaths(
            generator.circle(lightStartX + i * lightSpacing, lightY, lightR * 2, { seed: 13 + i, roughness: 1.5 }),
        ),
    )
    const urlBar = generator.toPaths(
        generator.rectangle(urlBarX, urlBarY, urlBarW, urlBarH, { seed: 16, roughness: 1 }),
    )
    const urlSquiggle = squigglePaths(urlBarX + 12, urlBarY + urlBarH / 2, urlBarW - 24, 17)

    return (
        <g>
            {renderPaths(frame)}
            {renderPaths(titleBarSep)}
            {lights.map((pths, i) => (
                <g key={`light-${i}`}>{renderPaths(pths)}</g>
            ))}
            {renderPaths(urlBar)}
            {renderPaths(urlSquiggle)}
        </g>
    )
})

export const BrowserMock = observer(function BrowserMock() {
    return (
        <g>
            <BrowserWindow x={40} y={160} w={600} h={360} />
        </g>
    )
})
