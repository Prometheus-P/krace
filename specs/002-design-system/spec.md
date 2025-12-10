# Feature Specification: User-Friendly Design System

**Feature Branch**: `002-design-system`
**Created**: 2025-12-04
**Status**: Draft (Clarified: API Integration Patterns)
**Input**: User description: "유저 친화적 디자인 시스템 확립 - Material Design 3 (material.io) 적극 활용, 로고 업데이트, 애니메이션 디자인"
**Clarified**: 2025-12-04 - API 활용 정의 (loading states, error handling, empty states, data mapping)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Brand Identity Through Logo (Priority: P1)

A user opens the KRace application and immediately sees the new RaceLab logo - a balanced gate symbol with three colors representing horse (green), cycle (red), and boat (blue) racing. The logo reinforces brand recognition and communicates the platform's purpose at a glance. The logo appears consistently across all pages (header) and loading states.

**Why this priority**: Brand identity is the foundation of user trust and recognition. The logo is the first thing users see and establishes the professional, data-focused nature of the platform.

**Independent Test**: Open the application and verify the logo displays correctly in the header, favicon, and any loading/splash screens.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** the page loads, **Then** the RaceLab logo is visible in the header with correct colors (green roof, red core, blue base)
2. **Given** a user views the logo, **When** they recognize the three-color structure, **Then** they can associate each color with a race type
3. **Given** a user is on any page, **When** they look at the header, **Then** the logo is consistent in size, position, and appearance
4. **Given** a user hovers over the logo, **When** the hover state activates, **Then** a subtle scale animation provides feedback

---

### User Story 2 - Consistent Visual Experience (Priority: P2)

A user navigates through different pages of the KRace application (home, results, race detail) and experiences a consistent visual language - same colors, typography, spacing, and component styles across all screens. The interface feels cohesive and professional, building trust in the platform.

**Why this priority**: Visual consistency is the foundation of user trust. Inconsistent UI creates confusion and reduces perceived quality, especially for the 40-60대 target demographic who value stability and reliability.

**Independent Test**: Navigate through all major pages and verify visual elements (buttons, cards, headers, colors) maintain consistent styling throughout.

**Acceptance Scenarios**:

1. **Given** a user is on the home page, **When** they navigate to the results page, **Then** they see the same header style, color scheme, and typography
2. **Given** a user views a race card on the home page, **When** they view a result card on the results page, **Then** both cards follow the same M3 elevation and border styling patterns
3. **Given** a user interacts with any button, **When** they see buttons on other pages, **Then** all buttons have consistent size, color, and interaction states

---

### User Story 3 - Meaningful Motion and Feedback (Priority: P3)

A user interacts with the application and experiences smooth, purposeful animations that guide their attention and confirm their actions. Transitions between states are fluid, loading indicators are engaging, and interactive elements respond with appropriate motion.

**Why this priority**: Motion design communicates state changes and provides feedback. Without animation, the interface feels static and unresponsive. Proper motion guides users and makes the experience feel polished.

**Independent Test**: Interact with various elements and verify animations are smooth, purposeful, and not distracting.

**Acceptance Scenarios**:

1. **Given** a user clicks a button, **When** the click is registered, **Then** a ripple effect emanates from the click point within 100ms
2. **Given** a user expands a race result card, **When** the expansion animates, **Then** the transition is smooth (300ms, ease-out) and content fades in appropriately
3. **Given** data is loading, **When** the user sees a loading indicator, **Then** skeleton placeholders animate with a subtle shimmer effect
4. **Given** a user with reduced motion preference, **When** they use the app, **Then** animations are minimized or instant

---

### User Story 4 - Accessible Touch-Friendly Interface (Priority: P4)

A user with varying levels of tech comfort (particularly 40-60대 users) can easily tap buttons, select filters, and navigate the app on mobile devices. All interactive elements are large enough to tap accurately, with clear visual feedback on interaction.

**Why this priority**: The target demographic requires generous touch targets and clear visual feedback. Poor touch accessibility directly impacts user retention and task completion rates.

**Independent Test**: Use the app on a mobile device and verify all interactive elements are easy to tap and provide clear feedback.

**Acceptance Scenarios**:

