# KRace 공공데이터 API 통합 문서

본 문서는 KRace 서비스에서 사용하는 공공데이터 API의 통합 명세서입니다.

## 목차

- [개요](#개요)
- [인증 및 공통 파라미터](#인증-및-공통-파라미터)
- [경마 (Horse Racing) API](#경마-horse-racing-api)
- [경륜 (Cycle Racing) API](#경륜-cycle-racing-api)
- [경정 (Boat Racing) API](#경정-boat-racing-api)
- [내부 타입 매핑](#내부-타입-매핑)

---

## 개요

| 분류      | 제공기관                                | Base URL                          | API 키 환경변수 |
| --------- | --------------------------------------- | --------------------------------- | --------------- |
| 경마      | 한국마사회 (KRA)                        | `https://apis.data.go.kr/B551015` | `KRA_API_KEY`   |
| 경륜/경정 | 국민체육진흥공단스포츠토토사업단 (KSPO) | `https://apis.data.go.kr/B551014` | `KSPO_API_KEY`  |

**총 API 함수: 27개**

- 경마: 6개
- 경륜: 10개 (핵심 6개 + 보조 4개)
- 경정: 6개
- 공통: 5개

---

## 인증 및 공통 파라미터

### 인증

모든 API는 공공데이터포털에서 발급받은 인증키(`serviceKey`)가 필요합니다.

### 공통 요청 파라미터

| 파라미터                  | 필수 | 설명                                 |
| ------------------------- | ---- | ------------------------------------ |
| `serviceKey`              | O    | 공공데이터포털 인증키 (URL 인코딩됨) |
| `pageNo`                  | O    | 페이지 번호 (기본값: 1)              |
| `numOfRows`               | O    | 페이지당 결과 수 (기본값: 10)        |
| `resultType` 또는 `_type` | O    | 응답 형식 (`json` 또는 `xml`)        |

### 공통 응답 구조

```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE",
      "pageNo": 1,
      "numOfRows": 10,
      "totalCount": 100
    },
    "body": {
      "items": {
        "item": [
          /* 데이터 배열 */
        ]
      }
    }
  }
}
```

---

## 경마 (Horse Racing) API

### 1. API299 - 경주결과종합

| 항목           | 내용                                                          |
| -------------- | ------------------------------------------------------------- |
| **Fetch 함수** | `fetchHorseRaceSchedules(rcDate)`                             |
| **엔드포인트** | `/API299/Race_Result_total`                                   |
| **용도**       | 경마 경주 일정/결과종합 (출전마, 기수, 순위, 기록, 배당률 등) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `meet` | X | 경마장 번호 (1=서울, 2=부산, 3=제주) |
| `rc_year` | X | 경주년도 |
| `rc_month` | X | 경주월 (YYYYMM) |
| `rc_date` | X | 경주일자 (YYYYMMDD) |
| `rc_no` | X | 경주번호 |

**응답 타입**

```typescript
interface KRA299ResultItem {
  meet: string; // 경마장명
  rcDate: number; // 경주일자
  rcNo: number; // 경주번호
  chulNo: number; // 출전번호
  ord: number; // 순위
  hrName: string; // 마명
  hrNo: string; // 마번
  jkName: string; // 기수명
  rcTime: number; // 기록시간
  age: number; // 마령
  rank: string; // 등급
  schStTime: string; // 출발예정시간
}
```

---

### 2. API187 - 경마경주정보

| 항목           | 내용                                          |
| -------------- | --------------------------------------------- |
| **Fetch 함수** | `fetchHorseRaceInfo(rcDate)`                  |
| **엔드포인트** | `/API187/HorseRaceInfo`                       |
| **용도**       | 경마 월별 경주 통계 (경마장별, 등급별 경주수) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `ym_fr` | X | 조회 시작 월 (YYYYMM) |
| `ym_to` | X | 조회 종료 월 (YYYYMM) |

**응답 타입**

```typescript
interface KRAHorseRaceInfoItem {
  meet: string; // 경마장명
  rank: string; // 등급
  rcKrFlag: string; // 국산/외산 구분 (1=국산)
  rcKrFlagText: string; // 국산/외산 텍스트
  rccnt: number; // 경주수
  yyyymm: string; // 년월
}
```

---

### 3. API156 - 경주결과상세

| 항목           | 내용                                                           |
| -------------- | -------------------------------------------------------------- |
| **Fetch 함수** | `fetchHorseRaceResultDetail(rcDate)`                           |
| **엔드포인트** | `/API156/raceRsutDtl`                                          |
| **용도**       | 경주별 상세 결과 (순위, 기록, 배당금, 마진, 조교사, 기수명 등) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `rccrs_cd` | X | 경마장 코드 (1=서울, 2=부산, 3=제주) |
| `race_dt` | X | 경주일자 (YYYYMMDD) |
| `race_no` | X | 경주번호 |

**응답 타입**

```typescript
interface KRAHorseResultDetailItem {
  schdRccrsNm: string; // 경마장명
  schdRaceDt: string; // 경주일자
  schdRaceNo: string; // 경주번호
  schdRaceNm: string; // 경주명
  cndRaceDs: string; // 거리
  cndRaceClas: string; // 등급
  pthrHrnm: string; // 마명
  hrmJckyNm: string; // 기수명
  hrmTrarNm: string; // 조교사명
  rsutRk: string; // 순위
  rsutRaceRcd: string; // 기록
  rsutMargin: string; // 착차
  rsutWinPrice: string; // 단승 배당금
}
```

---

### 4. API23_1 - 출전등록마정보

| 항목           | 내용                                  |
| -------------- | ------------------------------------- |
| **Fetch 함수** | `fetchHorseEntryRegistration(rcDate)` |
| **엔드포인트** | `/API23_1/entryRaceHorse_1`           |
| **용도**       | 출전등록마 정보 조회                  |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `hr_name` | X | 마 이름 |
| `hr_no` | X | 마 고유 번호 |
| `meet` | X | 경마장 번호 |
| `pg_date` | X | 일자 (YYYYMMDD) |
| `pg_month` | X | 월 (YYYYMM) |

**응답 타입**

```typescript
interface KRAHorseEntryItem {
  meet: string; // 경마장
  pgDate: string; // 일자
  pgNo: string; // 경주번호
  rcName: string; // 경주명
  rank: string; // 등급
  rcDist: string; // 거리
  hrName: string; // 마명
  hrNo: string; // 마번
  age: string; // 마령
  sex: string; // 성별
  trName: string; // 조교사명
  owName: string; // 마주명
}
```

---

### 5. API26_2 - 출전표상세

| 항목           | 내용                                                 |
| -------------- | ---------------------------------------------------- |
| **Fetch 함수** | `fetchHorseEntryDetail(rcDate)`                      |
| **엔드포인트** | `/API26_2/entrySheet_2`                              |
| **용도**       | 출전표 상세 정보 (마정보, 기수, 조교사, 부담중량 등) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `meet` | X | 경마장 번호 |
| `rc_date` | X | 경주일자 (YYYYMMDD) |
| `rc_month` | X | 경주월 (YYYYMM) |

**응답 타입**

```typescript
interface KRAHorseEntryDetailItem {
  meet: string; // 경마장
  rcDate: string; // 경주일자
  rcNo: string; // 경주번호
  chulNo: string; // 출전번호
  hrName: string; // 마명
  hrNo: string; // 마번
  jkName: string; // 기수명
  trName: string; // 조교사명
  wgBudam: string; // 부담중량
  rating: string; // 레이팅
  rcDist: string; // 거리
  stTime: string; // 출발시간
}
```

---

### 6. API301 - 확정배당률

| 항목           | 내용                                          |
| -------------- | --------------------------------------------- |
| **Fetch 함수** | `fetchHorseDividendSummary(rcDate)`           |
| **엔드포인트** | `/API301/Dividend_rate_total`                 |
| **용도**       | 경주별 확정 배당률 (단승, 복승, 쌍승, 삼복승) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `meet` | X | 경마장 번호 |
| `pool` | X | 배팅 코드 (WIN=단승, PLC=복승, QPL=쌍승, TLA=삼복승) |
| `rc_year` | X | 경주년도 |
| `rc_month` | X | 경주월 |
| `rc_date` | X | 경주일자 |
| `rc_no` | X | 경주번호 |

---

## 경륜 (Cycle Racing) API

### 1. SRVC_OD_API_CRA_RACE_ORGAN - 출주표

| 항목           | 내용                                                    |
| -------------- | ------------------------------------------------------- |
| **Fetch 함수** | `fetchCycleRaceSchedules(rcDate)`                       |
| **엔드포인트** | `/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I` |
| **용도**       | 경륜 출주표 (출전 선수, 최근 성적, 기어비 등)           |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `meet_nm` | X | 경기장명 (광명, 창원, 부산) |
| `stnd_yr` | X | 기준년도 |
| `week_tcnt` | X | 주차 |

**응답 타입**

```typescript
interface KSPOCycleRaceOrganItem {
  meet_nm: string; // 경기장명
  stnd_yr: string; // 기준 년도
  week_tcnt: string; // 연간주차
  day_tcnt: string; // 일차
  race_no: string; // 경주번호
  back_no: string; // 등번호
  racer_nm: string; // 선수명
  racer_age: string; // 선수나이
  win_rate: string; // 승률
  gear_rate: string; // 기어비율
  rec_200m_scr: string; // 200m 기록
}
```

---

### 2. SRVC_TODZ_CRA_RACE_RESULT - 경주결과

| 항목           | 내용                                        |
| -------------- | ------------------------------------------- |
| **Fetch 함수** | `fetchCycleRaceResults(rcDate)`             |
| **엔드포인트** | `/SRVC_TODZ_CRA_RACE_RESULT`                |
| **용도**       | 경륜 경주 확정 결과 (1~3위, 배당금, 환급금) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | O | 기준년도 |
| `meet_nm` | O | 경기장명 |
| `week_tcnt` | O | 주차 |
| `day_tcnt` | O | 일차 |
| `race_no` | O | 경주번호 |

**응답 타입**

```typescript
interface KSPOCycleRaceResultItem {
  stnd_yr: string; // 기준년도
  race_ymd: string; // 경주일자
  meet_nm: string; // 경기장명
  race_no: string; // 경주번호
  rank1: string; // 1위 선수번호
  rank2: string; // 2위 선수번호
  rank3: string; // 3위 선수번호
  pool1_val: string; // 단승 배당금
  pool2_val: string; // 복승 배당금
  pool4_val: string; // 쌍승 배당금
  pool5_val: string; // 삼복승 배당금
}
```

---

### 3. SRVC_CRA_RACE_RANK - 경주결과순위

| 항목           | 내용                             |
| -------------- | -------------------------------- |
| **Fetch 함수** | `fetchCycleRaceRankings(rcDate)` |
| **엔드포인트** | `/SRVC_CRA_RACE_RANK`            |
| **용도**       | 경륜 경주별 1~7위 착순 정보      |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_year` | X | 기준 년도 |
| `tms` | X | 주차 |
| `day_ord` | X | 일차 |
| `race_no` | X | 경주번호 |
| `race_day` | X | 경주일자 |
| `racer_no` | X | 선수번호 |
| `racer_nm` | X | 선수명 |

---

### 4. SRVC_CRA_RACER_INFO - 선수정보

| 항목           | 내용                                                |
| -------------- | --------------------------------------------------- |
| **Fetch 함수** | `fetchCycleRacerInfo(rcDate)`                       |
| **엔드포인트** | `/SRVC_CRA_RACER_INFO`                              |
| **용도**       | 경륜 선수 상세 정보 (승률, 연대율, 기어비, 훈련 등) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `racer_nm` | X | 선수명 |
| `period_no` | X | 선수기수 |

**응답 타입**

```typescript
interface KSPOCycleRacerInfoItem {
  racer_nm: string; // 선수명
  racer_grd_cd: string; // 등급
  run_cnt: string; // 출주수
  run_day_tcnt: string; // 출주일수
  rank1_tcnt: string; // 1착 횟수
  win_rate: string; // 승률
  high_rate: string; // 연대율
  high_3_rate: string; // 삼연대율
}
```

---

### 5. SRVC_OD_API_CRA_PAYOFF - 배당률

| 항목           | 내용                         |
| -------------- | ---------------------------- |
| **Fetch 함수** | `fetchCyclePayoffs(rcDate)`  |
| **엔드포인트** | `/SRVC_OD_API_CRA_PAYOFF`    |
| **용도**       | 경륜 경주별 배당률 및 환급금 |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `week_tcnt` | X | 주차 |
| `day_tcnt` | X | 일차 |

---

### 6~10. 보조 API

| Fetch 함수                | 엔드포인트                    | 용도               |
| ------------------------- | ----------------------------- | ------------------ |
| `fetchCycleOperationInfo` | `/SRVC_OD_API_CRA_CYCLE_EXER` | 운영 정보          |
| `fetchCycleExerciseStats` | `/SRVC_OD_API_CRA_CYCLE_EXER` | 훈련정보 통계      |
| `fetchCyclePartUnits`     | `/SRVC_OD_API_CRA_CYCLE_PART` | 자전거 부품정보    |
| `fetchCycleInspectStats`  | `/SRVC_OD_API_CRA_INSPECT`    | 검차 정보          |
| `fetchCycleInOutStats`    | `/SRVC_OD_API_CRA_INOUT`      | 자전거 입출고 정보 |

---

## 경정 (Boat Racing) API

### 1. SRVC_OD_API_VWEB_MBR_RACE_INFO - 출주표

| 항목           | 내용                                                       |
| -------------- | ---------------------------------------------------------- |
| **Fetch 함수** | `fetchBoatRaceSchedules(rcDate)`                           |
| **엔드포인트** | `/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I` |
| **용도**       | 경정 출주표 (출전 선수, 모터/보트 번호, 최근 성적)         |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `day_tcnt` | X | 주차 |
| `week_tcnt` | X | 일차 |
| `race_no` | X | 경주번호 |

**응답 타입**

```typescript
interface KSPOBoatRaceInfoItem {
  meet_nm: string; // 경기장명
  stnd_yr: string; // 기준 년도
  week_tcnt: string; // 연간주차
  day_tcnt: string; // 일차
  race_no: string; // 경주번호
  back_no: string; // 등번호
  racer_nm: string; // 선수명
  racer_age: string; // 선수나이
  wght: string; // 체중
  motor_no: string; // 모터번호
  boat_no: string; // 보트번호
  tms_6_avg_rank_scr: string; // 최근6회차 평균착순
}
```

---

### 2. SRVC_OD_API_MBR_RACE_RESULT - 경주결과

| 항목           | 내용                                        |
| -------------- | ------------------------------------------- |
| **Fetch 함수** | `fetchBoatRaceResults(rcDate)`              |
| **엔드포인트** | `/SRVC_OD_API_MBR_RACE_RESULT`              |
| **용도**       | 경정 경주 확정 결과 (1~3위, 배당금, 환급금) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `day_tcnt` | X | 주차 |
| `week_tcnt` | X | 일차 |
| `race_no` | X | 경주번호 |

**응답 타입**

```typescript
interface KSPOBoatRaceResultItem {
  stnd_yr: string; // 기준년도
  race_no: string; // 경주번호
  rank1: string; // 1위 선수번호
  rank2: string; // 2위 선수번호
  rank3: string; // 3위 선수번호
  pool1_val: string; // 단승 배당금
  pool2_val: string; // 복승 배당금
  pool3_val: string; // 쌍승 배당금
  pool4_val: string; // 삼복승 배당금
}
```

---

### 3. SRVC_MRA_RACE_RANK - 경주결과순위

| 항목           | 내용                            |
| -------------- | ------------------------------- |
| **Fetch 함수** | `fetchBoatRaceRankings(rcDate)` |
| **엔드포인트** | `/SRVC_MRA_RACE_RANK`           |
| **용도**       | 경정 경주별 1~6위 착순 정보     |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_year` | X | 기준 년도 |
| `tms` | X | 주차 |
| `day_ord` | X | 일차 |
| `race_no` | X | 경주번호 |
| `race_day` | X | 경주일자 |
| `racer_no` | X | 선수번호 |
| `racer_nm` | X | 선수명 |

---

### 4. SRVC_VWEB_MBR_RACER_INFO - 선수정보

| 항목           | 내용                                               |
| -------------- | -------------------------------------------------- |
| **Fetch 함수** | `fetchBoatRacerInfo(rcDate)`                       |
| **엔드포인트** | `/SRVC_VWEB_MBR_RACER_INFO`                        |
| **용도**       | 경정 선수 상세 정보 (승률, 연대율, 모터/보트 성적) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `racer_nm` | X | 선수명 |
| `racer_perio_no` | X | 선수기수 |

**응답 타입**

```typescript
interface KSPOBoatRacerInfoItem {
  racerNo: string; // 선수번호
  racerNm: string; // 선수명
  stndYr: string; // 기준 년도
  class: string; // 등급
  starts: number; // 출주 횟수
  firstPlace: number; // 1착 횟수
  avgFinishPoint: number; // 평균 착순
  avgAccidentPoint: number; // 평균 사고점
  avgStartPoint: number; // 평균 스타트
  winRate: number; // 승률
  placeRate: number; // 연대율
  tripleRate: number; // 삼연대율
}
```

---

### 5. SRVC_OD_API_MBR_PAYOFF - 배당률

| 항목           | 내용                         |
| -------------- | ---------------------------- |
| **Fetch 함수** | `fetchBoatPayoffs(rcDate)`   |
| **엔드포인트** | `/SRVC_OD_API_MBR_PAYOFF`    |
| **용도**       | 경정 경주별 배당률 및 환급금 |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | O | 기준년도 |
| `week_tcnt` | O | 주차 |
| `day_tcnt` | O | 일차 |
| `race_no` | O | 경주번호 |

---

### 6. SRVC_OD_API_MRA_SUPP_CD - 운영정보

| 항목           | 내용                                                 |
| -------------- | ---------------------------------------------------- |
| **Fetch 함수** | `fetchBoatOperationInfo(rcDate)`                     |
| **엔드포인트** | `/SRVC_OD_API_MRA_SUPP_CD`                           |
| **용도**       | 경정 운영정보 (부품교체, 소모품, 정비, 틸트, 인터뷰) |

**요청 파라미터**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `stnd_yr` | X | 기준년도 |
| `week_tcnt` | X | 주차 |
| `day_tcnt` | X | 일차 |
| `racer_no` | X | 선수번호 |
| `race_no` | X | 경주번호 |

**세부 카테고리**

- Parts: 부품 교체
- Consumables: 소모품 교체
- Maintenance: 정비 내역
- Tilt: 모터 틸트
- Interview: 선수 인터뷰 요약

---

## 내부 타입 매핑

### Race 타입

외부 API 응답을 내부 `Race` 타입으로 변환

```typescript
// 내부 타입
interface Race {
  id: string; // {type}-{meetCode}-{raceNo}-{date}
  type: RaceType; // 'horse' | 'cycle' | 'boat'
  raceNo: number;
  track: string; // 경기장명
  startTime: string;
  distance?: number;
  grade?: string;
  status: 'upcoming' | 'live' | 'finished';
  entries: Entry[];
}
```

| 외부 API              | Mapper 함수                    | 결과 타입 |
| --------------------- | ------------------------------ | --------- |
| KRA API299            | `mapKRA299ToRaces`             | `Race[]`  |
| KSPO Cycle RACE_ORGAN | `mapKSPOCycleRaceOrganToRaces` | `Race[]`  |
| KSPO Boat RACE_INFO   | `mapKSPOBoatRaceInfoToRaces`   | `Race[]`  |

### HistoricalRace 타입

외부 API 응답을 내부 `HistoricalRace` 타입으로 변환

```typescript
interface HistoricalRace {
  id: string;
  type: RaceType;
  raceNo: number;
  track: string;
  date: string;
  startTime: string;
  distance?: number;
  grade?: string;
  status: 'finished';
  results: HistoricalRaceResult[];
  dividends: Dividend[];
}
```

| 외부 API               | Mapper 함수                | 결과 타입          |
| ---------------------- | -------------------------- | ------------------ |
| KSPO Cycle RACE_RESULT | `mapKSPOCycleRaceResults`  | `HistoricalRace[]` |
| KSPO Boat RACE_RESULT  | `mapKSPOBoatRaceResults`   | `HistoricalRace[]` |
| KSPO Cycle RACE_RANK   | `mapKSPOCycleRaceRankings` | `HistoricalRace[]` |
| KSPO Boat RACE_RANK    | `mapKSPOBoatRaceRankings`  | `HistoricalRace[]` |

### Racer 타입

외부 API 응답을 내부 `Racer` 타입으로 변환

```typescript
interface Racer {
  id: string;
  name: string;
  grade?: string;
  totalStarts?: number;
  winRate?: number | null;
  topRate?: number | null;
  top3Rate?: number | null;
}
```

| 외부 API              | Mapper 함수             | 결과 타입 |
| --------------------- | ----------------------- | --------- |
| KSPO Cycle RACER_INFO | `mapKSPOCycleRacerInfo` | `Racer[]` |
| KSPO Boat RACER_INFO  | `mapKSPOBoatRacerInfo`  | `Racer[]` |

---

## API 함수 요약

### 경마 (6개)

| 함수명                        | API     | 용도            |
| ----------------------------- | ------- | --------------- |
| `fetchHorseRaceSchedules`     | API299  | 경주 일정/결과  |
| `fetchHorseRaceInfo`          | API187  | 경마 경주정보   |
| `fetchHorseRaceResultDetail`  | API156  | 경주결과 상세   |
| `fetchHorseEntryRegistration` | API23_1 | 출전등록마 정보 |
| `fetchHorseEntryDetail`       | API26_2 | 출전표 상세     |
| `fetchHorseDividendSummary`   | API301  | 확정 배당률     |

### 경륜 (10개)

| 함수명                    | API             | 용도       |
| ------------------------- | --------------- | ---------- |
| `fetchCycleRaceSchedules` | CRA_RACE_ORGAN  | 출주표     |
| `fetchCycleRaceResults`   | CRA_RACE_RESULT | 경주결과   |
| `fetchCycleRaceRankings`  | CRA_RACE_RANK   | 순위정보   |
| `fetchCycleRacerInfo`     | CRA_RACER_INFO  | 선수정보   |
| `fetchCyclePayoffs`       | CRA_PAYOFF      | 배당률     |
| `fetchCycleOperationInfo` | CRA_CYCLE_EXER  | 운영정보   |
| `fetchCycleExerciseStats` | CRA_CYCLE_EXER  | 훈련정보   |
| `fetchCyclePartUnits`     | CRA_CYCLE_PART  | 부품정보   |
| `fetchCycleInspectStats`  | CRA_INSPECT     | 검차정보   |
| `fetchCycleInOutStats`    | CRA_INOUT       | 입출고정보 |

### 경정 (6개)

| 함수명                   | API             | 용도     |
| ------------------------ | --------------- | -------- |
| `fetchBoatRaceSchedules` | MBR_RACE_INFO   | 출주표   |
| `fetchBoatRaceResults`   | MBR_RACE_RESULT | 경주결과 |
| `fetchBoatRaceRankings`  | MRA_RACE_RANK   | 순위정보 |
| `fetchBoatRacerInfo`     | MBR_RACER_INFO  | 선수정보 |
| `fetchBoatPayoffs`       | MBR_PAYOFF      | 배당률   |
| `fetchBoatOperationInfo` | MRA_SUPP_CD     | 운영정보 |

### 공통 (5개)

| 함수명                   | 용도           |
| ------------------------ | -------------- |
| `fetchRaceById`          | 경주 상세      |
| `fetchRaceEntries`       | 출전 정보      |
| `fetchRaceOdds`          | 배당률         |
| `fetchRaceResults`       | 경주 결과      |
| `fetchHistoricalResults` | 과거 결과 검색 |

---

**총 27개 API fetch 함수 구현 완료**
