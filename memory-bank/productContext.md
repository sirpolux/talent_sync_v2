# Product Context — Talent Sync v2

## Why this project exists
Organizations need a centralized place to model and manage their internal structure (departments, positions, grades, skills, and career transitions) so HR and leadership can:
- Maintain a clear, up-to-date org structure
- Standardize roles and grading across teams
- Track position requirements (skills) and growth paths (transitions)
- Operate in a multi-organization environment with strict separation of data

## Problems it solves
- Eliminates scattered spreadsheets and inconsistent job/grade definitions
- Enforces organization context (reducing cross-org data leakage)
- Provides admin workflows to create/update/list/show core HR entities
- Gives a consistent UI for admin operations via an Inertia + React SPA-like experience

## Target users
- Organization admins / HR admins: manage company setup, departments, positions, grading, roles, skills.
- Employees/managers (future/possible): view org structure, roles, career paths (not assumed implemented yet).
- System admins (possible): oversee organizations and platform configuration.

## Key UX principles
- Fast CRUD workflows (list → create/edit → show)
- Clear navigation within Admin area (breadcrumbs, consistent layout)
- Strong scoping cues: the currently selected organization should be obvious
- Safe defaults: prevent accidental cross-organization edits

## Core user journeys (current)
- Authenticate → select organization context (if applicable) → enter Admin dashboard
- Manage departments (create/edit/list/show)
- Manage positions and relationships (role, grading system/grade, hierarchy/transition)
- Manage grading systems and grades
- Manage skills and assign to positions
- Manage company/organization profile

## Out of scope / future ideas
- Reporting/analytics dashboards beyond basic admin dashboard tiles
- Import/export (CSV) for bulk setup
- Permissions matrix beyond org-admin gating
- Integrations (Slack, HRIS, ATS)
