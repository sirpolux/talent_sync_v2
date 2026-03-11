# Active Context — Talent Sync v2

## Current focus
Establish a baseline Memory Bank for this repository so future sessions can quickly resume work with consistent context.

## What changed recently (this session)
Created initial Memory Bank files:
- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/techContext.md`

## Current repo state (observed)
- Admin area appears implemented with Inertia + React pages for:
  - Departments
  - Positions
  - Grading Systems
  - Company/Organization profile
  - Dashboard
- Backend contains corresponding controllers and middleware for:
  - Organization context enforcement
  - Org admin gating
- Database migrations exist for key HR entities (organizations, departments, positions, transitions, roles, grading systems, grades, skills, pivots).

## Decisions / assumptions recorded
- The app is multi-organization; org scoping is a critical constraint.
- Controllers + middleware are expected to enforce org selection/admin access.
- Positions likely use a service layer abstraction (contract + implementation), which is a pattern to follow for business logic.

## Next steps (recommended)
1. Add `memory-bank/progress.md` to capture what is known working vs. unknown.
2. Optionally validate assumptions by scanning key files:
   - `routes/web.php`
   - `app/Http/Middleware/EnsureOrganizationContext.php`, `EnsureOrgAdmin.php`
   - Representative controllers (Departments/Positions/GradingSystems)
3. Run baseline checks (optional):
   - PHP: `php artisan test`
   - JS: `npm run build` or `npm run lint` (if configured)

## Notes
No explicit user feature request was provided beyond creating the Memory Bank core files.
