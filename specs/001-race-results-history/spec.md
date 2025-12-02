# Feature Specification: Race Results History

**Feature Branch**: `001-race-results-history`
**Created**: 2025-12-02
**Status**: Draft
**Input**: User description: "Race results history - Allow users to search and view historical race results for horse, cycle, and boat racing. Users should be able to filter by date range, race type, track location, and search for specific jockeys/riders. Display past race results with finishing positions, times, and dividend payouts."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Recent Results (Priority: P1)

A user wants to quickly see race results from today or recent days without complex filtering. They open the results page and immediately see the most recent completed races across all types, with the ability to scroll through results chronologically.

**Why this priority**: This is the core value proposition - users need immediate access to recent results without friction. Most users visit to check results from races that just finished.

**Independent Test**: Can be fully tested by navigating to the results page and verifying recent race results are displayed with finishing positions and payouts.

**Acceptance Scenarios**:

1. **Given** a user navigates to the results page, **When** the page loads, **Then** they see completed races from today (or most recent race day if no races today) sorted by most recent first
2. **Given** race results are displayed, **When** a user views a race card, **Then** they see race type icon, track name, race number, date/time, top 3 finishers with positions, and payout amounts
3. **Given** multiple races exist, **When** the user scrolls, **Then** additional results load progressively (pagination or infinite scroll)

---

### User Story 2 - Filter by Date and Race Type (Priority: P2)

A user wants to find results from a specific day or filter by their preferred race type (horse, cycle, or boat). They use filter controls to narrow down results to exactly what they're looking for.

**Why this priority**: Filtering is essential for users who follow specific race types or want to look up results from a particular date. This enables targeted research beyond just browsing recent results.

**Independent Test**: Can be fully tested by applying date range and race type filters and verifying only matching results appear.

**Acceptance Scenarios**:

1. **Given** a user is on the results page, **When** they select a date range (single date or range), **Then** only results from that period are displayed
2. **Given** a user selects a race type filter (horse, cycle, or boat), **When** the filter is applied, **Then** only results of that race type appear
3. **Given** multiple filters are applied, **When** the user views results, **Then** results match ALL selected filter criteria
4. **Given** a user has applied filters, **When** they clear filters, **Then** all recent results are shown again

---

### User Story 3 - Filter by Track Location (Priority: P3)

A user wants to see results from a specific track location (e.g., Seoul Racecourse, Gwangmyeong Velodrome). They select a track from the available options to view only races from that venue.

**Why this priority**: Track-specific filtering is important for local fans or those who follow specific venues, but is less commonly used than date/type filtering.

**Independent Test**: Can be fully tested by selecting a track filter and verifying only results from that track are displayed.

**Acceptance Scenarios**:

1. **Given** a user selects a track filter, **When** the filter is applied, **Then** only results from that track are shown
2. **Given** a user has selected a race type, **When** they view track filter options, **Then** only tracks relevant to that race type are shown (e.g., selecting "horse" shows Seoul/Busan/Jeju only)

---

### User Story 4 - Search by Jockey/Rider Name (Priority: P4)

A user wants to find race results featuring a specific jockey (horse racing) or rider (cycle/boat racing). They enter a name in the search field to find all races where that person participated.

**Why this priority**: Name search is a power-user feature for tracking specific athletes' performance history. Less common than browsing/filtering but valuable for dedicated followers.

**Independent Test**: Can be fully tested by entering a jockey/rider name and verifying results show only races featuring that person.

**Acceptance Scenarios**:

1. **Given** a user enters a jockey/rider name, **When** they submit the search, **Then** results show all races where that person participated
2. **Given** search results are displayed, **When** a user views a result, **Then** the searched person is highlighted in the results
3. **Given** a partial name is entered, **When** search is submitted, **Then** results include partial matches (e.g., "김" matches "김기수", "김선수")
4. **Given** no matches are found, **When** search completes, **Then** a clear "no results found" message is displayed with suggestions