1. **Given** a user is using a mobile device, **When** they tap any interactive element, **Then** the touch target is at least 48x48dp
2. **Given** a user taps a button or chip, **When** they make contact, **Then** immediate visual feedback (ripple, color change) confirms their action
3. **Given** a user has difficulty with precise taps, **When** they tap near a button, **Then** the touch target area extends beyond the visible boundary for easier interaction

---

### User Story 5 - Clear Information Hierarchy (Priority: P5)

A user viewing race information can quickly identify the most important data (race type, results, dividends) through clear visual hierarchy. Headlines stand out from body text, primary actions are visually prominent, and secondary information is appropriately subdued.

**Why this priority**: Racing data is dense with numbers and statistics. Clear hierarchy helps users find critical information quickly, reducing cognitive load and improving decision-making speed.

**Independent Test**: Show a page to a new user and ask them to identify the primary information - they should locate it within 3 seconds.

**Acceptance Scenarios**:

1. **Given** a user views a race result card, **When** they scan the content, **Then** the race type color, track, and top finishers are immediately distinguishable from secondary details
2. **Given** a user views dividend information, **When** they look for payout amounts, **Then** the amounts are visually prominent (larger size, bolder weight) compared to labels
3. **Given** a page has multiple sections, **When** a user scrolls, **Then** section headers clearly delineate content areas with consistent styling

---

### User Story 6 - Responsive Layout Adaptation (Priority: P6)

A user accesses the application from different devices (mobile phone, tablet, desktop) and the layout adapts appropriately. Content reflows, navigation adjusts, and the experience remains optimal regardless of screen size.

**Why this priority**: Users access racing information from multiple devices throughout the day. Seamless responsive behavior ensures consistent utility across all access points.

**Independent Test**: View any page at mobile (375px), tablet (768px), and desktop (1280px) widths and verify appropriate layout adaptation.

**Acceptance Scenarios**:

1. **Given** a user is on a mobile device, **When** they view the results page, **Then** the layout is single-column with stacked cards
2. **Given** a user is on a tablet, **When** they view the home page, **Then** the layout may show 2-column grid for race cards
3. **Given** a user is on a desktop, **When** they view any page, **Then** the content is constrained to a readable width (max 1280px) with appropriate margins

---

### Edge Cases

- What happens when a user has system font scaling above 100%? Text and layouts should adapt gracefully without breaking.
- How does the system handle extremely long text content (e.g., very long horse names)? Truncation with ellipsis and tooltip on hover/tap.
- What happens when the logo image fails to load? Display a text-based fallback "RACELAB".
- How does the system behave with reduced motion preferences? Animations are reduced or disabled respecting `prefers-reduced-motion`.
- What happens when a component is used in an unexpected context? Components should fail gracefully with sensible defaults.
- How does the system handle right-to-left text (if ever needed)? Base components should be RTL-aware for future localization.
- What happens when API returns partial data? Components display available fields, show "-" for missing optional fields.
- What happens during network timeout? Show error state after 10 seconds with "네트워크 연결을 확인해주세요" message.
- How does the system handle rapid retry clicks? Debounce retry button (disable for 1 second after click).
- What happens when skeleton is shown for extended period (>5s)? Add subtle "로딩 중..." text below skeleton.

## Requirements _(mandatory)_

### Functional Requirements

#### Logo & Brand

