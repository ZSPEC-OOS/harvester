# DeepScholar

AI-driven academic research platform — multi-source discovery, AI ranking, citation verification, and synthesized reports.

## Active Project

The live application lives in **`deep-research-platform/`** — a Next.js 14 full-stack app.

```
cd deep-research-platform
cp .env.example .env.local   # fill in your keys
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DEEPSEEK_API_KEY` | Default AI key (users can override via Settings) |
| `ENCRYPTION_KEY` | 32-byte hex key for encrypting stored API keys |
| `SERPER_API_KEY` | Serper.dev key for web search |

### Pipeline

```
POST /api/research           → create session
POST /api/research/:id/plan  → AI generates 7-field search plan (searchQueries, researchQuestions, …)
POST /api/research/:id/search → fetch Serper + CrossRef, deduplicate
POST /api/research/:id/rank  → AI relevance scoring + heuristic authority/recency/evidence
POST /api/research/:id/verify → CrossRef DOI verification + citation formatting
POST /api/research/:id/synthesize → AI report generation (streamed)
POST /api/research/:id/export → markdown / bibtex / json / csv / docx / pdf
```

## Archive

`archive/` contains the original standalone Vite + React prototype (DeepScholar v0).
It is no longer actively maintained; the Next.js platform supersedes it.
