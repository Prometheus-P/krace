# Feature Specification: Data Platform Phase 1 (Ingestion + Storage)

**Feature Branch**: `004-data-platform-phase1`
**Created**: 2025-12-10
**Status**: Draft
**Reference**: `docs/data-platform-spec.md` (전체 데이터 플랫폼 스펙)

## Overview

RaceLab을 "정보 뷰어"에서 "데이터 플랫폼"으로 전환하기 위한 Phase 1 구현입니다.
Phase 1의 목표는 **데이터 수집 파이프라인**과 **저장소 기초**를 구축하는 것입니다.

### Phase 1 범위

1. **Database Schema**: PostgreSQL + TimescaleDB 테이블 설계 및 마이그레이션
2. **Ingestion Pipeline**: KRA/KSPO API 폴링 워커 구현
3. **Odds Snapshots**: 배당률 시계열 데이터 수집 로직
4. **Historical Data**: 1년치 과거 데이터 백필 (~18M odds rows, ~1-2일 소요)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 데이터 수집 자동화 (Priority: P1)

시스템 운영자가 KRA/KSPO API에서 경주 데이터를 자동으로 수집하여 데이터베이스에 저장합니다.

**Why this priority**: 데이터 축적 없이는 분석 기능(Phase 2+)을 구현할 수 없습니다. 데이터 수집은 전체 플랫폼의 기초입니다.

**Acceptance Scenarios**:

1. **Given** 스케줄러가 실행 중일 때, **When** 매일 06:00이 되면, **Then** 당일 경주 일정이 `races` 테이블에 저장된다
2. **Given** 경주 시작 2시간 전일 때, **When** 폴러가 실행되면, **Then** 출주표가 `entries` 테이블에 저장된다
3. **Given** 경주 종료 후 5분이 지났을 때, **When** 폴러가 실행되면, **Then** 결과가 `results` 테이블에 저장된다

---

### User Story 2 - 배당률 시계열 수집 (Priority: P1)

시스템이 경주 시작 전 배당률을 시간대별로 수집하여 시계열 데이터로 저장합니다.

**Why this priority**: Odds 변동 분석(Odds Radar)은 Phase 2 핵심 기능이며, 이를 위해 시계열 데이터가 필수입니다.

**Acceptance Scenarios**:

1. **Given** 경주 시작 60분 전부터, **When** 5분 간격으로 폴러가 실행되면, **Then** 배당률이 `odds_snapshots` 테이블에 저장된다
2. **Given** 경주 시작 15분 전부터, **When** 1분 간격으로 폴러가 실행되면, **Then** 더 촘촘한 배당률이 저장된다
3. **Given** 경주 시작 5분 전부터, **When** 30초 간격으로 폴러가 실행되면, **Then** 막판 배당 변동이 캡처된다

---

### User Story 3 - 데이터베이스 조회 (Priority: P2)

개발자/분석가가 저장된 경주 데이터를 SQL로 조회하여 분석할 수 있습니다.

**Why this priority**: Phase 2 Insights 기능 개발을 위해 데이터 접근이 필요합니다.

**Acceptance Scenarios**:

1. **Given** 데이터가 수집되었을 때, **When** `SELECT * FROM races WHERE race_date = '2024-12-10'` 실행, **Then** 해당 날짜의 모든 경주가 반환된다
2. **Given** 배당 데이터가 수집되었을 때, **When** `SELECT * FROM odds_snapshots WHERE race_id = 'horse-1-3-20241210'` 실행, **Then** 해당 경주의 모든 배당 스냅샷이 시간순으로 반환된다
3. **Given** 결과 데이터가 저장되었을 때, **When** 말별 승률 집계 쿼리 실행, **Then** 정확한 통계가 계산된다

---

### User Story 4 - 수집 실패 복구 (Priority: P2)

시스템 운영자가 API 호출 실패 시 자동 재시도 및 알림을 받습니다.

**Why this priority**: 데이터 완결성을 위해 수집 실패 대응이 필요합니다.

**Acceptance Scenarios**:

1. **Given** API 호출이 실패했을 때, **When** 재시도 정책이 적용되면, **Then** Exponential backoff (1s, 2s, 4s, 8s, max 5회)로 재시도한다
2. **Given** 5회 재시도 후에도 실패했을 때, **When** 실패가 확정되면, **Then** `ingestion_failures` 테이블에 기록되고 Slack 알림이 발송된다
3. **Given** 실패한 수집 건이 있을 때, **When** 수동 재실행 명령을 실행하면, **Then** 해당 건이 다시 수집된다

---

### User Story 5 - 수집 현황 모니터링 (Priority: P3)

시스템 운영자가 데이터 수집 현황을 대시보드에서 확인합니다.

**Why this priority**: 운영 안정성을 위해 모니터링이 필요하지만, 핵심 기능 구현 후 추가합니다.

**Acceptance Scenarios**:

1. **Given** 수집 워커가 실행 중일 때, **When** 모니터링 대시보드를 확인하면, **Then** 금일 수집 건수, 성공률, 마지막 수집 시각이 표시된다
2. **Given** 수집 실패가 발생했을 때, **When** 대시보드를 확인하면, **Then** 실패 건수와 실패 사유가 표시된다

---

### Edge Cases

