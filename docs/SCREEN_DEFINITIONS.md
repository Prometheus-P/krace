# Screen Definitions for Data-Driven KRace Experience

This document outlines the primary screens that consume the project’s APIs while keeping the “데이터 플랫폼” identity and entry-level usability (경마/경륜/경정 입문자) at the forefront. References to racelab.kr’s current IA ensure our proposals drop into the live experience without breaking navigation or tone.

Each section references the underlying routes so designers and engineers can align UI/UX decisions with the real data contract.

---

## 1. Data Landing / Home (`GET /api/races/{horse|cycle|boat}`)

- **Hero + Context**
  - Mission copy explaining KRace as a transparent data platform.
  - Dual CTA buttons: “오늘의 경주 보기” (anchor to Schedule cards) and “데이터 둘러보기” (links to `/data` explorer).
- **Live KPI Cards**
  - Pull totals per race type (card colors per 🐎/🚴/🚤) with timestamps from API response `timestamp`.
  - Show soonest `startTime`, 트랙 상태, and data provenance (“공공데이터포털 API299 / KSPO API”).
- **Real-time Schedule Table**
  - Tabbed table backed by `/api/races/{type}` with filters (날짜, 트랙, 상태). Pagination mirrors API defaults (`limit=20`).
  - Provide legend explaining status badges (scheduled, live, finished).
- **입문 가이드 Strip**
  - Three tiles (경마, 경륜, 경정) linking to onboarding stories, each referencing actual data (예: 최근 결과로 “이런 경주였습니다”).
- **Data Integrity Badge**
  - Small banner showing last refresh + API route so data-focused visitors trust the numbers.

---

## 2. Results Hub (`/results` page + `GET /api/results`)

- **Left Rail Filters**
  - Components for 날짜 범위, 종목 멀티셀렉트, 트랙, 기수/선수 검색; all map to query params the API already supports.
  - Persist state to URL for shareable dataset views.
- **Results List**
  - `ResultsList` renders `HistoricalRace` cards with summarized info (아이콘, 트랙, 경주 번호, 시간, top 3 results).
  - Chips for `status` (`finished`, `canceled`) help orient new fans.
- **Detail Drawer**
  - Expanding a card reveals full `results` table + dividends; include export (CSV/PDF) for 분석 지향 사용자.
- **Pagination Footer**
  - Shows `total`, `page`, `totalPages`; allow limit selector (10/20/50) wired to API `limit`.
- **Mobile Behavior**
  - Filters collapse into bottom sheet; cards stay touch-friendly (tested via existing Playwright mobile projects).

---

## 3. Race Detail (`/race/[id]` + `GET /api/races/[type]/[id]/{entries|odds|results}`)

- **Header Summary**
  - Track, 거리, 등급, 상태 badge, share/bookmark, and “데이터 출처” tooltip referencing API route.
- **Tabbed Content**
  1. **출전표** – powered by `fetchRaceEntries`; highlight 기수, 조교사, 부중.
  2. **실시간 배당** – uses `/odds` route, includes miniature charts and accessible labels (matching Playwright accessibility specs).
  3. **결과 & 배당** – uses `/results`; includes payout chips with tooltips explaining 배당 종류 to newcomers.
- **Progress Timeline**
  - Visual indicator from 출전 등록 → 진행 중 → 결과 확定 to educate first-time visitors.
- **Raw Data Drawer**
  - Optional JSON viewer for advanced users who want to inspect the exact API payload.

---

## 4. Data Explorer (`/data` – new page consuming all APIs)

- **Request Builder**
  - Dropdown for selecting API endpoint (`/api/races/horse`, `/api/results`, `/api/results/{id}`, etc.).
  - Parameter inputs auto-update sample `fetch`/`curl` snippets.
- **Result Pane**
  - Split view: formatted JSON on the left, visualization (table/chart) on the right.
  - Log the API `timestamp`, `success`, error states, and cache headers so platform feels trustworthy.
- **Saved Queries**
  - Panel listing frequently used dataset views (e.g., “최근 3일 경마 결과 in 서울”). Entry-level users can load them without knowing parameters.
- **Schema & Glossary**
  - Side panel referencing TypeScript interfaces from `src/types/index.ts` with friendly descriptions and racing terminology explanations.

---

## 5. Entry Guides & Learning Hub (content-driven, data-assisted)

- **Guided Stories**
  - Articles like “경마 첫 관전 가이드” embed live widgets (e.g., top 3 최근 경주 결과) so educational content ties directly to data.
- **Checklists & Videos**
  - Each story includes action list (ex: “배당표 읽기 연습”) with quick links to relevant sections (`/results`, `/race/{id}`).
- **Glossary Cards**
  - Terms (배당, 등급, 부중…) with tooltips referencing real data examples (“이 경주에서 확인해보세요”).

---

## Global UX Principles

- **Data Transparency**
  - Every section displays API route + timestamp and references the gov provider (KRA / KSPO).
- **Accessibility & Internationalization**
  - Maintain color contrast, keyboard navigation, and ARIA labels that describe the data context (already aligned with Playwright tests like `should have accessible navigation`).
- **Newcomer-Friendly Copy**
  - Replace jargon with approachable explanations; tooltips or inline help should define racing concepts.
- **Responsive Layout**
  - Bottom navigation on mobile (홈 / 일정 / 결과 / 데이터) keeps key tasks one tap away.

These definitions provide a roadmap for aligning UI builds with the existing API surface, ensuring both 데이터 플랫폼 신뢰성과 초보 사용성 are addressed.
