# Implementation Plan: Advanced SEO/AEO/GEO Optimization

**Branch**: `005-seo-optimization` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-seo-optimization/spec.md`

## Summary

Implement advanced SEO (Search), AEO (Answer), and GEO (Generative Engine) optimizations for racelab.kr targeting 50-60 demographic users. Key deliverables:

1. **SEO**: Historical sitemap (365 days), enhanced dynamic metadata, font optimization
2. **AEO**: FAQPage schema, enhanced SportsEvent schema with subEvent results
3. **GEO**: AI Summary blocks for LLM parsing, authority signals for E-E-A-T

Technical approach: Extend existing Next.js Metadata API implementation with new JSON-LD schemas and server-side sitemap generation.

## Technical Context

**Language/Version**: TypeScript 5.9 + Next.js 14.2 (App Router)
**Primary Dependencies**: React 18.3, Tailwind CSS 3.4, Pretendard font
**Storage**: N/A (external API data, cached via Next.js ISR)
**Testing**: Jest (UI: jsdom, API: node) + Playwright E2E
**Target Platform**: Web (mobile-responsive, targeting 50-60 demographic)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: LCP < 2.5s, TTFB < 600ms, Lighthouse Score >= 90
**Constraints**: Pretendard font subset < 100KB, sitemap limit 50,000 URLs/file
**Scale/Scope**: ~10,000 historical races/year (3 types x 365 days x ~10 races/day)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-Driven Development | PASS | Unit tests for metadata generators, schema builders, sitemap utilities |
| II. Structural-Behavioral Separation | PASS | New components in separate commits from schema logic |
| III. Simplicity First | PASS | Extends existing patterns, no new abstractions |
| IV. Clear Data Flow | PASS | Follows existing: API → mappers → Components pattern |
| V. Mobile-First Responsive Design | PASS | No new UI components; AI Summary uses existing styles |

**Quality Gates Checklist**:
- [x] TDD cycle planned for all new utilities
- [x] Structural and behavioral changes separable
- [x] No unnecessary complexity - reuses existing patterns
- [x] Data flow follows established pattern
- [x] Mobile-first (AI Summary uses responsive text sizing)
- [ ] All tests pass (to be verified during implementation)

## Project Structure

### Documentation (this feature)

```text
specs/005-seo-optimization/
├── plan.md              # This file
├── research.md          # Phase 0: Schema research, font optimization findings
├── data-model.md        # Phase 1: Schema entity definitions
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: JSON-LD schema contracts
│   ├── faq-page.schema.json
│   ├── sports-event.schema.json
│   ├── metadata.schema.json
│   └── ai-summary.schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── sitemap.ts              # MODIFY: Historical sitemap generation
│   ├── sitemap/                # NEW: Sitemap index for large datasets
│   │   └── [id]/route.ts       # Dynamic sitemap chunks
│   ├── race/[id]/
│   │   └── page.tsx            # MODIFY: Add AI Summary, enhance SportsEvent
│   ├── guide/                  # NEW: FAQ pages with FAQPage schema
│   │   └── page.tsx
│   └── layout.tsx              # MODIFY: Font optimization
├── components/
│   ├── seo/
│   │   ├── RaceJsonLd.tsx      # EXISTS: SportsEvent schema
│   │   ├── FAQJsonLd.tsx       # NEW: FAQ page schema
│   │   └── AISummary.tsx       # NEW: LLM-parseable summary block
│   └── race-detail/
│       └── KeyInsightBlock.tsx # EXISTS: May extend for AI parsing
├── lib/
│   ├── seo/
│   │   ├── metadata.ts         # NEW: Metadata generation utilities
│   │   ├── schemas.ts          # NEW: JSON-LD schema builders
│   │   └── sitemap.ts          # NEW: Sitemap generation utilities
│   └── api.ts                  # EXISTS: May need historical fetch helpers
└── styles/
    └── fonts/                  # NEW: Pretendard Korean subset

tests/
├── unit/
│   └── lib/
│       └── seo/
│           ├── metadata.test.ts
│           ├── schemas.test.ts
│           └── sitemap.test.ts
└── e2e/
    └── seo/
        └── structured-data.spec.ts
```

**Structure Decision**: Single Next.js application (existing pattern). SEO utilities organized under `src/lib/seo/` with corresponding tests. New components in `src/components/seo/`.

## Complexity Tracking

> No constitution violations detected. Feature extends existing patterns.

| Area | Approach | Justification |
|------|----------|---------------|
| Sitemap splitting | Dynamic routes `/sitemap/[id]` | Required by Google's 50,000 URL limit |
| Schema builders | Pure functions in `lib/seo/` | Follows existing lib/ pattern, enables testing |
| Font subsetting | Build-time optimization | One-time setup, standard Next.js pattern |