---

### User Story 5 - View Detailed Race Result (Priority: P5)

A user wants to see complete details for a specific race, including all finishers, times, margins, and complete dividend information. They tap/click on a race card to expand and view full details.

**Why this priority**: Detailed view is important for analysis but secondary to the main browsing/filtering flow. Users first find races through other stories, then dive into details.

**Independent Test**: Can be fully tested by clicking on a race result card and verifying all detailed information is displayed.

**Acceptance Scenarios**:

1. **Given** a user clicks on a race result card, **When** the detail view opens, **Then** they see all finishers (not just top 3) with position, number, name, and time
2. **Given** the detail view is open, **When** viewing horse racing results, **Then** jockey and trainer names are displayed for each entry
3. **Given** the detail view is open, **When** viewing dividend section, **Then** all payout types are shown (win, place, quinella) with amounts

---

### Edge Cases

- What happens when no races occurred on the selected date? Display a clear message with suggestion to try another date or date range.
- What happens when external data source is unavailable? Show cached results if available with a notice about data freshness, or display an error message with retry option.
- What happens when searching for a jockey/rider with a very common name? Display results with additional context (track, date) to differentiate matches.
- How does the system handle races that were canceled? Display canceled races with appropriate visual indicator but exclude from default results view.
- What happens with partial data (e.g., missing dividend info)? Display available data with "unavailable" indicator for missing fields rather than hiding the entire result.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display completed race results with finishing positions (rank), entry numbers, and entry names
- **FR-002**: System MUST show dividend payout amounts for win, place, and quinella bets
- **FR-003**: System MUST allow filtering results by single date or date range (up to 90 days in the past)
- **FR-004**: System MUST allow filtering by race type (horse, cycle, boat) with multi-select capability
- **FR-005**: System MUST allow filtering by track location with options appropriate to the selected race type(s)
- **FR-006**: System MUST support searching by jockey/rider name with partial match capability
- **FR-007**: System MUST display race time/record for each finishing entry where available
- **FR-008**: System MUST indicate the race type visually using the established color scheme (horse=green, cycle=red, boat=blue)
- **FR-009**: System MUST paginate results to maintain performance (20 results per page default)
- **FR-010**: System MUST persist filter/search state in the URL for shareability and back-button support
- **FR-011**: System MUST display horse racing results with jockey and trainer information
- **FR-012**: System MUST handle missing or incomplete data gracefully without breaking the display

### Key Entities

- **Historical Race**: A completed race with all result data captured - includes race metadata (type, track, date, time, distance, grade) and list of finishers with their results
- **Race Result Entry**: A single participant's result in a race - includes finishing position, entry number, name, time/record, and for horse racing: jockey and trainer
- **Dividend**: Payout information for a race - includes win (단승), place (복승), and quinella (쌍승) amounts with the entry numbers involved
- **Track**: A venue where races occur - categorized by race type with Korean name and code (e.g., Seoul=1, Busan=2 for horse racing)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find results for a specific race within 30 seconds using filters
- **SC-002**: Results page loads initial content within 2 seconds on standard connections
- **SC-003**: Filter/search operations return results within 1 second
- **SC-004**: 90% of users successfully complete a search for specific race results on first attempt
- **SC-005**: System displays accurate results matching the official KSPO/KRA data sources
- **SC-006**: Mobile users can effectively browse and filter results (touch-friendly interface)
- **SC-007**: Feature supports result history for at least 90 days of past races

## Assumptions

- Historical race data is available through the existing KRA and KSPO public APIs (same endpoints used for live data but with past dates)
- The existing API rate limits (1,000 calls/day) are sufficient for historical queries with appropriate caching
- Users primarily access results on mobile devices, consistent with the project's mobile-first design principle
- Date range of 90 days provides sufficient history for typical user needs while managing data volume
- Search functionality works on Korean names as the primary use case
