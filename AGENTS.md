# AI Review Copilot Agent Notes

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Version Warning

This is not the Next.js you may know from training data. This repo uses Next.js 16, which has breaking changes in APIs, conventions, and generated file structure. Before changing Next.js routing, rendering, metadata, caching, or server/client component behavior, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Stack

- Next.js App Router, React 19, TypeScript.
- Tailwind CSS 4, shadcn/ui components, lucide-react icons, Sonner toasts.
- Local-first AI review workflows with browser-to-Ollama calls.
- Docker compose files for Ollama CPU and optional NVIDIA GPU.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Tests: no test script is currently defined.

## Main Folders

- `src/app`: App Router pages and API routes.
- `src/components`: UI, review workflow, provider settings, file upload, and guide components.
- `src/lib`: AI clients, parsers, static analysis, database helpers, and utilities.
- `src/data`: sample and documentation data.
- `src/types`: shared TypeScript types.
- `docker`: Ollama compose files.

## Coding Conventions

- Keep TypeScript strict and avoid unused imports.
- Prefer existing shadcn/ui primitives, local utility helpers, and established component patterns.
- Use `@/` imports for source files.
- Keep browser-only behavior in `"use client"` components.
- Do not change Ollama integration logic unless the task explicitly requires it.
- Do not add authentication, persistence, cloud AI, or PR provider integrations unless requested.

## Design Rules

- Preserve the dark-first, modern UI with subtle gradients, rounded cards, and soft borders.
- Use Tailwind utility classes consistent with existing pages.
- Use lucide-react icons for buttons and small UI affordances.
- Keep documentation and workflow pages readable, responsive, and uncluttered.

## Validation Before Finishing

- Run `npm run lint`.
- Run `npm run build` for route, TypeScript, or component changes.
- For UI changes, start `npm run dev` and verify affected routes load locally.
- Confirm existing `/review` functionality and navigation are not broken when touching shared UI.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
