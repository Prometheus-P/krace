# Wireframe Briefs (KRace Data Platform)

> Annotated with racelab.kr navigation/brand cues so the mocks align with what users already see in production.

## 1. 데이터 랜딩 / 홈

```
[Hero Banner]
  - Title + mission copy
  - CTAs: [오늘의 경주 보기] [데이터 둘러보기]
  - Background with subtle graph

[KPI Cards row]
  - Card per 종목 (경마/경륜/경정)
  - Metrics: 오늘 경주 수, 다음 시작 시간, 상태
  - Timestamp + “공공데이터포털 API” tag

[Real-time Schedule Section]
  - Tab bar (경마 | 경륜 | 경정)
  - Filters bar (날짜, 트랙, 상태)
  - Scrollable table (경주번호, 트랙, 시간, 상태, 데이터 출처)
  - Pagination footer

[입문 가이드 Strip]
  - Three tiles (경마, 경륜, 경정)
  - Each tile: illustration + short text + “자세히” chip

[Data Integrity Banner]
  - Copy: “실시간으로 업데이트된 공공데이터”
  - Shows last refresh (timestamp from API)
```

---

## 2. 결과 허브 (/results)

```
[Header]
  - Title “경주 결과”
  - Subtitle copy

[Layout: 2 columns]
| Filters (left)               | Results List (right)                      |
|------------------------------|-------------------------------------------|
| 카드 with sections:          | Suspense fallback skeleton                |
| - 날짜 범위 피커             | [Total count line]                        |
| - 종목 멀티셀렉트            | [Result cards stack, each clickable]      |
| - 트랙 컴보박스              | Card contents: 아이콘, 트랙/시간, top 3 |
| - 기수 검색 입력            | Expand area -> result table + dividends   |
| Buttons: [초기화], [적용]    | Pagination component w/ limit selector    |

[Mobile]
  - Filters collapse into bottom sheet triggered by “필터” button
```

---

## 3. 경주 상세 (/race/[id])

```
[Header bar]
  - Back button, Track badge, Distance, Grade chip, Status badge
  - Share/bookmark icons, “데이터 출처” tooltip

[Tabs]
  1. 출전표
     - Summary (날짜, 트랙, 등급)
     - Table: NO, 말명/선수, 기수, 조교사, 부중, 최근성적
  2. 배당/실시간
     - Odds cards grid; highlight favorites
     - Mini chart or trend indicator
  3. 결과 & 배당
     - Results table (rank, entry, 기수, 기록)
     - Dividends list with type chips + amounts
     - CTA: “CSV 다운로드”

[Side Drawer / Modal]
  - Raw JSON viewer (toggle)

[Timeline]
  - Visual steps: 출전등록 → 진행 중 → 결과 확정
```

---

## 4. 데이터 익스플로러 (/data)

```
[Two-column layout]
Left = Request Builder, Right = Result Viewer

[Request Builder]
  - Dropdown: Endpoint selector (e.g., /api/races/horse)
  - Dynamic form fields for query params (dateFrom, track, etc.)
  - Buttons: [요청 보내기], [문서 보기]
  - Saved Queries list (accordion)

[Result Viewer]
  - Tabs: JSON | Table | Chart
  - JSON tab shows formatted response + metadata (status, timestamp, cache-control)
  - Table tab auto-generates columns
  - Chart tab (if applicable) uses entries/results
  - Code snippet section (curl / fetch / axios)

[Schema / Glossary Sidebar]
  - Toggles showing type definitions and racing terms
```

---

## 5. 입문 가이드 / 학습 허브

```
[Hero] “데이터로 배우는 경주 입문”

[Featured Guides Carousel]
  - Cards with cover image, snippet, CTA

[Guide Detail Layout]
  - Article body rich text
  - Inline widget referencing live data (e.g., 최근 결과 미니 카드)
  - Checklist box (with progress tracking)
  - Related data links (e.g., “실시간 일정 보기”)

[Glossary Grid]
  - Cards for key terms, each linking to relevant dataset example

[CTA Footer]
  - Encourage signup/newsletter or next steps (“오늘 경주 확인하기” button)
```
