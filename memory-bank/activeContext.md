# Active Context — Talent Sync v2

## Current focus
Keep Memory Bank synced with repository reality (what exists vs. what has been verified), with emphasis on multi-organization scoping and Admin CRUD flows.

## What changed recently (this session)
No product code changes recorded. Memory Bank docs were reviewed for consistency.

## Current repo state (observed; not fully verified)
- Stack: Laravel + Inertia.js + React, Tailwind, Vite.
- Admin UI pages exist for: Departments, Positions, Grading Systems, Skills, Competencies, Employees, Company/Organization, Dashboard.
- Backend controllers exist for major admin domains under `app/Http/Controllers/Admin*Controller.php`.
- Org-scoping/authz middleware present:
  - `EnsureOrganizationContext`
  - `EnsureOrgAdmin`
- Positions use a service abstraction:
  - `app/Contracts/PositionServiceInterface.php`
  - `app/Services/PositionService.php`
- Migrations present for organizations/departments/positions/transitions/roles/grading systems/grades/skills and competency pivots, plus career paths.

## Decisions / assumptions recorded
- Multi-organization data separation is the core constraint; server-side authorization and query scoping must enforce it.
- Follow “Route → Controller → Inertia page” pattern for new UI.
- Prefer service-layer extraction for non-trivial domain logic (at least Positions follows this).

## Immediate next steps
1. Run baseline checks and record results:
   - `php artisan test`
   - `npm run build` (or `npm run lint` if present)
2. Spot-check org scoping + authorization in a few representative controllers (Departments/Positions/GradingSystems/Skills).
3. If failures are found, document:
   - concrete error output / failing test names
   - minimal reproduction steps
   - proposed fixes and file touch-points

## Notes
Memory Bank currently reflects “observed structure” more than “verified runtime behavior”; validation is pending.
