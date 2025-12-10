# Data Model: Data Platform Phase 1

**Date**: 2025-12-10
**Plan Reference**: [plan.md](./plan.md)
**Research Reference**: [research.md](./research.md)

이 문서는 Data Platform Phase 1의 데이터베이스 스키마를 정의합니다.

---

## 1. Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    tracks     │       │    races      │       │   entries     │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │◄──────│ track_id (FK) │       │ id (PK)       │
│ code          │       │ id (PK)       │◄──────│ race_id (FK)  │
│ name          │       │ race_type     │       │ entry_no      │
│ race_type     │       │ race_no       │       │ name          │
│ location      │       │ race_date     │       │ jockey_id     │
└───────────────┘       │ start_time    │       │ horse_id      │
                        │ distance      │       │ ...           │
                        │ grade         │       └───────┬───────┘
                        │ status        │               │
                        └───────┬───────┘               │
                                │                       │
                ┌───────────────┼───────────────────────┘
                │               │
                ▼               ▼
        ┌───────────────┐   ┌───────────────────────┐
        │   results     │   │   odds_snapshots      │
        ├───────────────┤   │   (TimescaleDB)       │
        │ id (PK)       │   ├───────────────────────┤
        │ race_id (FK)  │   │ time (PK)             │
        │ entry_no      │   │ race_id (PK)          │
        │ finish_pos    │   │ entry_no (PK)         │
        │ time          │   │ odds_win              │
        │ dividend_win  │   │ odds_place            │
        └───────────────┘   │ pool_total            │
                            │ popularity_rank       │
                            └───────────────────────┘

        ┌───────────────────────┐
        │  ingestion_failures   │
        ├───────────────────────┤
        │ id (PK)               │
        │ source                │
        │ endpoint              │
        │ error_message         │
        │ retry_count           │
        │ resolved              │
        │ created_at            │
        └───────────────────────┘
```

---

## 2. Table Schemas (Drizzle ORM)

### 2.1 tracks (경기장)

```typescript
// src/lib/db/schema/tracks.ts
import { pgTable, serial, varchar, point, timestamp } from 'drizzle-orm/pg-core';

