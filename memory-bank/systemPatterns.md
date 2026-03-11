# System Patterns — Talent Sync v2

## High-level architecture
- **Backend**: Laravel application providing routing, controllers, middleware, request validation, models, services, and database migrations.
- **Frontend**: Inertia.js + React pages under `resources/js/Pages/**`, rendered via Laravel routes/controllers.
- **Styling**: TailwindCSS (via `resources/css/app.css`, `tailwind.config.js`) and shared UI components (`resources/js/Components/**`).
- **Build**: Vite for asset bundling (`vite.config.js`, `resources/js/app.jsx`).

## Routing → Controller → Inertia Page pattern
Common pattern:
1. Route defined in `routes/web.php`
2. Controller action in `app/Http/Controllers/*Controller.php`
3. Returns `Inertia::render('...')` for a React page (e.g., `resources/js/Pages/Admin/...`)

Admin domain appears split by entity:
- Departments: `AdminDepartmentController`
- Positions: `AdminPositionController`
- Grading systems: `AdminGradingSystemController`
- Roles: `AdminRoleController`
- Transitions: `AdminTransitionController`
- Organization/company: `AdminOrganizationController`
- Dashboard: `DashboardController` / `resources/js/Pages/Admin/Dashboard.jsx`

## Organization context scoping
- Presence of middleware suggests strong org scoping:
  - `EnsureOrganizationContext` (ensures an org is selected/available)
  - `EnsureOrgAdmin` (gates admin access)
- UI includes an org selection page: `resources/js/Pages/Org/Select.jsx`
- Controllers should consistently:
  - Filter queries by current organization (often via user/org context)
  - Prevent cross-org access on show/edit/update/destroy

## Layering / domain services
Positions appear to use a service abstraction:
- `app/Contracts/PositionServiceInterface.php`
- `app/Services/PositionService.php`
Pattern:
- Controllers delegate business logic to services (useful for testability and keeping controllers thin).
- Similar patterns may exist for other domains but are not confirmed yet.

## Data modeling patterns (from migrations/models list)
Key entities:
- `Organization`, `Department`, `Position`, `Role`
- `GradingSystem`, `Grade`
- `Skill`, `PositionSkill` (pivot)
- `PositionTransition` (relationships between positions)

Typical relationship expectations:
- Organization has many departments/positions/grading systems/skills/roles
- Department belongs to organization; has many positions
- Position belongs to organization and department; may reference role and grading system/grade
- PositionSkill is many-to-many between positions and skills
- PositionTransition models allowed transitions (from_position_id → to_position_id)

## Frontend UI composition patterns
- Layouts:
  - `resources/js/Layouts/AdminLayout.jsx`
  - `resources/js/Layouts/AuthenticatedLayout.jsx`
  - `resources/js/Layouts/GuestLayout.jsx`
- Common components:
  - `resources/js/Components/Breadcrumbs.jsx`
  - UI primitives like `resources/js/Components/ui/button.jsx`
- Pages organized by feature folder: `resources/js/Pages/Admin/<Feature>/...`

## Conventions
- Feature folders contain `Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx` pages.
- Tables often extracted into a component (e.g., `PositionsTable.jsx`).
- Middleware + controller naming indicates a standard Laravel resource-controller style.

## Security & access patterns (expected)
- Auth middleware for protected routes.
- Org admin middleware for Admin section.
- Server-side validation via Form Request classes (e.g., `StorePositionRequest`, `UpdatePositionRequest`).