- API Rate Limit 도달 시? → 요청 간격을 늘리고 캐싱 강화, 알림 발송
- 경주 취소/연기 시? → `races.status`를 `canceled`/`postponed`로 업데이트
- 동일 데이터 중복 수집 시? → UPSERT 로직으로 중복 방지
- TimescaleDB 하이퍼테이블 파티션 문제 시? → 자동 파티셔닝 및 압축 정책으로 대응

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST store race schedules in `races` table with fields: id, race_type, track_id, race_no, race_date, start_time, distance, grade, status
- **FR-002**: System MUST store entry information in `entries` table with fields: race_id, entry_no, name, jockey_id, horse_id, trainer_id, etc.
- **FR-003**: System MUST store odds snapshots in `odds_snapshots` hypertable with fields: time, race_id, entry_no, odds_win, odds_place, pool_total
- **FR-004**: System MUST store race results in `results` table with fields: race_id, entry_no, finish_position, time, dividend_win, dividend_place
- **FR-005**: System MUST poll KRA API for horse racing data (schedules, entries, odds, results)
- **FR-006**: System MUST poll KSPO API for cycle and boat racing data
- **FR-007**: System MUST implement odds collection at variable intervals: 5min (T-60~T-15), 1min (T-15~T-5), 30sec (T-5~T)
- **FR-008**: System MUST retry failed API calls with exponential backoff (max 5 retries)
- **FR-009**: System MUST log all ingestion failures to `ingestion_failures` table
- **FR-010**: System MUST support manual re-ingestion of failed records

### Non-Functional Requirements

- **NFR-001**: Database MUST use PostgreSQL 15+ with TimescaleDB extension
- **NFR-002**: Odds snapshots table MUST use TimescaleDB hypertable with automatic partitioning
- **NFR-003**: Data retention: raw odds snapshots compressed after 30 days
- **NFR-004**: Ingestion worker MUST use Bull/Redis for job scheduling
- **NFR-005**: System MUST send Slack notifications on ingestion failures
- **NFR-006**: System MUST handle ~50,000 odds_snapshots rows/day (~1.5M/month); partition by week
- **NFR-007**: All credentials (DB, API keys, Redis) MUST be stored in platform secrets manager (Vercel/Railway); no secrets in code or .env files committed to repo
- **NFR-008**: System MUST expose essential metrics: ingestion success rate (%), API latency p95 (ms), Bull queue depth, data freshness (minutes since last successful ingestion per source)

### Key Entities

- **Track**: 경기장 정보 (code, name, race_type, location)
- **Race**: 경주 정보 (id, race_type, track_id, race_no, race_date, start_time, distance, grade, status)
- **Entry**: 출전 정보 (race_id, entry_no, name, jockey, trainer, horse_id, etc.)
- **OddsSnapshot**: 배당률 시계열 (time, race_id, entry_no, odds_win, odds_place, pool_total)
- **Result**: 경주 결과 (race_id, entry_no, finish_position, time, dividend)
- **IngestionFailure**: 수집 실패 로그 (source, endpoint, error, retry_count, created_at)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 당일 경주 일정 수집 성공률 99% 이상
- **SC-002**: 배당률 스냅샷 수집 완결성: 경주당 최소 20개 스냅샷
- **SC-003**: 결과 수집 지연: 경주 종료 후 10분 이내
- **SC-004**: 데이터베이스 쿼리 성능: 1일 데이터 조회 < 100ms
- **SC-005**: TimescaleDB 압축 후 스토리지 절감률 70% 이상
- **SC-006**: 수집 실패 시 알림 발송: 실패 후 1분 이내

## Technical Context

**Language/Version**: TypeScript 5.9 + Node.js 20 LTS
**Primary Dependencies**:
- Next.js 14.2 (기존 프로젝트)
- Bull (Job Queue)
- Redis (Queue Backend)
- pg (PostgreSQL Client)
- @timescale/hypertable (TimescaleDB)

**Storage**:
- PostgreSQL 15 + TimescaleDB extension
- Redis (Bull Queue)

**Testing**:
- Jest (Unit/Integration)
- Playwright (E2E)

**Target Platform**: Vercel (Next.js) + Supabase/Railway (PostgreSQL)

**Performance Goals**:
- API 폴링: 초당 10건 이상 처리
- 배당 스냅샷 삽입: 초당 100건 이상

**Constraints**:
- KRA/KSPO API Rate Limit 준수
- Vercel Serverless Function 10초 타임아웃 고려

## Assumptions

- PostgreSQL 호스팅은 Supabase 또는 Railway 사용 예정
- TimescaleDB는 PostgreSQL extension으로 설치 가능
- Bull/Redis는 Upstash Redis 또는 Railway Redis 사용
- Ingestion Worker는 Railway 또는 Render의 dedicated worker process로 배포 (Vercel 10s 타임아웃 회피, ~$5-10/mo)

## Design System

기존 RaceLab 디자인 시스템 유지. 이 Phase에서는 UI 변경 없음 (백엔드 인프라 구축에 집중).

## Clarifications

### Session 2025-12-10

- Q: What is the expected daily data volume for odds snapshots? → A: Medium (~50,000 rows/day)
- Q: How should database credentials and API keys be managed? → A: Secrets manager (Vercel/Railway secrets)
- Q: Where should the ingestion worker run? → A: Dedicated worker on Railway/Render
- Q: Which metrics should be tracked for ingestion monitoring? → A: Essential (success rate, latency p95, queue depth, data freshness)
- Q: How much historical data should be backfilled initially? → A: 1 year (~18M odds rows, ~1-2 day backfill)

---

**Reference Documents**:
- [Data Platform Spec](../../docs/data-platform-spec.md) - 전체 데이터 플랫폼 아키텍처
- [Technical Design](../../docs/technical/TECHNICAL_DESIGN.md) - 기존 시스템 아키텍처
