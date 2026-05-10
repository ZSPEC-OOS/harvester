# Deployment Guide

## Environment Variables
| Name | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | Postgres connection string |
| NEXT_PUBLIC_DEFAULT_USER_ID | Yes | Default local user identifier |
| DEEPSEEK_API_KEY | Yes | AI provider key |
| SERPER_API_KEY | Yes | Search API key |
| ENCRYPTION_SECRET | Yes | 32+ character key encryption secret |

## Build & Deploy
1. Install dependencies: `npm ci`
2. Run production build: `npm run build`
3. Start app: `npm run start`

## Pre-deploy Checklist
- Run migrations successfully (`prisma migrate deploy`)
- Verify `/api/health` returns healthy
- Confirm CSP and HSTS headers in production
- Validate API keys in settings

## Rollback
1. Re-deploy previous Vercel deployment.
2. Restore DB from latest backup if migration issue occurs.
3. Re-run health checks and smoke tests.
