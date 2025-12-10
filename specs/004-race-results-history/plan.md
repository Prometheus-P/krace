# Implementation Plan: Data Platform Phase 1 (Ingestion + Storage)

**Branch**: `004-data-platform-phase1` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-race-results-history/spec.md`
**Reference**: [Data Platform Spec](../../docs/data-platform-spec.md)

## Summary

RaceLab을 "정보 뷰어"에서 "데이터 플랫폼"으로 전환하기 위한 Phase 1 구현 계획입니다.
핵심 목표는 **데이터 수집 파이프라인(Ingestion)**과 **저장소(Storage)** 기초를 구축하는 것입니다.

**주요 구현 범위**:
1. PostgreSQL + TimescaleDB 스키마 설계 및 마이그레이션
2. Bull/Redis 기반 Job Queue 인프라 구축
3. KRA/KSPO API 폴링 워커 구현
4. Odds 시계열 스냅샷 수집 로직
5. 실패 복구 및 모니터링 기초

## Technical Context

**Language/Version**: TypeScript 5.9 + Node.js 20 LTS
**Primary Dependencies**:
- Next.js 14.2 (기존 프로젝트)
- Bull 4.x (Job Queue)
- ioredis (Redis Client)
- pg / @vercel/postgres (PostgreSQL Client)
- Drizzle ORM 또는 Prisma (ORM - NEEDS CLARIFICATION)

**Storage**:
- PostgreSQL 15+ with TimescaleDB extension
- Redis 7+ (Bull Queue Backend)

**Testing**:
- Jest (Unit/Integration) - jest.config.api.js
- Playwright (E2E) - playwright.config.ts

**Target Platform**:
- Next.js on Vercel (기존 프론트엔드/API)
- Ingestion Worker: Railway/Render (별도 Node.js 프로세스) 또는 Vercel Cron

**Project Type**: Web application (기존 Next.js 프로젝트 확장)

**Performance Goals**:
- API 폴링 처리량: 초당 10건 이상
- 배당 스냅샷 DB 삽입: 초당 100건 이상
- 일간 데이터 조회 쿼리: < 100ms

**Constraints**:
- KRA/KSPO API Rate Limit (일 1,000 호출 추정)
- Vercel Serverless Function 10초 타임아웃
- Vercel Cron 최대 실행 주기 1분

**Scale/Scope**:
- 일간 경주 수: ~50-100 경주
- 경주당 odds 스냅샷: 20-40개
- 예상 일간 스냅샷 삽입량: ~5,000 rows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Test-Driven Development (NON-NEGOTIABLE)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Failing test before production code | ✅ PASS | 모든 DB 스키마, 폴러, 워커에 대해 TDD 적용 |
| All tests pass before commit | ✅ PASS | CI/CD에서 검증 |
| Coverage: Unit 80%, Integration 60% | ✅ PASS | Jest coverage threshold 설정 |

### II. Structural-Behavioral Separation

| Requirement | Status | Notes |
|-------------|--------|-------|
| Structure and behavior in separate commits | ✅ PASS | 스키마 마이그레이션 vs 비즈니스 로직 분리 |
| Commit convention followed | ✅ PASS | `chore(structure):`, `feat(behavior):` |

### III. Simplicity First

| Requirement | Status | Notes |
|-------------|--------|-------|
| Functions 10-20 lines max | ✅ PASS | 폴러/워커 로직 분할 |
| No premature abstraction | ✅ PASS | 직접 구현 우선, 필요시 추상화 |
| Complexity justified in plan | ✅ PASS | TimescaleDB는 시계열 데이터 필수 요구사항 |

### IV. Clear Data Flow

| Requirement | Status | Notes |
|-------------|--------|-------|
| Data through mapper functions | ✅ PASS | 기존 `lib/api-helpers/mappers.ts` 패턴 유지 |
| Standard API response format | ✅ PASS | `{ success, data, error, timestamp }` |
| Explicit dependencies | ✅ PASS | DI 패턴으로 테스트 가능성 확보 |

### V. Mobile-First Responsive Design

| Requirement | Status | Notes |
|-------------|--------|-------|
| Mobile-first UI | N/A | Phase 1은 백엔드 인프라만, UI 없음 |

**Constitution Check Result**: ✅ **PASS** - 모든 적용 가능한 원칙 준수

## Project Structure

### Documentation (this feature)

```text
specs/004-race-results-history/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── ingestion-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# 기존 Next.js 프로젝트 구조 확장

src/
├── app/                      # Next.js App Router (기존)
│   ├── api/
│   │   └── ingestion/        # [신규] Ingestion 관련 API Routes
│   │       ├── trigger/      # 수동 트리거 엔드포인트
│   │       └── status/       # 수집 현황 조회
│   └── ...
├── components/               # React 컴포넌트 (기존)
├── lib/                      # 유틸리티 (기존)
│   ├── api.ts               # API 클라이언트 (기존)
│   ├── api-helpers/         # 매퍼 (기존)
│   └── db/                  # [신규] 데이터베이스 레이어
│       ├── schema.ts        # Drizzle/Prisma 스키마
│       ├── client.ts        # DB 클라이언트
│       └── migrations/      # 마이그레이션 파일
├── types/                   # TypeScript 타입 (기존)
└── ingestion/               # [신규] Ingestion 워커 모듈
    ├── index.ts             # 워커 엔트리포인트
    ├── jobs/                # Job 정의
    │   ├── schedulePoller.ts
    │   ├── entryPoller.ts
    │   ├── oddsPoller.ts
    │   └── resultPoller.ts
    ├── queue/               # Bull Queue 설정
    │   └── setup.ts
    └── utils/
        └── retry.ts         # 재시도 로직

db/                          # [신규] DB 마이그레이션 (root level)
├── migrations/
│   ├── 001_init_schema.sql
│   ├── 002_timescale_hypertable.sql
│   └── ...
└── seeds/                   # 초기 데이터 (tracks 등)
    └── tracks.sql

tests/
├── unit/
│   └── ingestion/           # [신규] Ingestion 유닛 테스트
├── integration/
│   └── db/                  # [신규] DB 통합 테스트
└── e2e/                     # E2E (기존)
```

**Structure Decision**: 기존 Next.js 프로젝트 구조를 유지하면서 `src/ingestion/`과 `src/lib/db/`를 신규 추가.
별도 백엔드 서버 대신 Next.js API Routes + Vercel Cron 또는 Railway 워커로 구현.

## Complexity Tracking

| Item | Justification | Simpler Alternative Rejected |
|------|---------------|------------------------------|
| TimescaleDB | 시계열 데이터(odds) 효율적 저장/압축 필수 | 일반 PostgreSQL은 시계열 쿼리 비효율, 스토리지 과다 |
| Bull/Redis | 스케줄링, 재시도, 동시성 제어 필요 | 단순 cron은 재시도/실패 복구 불가 |
| 별도 Ingestion Worker | Vercel 10초 타임아웃으로 장시간 폴링 불가 | API Routes만으로는 1분 이상 작업 불가능 |

## Open Questions (for Research Phase)

1. **ORM 선택**: Drizzle vs Prisma - TimescaleDB 지원, 마이그레이션 편의성 비교 필요
2. **호스팅 결정**: PostgreSQL - Supabase vs Railway vs Neon - TimescaleDB 지원 여부
3. **Worker 호스팅**: Railway vs Render vs Fly.io - 비용, 스케줄링 지원 비교
4. **Redis 호스팅**: Upstash vs Railway Redis - Bull 호환성, 비용 비교
5. **Vercel Cron 한계**: 1분 주기가 odds 수집에 충분한지 검토 필요
