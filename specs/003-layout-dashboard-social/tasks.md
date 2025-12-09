# Tasks: Layout Enhancement & Social Integration

**Input**: Design documents from `/specs/003-layout-dashboard-social/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create project structure per implementation plan in `src/`
- [x] T002 Update dependencies in `package.json` if needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T003 Create `src/components/layout/Header.tsx` component
- [x] T004 Create `src/components/layout/Footer.tsx` component
- [x] T005 Create `src/app/(dashboard)/page.tsx` for the dashboard

---

## Phase 3: User Story 1 - Share Race Information (Priority: P1) 🎯 MVP

**Goal**: Allow users to share race information via social media or messaging apps.

**Independent Test**: Navigate to any race result or race detail → click share button → verify share options appear and content can be shared

### Implementation for User Story 1

- [x] T006 [US1] Create `src/components/ui/ShareButton.tsx` component.
- [x] T007 [US1] Implement native share API in `src/lib/social.ts`.
- [x] T008 [US1] Add "copy link" fallback in `src/lib/social.ts`.
- [x] T009 [US1] Implement Open Graph meta tags (title, description, image) for dynamic content on shareable pages.

---

## Phase 4: User Story 2 - Quick Access to Telegram Community (Priority: P2)

**Goal**: Provide an easy way to join the RaceLab Telegram community.

**Independent Test**: Click Telegram button in footer → verify it opens Telegram app/web with the correct community link.

### Implementation for User Story 2

- [x] T010 [US2] Create `src/components/ui/TelegramButton.tsx` component.
- [x] T011 [US2] Add the `TelegramButton` to the `Footer` component.

---

## Phase 5: User Story 3 - Enhanced Navigation Menu (Priority: P3)

**Goal**: Improve navigation with clear visual hierarchy and mobile experience.

**Independent Test**: Navigate through all menu items on desktop and mobile → verify all links work, active states display correctly, and transitions are smooth.

### Implementation for User Story 3

- [x] T012 [US3] Update `Header.tsx` to include a link to the dashboard.
- [x] T013 [US3] Ensure navigation meets M3 design system consistency.
- [x] T014 [US3] Implement smooth open/close transitions for mobile navigation in `Header.tsx`.
- [x] T015 [US3] Implement active state highlighting in `Header.tsx`.

---

## Phase 6: User Story 4 - Enhanced Footer with Social Links (Priority: P4)

**Goal**: Provide a well-organized footer with useful links and social media connections.

**Independent Test**: Scroll to footer on any page → verify all links work, social icons are present, and layout is responsive.

### Implementation for User Story 4

- [x] T016 [US4] Update `Footer.tsx` to include social media links.
- [x] T017 [US4] Ensure the footer has a responsive layout.
- [x] T018 [US4] Update branding in the footer to "RaceLab".

---

## Phase 7: User Story 5 - System Status Dashboard (Priority: P5)

**Goal**: Provide a dashboard to view system health and API status.

**Independent Test**: Navigate to /dashboard → verify system status indicators display correctly.

### Implementation for User Story 5

- [x] T019 [US5] Implement the dashboard UI in `src/app/(dashboard)/page.tsx`.
- [x] T020 [US5] Fetch and display overall system health status.
- [x] T021 [US5] Fetch and display individual service status for external APIs.
- [x] T022 [US5] Implement auto-refresh for the dashboard.
- [x] T023 [US5] Display the last-checked timestamp for each service.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T024 Update documentation in `docs/`
- [x] T025 Code cleanup and refactoring.
- [x] T026 Run `quickstart.md` validation.