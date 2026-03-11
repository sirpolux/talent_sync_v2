<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentMinimalResource;
use App\Http\Resources\SkillMininalResource;
use App\Http\Resources\SkillResource;
use App\Models\Department;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSkillController extends Controller
{
    public function index(Request $request): Response
    {
        $currentOrgId = (int) $request->session()->get('current_organization_id');

        $search = trim((string) $request->get('search', ''));
        $sort = (string) $request->get('sort', 'name');
        $direction = strtolower((string) $request->get('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 50, 100], true) ? $perPage : 10;

        $allowedSorts = ['name', 'type', 'category', 'is_active', 'scope'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'name';
        }

        $skillsQuery = Skill::query()
            ->where(function ($q) use ($currentOrgId) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $currentOrgId);
            })
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        // "scope" is computed: system (null org) vs org
        if ($sort === 'scope') {
            $skillsQuery->orderByRaw('CASE WHEN organization_id IS NULL THEN 0 ELSE 1 END ' . $direction);
            $skillsQuery->orderBy('name', 'asc');
        } else {
            $skillsQuery->orderBy($sort, $direction);
        }

        $skills = $skillsQuery
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Skills/Index', [
            'skills' => SkillMininalResource::collection($skills),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

/**
 * Show the form for creating a new skill.
 *
 * @return \Inertia\Response
 */
    public function create(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Skills/Create', [
            'departments' => DepartmentMinimalResource::collection($departments),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:skill,course,degree'],
            'category' => ['required', 'in:Soft Skills,Technical,Educational'],
            'applies_to_all_departments' => ['required', 'boolean'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        $currentOrgId = (int) $request->session()->get('current_organization_id');

        // Enforce org-scoped creation (global skills are seeded/system-managed only)
        $validated['organization_id'] = $currentOrgId;

        // Ensure department belongs to current org (prevents cross-org IDs)
        if (!empty($validated['department_id'])) {
            $deptOk = Department::query()
                ->where('id', $validated['department_id'])
                ->where('organization_id', $currentOrgId)
                ->exists();

            if (!$deptOk) {
                return back()->withErrors([
                    'department_id' => 'Invalid department for current organization.',
                ]);
            }
        }

        // Enforce applicability invariant
        if ($validated['applies_to_all_departments']) {
            $validated['department_id'] = null;
        } else {
            if (empty($validated['department_id'])) {
                return back()->withErrors([
                    'department_id' => 'Department is required when not applying to all departments.',
                ]);
            }
        }

        $validated['added_by'] = auth()->id();

        Skill::create($validated);

        return redirect()
            ->route('admin.skills.index')
            ->with('status', 'Skill created successfully.');
    }

    public function show(Request $request, Skill $skill): Response
    {

        $currentOrgId = (int) $request->session()->get('current_organization_id');

        abort_unless(
            $skill->organization_id === null || (int) $skill->organization_id === $currentOrgId,
            404
        );

        return Inertia::render('Admin/Skills/Show', [
            'skill' => new SkillResource($skill),
        ]);
    }

    public function edit(Request $request, Skill $skill): Response
    {

        $currentOrgId = (int) $request->session()->get('current_organization_id');

        abort_unless((int) $skill->organization_id === $currentOrgId, 404);

        $orgId = $currentOrgId;
        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Skills/Edit', [
            'skill' => new SkillResource($skill->loadMissing('department')),
            'departments' => DepartmentMinimalResource::collection($departments),
        ]);
    }

    public function update(Request $request, Skill $skill): RedirectResponse
    {
        $currentOrgId = (int) $request->session()->get('current_organization_id');

        // Only org-scoped skills should be editable/toggleable in this admin flow
        abort_unless((int) $skill->organization_id === $currentOrgId, 404);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', 'required', 'in:skill,course,degree'],
            'category' => ['sometimes', 'required', 'in:Soft Skills,Technical,Educational'],
            'applies_to_all_departments' => ['sometimes', 'required', 'boolean'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ]);

        // Ensure department belongs to current org (prevents cross-org IDs)
        if (!empty($validated['department_id'])) {
            $deptOk = Department::query()
                ->where('id', $validated['department_id'])
                ->where('organization_id', $currentOrgId)
                ->exists();

            if (!$deptOk) {
                return back()->withErrors([
                    'department_id' => 'Invalid department for current organization.',
                ]);
            }
        }

        // Enforce applicability invariant when those fields are in play
        $incomingApplies = array_key_exists('applies_to_all_departments', $validated)
            ? (bool) $validated['applies_to_all_departments']
            : (bool) $skill->applies_to_all_departments;

        $incomingDeptId = array_key_exists('department_id', $validated)
            ? $validated['department_id']
            : $skill->department_id;

        if ($incomingApplies) {
            $validated['department_id'] = null;
        } else {
            if (empty($incomingDeptId)) {
                return back()->withErrors([
                    'department_id' => 'Department is required when not applying to all departments.',
                ]);
            }
        }

        $skill->update($validated);

        return redirect()
            ->route('admin.skills.show', $skill->id)
            ->with('status', 'Skill updated successfully.');
    }

    public function destroy($id)
    {
        // TODO: Implement destroy logic
    }
}
