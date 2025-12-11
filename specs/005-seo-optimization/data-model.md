# Data Model: Advanced SEO/AEO/GEO Optimization

**Feature**: 005-seo-optimization
**Date**: 2025-12-11

## Overview

This feature introduces schema definitions for SEO structured data (JSON-LD) and sitemap generation. No database changes required - all entities are runtime transformations of existing Race/Entry/Result types.

---

## Schema Entities

### 1. SportsEventSchema

JSON-LD structured data for race events.

```typescript
interface SportsEventSchema {
  "@context": "https://schema.org";
  "@type": "SportsEvent";
  "@id": string;                    // Unique URI: {baseUrl}/race/{id}#event
  name: string;                     // "서울 제1경주"
  description: string;              // "경마 1600m 경주"
  startDate: string;                // ISO 8601: "2025-12-11T10:30:00+09:00"
  endDate?: string;                 // ISO 8601 (optional)
  eventStatus: EventStatusType;     // Schema.org EventStatus URL
  location: PlaceSchema;            // Venue details
  organizer: OrganizationSchema;    // KRA or KSPO
  competitor: CompetitorSchema[];   // Entries (horses/athletes)
  sport: string;                    // "경마" | "경륜" | "경정"
  image?: ImageObjectSchema;        // OG image
  subEvent?: SubEventSchema[];      // Race results (1착, 2착, 3착)
}

type EventStatusType =
  | "https://schema.org/EventScheduled"
  | "https://schema.org/EventCancelled"
  | "https://schema.org/EventPostponed"
  | "https://schema.org/EventRescheduled"
  | "https://schema.org/EventCompleted";
```

**Source Mapping**:
| Schema Field | Source | Transformation |
|--------------|--------|----------------|
| name | `race.track`, `race.raceNo` | `${track} 제${raceNo}경주` |
| startDate | `race.date`, `race.startTime` | ISO 8601 with KST timezone |
| eventStatus | `race.status` | Map to Schema.org URL |
| competitor | `race.entries[]` | Map to Person/Thing |
| subEvent | `results[]` | Top 3 results |

---

### 2. FAQSchema

JSON-LD structured data for FAQ pages.

```typescript
interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FAQItemSchema[];
}

interface FAQItemSchema {
  "@type": "Question";
  name: string;                     // Question text in Korean
  acceptedAnswer: {
    "@type": "Answer";
    text: string;                   // Answer text in Korean
  };
}
```

**Validation Rules**:
- `name`: Required, non-empty, Korean text
- `text`: Required, non-empty, plain text (no HTML)

---

### 3. PlaceSchema

Location information for events.

```typescript
interface PlaceSchema {
  "@type": "Place";
  name: string;                     // Track name: "서울경마공원"
  address: PostalAddressSchema;
}

interface PostalAddressSchema {
  "@type": "PostalAddress";
  addressCountry: "KR";
  addressRegion?: string;           // "서울특별시" | "부산광역시" | etc.
  addressLocality?: string;         // City/district
}
```

**Source Mapping**:
| Track Code | name | addressRegion |
|------------|------|---------------|
| SEL | 서울경마공원 | 경기도 |
| BSN | 부산경남경마공원 | 경상남도 |
| JEJ | 제주경마공원 | 제주특별자치도 |
| GWM | 광명벨로드롬 | 경기도 |
| CSN | 창원경륜공단 | 경상남도 |
| MSN | 미사리경정장 | 경기도 |

---

### 4. CompetitorSchema

Entry representation in SportsEvent.

```typescript
// For horse racing
interface HorseCompetitorSchema {
  "@type": "Thing";                 // Horse is not a Person
  name: string;                     // Horse name
  identifier?: string;              // Entry number
  athlete?: {
    "@type": "Person";
    name: string;                   // Jockey name
  };
}

// For cycle/boat racing
interface AthleteCompetitorSchema {
  "@type": "Person";
  name: string;                     // Athlete name
  identifier?: string;              // Entry number
}

type CompetitorSchema = HorseCompetitorSchema | AthleteCompetitorSchema;
```

---

### 5. SitemapEntry

Sitemap URL entry.

```typescript
interface SitemapEntry {
  url: string;                      // Full URL
  lastModified: Date;               // Last update timestamp
  changeFrequency: ChangeFrequency;
  priority: number;                 // 0.0 - 1.0
}

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';
```

