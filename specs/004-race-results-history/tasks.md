# Tasks: Data Platform Phase 1 (Ingestion + Storage)

**Input**: Design documents from `/specs/004-race-results-history/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ingestion-api.yaml ✅

**Tests**: TDD approach per project constitution. Tests included for critical paths.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

Based on plan.md project structure:
- `src/lib/db/` - Database layer (Drizzle ORM)
- `src/ingestion/` - Ingestion worker module
- `src/app/api/ingestion/` - API routes
- `db/migrations/` - SQL migrations
- `tests/unit/ingestion/` - Unit tests
- `tests/integration/db/` - Integration tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and configuration

- [ ] T001 Create directory structure: `src/lib/db/schema/`, `src/lib/db/queries/`, `src/ingestion/`, `db/migrations/`, `db/seeds/`
- [ ] T002 Install dependencies: `drizzle-orm`, `pg`, `bull`, `ioredis`, `@types/pg` in package.json
- [ ] T003 [P] Create drizzle.config.ts at project root
- [ ] T004 [P] Update .env.example with DATABASE_URL, REDIS_URL, INGESTION_API_KEY variables
- [ ] T005 [P] Create src/lib/db/client.ts with Drizzle client initialization

---

## Phase 2: Foundational (Database Schema - BLOCKING)

**Purpose**: Core database schema that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Schema Files

- [ ] T006 [P] Create tracks schema in src/lib/db/schema/tracks.ts
- [ ] T007 [P] Create races schema in src/lib/db/schema/races.ts
- [ ] T008 [P] Create entries schema in src/lib/db/schema/entries.ts
- [ ] T009 [P] Create oddsSnapshots schema in src/lib/db/schema/oddsSnapshots.ts
- [ ] T010 [P] Create results schema in src/lib/db/schema/results.ts
- [ ] T011 [P] Create ingestionFailures schema in src/lib/db/schema/ingestionFailures.ts
- [ ] T012 Create schema index export in src/lib/db/schema/index.ts (depends on T006-T011)

### Type Definitions

- [ ] T013 Create database type definitions in src/types/db.ts (RaceType, RaceStatus, etc.)

### Migration Files

- [ ] T014 Create SQL migration db/migrations/001_init_schema.sql (tracks, races, entries, results, ingestion_failures)
- [ ] T015 Create SQL migration db/migrations/002_timescale_hypertable.sql (odds_snapshots + compression policy)
- [ ] T016 Create seed file db/seeds/tracks.sql (서울, 부산, 제주, 광명, 창원, 미사리)

### Infrastructure

- [ ] T017 [P] Create ingestion auth middleware in src/lib/api-helpers/ingestionAuth.ts
- [ ] T018 [P] Create retry utility with exponential backoff in src/ingestion/utils/retry.ts

**Checkpoint**: Database schema ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 데이터 수집 자동화 (Priority: P1) 🎯 MVP

**Goal**: KRA/KSPO API에서 경주 데이터(일정, 출주표, 결과)를 자동 수집하여 DB에 저장

**Independent Test**: 
- POST /api/ingestion/trigger/schedules 호출 시 races 테이블에 데이터 저장 확인
- POST /api/ingestion/trigger/entries 호출 시 entries 테이블에 데이터 저장 확인
- POST /api/ingestion/trigger/results 호출 시 results 테이블에 데이터 저장 확인

### Tests for User Story 1

- [ ] T019 [P] [US1] Unit test for schedulePoller in tests/unit/ingestion/schedulePoller.test.ts
- [ ] T020 [P] [US1] Unit test for entryPoller in tests/unit/ingestion/entryPoller.test.ts
- [ ] T021 [P] [US1] Unit test for resultPoller in tests/unit/ingestion/resultPoller.test.ts
- [ ] T022 [P] [US1] Integration test for schedule ingestion in tests/integration/db/scheduleIngestion.test.ts

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create KRA API client wrapper in src/ingestion/clients/kraClient.ts
- [ ] T024 [P] [US1] Create KSPO API client wrapper in src/ingestion/clients/kspoClient.ts
- [ ] T025 [P] [US1] Create schedule mapper in src/ingestion/mappers/scheduleMapper.ts
- [ ] T026 [P] [US1] Create entry mapper in src/ingestion/mappers/entryMapper.ts
- [ ] T027 [P] [US1] Create result mapper in src/ingestion/mappers/resultMapper.ts
- [ ] T028 [US1] Implement schedulePoller job in src/ingestion/jobs/schedulePoller.ts (depends on T023, T024, T025)
- [ ] T029 [US1] Implement entryPoller job in src/ingestion/jobs/entryPoller.ts (depends on T023, T024, T026)
- [ ] T030 [US1] Implement resultPoller job in src/ingestion/jobs/resultPoller.ts (depends on T023, T024, T027)
- [ ] T031 [US1] Create API route POST /api/ingestion/trigger/schedules in src/app/api/ingestion/trigger/schedules/route.ts
- [ ] T032 [US1] Create API route POST /api/ingestion/trigger/entries in src/app/api/ingestion/trigger/entries/route.ts
- [ ] T033 [US1] Create API route POST /api/ingestion/trigger/results in src/app/api/ingestion/trigger/results/route.ts
- [ ] T034 [US1] Add Vercel Cron config for daily schedule collection (06:00) in vercel.json
- [ ] T035 [US1] Create cron route src/app/api/ingestion/cron/schedules/route.ts

**Checkpoint**: US1 complete - 일정/출주표/결과 수집 기능 독립 테스트 가능

---

## Phase 4: User Story 2 - 배당률 시계열 수집 (Priority: P1)

**Goal**: 경주 시작 전 배당률을 시간대별로 수집하여 TimescaleDB 하이퍼테이블에 저장

**Independent Test**:
- POST /api/ingestion/trigger/odds 호출 시 odds_snapshots 테이블에 시계열 데이터 저장 확인
- 1분 Cron 내에서 30초 간격 수집 동작 확인

### Tests for User Story 2

- [ ] T036 [P] [US2] Unit test for oddsPoller in tests/unit/ingestion/oddsPoller.test.ts
- [ ] T037 [P] [US2] Unit test for smart scheduler in tests/unit/ingestion/smartScheduler.test.ts
- [ ] T038 [P] [US2] Integration test for odds snapshots in tests/integration/db/oddsSnapshots.test.ts

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create odds mapper in src/ingestion/mappers/oddsMapper.ts
- [ ] T040 [US2] Create smart scheduler utility in src/ingestion/utils/smartScheduler.ts (variable intervals: 5min/1min/30sec)
- [ ] T041 [US2] Implement oddsPoller job with variable intervals in src/ingestion/jobs/oddsPoller.ts (depends on T039, T040)
- [ ] T042 [US2] Create API route POST /api/ingestion/trigger/odds in src/app/api/ingestion/trigger/odds/route.ts
- [ ] T043 [US2] Add Vercel Cron config for odds collection (1-min interval) in vercel.json
- [ ] T044 [US2] Create cron route src/app/api/ingestion/cron/odds/route.ts with smart scheduling

**Checkpoint**: US2 complete - 배당률 시계열 수집 기능 독립 테스트 가능

---

## Phase 5: User Story 3 - 데이터베이스 조회 (Priority: P2)

**Goal**: 저장된 경주 데이터를 SQL로 조회하여 분석 가능

**Independent Test**:
- SELECT * FROM races WHERE race_date = '2024-12-10' 쿼리 동작 확인
- odds_snapshots 시계열 쿼리 성능 < 100ms 확인

### Tests for User Story 3

- [ ] T045 [P] [US3] Unit test for race queries in tests/unit/db/raceQueries.test.ts
- [ ] T046 [P] [US3] Unit test for odds queries in tests/unit/db/oddsQueries.test.ts

### Implementation for User Story 3

- [ ] T047 [P] [US3] Create race query functions in src/lib/db/queries/races.ts (getRacesByDate, getRaceById, getRaceWithEntries)
- [ ] T048 [P] [US3] Create entry query functions in src/lib/db/queries/entries.ts (getEntriesByRace, getEntryStats)
- [ ] T049 [P] [US3] Create odds query functions in src/lib/db/queries/odds.ts (getOddsHistory, getOddsSummary, use continuous aggregate)
- [ ] T050 [P] [US3] Create result query functions in src/lib/db/queries/results.ts (getResultsByRace, getHorseWinRate, getJockeyStats)
- [ ] T051 [US3] Create query index file src/lib/db/queries/index.ts

**Checkpoint**: US3 complete - 데이터 조회 기능 독립 테스트 가능

---

## Phase 6: User Story 4 - 수집 실패 복구 (Priority: P2)

**Goal**: API 호출 실패 시 자동 재시도(exponential backoff) 및 Slack 알림

**Independent Test**:
- 5회 재시도 후 실패 시 ingestion_failures 테이블에 기록 확인
- GET /api/ingestion/failures 로 실패 목록 조회 확인
- POST /api/ingestion/failures/{id}/retry 로 수동 재시도 확인

### Tests for User Story 4

- [ ] T052 [P] [US4] Unit test for failure logger in tests/unit/ingestion/failureLogger.test.ts
- [ ] T053 [P] [US4] Unit test for Slack notifier in tests/unit/ingestion/slackNotifier.test.ts

### Implementation for User Story 4

- [ ] T054 [P] [US4] Create failure logger in src/ingestion/utils/failureLogger.ts
- [ ] T055 [P] [US4] Create Slack notification service in src/ingestion/services/slackNotifier.ts
- [ ] T056 [US4] Update retry utility with failure logging in src/ingestion/utils/retry.ts (integrate failureLogger)
- [ ] T057 [US4] Create API route GET /api/ingestion/failures in src/app/api/ingestion/failures/route.ts
- [ ] T058 [US4] Create API route POST /api/ingestion/failures/[id]/retry in src/app/api/ingestion/failures/[id]/retry/route.ts
- [ ] T059 [US4] Create failure recovery cron job in src/ingestion/jobs/failureRecovery.ts

**Checkpoint**: US4 complete - 실패 복구 기능 독립 테스트 가능

---

## Phase 7: User Story 5 - 수집 현황 모니터링 (Priority: P3)

**Goal**: 데이터 수집 현황을 API로 조회 가능

**Independent Test**:
- GET /api/ingestion/status 호출 시 금일 수집 건수, 성공률, 마지막 수집 시각 반환 확인

### Tests for User Story 5

- [ ] T060 [P] [US5] Unit test for status service in tests/unit/ingestion/statusService.test.ts

### Implementation for User Story 5

- [ ] T061 [US5] Create status aggregation service in src/ingestion/services/statusService.ts
- [ ] T062 [US5] Create metrics tracking utility in src/ingestion/utils/metrics.ts
- [ ] T063 [US5] Create API route GET /api/ingestion/status in src/app/api/ingestion/status/route.ts

**Checkpoint**: US5 complete - 모니터링 기능 독립 테스트 가능

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, code quality, and final validation

- [ ] T064 [P] Update quickstart.md with actual setup verification steps
- [ ] T065 [P] Add JSDoc comments to all public functions in src/lib/db/ and src/ingestion/
- [ ] T066 [P] Create README for ingestion module in src/ingestion/README.md
- [ ] T067 Run all migrations on test database and validate
- [ ] T068 Run quickstart.md validation (end-to-end test)
- [ ] T069 Performance test: verify odds query < 100ms on 30-day data

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ─── BLOCKS ALL USER STORIES
    ↓
┌───────────────────────────────────────────────────┐
│  User Stories can proceed in parallel after P2    │
│                                                   │
│  Phase 3 (US1: P1) ──┐                           │
│  Phase 4 (US2: P1) ──┼── Can run in parallel     │
│  Phase 5 (US3: P2) ──┤                           │
│  Phase 6 (US4: P2) ──┤                           │
│  Phase 7 (US5: P3) ──┘                           │
└───────────────────────────────────────────────────┘
    ↓
Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (P1) | Phase 2 only | US2, US3, US4, US5 |
| US2 (P1) | Phase 2 only | US1, US3, US4, US5 |
| US3 (P2) | Phase 2 only | US1, US2, US4, US5 |
| US4 (P2) | Phase 2 only | US1, US2, US3, US5 |
| US5 (P3) | Phase 2 only | US1, US2, US3, US4 |

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (TDD)
2. Mappers/Utilities before Jobs
3. Jobs before API Routes
4. API Routes before Cron config

---

## Parallel Execution Examples

### Phase 2: All Schema Files (6 tasks)

```bash
# Launch all schema files in parallel:
T006: "Create tracks schema in src/lib/db/schema/tracks.ts"
T007: "Create races schema in src/lib/db/schema/races.ts"
T008: "Create entries schema in src/lib/db/schema/entries.ts"
T009: "Create oddsSnapshots schema in src/lib/db/schema/oddsSnapshots.ts"
T010: "Create results schema in src/lib/db/schema/results.ts"
T011: "Create ingestionFailures schema in src/lib/db/schema/ingestionFailures.ts"
```

### User Story 1: Tests + API Clients + Mappers (8 tasks)

```bash
# Launch US1 tests in parallel:
T019: "Unit test for schedulePoller"
T020: "Unit test for entryPoller"
T021: "Unit test for resultPoller"
T022: "Integration test for schedule ingestion"

