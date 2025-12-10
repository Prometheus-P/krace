# Implementation Plan: Data Platform Phase 1 (Ingestion + Storage)

**Branch**: `004-data-platform-phase1` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-race-results-history/spec.md`

## Summary

Build the foundational data infrastructure for RaceLab's transformation from "information viewer" to "data platform". This phase implements:

1. **PostgreSQL + TimescaleDB schema** for races, entries, odds snapshots (time-series), and results
2. **Bull/Redis-based ingestion pipeline** running on Railway as a dedicated worker
3. **Variable-interval odds polling** (5min → 1min → 30sec as race approaches)
4. **1-year historical data backfill** (~18M odds rows)

Technical approach: Separate worker process (avoiding Vercel 10s timeout), TimescaleDB hypertables for efficient time-series queries, exponential backoff retry with Slack alerting.

## Technical Context

**Language/Version**: TypeScript 5.9 + Node.js 20 LTS
**Primary Dependencies**:
- Next.js 14.2 (existing project, API routes for monitoring)
- Bull 4.x (Job Queue)
- ioredis (Redis client for Bull)
- pg + @timescale/hypertable (PostgreSQL + TimescaleDB)
- Drizzle ORM (schema management, migrations)
- @slack/web-api (failure notifications)

**Storage**:
- PostgreSQL 15 + TimescaleDB extension (Railway)
- Redis (Upstash or Railway, for Bull queue)

**Testing**:
- Jest (unit/integration tests for ingestion logic)
- Playwright (E2E for monitoring dashboard if added)

**Target Platform**:
- Next.js frontend: Vercel
- Ingestion worker: Railway (dedicated process, ~$5-10/mo)
- PostgreSQL: Railway (TimescaleDB support)
- Redis: Upstash or Railway

**Project Type**: Web application (Next.js + dedicated worker process)

**Performance Goals**:
- API polling: 10+ requests/second
- Odds snapshot insertion: 100+ rows/second
- Query performance: 1-day data < 100ms

**Constraints**:
- KRA/KSPO API rate limits (must respect)
- ~50,000 odds_snapshots rows/day (~1.5M/month)
- 1-year backfill: ~18M odds rows (1-2 day processing)

**Scale/Scope**:
- 3 race types (horse, cycle, boat)
- 5 tracks (서울, 부산경남, 제주, 광명, 미사리)
- ~30-50 races/day during race days
- ~12-16 entries per race

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. TDD (NON-NEGOTIABLE)** | ✅ WILL COMPLY | All ingestion logic, mappers, and DB operations will have tests first. Coverage targets: Unit 80%, Integration 60% |
| **II. Structural-Behavioral Separation** | ✅ WILL COMPLY | Phase will use separate commits: `chore(structure):` for file/folder setup, `feat(behavior):` for logic |
| **III. Simplicity First** | ✅ WILL COMPLY | Direct Bull job handlers, simple mapper functions. No premature abstractions. |
| **IV. Clear Data Flow** | ✅ WILL COMPLY | `KRA/KSPO API → ingestion/fetchers → ingestion/mappers → Drizzle ORM → PostgreSQL` |
| **V. Mobile-First** | ⚪ N/A | Phase 1 is backend-only; no UI changes |

**Gate Status**: ✅ PASS - All applicable principles will be followed.

## Project Structure

### Documentation (this feature)

```text
specs/004-race-results-history/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal API contracts)
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── admin/
│           └── ingestion/         # Monitoring/control endpoints
│               ├── status/route.ts
│               ├── retry/route.ts
│               └── metrics/route.ts
├── lib/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── tracks.ts          # Track entity
│   │   │   ├── races.ts           # Race entity
│   │   │   ├── entries.ts         # Entry entity
│   │   │   ├── oddsSnapshots.ts   # TimescaleDB hypertable
│   │   │   ├── results.ts         # Race results
│   │   │   └── ingestionFailures.ts
│   │   ├── migrations/            # Drizzle migrations
│   │   └── client.ts              # DB connection
│   └── ingestion/
│       ├── fetchers/
│       │   ├── kra.ts             # KRA API client
│       │   └── kspo.ts            # KSPO API client
│       ├── mappers/
│       │   ├── races.ts           # API → DB mappers
│       │   ├── entries.ts
│       │   ├── odds.ts
│       │   └── results.ts
│       ├── jobs/
│       │   ├── schedulePoller.ts  # Daily schedule fetch
│       │   ├── entryPoller.ts     # Pre-race entry fetch
│       │   ├── oddsPoller.ts      # Variable-interval odds
│       │   └── resultPoller.ts    # Post-race results
│       └── notifications/
│           └── slack.ts           # Failure alerts

worker/
├── index.ts                       # Bull worker entry point
├── queue.ts                       # Queue configuration
└── scheduler.ts                   # Job scheduling logic

tests/
├── unit/
│   └── lib/
│       └── ingestion/
│           ├── mappers/           # Mapper unit tests
│           └── fetchers/          # Fetcher mocks/tests
└── integration/
    └── ingestion/
        ├── jobs.test.ts           # Job execution tests
        └── db.test.ts             # DB write tests
```

**Structure Decision**: Web application with separate worker process. Next.js handles the frontend and monitoring API; dedicated `worker/` directory contains the Bull-based ingestion process that runs on Railway.

## Complexity Tracking

> No violations identified. All designs follow simplicity-first principle.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Worker separation | Dedicated process vs serverless | Vercel 10s timeout incompatible with API polling; Railway worker is simpler than complex chunking |
| ORM choice | Drizzle over raw SQL | Type-safe migrations, existing project pattern, minimal overhead |
| Queue choice | Bull over custom scheduler | Battle-tested, built-in retry, dashboard available |
