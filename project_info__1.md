# Staff Career Path Review — Missing Position-Gap Coverage

## Summary
I re-reviewed the staff career path flow with special attention to `/staff/career-paths/4`. The main issue is now clearer: the backend *does* calculate position-related gaps, but the employee-facing page is only exposing them partially and inconsistently.

There are two separate “position” concepts in this flow:
1. **Current position requirements** — what the employee must satisfy while in their current job.
2. **Next position requirements** — what the employee would need for the next step in the selected career path.

The current implementation returns both summaries, but the UI only renders a gap list for the current position, while the “Next position skills” card is summary-only. That makes it look as if only departmental gaps were considered, even though the controller and service are computing more than that.

## What the `/staff/career-paths/{careerPath}` endpoint is actually doing
In `StaffCareerPathController@show`:

- The requested career path is loaded and rendered for display.
- The employee’s **active selection** is fetched separately.
- Promotion eligibility is **not computed for the viewed path**; it is computed only for the employee’s **active selected career path**:

```php
$selectedCareerPath = $activeSelection?->careerPath;

$promotionEligibility = $selectedCareerPath
    ? $eligibilityService->evaluate($organizationUser, $selectedCareerPath->loadMissing(['steps.toPosition.skills']))
    : null;
```

This is the key architectural detail.

So on `/staff/career-paths/4`:
- the page may be showing career path `4`,
- but the eligibility payload may belong to a different active path,
- and the UI now tries to explain this by showing a “selected path vs viewed path” message.

## Why the position gap seems missing
The backend service `PromotionEligibilityService` returns:

- `department_skill_summary`
- `current_position_skill_summary`
- `next_position_skill_summary`
- `department_skill_gaps`
- `position_skill_gaps`
- `current_position_skill_gaps`
- `next_position_skill_gaps`
- `missing_requirements`

### Important gap in the payload
`missing_requirements` only includes:
- `department`
- `position`
- `tenure`

It does **not** include `next_position` gaps.

That means:
- the service computes next-step gaps,
- but the UI has no simple `missing_requirements.next_position` bucket to display,
- and the current staff show page never renders `next_position_skill_gaps` at all.

### Result
The page visually emphasizes:
- department gaps
- current position gaps
- tenure gap

But not:
- next position gaps

So from an employee’s perspective, it can absolutely look like only departmental gaps were identified.

## Current behavior of the staff show page
In `resources/js/Pages/Staff/CareerPaths/Show.jsx`:

### What it shows
When the viewed path matches the active selection:
- Department gaps
- Current position gaps
- Tenure status
- Readiness message

### What it does not show
- It does **not** render `next_position_skill_gaps`
- It does **not** display a dedicated “next role requirements” list
- It also hides most eligibility detail when the viewed path is not the active one

So the page is only partially using the service’s output.

## Root cause of the confusing “only departmental gap” impression
There are two causes working together:

### 1. Eligibility is tied to the active selection, not the viewed path
The controller evaluates only the active career path, not the currently opened one.

That means if a staff member opens `/staff/career-paths/4` and path 4 is *not* their active selection, the eligibility block is essentially talking about another path.

### 2. The UI does not surface next-position gaps
Even when the active selection is the viewed path, the UI still only renders:
- department gaps
- current position gaps
- tenure

The “next position” analysis exists in the service but is unused in the UI.

## Non-obvious design implications
This codebase is treating career path selection as a locked employee choice:
- staff can select a path once,
- if a different one is already active, the controller redirects and blocks switching,
- admins control changes.

This means the staff-facing “show” page is really a **read-only explanation page for the active path**, not a general comparison page for arbitrary career paths.

That design makes sense, but it also means the page should be very explicit about:
- whether the current page is the active selection,
- whether the displayed readiness data applies to this path or another path,
- and what the “next position” requirements are.

## Concrete gap list
### Backend
- `PromotionEligibilityService` computes `next_position_skill_gaps`, but does not include them under `missing_requirements`.
- `StaffCareerPathController@show` evaluates eligibility for the active path only, not the viewed path.

### Frontend
- `Show.jsx` only renders current-position and department missing requirements.
- `Show.jsx` shows `next_position_skill_summary` but never shows `next_position_skill_gaps`.
- The page wording may still imply the eligibility data belongs to the opened path, even when it belongs to the active selection.

## Suggested reading order
If you want to inspect this further, the best path is:

1. `app/Http/Controllers/StaffCareerPathController.php`
2. `app/Services/PromotionEligibilityService.php`
3. `resources/js/Pages/Staff/CareerPaths/Show.jsx`
4. `app/Models/CareerPathStep.php`
5. `app/Models/Position.php`

## Bottom line
You were right to question it: the current employee-facing page does **not** fully expose position-gap information. The backend calculates both current-position and next-position gaps, but the UI only surfaces the current-position side clearly, and the eligibility data is tied to the employee’s active selected path rather than the viewed career path.