# Deep Research Platform (Harvester)

A production-oriented research workspace for planning, retrieving, ranking, verifying, and synthesizing evidence-backed reports with citations.

## Current Stack

- **Frontend/App**: Next.js App Router, React, TypeScript, Tailwind CSS.
- **Backend**: Next.js Route Handlers + SSE streaming endpoints.
- **Data**: Prisma ORM.
- **Testing**: Vitest (unit/integration/evals) and Playwright (E2E).
- **AI Pipeline**: planner, ranker, citation verifier, synthesis stages with provider routing.

## Core Features

- Guided research session setup (topic, citation style, depth, year range).
- Streaming multi-stage workflow: plan → search → rank → verify → synthesize.
- Session/project history and rerun support.
- Citation verification and export formats (JSON, Markdown, CSV, BibTeX, DOCX, PDF).
- Usage/cost tracking, API key management, and health endpoints.
- Error boundaries and resilient UI fallbacks across major app sections.

## Quick Start

```bash
cd deep-research-platform
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Testing Commands

```bash
cd deep-research-platform
npm run test
npm run test:unit
npm run test:integration
npm run test:evals
npm run test:e2e
```

## Project Structure

- `deep-research-platform/app` — routes, layouts, API handlers.
- `deep-research-platform/components` — UI, cards, research console, providers.
- `deep-research-platform/lib` — prompts, AI routing, ranking, validation, utils.
- `deep-research-platform/server` — search, citations, export services.
- `deep-research-platform/tests` — unit, integration, eval, and E2E suites.

## Notes

Legacy Vite scaffold files from earlier prototyping are archived under `archive/`.
