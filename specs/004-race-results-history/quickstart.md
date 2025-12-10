# Quickstart: Data Platform Phase 1

**Date**: 2025-12-10
**Plan Reference**: [plan.md](./plan.md)

이 문서는 Data Platform Phase 1 개발 환경 설정 및 빠른 시작 가이드입니다.

---

## 1. Prerequisites

### 필수 도구

```bash
# Node.js 20 LTS
node --version  # v20.x.x

# pnpm (권장) 또는 npm
pnpm --version  # 8.x+

# PostgreSQL CLI (로컬 테스트용)
psql --version  # 15.x+
```

### 외부 서비스 계정

| 서비스 | 용도 | 가입 URL |
|--------|------|----------|
| **Supabase** | PostgreSQL + TimescaleDB | https://supabase.com |
| **Railway** | Redis + Worker (선택) | https://railway.app |
| **Upstash** | Redis 대안 | https://upstash.com |

---

## 2. Environment Setup

### 2.1 Supabase 프로젝트 생성

1. Supabase Dashboard에서 새 프로젝트 생성
2. **⚠️ 중요: Postgres 15 선택** (17에서는 TimescaleDB 미지원)
3. 프로젝트 생성 후 Settings > Database에서 Connection String 복사

### 2.2 TimescaleDB 활성화

Supabase SQL Editor에서 실행:

```sql
-- TimescaleDB 확장 활성화
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 확인
SELECT extname, extversion FROM pg_extension WHERE extname = 'timescaledb';
```

### 2.3 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

```env
# .env.local

# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase API (optional, for REST API)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Redis (Railway or Upstash)
REDIS_URL="redis://default:[PASSWORD]@[HOST]:[PORT]"

# Ingestion API Key (자체 생성)
INGESTION_API_KEY="your-secure-random-key"

# Existing env vars...
KRA_API_KEY="..."
KSPO_API_KEY="..."
```

---

## 3. Database Setup

### 3.1 의존성 설치

```bash
# Drizzle ORM 및 관련 패키지
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

### 3.2 Drizzle 설정

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 3.3 스키마 생성

```bash
# 스키마 파일 생성 (data-model.md 참조)
mkdir -p src/lib/db/schema

# 마이그레이션 생성
pnpm drizzle-kit generate:pg

# 마이그레이션 실행
pnpm drizzle-kit push:pg
```

### 3.4 TimescaleDB Hypertable 설정

```bash
# Supabase SQL Editor 또는 psql에서 실행
psql $DATABASE_URL -f db/migrations/002_timescale_hypertable.sql
```

### 3.5 초기 데이터 시딩

```bash
psql $DATABASE_URL -f db/seeds/tracks.sql
```

---

## 4. Redis Setup (Optional for MVP)

### Railway Redis

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인 및 프로젝트 연결
railway login
railway link

# Redis 서비스 추가
railway add --service redis

# 환경 변수 확인
railway variables
```

### Upstash Redis (대안)

1. https://upstash.com 에서 Redis 데이터베이스 생성
2. REST API URL과 Token 복사
3. BullMQ Fixed Price 플랜 선택 권장

---

## 5. Development Workflow

### 5.1 로컬 개발 서버

```bash
# 개발 서버 시작
pnpm dev

# 별도 터미널에서 타입 체크 워치
pnpm tsc --watch --noEmit
```

### 5.2 DB 변경 시

```bash
# 스키마 변경 후
pnpm drizzle-kit generate:pg  # 마이그레이션 생성
pnpm drizzle-kit push:pg       # DB에 적용

# 또는 studio로 확인
pnpm drizzle-kit studio
```

### 5.3 테스트

```bash
# Unit 테스트
pnpm test

# 특정 파일 테스트
pnpm test src/lib/db/__tests__/schema.test.ts

# Integration 테스트 (DB 연결 필요)
pnpm test:integration
```

---

## 6. First Ingestion Test

### 6.1 수동 트리거 테스트

