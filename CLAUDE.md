# CLAUDE.md

MockBench — a wireframing tool with a sketchy hand-drawn aesthetic.

A wireframe is a document of intent, not a visual asset. The tool should be as fast as a pencil, as smart as an outline, and as presentable as a slide deck. Show people the minimum they need to think clearly. Let them discover depth when they're ready. Ship less, reveal gradually, and never let the interface outgrow the idea it's trying to capture.

# Commands

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Production build
pnpm typecheck        # TypeScript strict check (no emit)
pnpm typecheck:watch  # Watch mode
```


# Stack

- Vite + React + TypeScript (strict)
- Tailwind v4
- Zustand (state management)
- RoughJS (hand-drawn SVG rendering)
- pnpm

# Forbidden Directories

NEVER read, reference, or open files in the `user-notes-ai-must-never-read/` directory. This folder contains the user's private notes. Ignore its existence entirely. Do not list its contents, do not summarize it, do not use it for context. Pretend it does not exist.