**Priority Rules**:
| Page Type | priority | changeFrequency |
|-----------|----------|-----------------|
| Homepage | 1.0 | hourly |
| Today's races | 0.9 | hourly |
| Historical races (finished) | 0.7 | never |
| Guide pages | 0.8 | weekly |
| Results page | 0.9 | always |

---

### 6. AISummary

Plain-text summary for LLM parsing.

```typescript
interface AISummary {
  raceInfo: string;                 // "2025-12-11 서울 제1경주 경마"
  status: string;                   // "경주 종료" | "경주 예정" | "진행 중"
  results?: AISummaryResult[];      // Top 3 finishers
  dataSource: string;               // "한국마사회 (KRA) 공식 데이터"
}

interface AISummaryResult {
  rank: number;                     // 1, 2, 3
  name: string;                     // Horse/athlete name
  odds?: number;                    // Winning odds
  jockey?: string;                  // Jockey name (horse only)
}
```

**Output Format** (plain text for LLM):
```
경주 정보: 2025-12-11 서울 제1경주 경마 (1600m)
경주 결과: 1착 스피드킹 (배당 3.5배, 기수: 김철수), 2착 골든에이스 (배당 5.2배), 3착 썬더볼트 (배당 8.1배)
데이터 출처: 한국마사회 (KRA) 공식 데이터 (data.go.kr)
```

---

### 7. RaceMetadata

Page-specific SEO metadata.

```typescript
interface RaceMetadata {
  title: string;                    // "서울 제1경주 배당률 & 결과 - RaceLab"
  description: string;              // 150-160 chars
  canonical: string;                // Full canonical URL
  openGraph: OpenGraphMetadata;
  twitter: TwitterMetadata;
}

interface OpenGraphMetadata {
  title: string;
  description: string;
  type: 'website';
  url: string;
  siteName: 'RaceLab';
  locale: 'ko_KR';
  images: Array<{
    url: string;
    width: number;
    height: number;
    alt: string;
  }>;
}

interface TwitterMetadata {
  card: 'summary_large_image';
  title: string;
  description: string;
}
```

**Title Template**:
- Race detail: `{track} 제{raceNo}경주 {raceType} - RaceLab`
- Results: `{track} 제{raceNo}경주 결과 & 배당금 - RaceLab`
- Historical: `{date} {track} 제{raceNo}경주 결과 - RaceLab`

**Description Template**:
```
{date} {track} 제{raceNo}경주 {raceType} 출주표, 배당률, 경주 결과를 확인하세요. {dataSource} 공식 데이터.
```

---

## Entity Relationships

```
Race (existing)
├── entries[] (existing)
│   └── CompetitorSchema (generated)
├── results[] (existing)
│   └── SubEventSchema (generated)
├── SportsEventSchema (generated)
├── RaceMetadata (generated)
└── AISummary (generated)

FAQPage (new)
└── FAQSchema (generated)

Sitemap
├── static pages
└── race pages
    └── SitemapEntry[] (generated from Race IDs)
```

---

## State Transitions

### Race Status → Event Status Mapping

```
Race.status          EventStatus
─────────────        ───────────────────────────────────────
'upcoming'     →     https://schema.org/EventScheduled
'live'         →     https://schema.org/EventScheduled (no "Live" status in schema)
'finished'     →     https://schema.org/EventScheduled (completed events keep original)
'canceled'     →     https://schema.org/EventCancelled
'postponed'    →     https://schema.org/EventPostponed
```

Note: Schema.org does not have "EventCompleted" - finished events retain `EventScheduled` status per Google guidelines.

---

## Validation Rules

### SportsEvent
- `name`: Required, non-empty
- `startDate`: Required, valid ISO 8601
- `competitor`: At least 1 entry
- `location.name`: Required, non-empty

### FAQPage
- `mainEntity`: At least 1 Q&A pair
- Each `name`: Max 200 characters
- Each `text`: Max 2000 characters

### Sitemap
- `url`: Valid HTTPS URL
- `priority`: 0.0 ≤ value ≤ 1.0
- Max 50,000 URLs per sitemap file

### AISummary
- `raceInfo`: Required
- `results`: Max 3 items
- `dataSource`: Required (for E-E-A-T)
