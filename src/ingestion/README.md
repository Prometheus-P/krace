# Ingestion Module

이 모듈은 KRA/KSPO API에서 경마/경륜/경정 데이터를 수집하여 PostgreSQL + TimescaleDB에 저장합니다.

## 구조

```
src/ingestion/
├── clients/           # 외부 API 클라이언트
│   ├── kraClient.ts   # KRA (경마) API
│   └── kspoClient.ts  # KSPO (경륜/경정) API
├── jobs/              # 수집 작업
│   ├── schedulePoller.ts    # 경주 일정 수집
│   ├── entryPoller.ts       # 출주표 수집
│   ├── resultPoller.ts      # 경주 결과 수집
│   ├── oddsPoller.ts        # 배당률 수집
│   └── failureRecovery.ts   # 실패 복구 작업
├── mappers/           # API 응답 → DB 스키마 변환
│   ├── scheduleMapper.ts
│   ├── entryMapper.ts
│   ├── resultMapper.ts
│   └── oddsMapper.ts
├── services/          # 비즈니스 로직 서비스
│   ├── statusService.ts     # 상태 모니터링
│   └── slackNotifier.ts     # Slack 알림
└── utils/             # 유틸리티
    ├── retry.ts       # Exponential backoff 재시도
    ├── failureLogger.ts     # 실패 로깅
    ├── smartScheduler.ts    # 가변 수집 간격
    └── metrics.ts     # 메트릭 추적
```

## 수집 흐름

### 1. 일정 수집 (Daily)
```
Cron (06:00 UTC) → schedulePoller → KRA/KSPO API → races 테이블
```

### 2. 출주표/결과 수집 (On-demand)
```
Trigger API → entryPoller/resultPoller → entries/results 테이블
```

### 3. 배당률 수집 (Variable interval)
```
Cron (매분) → smartScheduler → oddsPoller → odds_snapshots 테이블

수집 간격:
- T-60 ~ T-15: 5분마다
- T-15 ~ T-5: 1분마다
- T-5 ~ T-0: 30초마다 (1분 cron 내 2회 수집)
```

## API Endpoints

### 트리거 API (POST)

수동으로 수집을 시작할 때 사용합니다.

```bash
# 일정 수집
curl -X POST /api/ingestion/trigger/schedules \
  -H "X-Ingestion-Key: $KEY" \
  -d '{"date": "2024-12-10"}'

# 출주표 수집
curl -X POST /api/ingestion/trigger/entries \
  -H "X-Ingestion-Key: $KEY" \
  -d '{"raceIds": ["horse-seoul-1-20241210"]}'

# 결과 수집
curl -X POST /api/ingestion/trigger/results \
  -H "X-Ingestion-Key: $KEY" \
  -d '{"raceIds": ["horse-seoul-1-20241210"]}'

# 배당률 수집
curl -X POST /api/ingestion/trigger/odds \
  -H "X-Ingestion-Key: $KEY" \
  -d '{"raceIds": ["horse-seoul-1-20241210"]}'
```

### Cron 엔드포인트 (GET)

Vercel Cron에서 자동 호출됩니다.

- `/api/ingestion/cron/schedules` - 매일 06:00 UTC
- `/api/ingestion/cron/odds` - 매분

### 모니터링 API (GET)

```bash
# 수집 현황
curl /api/ingestion/status -H "X-Ingestion-Key: $KEY"

# 상세 대시보드
curl "/api/ingestion/status?full=true" -H "X-Ingestion-Key: $KEY"

# 실패 목록
curl /api/ingestion/failures -H "X-Ingestion-Key: $KEY"
```

### 실패 복구 (POST)

```bash
# 특정 실패 재시도
curl -X POST /api/ingestion/failures/{id}/retry \
  -H "X-Ingestion-Key: $KEY"
```

## 환경 변수

```env
# 필수
DATABASE_URL=postgresql://...
INGESTION_API_KEY=your-secure-key
KRA_API_KEY=kra-api-key
KSPO_API_KEY=kspo-api-key

# 선택
CRON_SECRET=vercel-cron-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
REDIS_URL=redis://... (Bull 큐 사용 시)
```

## 재시도 로직

모든 API 호출은 exponential backoff로 재시도됩니다:

- 최대 5회 시도
- 지연: 1초 → 2초 → 4초 → 8초 → 16초
- 5xx 에러와 429 Rate Limit만 재시도
- 실패 시 `ingestion_failures` 테이블에 기록

## Slack 알림

실패 발생 시 Slack으로 알림을 보냅니다:

- 🚨 수집 실패 (3회 이상 재시도)
- ❌ 최대 재시도 초과
- ✅ 복구 성공

## 메트릭

`src/ingestion/utils/metrics.ts`에서 수집 메트릭을 추적합니다:

- `ingestion.schedules.duration` - 일정 수집 소요 시간
- `ingestion.odds.count` - 배당률 스냅샷 수
- `api.errors.count` - API 오류 횟수

## 테스트

```bash
# 단위 테스트
npx jest tests/unit/ingestion/

# 통합 테스트 (DB 필요)
npx jest tests/integration/db/
```

## 참고

- [Data Model](../../specs/004-race-results-history/data-model.md)
- [API Contract](../../specs/004-race-results-history/contracts/ingestion-api.yaml)
- [Quickstart](../../specs/004-race-results-history/quickstart.md)