```bash
# 일정 수집 테스트
curl -X POST http://localhost:3000/api/ingestion/trigger/schedules \
  -H "Content-Type: application/json" \
  -H "X-Ingestion-Key: $INGESTION_API_KEY" \
  -d '{"date": "2024-12-10", "raceTypes": ["horse"]}'
```

### 6.2 DB 확인

```bash
# psql 또는 Supabase Dashboard에서
psql $DATABASE_URL -c "SELECT COUNT(*) FROM races WHERE race_date = '2024-12-10';"
```

### 6.3 Odds 수집 테스트

```bash
# 특정 경주 odds 수집
curl -X POST http://localhost:3000/api/ingestion/trigger/odds \
  -H "Content-Type: application/json" \
  -H "X-Ingestion-Key: $INGESTION_API_KEY" \
  -d '{"raceIds": ["horse-seoul-1-20241210"]}'

# 스냅샷 확인
psql $DATABASE_URL -c "SELECT * FROM odds_snapshots ORDER BY time DESC LIMIT 10;"
```

---

## 7. Vercel Cron Setup

### 7.1 vercel.json 설정

```json
{
  "crons": [
    {
      "path": "/api/ingestion/cron/schedules",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/ingestion/cron/odds",
      "schedule": "* * * * *"
    }
  ]
}
```

### 7.2 Cron Endpoint 구현

```typescript
// src/app/api/ingestion/cron/schedules/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 일정 수집 로직
  // ...

  return NextResponse.json({ success: true });
}
```

---

## 8. Troubleshooting

### TimescaleDB 확장 오류

```sql
-- 확장 확인
SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';

-- Supabase에서 활성화 안 되면 PG 버전 확인
SELECT version();
-- PG 15여야 함. PG 17이면 새 프로젝트 생성 필요
```

### 연결 오류

```bash
# 연결 테스트
psql $DATABASE_URL -c "SELECT 1;"

# SSL 문제 시
DATABASE_URL="...?sslmode=require"
```

### Bull/Redis 연결 오류

```typescript
// Redis 연결 테스트
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
await redis.ping(); // 'PONG' 응답 확인
```

---

## 9. Verification Steps

Phase 1 구현 확인:

### 9.1 Schema Verification

```bash
# 스키마 파일 확인
ls -la src/lib/db/schema/

# 예상 출력:
# tracks.ts, races.ts, entries.ts
# oddsSnapshots.ts, results.ts, ingestionFailures.ts
# index.ts
```

### 9.2 API Endpoints Verification

```bash
# 상태 확인 API
curl http://localhost:3000/api/ingestion/status \
  -H "X-Ingestion-Key: $INGESTION_API_KEY"

# 실패 목록 확인
curl http://localhost:3000/api/ingestion/failures \
  -H "X-Ingestion-Key: $INGESTION_API_KEY"
```

### 9.3 Unit Tests

```bash
# 전체 테스트 실행
npm run test

# Ingestion 테스트만
npx jest tests/unit/ingestion/
```

---

## 10. Implementation Completed

Phase 1 구현 완료 항목:

- [X] 전체 마이그레이션 스크립트 생성
- [X] Ingestion Poller 함수 구현 (schedules, entries, results, odds)
- [X] Smart Scheduler (variable interval) 구현
- [X] Failure Recovery 시스템 구현
- [X] Status/Monitoring API 구현
- [X] 단위 테스트 작성

**구현된 API Endpoints**:

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/ingestion/trigger/schedules | 일정 수집 트리거 |
| POST | /api/ingestion/trigger/entries | 출주표 수집 트리거 |
| POST | /api/ingestion/trigger/results | 결과 수집 트리거 |
| POST | /api/ingestion/trigger/odds | 배당률 수집 트리거 |
| GET | /api/ingestion/cron/schedules | 일정 Cron (매일 06:00) |
| GET | /api/ingestion/cron/odds | 배당률 Cron (매분) |
| GET | /api/ingestion/failures | 실패 목록 조회 |
| POST | /api/ingestion/failures/:id/retry | 실패 재시도 |
| GET | /api/ingestion/status | 수집 현황 모니터링 |

---

**Quickstart Complete**: Data Platform Phase 1 구현 완료
