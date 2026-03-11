# Tech Context — Talent Sync v2

## Stack overview
- **Backend framework**: Laravel (PHP)
- **Frontend framework**: React (JSX) via **Inertia.js**
- **Build tool**: Vite
- **CSS**: TailwindCSS
- **Database**: (Not explicitly confirmed here; typical Laravel setup—likely MySQL/Postgres/SQLite via `.env`)
- **Testing**: PHPUnit / Pest (both present in `tests/`)

## Key directories
- `app/` — Laravel application code (controllers, middleware, models, services, providers)
- `routes/` — route definitions (`web.php`, `auth.php`, etc.)
- `database/migrations/` — schema migrations
- `database/factories/`, `database/seeders/` — test/demo data generation
- `resources/js/` — Inertia React app, layouts, shared components
- `resources/css/` — Tailwind entry CSS
- `public/` — public assets and entry `index.php`

## Tooling & configuration files
- `composer.json` / `composer.lock` — PHP dependencies
- `package.json` / `package-lock.json` — Node dependencies
- `vite.config.js` — Vite configuration
- `tailwind.config.js`, `postcss.config.js` — styling toolchain
- `.env` / `.env.example` — environment configuration

## Local development (typical)
Backend:
- `php artisan serve` (or use Laravel Valet / Herd / Docker depending on environment)
Frontend:
- `npm install`
- `npm run dev` (Vite dev server)

Database:
- Configure `.env` then run:
  - `php artisan migrate`
  - Optional: `php artisan db:seed` (seeders exist, including `DemoSeeder`)

## Frontend conventions
- Inertia pages in `resources/js/Pages/**` named `Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx`
- Shared layouts in `resources/js/Layouts/**`
- Reusable UI components in `resources/js/Components/**` (includes a `ui/` primitives folder)

## Backend conventions
- Controllers under `app/Http/Controllers/**` (Admin controllers for domain areas)
- Form Requests used for validation (`app/Http/Requests/**`)
- Middleware used for org context/admin gating (`app/Http/Middleware/**`)
- Domain services used at least for Positions (`app/Services/PositionService.php`)

## Constraints / assumptions
- Multi-organization data separation is critical; any new queries/relationships should respect org scoping.
- Inertia dictates that server-side props shape page requirements; changes should be coordinated across controller + page.
