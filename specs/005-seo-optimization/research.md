# Research: Advanced SEO/AEO/GEO Optimization

**Date**: 2025-12-11
**Feature**: 005-seo-optimization
**Status**: Complete

## Summary of Decisions

| Topic | Decision | Rationale | Alternatives Rejected |
|-------|----------|-----------|----------------------|
| Speakable Schema | **SKIP** | Beta, limited to news content only | N/A - not applicable to sports events |
| FAQPage Schema | **IMPLEMENT** | AI citation value even without Google rich results | None - low cost, high value |
| SportsEvent Enhancement | **IMPLEMENT** | Google supports sports events well | Using generic Event type |
| Sitemap Generation | **Native Next.js** | No dependencies, ISR support | `next-sitemap` package |
| Font Optimization | **Korean subset** | Target < 100KB with WOFF2 | Full font with CDN caching |

---

## 1. Speakable Schema

### Decision: **DO NOT IMPLEMENT**

### Rationale
1. **Limited to news content**: Google's Speakable schema is currently restricted to news articles, not sports events or race results
2. **Beta status**: Subject to breaking changes, high maintenance burden
3. **Korean voice search reality**: Naver Clova (dominant in Korea) doesn't support Google's Speakable schema
4. **Better alternative**: FAQPage schema serves similar purpose for voice Q&A

### Alternative Implementation
Instead of Speakable, use:
- FAQPage schema for voice-optimized Q&A
- SportsEvent with clear descriptions for AI parsing
- Plain-text AI Summary block (FR-010) without vendor lock-in

