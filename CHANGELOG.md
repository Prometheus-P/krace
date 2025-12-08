# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-04

### Added
- Boat race results API endpoint (`fetchBoatRaceResults`) for complete race type coverage
- User-Friendly Design System (002-design-system) with M3 components
  - RaceLabLogo component with variants (full, symbol, text) and hover animation
  - M3Button (5 variants: filled, outlined, text, elevated, tonal)
  - M3Dialog and M3Snackbar components
  - Skeleton component with shimmer animation
  - useReducedMotion and useRipple hooks
- API Integration Patterns documented (loading, error, empty states)
- Comprehensive quality checklists (UX Visual: 61 items, UX API: 53 items)

### Changed
- Updated branding from KRace to RaceLab with new logo
- Enhanced M3Card with 3 variants (elevated, filled, outlined)
- Improved touch accessibility (48x48dp minimum targets)
- Added reduced motion support via `prefers-reduced-motion`

### Documentation
- Complete design system quickstart guide with usage examples
- API_README_v2.md with consolidated API documentation
- 15+ documented M3 components per SC-007

### Tests
- 605 tests passing across 45 test suites
- Full E2E coverage for responsive layouts

## [1.2.1] - 2025-12-02

### Fixed
- E2E tests now use relative URLs instead of hardcoded `racelab.kr`, enabling proper testing against preview deployments with `BASE_URL` environment variable
- Results API pagination validation now returns proper 400 errors for invalid parameters (page < 1 or limit outside 1-100 range)

### Changed
- Extracted cache control header constants to shared module (`src/lib/constants/cacheControl.ts`) for reusability across API routes
- Updated results API route to use `request.nextUrl` for proper Next.js 14 compatibility with dynamic rendering

### Documentation
- Clarified `NEXT_PUBLIC_SITE_URL` environment variable must include protocol (https://) in documentation
- Added `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` environment variable documentation

## [1.2.0] - 2025-12-01

### Added
- Complete race results history feature with M3 Design System
- Material Design 3 (M3) components: Card, Chip, SearchBar with Korean optimization
- Results browsing page with advanced filtering (date range, race type, track, search)
- Pagination component with keyboard accessibility
- Historical race results API endpoint with comprehensive filtering support
- 22+ new components with complete test coverage (339 tests passing)

### Changed
- Integrated Pretendard font for optimal Korean typography (weights: 400, 500, 600, 700)
- Extended Tailwind config with M3 color palette, typography scale, and elevation shadows
- Added navigation link to results page in Header component

## [1.1.0] - 2025-11-15

### Added
- Initial release with horse racing, cycle racing, and boat racing support
- Real-time race schedule display
- Race detail pages with entries, odds, and results
- SEO optimization with sitemap and robots.txt
- Google Analytics integration
- Responsive design with mobile support

### Infrastructure
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS styling
- Jest + React Testing Library for unit tests
- Playwright for E2E tests
- Vercel deployment with preview environments

[1.3.0]: https://github.com/Prometheus-P/racelab/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/Prometheus-P/racelab/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Prometheus-P/racelab/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Prometheus-P/racelab/releases/tag/v1.1.0