# Launch US1 implementations in parallel:
T023: "Create KRA API client wrapper"
T024: "Create KSPO API client wrapper"
T025: "Create schedule mapper"
T026: "Create entry mapper"
T027: "Create result mapper"
```

### Multiple User Stories in Parallel (Team Strategy)

```bash
# Developer A: US1 (일정/출주표/결과)
T019-T035

# Developer B: US2 (배당률 시계열)
T036-T044

# Developer C: US3 + US4 (조회 + 실패복구)
T045-T059
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only) - 권장

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (DB Schema)
3. Complete Phase 3: User Story 1 (일정/출주표/결과 수집)
4. Complete Phase 4: User Story 2 (배당률 시계열)
5. **STOP and VALIDATE**: 데이터 수집 파이프라인 독립 테스트
6. Deploy to staging

### Full Implementation

1. Setup + Foundational → Foundation ready
2. US1 (일정 수집) → Test → Checkpoint
3. US2 (배당률) → Test → Checkpoint  
4. US3 (조회) → Test → Checkpoint
5. US4 (실패복구) → Test → Checkpoint
6. US5 (모니터링) → Test → Checkpoint
7. Polish → Final validation → Deploy

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 5 | 3 |
| Foundational | 13 | 8 |
| US1 (P1) | 17 | 9 |
| US2 (P1) | 9 | 4 |
| US3 (P2) | 7 | 6 |
| US4 (P2) | 8 | 4 |
| US5 (P3) | 4 | 1 |
| Polish | 6 | 3 |
| **Total** | **69** | **38 (55%)** |

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story
- Each user story independently completable and testable
- TDD: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