### Sources
- [Google Speakable Documentation](https://developers.google.com/search/docs/appearance/structured-data/speakable)
- [Schema.org Speakable Property](https://schema.org/speakable)

---

## 2. FAQPage Schema

### Decision: **IMPLEMENT** with modified expectations

### Key Findings
- **Restricted since Sept 2023**: FAQ rich results only for well-known government/health sites
- **Still valuable**: Semantic value for Bing, DuckDuckGo, AI tools (ChatGPT, Perplexity)
- **Available in Korean**: Works with `ko_KR` locale

### Implementation Pattern
```typescript
export function generateFAQSchema(faqs: Array<{question: string; answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
```

### Use Cases for RaceLab
- `/guide/betting` - "배당률이란 무엇인가요?", "단승식과 복승식의 차이는?"
- `/guide/how-to-read-odds` - "배당률이 높으면 좋은가요?"
- `/help` - "경주 결과는 언제 업데이트되나요?"

### Testing
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### Sources
- [Google FAQPage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Schema.org FAQ Documentation](https://schema.org/docs/faq.html)

---

## 3. SportsEvent Schema Enhancement

### Decision: **IMPLEMENT** with Korean racing context

### Key Properties

**eventStatus** (EventStatusType):
| Status | Schema Value | Use Case |
|--------|--------------|----------|
| Scheduled | `https://schema.org/EventScheduled` | Default for upcoming races |
| Cancelled | `https://schema.org/EventCancelled` | Race cancelled |
| Postponed | `https://schema.org/EventPostponed` | Postponed, date unknown |
| Rescheduled | `https://schema.org/EventRescheduled` | New date known |

**competitor**:
- Horse racing: `Thing` for horse + `Person` for jockey
- Cycle/Boat racing: `Person` for athlete

**subEvent**:
- Use for race results (1착, 2착, 3착)
- Each subEvent is also an `Event`

### Implementation Pattern
```typescript
export function generateSportsEventSchema(race: Race, entries: Entry[], results?: RaceResult[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${baseUrl}/race/${race.id}#event`,
    "name": `${race.track} 제${race.raceNo}경주`,
    "startDate": race.startTime, // ISO 8601
    "eventStatus": mapRaceStatusToEventStatus(race.status),
    "location": {
      "@type": "Place",
      "name": race.track,
      "address": { "@type": "PostalAddress", "addressCountry": "KR" }
    },
    "organizer": {
      "@type": "Organization",
      "name": race.type === 'horse' ? "한국마사회" : "국민체육진흥공단"
    },
    "competitor": entries.map(entry => ({
      "@type": race.type === 'horse' ? "Thing" : "Person",
      "name": entry.name
    })),
    ...(results && {
      "subEvent": results.slice(0, 3).map((r, idx) => ({
        "@type": "Event",
        "name": `${idx + 1}착`,
        "description": `${r.name} (배당률: ${r.odds}배)`
      }))
    })
  };
}
```

### Sources
- [Schema.org SportsEvent](https://schema.org/SportsEvent)
- [Schema.org EventStatusType](https://schema.org/EventStatusType)

---

## 4. Next.js Sitemap Generation

### Decision: **Native Next.js** with ISR

### Key Findings
- `generateSitemaps` function available in Next.js 14.2.3+
- Automatic splitting when exceeding 50,000 URLs
- ISR support via `revalidate` constant

### Implementation Pattern

**Basic Sitemap (< 50,000 URLs)**:
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const raceIds = await getAllRaceIds({ days: 365 });

  return [
    { url: baseUrl, changeFrequency: 'hourly', priority: 1.0 },
    ...raceIds.map(race => ({
      url: `${baseUrl}/race/${race.id}`,
      lastModified: race.updatedAt,
      changeFrequency: race.status === 'finished' ? 'never' : 'hourly',
      priority: race.status === 'upcoming' ? 0.9 : 0.7,
    }))
  ];
}
```

**Multiple Sitemaps (> 50,000 URLs)**:
```typescript
// src/app/sitemap/[id]/route.ts
const URLS_PER_SITEMAP = 10000;

export async function generateSitemaps() {
  const total = await getTotalRaceCount({ days: 365 });
  return Array.from({ length: Math.ceil(total / URLS_PER_SITEMAP) }, (_, i) => ({ id: String(i) }));
}
```

### Caching Strategy
| Content Type | changeFrequency | priority |
|--------------|-----------------|----------|
| Homepage | hourly | 1.0 |
| Today's races | hourly | 0.9 |
| Historical races | never | 0.7 |
| Guide pages | weekly | 0.8 |

### Scale Estimate
- 3 race types × ~30 races/day × 365 days = ~33,000 URLs
- Within single sitemap limit (50,000)

### Sources
- [Next.js generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)
- [Next.js ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

---

## 5. Pretendard Font Optimization

### Decision: **Korean subset** with `next/font/local`

### Target
- Current: ~273KB (full WOFF2)
- Target: < 100KB per weight

### Subsetting Strategy

**Unicode Ranges**:
| Range | Characters | Description |
|-------|------------|-------------|
| U+AC00-D7A3 | 11,172 | Korean syllables (가-힣) |
| U+1100-11FF | 256 | Hangul Jamo (ㄱ-ㅎ, ㅏ-ㅣ) |
| U+3130-318F | 94 | Hangul Compatibility Jamo |
| U+0020-007E | 95 | Basic Latin (ASCII) |

**Tool: pyftsubset (fonttools)**:
```bash
pyftsubset Pretendard-Regular.otf \
  --output-file=public/fonts/pretendard-korean.woff2 \
  --flavor=woff2 \
  --unicodes=U+AC00-D7A3,U+1100-11FF,U+3130-318F,U+0020-007E \
  --layout-features='*' \
  --with-zopfli
```

### Implementation Pattern
```typescript
// src/app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
    { path: '../fonts/pretendard-korean-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/pretendard-korean-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-pretendard',
  preload: true,
});
```

### Expected Results
- Regular (400): ~50-70KB
- Bold (700): ~50-70KB
- Total: ~100-140KB for 2 weights

### Fallback Strategy
```css
font-family: var(--font-pretendard), system-ui, -apple-system, sans-serif;
```

### Testing
1. Network DevTools → Filter `woff2` → Verify < 100KB
2. Lighthouse → Check CLS (layout shift)
3. Slow 3G throttling → LCP should remain < 2.5s

### Sources
- [Next.js Font Optimization](https://nextjs.org/docs/14/app/building-your-application/optimizing/fonts)
- [Google Fonts Korean Strategy](https://developers.googleblog.com/google-fonts-launches-korean-support/)
- [korsubset Tool](https://github.com/SeokminHong/korsubset)

---

## Unresolved Items

None. All NEEDS CLARIFICATION items resolved.

## Next Steps

1. Create `src/lib/seo/schemas.ts` for schema generators
2. Update `src/app/sitemap.ts` for historical data
3. Run font subsetting, place WOFF2 in `public/fonts/`
4. Update `src/app/layout.tsx` with `next/font/local`
5. Add FAQ schema to guide pages
6. Enhance SportsEvent schema in race detail pages
