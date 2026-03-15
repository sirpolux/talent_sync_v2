<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminHierarchyController extends Controller
{
    /**
     * List positions and their parent links (promotion hierarchy).
     */
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $orgLevelMin = (int) config('hierarchy.org_level_min', 4);

        $departmentId = $request->query('department_id');
        $departmentId = $departmentId !== null && $departmentId !== '' ? (int) $departmentId : null;

        $positionsQuery = Position::query()
            ->where('organization_id', $orgId)
            ->with(['department:id,name', 'parentPosition:id,name'])
            ->orderBy('name');

        if ($departmentId !== null) {
            $positionsQuery->where('department_id', $departmentId);
        }

        $positions = $positionsQuery
            ->get()
            ->map(function (Position $p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'level' => (int) $p->level,
                    'department_id' => $p->department_id,
                    'department_name' => $p->department?->name,
                    'parent_position_id' => $p->parent_position_id,
                    'parent_position_name' => $p->parentPosition?->name,
                ];
            })
            ->values();

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        return Inertia::render('Admin/Hierarchies/Index', [
            'positions' => $positions,
            'departments' => $departments,
            'filters' => [
                'department_id' => $departmentId,
            ],
            'orgLevelMin' => $orgLevelMin,
            'orgParentRequiresHigherLevel' => (bool) config('hierarchy.org_parent_requires_higher_level', true),
        ]);
    }

    /**
     * Update a position's parent_position_id (promotion hierarchy parent).
     * Resource route uses {hierarchy}, but we're treating it as a Position id.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $orgLevelMin = (int) config('hierarchy.org_level_min', 4);
        $orgParentRequiresHigherLevel = (bool) config('hierarchy.org_parent_requires_higher_level', true);

        /** @var Position $position */
        $position = Position::query()
            ->where('organization_id', $orgId)
            ->findOrFail($id);

        $data = $request->validate([
            'parent_position_id' => [
                'nullable',
                'integer',
                Rule::exists('positions', 'id')->where('organization_id', $orgId),
            ],
        ]);

        $parentId = $data['parent_position_id'] ?? null;

        if ($parentId !== null && (int) $parentId === (int) $position->id) {
            throw ValidationException::withMessages([
                'parent_position_id' => 'A position cannot be its own parent.',
            ]);
        }

        $parent = null;
        if ($parentId !== null) {
            /** @var Position $parent */
            $parent = Position::query()
                ->where('organization_id', $orgId)
                ->findOrFail($parentId);

            $positionIsOrgLevel = (int) $position->level >= $orgLevelMin;
            $parentIsOrgLevel = (int) $parent->level >= $orgLevelMin;

            // Rule 1: org-level positions can only parent to org-level positions
            if ($positionIsOrgLevel && ! $parentIsOrgLevel) {
                throw ValidationException::withMessages([
                    'parent_position_id' => 'Org-level positions can only report in the hierarchy to org-level positions.',
                ]);
            }

            // Rule 2: (recommended) org-level parent must be strictly higher
            if ($positionIsOrgLevel && $parentIsOrgLevel && $orgParentRequiresHigherLevel) {
                if ((int) $parent->level <= (int) $position->level) {
                    throw ValidationException::withMessages([
                        'parent_position_id' => 'Org-level positions must have a higher-level org parent.',
                    ]);
                }
            }

            // Rule 3: non-org-level positions cannot select a non-org-level parent in another department
            if (! $positionIsOrgLevel && ! $parentIsOrgLevel) {
                if ((int) $position->department_id !== (int) $parent->department_id) {
                    throw ValidationException::withMessages([
                        'parent_position_id' => 'Department-level positions must select a parent within the same department.',
                    ]);
                }
            }

            // Prevent cycles: walk upward from the selected parent and ensure we never hit the current node.
            $current = $parent;
            while ($current) {
                if ((int) $current->id === (int) $position->id) {
                    throw ValidationException::withMessages([
                        'parent_position_id' => 'Invalid parent: this would create a cycle in the hierarchy.',
                    ]);
                }

                if (! $current->parent_position_id) {
                    break;
                }

                $current = Position::query()
                    ->where('organization_id', $orgId)
                    ->find($current->parent_position_id);
            }
        }

        $position->parent_position_id = $parentId;
        $position->save();

        return back()->with('status', 'Hierarchy updated.');
    }

    // Not used for the initial hierarchy flow
    public function create(): Response
    {
        return Inertia::render('Admin/Hierarchies/Create');
    }

    public function store(Request $request)
    {
        abort(404);
    }

    public function show($id): Response
    {
        return Inertia::render('Admin/Hierarchies/Show');
    }

    public function edit($id): Response
    {
        return Inertia::render('Admin/Hierarchies/Edit');
    }

    public function destroy($id)
    {
        abort(404);
    }
}
