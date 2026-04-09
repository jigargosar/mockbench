# MockBench — Product Notes

## Name
MockBench — "mock" (wireframe/mockup) + "bench" (workbench where you build things).
Chosen for: zero conflicts, clean SERP, .com likely available, instantly understood.

## What it is
A wireframing tool with a hand-drawn/sketchy aesthetic. Lo-fi on purpose.
Think Balsamiq energy but built for the modern web.

## Key differentiator
- Hand-drawn SVG aesthetic via RoughJS (not pixel-perfect, not boring boxes)
- Present mode built in — wireframe your screens, present them directly
- Template library as growth engine (programmatic SEO play)

## Growth strategy
Programmatic SEO: auto-generated template pages targeting long-tail searches.
Examples: "login page wireframe template", "dashboard wireframe", "checkout flow wireframe".
Each page is a landing page with a usable wireframe inside the product.

## Competitive landscape
- Balsamiq — established, desktop-era feel, paid
- Figma — overkill for wireframing, high fidelity
- Excalidraw — closest vibe but general-purpose whiteboard, not wireframe-specific
- Moqups, MockFlow, Mockplus — various quality, none own the "sketchy wireframe" niche on the web

## Technical decisions
- Pure SVG (not canvas) — better React integration, DOM events, accessibility
- RoughJS for hand-drawn paths
- Zustand for state (camera, elements, tools as separate stores)
- Vite + React + TypeScript + Tailwind v4