- **FR-001**: System MUST display the RaceLab SVG logo in the header with three-color balanced gate design (green roof #81C784, red core #E57373, blue base #64B5F6)
- **FR-002**: System MUST provide logo variants: full logo (symbol + text), symbol only, and text-only for different contexts
- **FR-003**: System MUST include hover animation for logo (subtle scale to 1.02x over 500ms)
- **FR-004**: Logo MUST link to the home page from all pages

#### Design Tokens (M3)

- **FR-005**: System MUST use M3 (Material Design 3) design tokens for all colors, spacing, typography, and elevation values
- **FR-006**: System MUST maintain race type color associations: Horse (#2d5a27 green), Cycle (#dc2626 red), Boat (#0369a1 blue) as semantic accents
- **FR-007**: System MUST use Pretendard font family as the primary typeface with M3 type scale
- **FR-008**: System MUST implement M3 elevation system with 5 levels (0-5) using appropriate shadows

#### Components

- **FR-009**: System MUST provide a minimum touch target size of 48x48dp for all interactive elements
- **FR-010**: System MUST display visual feedback (ripple effect) within 100ms of user interaction
- **FR-011**: System MUST provide consistent component APIs across all UI elements (props, variants, sizes)
- **FR-012**: System MUST include loading, error, and empty states for all data-dependent components

#### Animation & Motion

- **FR-013**: System MUST use M3 standard easing curves (emphasized, standard, decelerate) for all animations
- **FR-014**: System MUST implement card expansion animation (300ms duration, ease-out)
- **FR-015**: System MUST provide skeleton loading animations with shimmer effect for async content
- **FR-016**: System MUST respect user preferences for reduced motion (`prefers-reduced-motion`)
- **FR-017**: System MUST provide button ripple effect on click/tap interaction

#### Accessibility

- **FR-018**: System MUST ensure all text meets WCAG AA contrast requirements (4.5:1 for body, 3:1 for large text)
- **FR-019**: System MUST provide keyboard navigation support for all interactive components
- **FR-020**: System MUST include focus indicators that are clearly visible (2px outline)

#### Responsive

- **FR-021**: System MUST support responsive breakpoints: mobile (default), tablet (md: 768px), desktop (lg: 1024px)

#### API Data States

- **FR-022**: System MUST display component-level skeleton UI with shimmer effect when data is loading (after 100ms delay)
- **FR-023**: System MUST display inline error messages in Korean with retry action when API calls fail
- **FR-024**: System MUST display contextual empty states with suggested actions when no data is available
- **FR-025**: System MUST apply race-type accent colors (horse/cycle/boat) automatically based on data `raceType` property
- **FR-026**: System MUST maintain component dimensions during loading/error states to prevent layout shift

### Key Entities

- **Design Token**: A named value representing a design decision (color, spacing, typography, elevation, motion) - stored in a centralized configuration
- **Component**: A reusable UI building block with defined variants, sizes, and states following M3 specifications
- **Animation**: A defined motion pattern with duration, easing, and trigger conditions
- **Logo Asset**: SVG-based brand symbol with multiple variants (full, symbol, text) and states (default, hover)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of interactive elements have touch targets of at least 48x48dp
- **SC-002**: 100% of pages pass visual consistency audit (same components styled identically across pages)
- **SC-003**: All text content meets WCAG AA contrast requirements (verified by automated accessibility testing)
- **SC-004**: Users can identify primary information on any page within 3 seconds (validated through user testing)
- **SC-005**: All pages render correctly at mobile (375px), tablet (768px), and desktop (1280px) widths
- **SC-006**: Design system documentation covers 100% of reusable components with usage examples
- **SC-007**: Component library provides at least 15 documented, reusable M3 components
- **SC-008**: Logo displays correctly on all pages with proper fallback behavior
- **SC-009**: All animations complete within 500ms maximum duration
- **SC-010**: 100% of interactive elements provide visual feedback within 100ms of interaction

## Assumptions

- Pretendard font is already integrated and available for use
- Existing M3 tokens (colors, spacing, elevation) provide a foundation to build upon
- The 40-60대 Korean demographic remains the primary user target, influencing design decisions toward clarity and simplicity
- M3 component specifications from material.io are the authoritative reference for component behavior
- Tailwind CSS remains the styling framework, with M3 tokens mapped to Tailwind configuration
- Light mode is the primary theme; dark mode is deferred to a future iteration
- Logo SVG files in `public/racelab_logo_*.html` contain the authoritative logo design

## Design System Scope

### In Scope

- Logo integration and variants (full, symbol, text)
- M3 color system implementation (primary, secondary, tertiary, surface, error)
- Typography scale (display, headline, title, body, label)
- Elevation system (levels 0-5 with corresponding shadows)
- Spacing system (4dp grid)
- Core components: Button, Card, Chip, TextField, SearchBar, Dialog, Snackbar
- State styles: hover, focus, active, disabled, error
- Animation system: ripple, expansion, skeleton shimmer, transitions
- Motion guidelines (duration, easing)

### Out of Scope

- Dark mode implementation (deferred to future iteration)
- Custom illustrations beyond logo
- Complex animations beyond M3 standard transitions
- Print stylesheets
- Third-party component library integration
- Icon library (use existing or M3 icons)

## Animation Specifications

### Standard Animations

| Animation        | Duration | Easing      | Trigger           |
| ---------------- | -------- | ----------- | ----------------- |
| Button Ripple    | 300ms    | ease-out    | Click/Tap         |
| Card Expansion   | 300ms    | ease-out    | Click to expand   |
| Card Collapse    | 250ms    | ease-in     | Click to collapse |
| Skeleton Shimmer | 1.5s     | linear      | Continuous loop   |
| Logo Hover       | 500ms    | ease-in-out | Hover             |
| Page Transition  | 200ms    | ease        | Navigation        |
| Chip Selection   | 150ms    | ease-out    | Click/Tap         |

### Motion Principles

1. **Purposeful**: Every animation serves a function (feedback, guidance, state change)
2. **Quick**: Most interactions complete under 300ms
3. **Subtle**: Animations enhance, not distract
4. **Respectful**: Honor user preferences for reduced motion

---

## API Integration Patterns _(clarified)_

This section defines how design system components integrate with API data from the KRace backend (see `API_README_v2.md` for full API documentation).

### Loading State Strategy

**Approach**: Component-level skeleton UI (recommended for 40-60대 user clarity)

| Component Type  | Skeleton Behavior                                    |
| --------------- | ---------------------------------------------------- |
| RaceCard        | Card shape with shimmer, race type color bar visible |
| ResultTable     | Table header static, rows show skeleton cells        |
| DividendDisplay | Amount placeholders with shimmer                     |
| EntryList       | List items with avatar/name placeholders             |
| SearchResults   | Card grid with skeleton cards                        |

**Timing**:

- 0-100ms: Component shows previous state or empty
- 100ms+: Skeleton appears with shimmer animation
- On data: Skeleton fades out (150ms), content fades in

### Error State Handling

**Approach**: Inline error with retry action

```
┌─────────────────────────────────────┐
│  ⚠️  데이터를 불러올 수 없습니다      │
│                                     │
│  [다시 시도]                         │
└─────────────────────────────────────┘
```

**Requirements**:

- Error message in Korean, clear and non-technical
- Retry button uses primary action styling
- Error state maintains component dimensions to prevent layout shift
- Log detailed error to console for debugging

### Empty State Design

**Approach**: Contextual messaging with suggested actions

| Context           | Message                     | Action              |
| ----------------- | --------------------------- | ------------------- |
| No search results | "검색 결과가 없습니다"      | 필터 조정 제안      |
| No races today    | "오늘 경주 일정이 없습니다" | 다른 날짜 선택 링크 |
| No dividends      | "배당 정보 없음"            | -                   |

**Requirements**:

- Empty state uses M3 surface-variant background
- Icon or illustration appropriate to context
- Suggested action uses secondary button style

### Data Display Components

Components receive **mapped internal types** (not raw API responses):

| API Source                 | Mapped Type      | Display Component           |
| -------------------------- | ---------------- | --------------------------- |
| Horse/Cycle/Boat schedules | `Race`           | `RaceCard`, `RaceList`      |
| Entry APIs                 | `Entry`          | `EntryTable`, `EntryCard`   |
| Result APIs                | `HistoricalRace` | `ResultCard`, `ResultTable` |
| Payoff APIs                | `Dividend`       | `DividendDisplay`           |

**Data Flow**:

```
API Route → lib/api.ts → mappers.ts → Component Props
```

### Race Type Visual Mapping

Components automatically apply race-type styling based on the `raceType` prop:

| Race Type | Accent Color    | Badge | Skeleton Tint |
| --------- | --------------- | ----- | ------------- |
| horse     | #2d5a27 (green) | 경마  | green-50      |
| cycle     | #dc2626 (red)   | 경륜  | red-50        |
| boat      | #0369a1 (blue)  | 경정  | blue-50       |

### Refresh & Polling

- **Manual refresh**: Pull-to-refresh on mobile, refresh button on desktop
- **Auto-refresh**: Not implemented in design system scope (page-level concern)
- **Stale indicator**: Subtle timestamp showing "업데이트: 2분 전" for cached data
