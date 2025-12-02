<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version change: 0.0.0 → 1.0.0 (Initial ratification)

  Modified principles: N/A (Initial creation)

  Added sections:
  - Core Principles (5 principles)
  - Development Standards
  - Quality Gates
  - Governance

  Removed sections: N/A

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section aligns)
  - .specify/templates/spec-template.md ✅ (User scenarios/testing focus aligns)
  - .specify/templates/tasks-template.md ✅ (TDD workflow aligns)
  - .specify/templates/checklist-template.md ✅ (No conflicts)
  - .specify/templates/agent-file-template.md ✅ (No conflicts)

  Follow-up TODOs: None
  ============================================================================
-->

# KRace Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All code changes MUST follow the TDD cycle without exception:

1. **Red**: Write a failing test that defines the expected behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Improve code structure while keeping tests green

**Rationale**: TDD ensures code correctness, enables safe refactoring, and serves as living documentation. The KRace platform handles real-time racing data where reliability is critical.

**Enforcement**:
- No production code without corresponding tests
- All tests MUST pass before committing
- Test coverage targets: Unit 80%, Integration 60%, E2E Critical Paths 100%

### II. Structural-Behavioral Separation

Structure changes and behavioral changes MUST never be mixed in a single commit:

- **Structural Changes**: Renames, file moves, method extraction, dependency reorganization
- **Behavioral Changes**: New features, bug fixes, API modifications, test additions

**Commit Convention**:
- `chore(structure):` for structural changes only
- `feat(behavior):` or `fix(behavior):` for behavioral changes

**Rationale**: Separation makes code review effective, enables safe rollbacks, and maintains clear change history for debugging production issues.

### III. Simplicity First

Solutions MUST use the simplest approach that meets requirements:

- Functions MUST be 10-20 lines maximum, following Single Responsibility Principle
- No premature abstraction - implement only what is currently needed (YAGNI)
- Direct implementations over patterns unless complexity is justified
- Three similar lines of code is preferred over a premature abstraction

**Rationale**: The KRace platform prioritizes fast response times and maintainability. Complex abstractions slow development and increase bug surface area.

**Enforcement**: Complexity beyond minimal requirements MUST be justified in plan.md Complexity Tracking section.

### IV. Clear Data Flow

Data transformations MUST follow a predictable, traceable path:

```
External APIs (KRA, KSPO) → lib/api.ts → lib/api-helpers/mappers.ts → API Routes → Components
```

- All external data MUST pass through mapper functions
- API responses MUST follow the standard format:
  ```typescript
  { success: boolean, data?: T[], error?: { code, message }, timestamp: ISO string }
  ```
- No hidden dependencies - all external dependencies MUST be explicit through parameters or injection

**Rationale**: Racing data flows through multiple transformations. Clear data flow enables debugging, testing, and prevents data corruption in the user-facing application.

### V. Mobile-First Responsive Design

UI implementation MUST prioritize mobile users:

- Mobile viewport MUST be the primary design target
- Responsive breakpoints: mobile (default), tablet (md:), desktop (lg:)
- Race type colors MUST be consistent: Horse (#2d5a27 green), Cycle (#dc2626 red), Boat (#0369a1 blue)
- Performance: Pages MUST load within 3 seconds on 3G networks

**Rationale**: Most users access racing information on mobile devices during events. Poor mobile experience directly impacts user engagement and platform viability.

## Development Standards

### Code Quality Requirements

- ESLint validation MUST pass with zero errors
- TypeScript strict mode enabled - no `any` types without explicit justification
- All public functions MUST have explicit return types
- Error handling at system boundaries (user input, external APIs) is mandatory
- Internal code may trust framework guarantees without defensive checks

### Testing Architecture

- **UI Tests** (`jest.config.ui.js`): jsdom environment for React components
- **API Tests** (`jest.config.api.js`): Node environment for route handlers
- **E2E Tests** (`playwright.config.ts`): Multi-browser including mobile viewports

### Commit Discipline

Every commit MUST satisfy:
1. All tests green
2. Linter/formatter checks pass
3. Contains exactly one logical unit of change
4. Structure and behavior never mixed

## Quality Gates

All PRs and code reviews MUST verify compliance with:

- [ ] TDD cycle followed (evidence of red-green-refactor)
- [ ] Structural and behavioral changes in separate commits
- [ ] No unnecessary complexity beyond requirements
- [ ] Data flow follows established pattern
- [ ] Mobile-first responsive implementation verified
- [ ] All tests pass including E2E critical paths

## Governance

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Amendments MUST be reviewed for impact on existing code and workflows
3. Version increment follows semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements
4. Migration plan required for breaking changes

### Compliance Review

- All development agents (AI or human) MUST read this constitution before contributing
- Violations MUST be corrected before merge
- Repeated violations warrant process review and potential constitution amendment

### Guidance Reference

Runtime development guidance is maintained in `CLAUDE.md` at the repository root. This constitution takes precedence in case of conflicts.

**Version**: 1.0.0 | **Ratified**: 2025-12-02 | **Last Amended**: 2025-12-02
