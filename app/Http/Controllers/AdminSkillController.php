<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentMinimalResource;
use App\Http\Resources\SkillMininalResource;
use App\Models\Department;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSkillController extends Controller
{
    public function index(): Response
    {
        $currentOrgId = auth()->user()?->current_organization_id;

        $skills = Skill::query()
            ->where(function ($q) use ($currentOrgId) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $currentOrgId);
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Skills/Index', [
            'skills' => SkillMininalResource::collection($skills),
        ]);
    }

    public function create(): Response
    {
        $departments = Department::query()
            ->where('organization_id', auth()->user()?->current_organization_id)
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

        $currentOrgId = auth()->user()?->current_organization_id;

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

    public function show($id): Response
    {
        return Inertia::render('Admin/Skills/Show');
    }

    public function edit($id): Response
    {
        return Inertia::render('Admin/Skills/Edit');
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update logic
    }

    public function destroy($id)
    {
        // TODO: Implement destroy logic
    }
}
