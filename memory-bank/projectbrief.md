# Project Brief — Talent Sync v2

## What this project is
A web application for managing HR/people operations (organizations, departments, positions, grading systems/grades, skills, roles, transitions), with an admin area and organization context selection. Built with Laravel (PHP) + Inertia.js + React on the frontend.

## Primary goals
- Provide an internal admin portal to manage organizational structures:
  - Organizations and company profile
  - Departments
  - Positions (including hierarchy/role/grading)
  - Grading systems and grades
  - Skills and position-skill relationships
  - Position transitions (career paths)
  - Roles (and role association on positions)
- Ensure organization context is enforced for org-scoped resources.
- Provide an authenticated user experience with role/org admin gating.

## Non-goals (current scope assumptions)
- Public-facing marketing site beyond basic landing sections.
- Complex multi-tenant billing/subscriptions.
- External integrations (ATS/HRIS) unless explicitly added later.

## Users & roles (assumed from codebase)
- Authenticated users (Laravel auth).
- Organization admins (middleware indicates org admin gating).
- Possibly system-level admins (presence of admin controllers).

## Success criteria
- Admin can create/update/list/show org structures (departments/positions/grades/skills etc.) within the selected organization context.
- Routes and authorization prevent cross-organization access.
- UI pages render reliably via Inertia/React and navigation patterns are consistent.
- Database schema supports relationships and constraints needed by the domain.

## Repository pointers
- Backend (Laravel): `app/`, `routes/`, `database/`
- Frontend (Inertia/React): `resources/js/`, `resources/css/`
- Build tooling: `vite.config.js`, `package.json`, `tailwind.config.js`