export const tracks = pgTable('tracks', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  raceType: varchar('race_type', { length: 10 }).notNull(), // 'horse' | 'cycle' | 'boat'
  location: point('location'), // 위경도 (optional)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
```

**Seed Data**:
```sql
INSERT INTO tracks (code, name, race_type) VALUES
  ('seoul', '서울', 'horse'),
  ('busan', '부산경남', 'horse'),
  ('jeju', '제주', 'horse'),
  ('gwangmyeong', '광명', 'cycle'),
  ('changwon', '창원', 'cycle'),
  ('busan_cycle', '부산', 'cycle'),
  ('misari', '미사리', 'boat');
```

---

### 2.2 races (경주)

```typescript
// src/lib/db/schema/races.ts
import { pgTable, varchar, integer, date, time, timestamp, jsonb, bigint } from 'drizzle-orm/pg-core';
import { tracks } from './tracks';

export const races = pgTable('races', {
  id: varchar('id', { length: 50 }).primaryKey(), // 'horse-1-3-20241210'
  raceType: varchar('race_type', { length: 10 }).notNull(),
  trackId: integer('track_id').references(() => tracks.id),
  raceNo: integer('race_no').notNull(),
  raceDate: date('race_date').notNull(),
  startTime: time('start_time'),
  distance: integer('distance'), // 미터
  grade: varchar('grade', { length: 20 }),
  status: varchar('status', { length: 20 }).default('scheduled').notNull(),
  // 'scheduled' | 'upcoming' | 'live' | 'finished' | 'canceled' | 'postponed'
  purse: bigint('purse', { mode: 'number' }), // 상금 (원)
  conditions: jsonb('conditions'), // 출전 조건 JSON
  weather: varchar('weather', { length: 20 }),
  trackCondition: varchar('track_condition', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Race = typeof races.$inferSelect;
export type NewRace = typeof races.$inferInsert;
```

**Indexes**:
```sql
CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_races_type_date ON races(race_type, race_date);
CREATE INDEX idx_races_status ON races(status);
```

---

### 2.3 entries (출전 정보)

```typescript
// src/lib/db/schema/entries.ts
import { pgTable, serial, varchar, integer, decimal, timestamp, unique } from 'drizzle-orm/pg-core';
import { races } from './races';

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  raceId: varchar('race_id', { length: 50 }).references(() => races.id).notNull(),
  entryNo: integer('entry_no').notNull(), // 마번/배번
  name: varchar('name', { length: 100 }).notNull(), // 마명/선수명
  entityType: varchar('entity_type', { length: 10 }).notNull(), // 'horse' | 'cyclist' | 'boat_racer'

  // 경마 전용
  horseId: varchar('horse_id', { length: 20 }),
  jockeyId: varchar('jockey_id', { length: 20 }),
  jockeyName: varchar('jockey_name', { length: 50 }),
  trainerId: varchar('trainer_id', { length: 20 }),
  trainerName: varchar('trainer_name', { length: 50 }),
  ownerName: varchar('owner_name', { length: 50 }),
  birthYear: integer('birth_year'),
  sex: varchar('sex', { length: 10 }), // 수, 암, 거세
  weight: decimal('weight', { precision: 5, scale: 1 }), // 마체중
  burdenWeight: decimal('burden_weight', { precision: 5, scale: 1 }), // 부담중량
  rating: integer('rating'), // 레이팅

  // 경륜/경정 전용
  racerId: varchar('racer_id', { length: 20 }),
  racerGrade: varchar('racer_grade', { length: 10 }),
  gearRatio: decimal('gear_ratio', { precision: 3, scale: 2 }), // 기어비 (경륜)
  motorNo: integer('motor_no'), // 모터번호 (경정)
  boatNo: integer('boat_no'), // 보트번호 (경정)

  // 공통
  recentRecord: varchar('recent_record', { length: 100 }),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'scratched'

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRaceEntry: unique().on(table.raceId, table.entryNo),
}));

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
```

**Indexes**:
```sql
CREATE INDEX idx_entries_race ON entries(race_id);
CREATE INDEX idx_entries_jockey ON entries(jockey_id);
CREATE INDEX idx_entries_horse ON entries(horse_id);
CREATE INDEX idx_entries_racer ON entries(racer_id);
```

---

### 2.4 odds_snapshots (배당률 시계열 - TimescaleDB)

```typescript
// src/lib/db/schema/oddsSnapshots.ts
import { pgTable, varchar, integer, decimal, bigint, timestamp } from 'drizzle-orm/pg-core';

export const oddsSnapshots = pgTable('odds_snapshots', {
  time: timestamp('time', { withTimezone: true }).notNull(),
  raceId: varchar('race_id', { length: 50 }).notNull(),
  entryNo: integer('entry_no').notNull(),

  oddsWin: decimal('odds_win', { precision: 8, scale: 2 }), // 단승 배당
  oddsPlace: decimal('odds_place', { precision: 8, scale: 2 }), // 복승 배당

  poolTotal: bigint('pool_total', { mode: 'number' }), // 전체 베팅 풀
  poolWin: bigint('pool_win', { mode: 'number' }), // 해당 출전번호 단승 풀
  poolPlace: bigint('pool_place', { mode: 'number' }), // 해당 출전번호 복승 풀

  popularityRank: integer('popularity_rank'), // 인기 순위
});

export type OddsSnapshot = typeof oddsSnapshots.$inferSelect;
export type NewOddsSnapshot = typeof oddsSnapshots.$inferInsert;
```

**TimescaleDB Setup** (Raw SQL):
```sql
-- 하이퍼테이블 변환
SELECT create_hypertable('odds_snapshots', 'time');

-- 복합 Primary Key
ALTER TABLE odds_snapshots ADD PRIMARY KEY (time, race_id, entry_no);

-- 압축 정책 (30일 이후 압축)
SELECT add_compression_policy('odds_snapshots', INTERVAL '30 days');

-- 연속 집계 (5분 단위 요약)
CREATE MATERIALIZED VIEW odds_5min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    race_id,
    entry_no,
    first(odds_win, time) AS odds_open,
    last(odds_win, time) AS odds_close,
    max(odds_win) AS odds_high,
    min(odds_win) AS odds_low,
    avg(odds_win)::decimal(8,2) AS odds_avg,
    last(popularity_rank, time) AS final_rank
FROM odds_snapshots
GROUP BY bucket, race_id, entry_no;

-- 집계 자동 갱신 정책
SELECT add_continuous_aggregate_policy('odds_5min',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '5 minutes');
```

---

### 2.5 results (경주 결과)

```typescript
// src/lib/db/schema/results.ts
import { pgTable, serial, varchar, integer, decimal, bigint, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { races } from './races';

export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  raceId: varchar('race_id', { length: 50 }).references(() => races.id).notNull(),
  entryNo: integer('entry_no').notNull(),

  finishPosition: integer('finish_position').notNull(), // 착순
  time: decimal('time', { precision: 10, scale: 3 }), // 주파시간 (초)
  margin: varchar('margin', { length: 20 }), // 착차 ('목', '1/2마신' 등)

  // 구간 기록 (경마)
  splitTimes: jsonb('split_times'), // {s1f: 13.2, g3f: 36.5, ...}

  // 배당금
  dividendWin: bigint('dividend_win', { mode: 'number' }), // 단승 배당금
  dividendPlace: bigint('dividend_place', { mode: 'number' }), // 복승 배당금

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRaceResult: unique().on(table.raceId, table.entryNo),
}));

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
```

**Indexes**:
```sql
CREATE INDEX idx_results_race ON results(race_id);
CREATE INDEX idx_results_position ON results(finish_position);
```

---

### 2.6 ingestion_failures (수집 실패 로그)

```typescript
// src/lib/db/schema/ingestionFailures.ts
import { pgTable, serial, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const ingestionFailures = pgTable('ingestion_failures', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 20 }).notNull(), // 'kra' | 'kspo'
  endpoint: varchar('endpoint', { length: 100 }).notNull(),
  errorMessage: text('error_message').notNull(),
  errorCode: varchar('error_code', { length: 50 }),
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(5).notNull(),
  resolved: boolean('resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  metadata: text('metadata'), // JSON string for additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type IngestionFailure = typeof ingestionFailures.$inferSelect;
export type NewIngestionFailure = typeof ingestionFailures.$inferInsert;
```

---

## 3. Migration Files

### 3.1 001_init_schema.sql

```sql
-- Migration: 001_init_schema
-- Date: 2025-12-10
-- Description: Initialize core tables for Data Platform Phase 1

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    race_type VARCHAR(10) NOT NULL CHECK (race_type IN ('horse', 'cycle', 'boat')),
    location POINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- races table
CREATE TABLE IF NOT EXISTS races (
    id VARCHAR(50) PRIMARY KEY,
    race_type VARCHAR(10) NOT NULL,
    track_id INTEGER REFERENCES tracks(id),
    race_no INTEGER NOT NULL,
    race_date DATE NOT NULL,
    start_time TIME,
    distance INTEGER,
    grade VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled' NOT NULL,
    purse BIGINT,
    conditions JSONB,
    weather VARCHAR(20),
    track_condition VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_races_type_date ON races(race_type, race_date);
CREATE INDEX idx_races_status ON races(status);

-- entries table
CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    race_id VARCHAR(50) REFERENCES races(id) NOT NULL,
    entry_no INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(10) NOT NULL,
    
    -- Horse racing specific
    horse_id VARCHAR(20),
    jockey_id VARCHAR(20),
    jockey_name VARCHAR(50),
    trainer_id VARCHAR(20),
    trainer_name VARCHAR(50),
    owner_name VARCHAR(50),
    birth_year INTEGER,
    sex VARCHAR(10),
    weight DECIMAL(5,1),
    burden_weight DECIMAL(5,1),
    rating INTEGER,
    
    -- Cycle/Boat racing specific
    racer_id VARCHAR(20),
    racer_grade VARCHAR(10),
    gear_ratio DECIMAL(3,2),
    motor_no INTEGER,
    boat_no INTEGER,
    
    -- Common
    recent_record VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_entries_race ON entries(race_id);
CREATE INDEX idx_entries_jockey ON entries(jockey_id);
CREATE INDEX idx_entries_horse ON entries(horse_id);
CREATE INDEX idx_entries_racer ON entries(racer_id);

-- results table
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    race_id VARCHAR(50) REFERENCES races(id) NOT NULL,
    entry_no INTEGER NOT NULL,
    finish_position INTEGER NOT NULL,
    time DECIMAL(10,3),
    margin VARCHAR(20),
    split_times JSONB,
    dividend_win BIGINT,
    dividend_place BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_results_race ON results(race_id);
CREATE INDEX idx_results_position ON results(finish_position);

-- ingestion_failures table
CREATE TABLE IF NOT EXISTS ingestion_failures (
    id SERIAL PRIMARY KEY,
    source VARCHAR(20) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0 NOT NULL,
    max_retries INTEGER DEFAULT 5 NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 3.2 002_timescale_hypertable.sql

```sql
-- Migration: 002_timescale_hypertable
-- Date: 2025-12-10
-- Description: Setup TimescaleDB for odds_snapshots

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create odds_snapshots table
CREATE TABLE IF NOT EXISTS odds_snapshots (
    time TIMESTAMPTZ NOT NULL,
    race_id VARCHAR(50) NOT NULL,
    entry_no INTEGER NOT NULL,
    odds_win DECIMAL(8,2),
    odds_place DECIMAL(8,2),
    pool_total BIGINT,
    pool_win BIGINT,
    pool_place BIGINT,
    popularity_rank INTEGER,
    
    PRIMARY KEY (time, race_id, entry_no)
);

-- Convert to hypertable
SELECT create_hypertable('odds_snapshots', 'time', if_not_exists => TRUE);

-- Add compression policy (compress data older than 30 days)
SELECT add_compression_policy('odds_snapshots', INTERVAL '30 days', if_not_exists => TRUE);

-- Create continuous aggregate for 5-minute summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS odds_5min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    race_id,
    entry_no,
    first(odds_win, time) AS odds_open,
    last(odds_win, time) AS odds_close,
    max(odds_win) AS odds_high,
    min(odds_win) AS odds_low,
    avg(odds_win)::decimal(8,2) AS odds_avg,
    last(popularity_rank, time) AS final_rank,
    count(*) AS snapshot_count
FROM odds_snapshots
GROUP BY bucket, race_id, entry_no;

-- Add refresh policy for continuous aggregate
SELECT add_continuous_aggregate_policy('odds_5min',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '5 minutes',
    if_not_exists => TRUE);
```

### 3.3 003_seed_tracks.sql

```sql
-- Migration: 003_seed_tracks
-- Date: 2025-12-10
-- Description: Seed tracks data

INSERT INTO tracks (code, name, race_type) VALUES
    ('seoul', '서울', 'horse'),
    ('busan', '부산경남', 'horse'),
    ('jeju', '제주', 'horse'),
    ('gwangmyeong', '광명', 'cycle'),
    ('changwon', '창원', 'cycle'),
    ('busan_cycle', '부산', 'cycle'),
    ('misari', '미사리', 'boat')
ON CONFLICT (code) DO NOTHING;
```

---

## 4. Type Definitions

```typescript
// src/types/db.ts
import type { Track, Race, Entry, OddsSnapshot, Result, IngestionFailure } from '@/lib/db/schema';

// Re-export schema types
export type { Track, Race, Entry, OddsSnapshot, Result, IngestionFailure };

// Enum types for type safety
export type RaceType = 'horse' | 'cycle' | 'boat';
export type RaceStatus = 'scheduled' | 'upcoming' | 'live' | 'finished' | 'canceled' | 'postponed';
export type EntryStatus = 'active' | 'scratched';
export type EntityType = 'horse' | 'cyclist' | 'boat_racer';
export type IngestionSource = 'kra' | 'kspo';

// Query result types
export interface RaceWithEntries extends Race {
  entries: Entry[];
}

export interface RaceWithResults extends Race {
  results: Result[];
}

export interface OddsSummary {
  raceId: string;
  entryNo: number;
  oddsOpen: number;
  oddsClose: number;
  oddsHigh: number;
  oddsLow: number;
  oddsChange: number; // (close - open) / open * 100
  snapshotCount: number;
}
```

---

## 5. Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Track | code | Unique, lowercase, alphanumeric + underscore |
| Track | race_type | Must be 'horse', 'cycle', or 'boat' |
| Race | id | Format: `{type}-{trackCode}-{raceNo}-{YYYYMMDD}` |
| Race | race_date | Must be valid date, not more than 1 year in future |
| Race | status | Must be valid RaceStatus enum value |
| Entry | entry_no | Positive integer, unique per race |
| Entry | entity_type | Must match race's race_type category |
| OddsSnapshot | odds_win | Positive decimal, typically 1.0 - 999.0 |
| OddsSnapshot | popularity_rank | Positive integer, 1 = most popular |
| Result | finish_position | Positive integer, 1 = winner |

---

**Data Model Complete**: Phase 1 스키마 설계 완료
