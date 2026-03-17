<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentSkillRequirement;
use App\Models\Position;
use App\Models\GradingSystem;
use App\Models\PositionCompetency;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminCompetencyController extends Controller
{
    private function assertOrgOwnership(Request $request, int $recordOrgId): void
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($recordOrgId === $orgId, 404);
    }

    private function validateGradeMatchesSystem(Request $request): void
    {
        $gradingSystemId = $request->input('grading_system_id');
        $gradeId = $request->input('grade_id');

        if ($gradingSystemId && $gradeId) {
            $valid = DB::table('grades')
                ->where('id', $gradeId)
                ->where('grading_system_id', $gradingSystemId)
                ->exists();

            if (! $valid) {
                throw ValidationException::withMessages([
                    'grade_id' => 'Selected grade does not belong to the selected grading system.',
                ]);
            }
        }
    }
    /**
     * UI: list departments (entry point)
     */
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('per_page', 15);

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('department_code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Competencies/Index', [
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * UI: show a department competencies + positions
     * GET /admin/competencies/departments/{department}
     */
    public function department(Request $request, Department $department): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($department->organization_id === $orgId, 404);

        $positionSearch = (string) $request->input('position_search', '');
        $positionPerPage = (int) $request->input('position_per_page', 10);

        $departmentCompetencies = DepartmentSkillRequirement::query()
            ->where('organization_id', $orgId)
            ->where('department_id', $department->id)
            ->with(['skill:id,name', 'gradingSystem:id,name', 'grade:id,label'])
            ->orderByDesc('active')
            ->orderBy('must_have', 'desc')
            ->get();

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->where('department_id', $department->id)
            ->when($positionSearch !== '', function ($query) use ($positionSearch) {
                $query->where(function ($q) use ($positionSearch) {
                    $q->where('name', 'like', "%{$positionSearch}%")
                        ->orWhere('level', 'like', "%{$positionSearch}%");
                });
            })
            ->orderBy('name')
            ->paginate($positionPerPage, ['id', 'name', 'level', 'department_id'])
            ->withQueryString();

        $applicableSkills = Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $q) use ($orgId) {
                // system-wide or owned by org
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $q) use ($department) {
                // applies to all departments OR tied to this department
                $q->where('applies_to_all_departments', true)
                    ->orWhere('department_id', $department->id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $gradingSystems = GradingSystem::query()
            ->where(function (Builder $q) use ($orgId) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->with(['grades' => function ($q) {
                $q->orderBy('order');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($system) {
                return [
                    'id' => $system->id,
                    'name' => $system->name,
                    'organization_id' => $system->organization_id,
                    'is_system_wide' => $system->organization_id === null,
                    'grades' => $system->grades->map(function ($g) {
                        return [
                            'id' => $g->id,
                            'name' => $g->label,
                            'label' => $g->label,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Competencies/Department', [
            'department' => $department->only(['id', 'name', 'department_code']),
            'departmentCompetencies' => $departmentCompetencies,
            'positions' => $positions,
            'applicableSkills' => $applicableSkills,
            'gradingSystems' => $gradingSystems,
            'filters' => [
                'position_search' => $positionSearch,
                'position_per_page' => $positionPerPage,
            ],
        ]);
    }

    /**
     * UI: show a position competencies + inherited department competencies
     * GET /admin/competencies/positions/{position}
     */
    public function position(Request $request, Position $position): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($position->organization_id === $orgId, 404);

        $positionCompetencies = PositionCompetency::query()
            ->where('organization_id', $orgId)
            ->where('position_id', $position->id)
            ->with(['skill:id,name', 'gradingSystem:id,name', 'grade:id,label'])
            ->orderByDesc('active')
            ->orderBy('must_have', 'desc')
            ->get();

        $inheritedDepartmentCompetencies = DepartmentSkillRequirement::query()
            ->where('organization_id', $orgId)
            ->where('department_id', $position->department_id)
            ->with(['skill:id,name', 'gradingSystem:id,name', 'grade:id,label'])
            ->orderByDesc('active')
            ->orderBy('must_have', 'desc')
            ->get();

        $skills = Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $q) use ($orgId) {
                // system-wide or owned by org
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $q) use ($position) {
                // applies to all departments OR tied to this position's department
                $q->where('applies_to_all_departments', true)
                    ->orWhere('department_id', $position->department_id);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $gradingSystems = GradingSystem::query()
            ->where(function (Builder $q) use ($orgId) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->with(['grades' => function ($q) {
                $q->orderBy('order');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($system) {
                return [
                    'id' => $system->id,
                    'name' => $system->name,
                    'organization_id' => $system->organization_id,
                    'is_system_wide' => $system->organization_id === null,
                    'grades' => $system->grades->map(function ($g) {
                        return [
                            'id' => $g->id,
                            'name' => $g->label,
                            'label' => $g->label,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Competencies/Position', [
            'position' => $position->only(['id', 'name', 'level', 'department_id']),
            'positionCompetencies' => $positionCompetencies,
            'inheritedDepartmentCompetencies' => $inheritedDepartmentCompetencies,
            'skills' => $skills,
            'gradingSystems' => $gradingSystems,
        ]);
    }

    /**
     * POST /admin/competencies/department
     */
    public function storeDepartment(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $departmentId = (int) $request->input('department_id');

        $data = $request->validate([
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')->where('organization_id', $orgId)],
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function ($q) use ($orgId, $departmentId) {
                    // NOTE: Laravel's DatabasePresenceVerifier passes an Illuminate\Database\Query\Builder here,
                    // not Eloquent\Builder, so don't typehint Builder.
                    $q->where(function ($ownedQ) use ($orgId) {
                        // system-wide or owned by org
                        $ownedQ->whereNull('organization_id')
                            ->orWhere('organization_id', $orgId);
                    });

                    $q->where(function ($deptQ) use ($departmentId) {
                        // applies to all departments OR tied to this department
                        $deptQ->where('applies_to_all_departments', true)
                            ->orWhere('department_id', $departmentId);
                    });
                }),
            ],
            'must_have' => ['required', 'boolean'],
            'grading_system_id' => ['required', 'integer', 'exists:grading_systems,id'],
            'grade_id' => [
                'required',
                'integer',
                Rule::exists('grades', 'id')->where(function ($q) use ($request) {
                    $q->where('grading_system_id', $request->input('grading_system_id'));
                }),
            ],
            'active' => ['required', 'boolean'],
        ]);

        DepartmentSkillRequirement::updateOrCreate(
            [
                'department_id' => $data['department_id'],
                'skill_id' => $data['skill_id'],
            ],
            [
                'organization_id' => $orgId,
                'must_have' => $data['must_have'],
                'grading_system_id' => $data['grading_system_id'] ?? null,
                'grade_id' => $data['grade_id'] ?? null,
                'active' => $data['active'],
                'added_by' => $request->user()?->id,
            ]
        );

        return back()->with('status', 'Department skill requirement saved.');
    }

    /**
     * POST /admin/competencies/position
     */
    public function storePosition(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $positionId = (int) $request->input('position_id');

        $data = $request->validate([
            'position_id' => ['required', 'integer', Rule::exists('positions', 'id')->where('organization_id', $orgId)],
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function ($q) use ($orgId, $positionId) {
                    // Allow global skills + org skills, and ensure skill applies to the position's department.
                    $position = Position::query()
                        ->where('organization_id', $orgId)
                        ->where('id', $positionId)
                        ->first(['id', 'department_id']);

                    abort_unless($position, 404);

                    $q->where(function ($ownedQ) use ($orgId) {
                        $ownedQ->whereNull('organization_id')
                            ->orWhere('organization_id', $orgId);
                    });

                    $q->where(function ($deptQ) use ($position) {
                        $deptQ->where('applies_to_all_departments', true)
                            ->orWhere('department_id', $position->department_id);
                    });
                }),
            ],
            'must_have' => ['required', 'boolean'],
            'grading_system_id' => ['required', 'integer', 'exists:grading_systems,id'],
            'grade_id' => [
                'required',
                'integer',
                Rule::exists('grades', 'id')->where(function ($q) use ($request) {
                    $q->where('grading_system_id', $request->input('grading_system_id'));
                }),
            ],
            'active' => ['required', 'boolean'],
        ]);

        PositionCompetency::updateOrCreate(
            [
                'position_id' => $data['position_id'],
                'skill_id' => $data['skill_id'],
            ],
            [
                'organization_id' => $orgId,
                'must_have' => $data['must_have'],
                'grading_system_id' => $data['grading_system_id'] ?? null,
                'grade_id' => $data['grade_id'] ?? null,
                'active' => $data['active'],
                'added_by' => $request->user()?->id,
            ]
        );

        return back()->with('status', 'Position competency saved.');
    }

    /**
     * PATCH /admin/competencies/department/{departmentCompetency}
     */
    public function updateDepartment(
        Request $request,
        DepartmentSkillRequirement $departmentCompetency
    ): RedirectResponse
    {
        $this->assertOrgOwnership($request, (int) $departmentCompetency->organization_id);

        $data = $request->validate([
            'must_have' => ['sometimes', 'boolean'],
            'grading_system_id' => ['sometimes', 'nullable', 'integer', 'exists:grading_systems,id'],
            'grade_id' => ['sometimes', 'nullable', 'integer', 'exists:grades,id'],
            'active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('grading_system_id', $data) && blank($data['grading_system_id'])) {
            $data['grading_system_id'] = null;
        }
        if (array_key_exists('grade_id', $data) && blank($data['grade_id'])) {
            $data['grade_id'] = null;
        }

        // ensure grade belongs to grading system if both provided (or if system unchanged but grade provided)
        $gradingSystemId = array_key_exists('grading_system_id', $data)
            ? $data['grading_system_id']
            : $departmentCompetency->grading_system_id;

        $gradeId = array_key_exists('grade_id', $data)
            ? $data['grade_id']
            : $departmentCompetency->grade_id;

        if ($gradingSystemId && $gradeId) {
            $valid = DB::table('grades')
                ->where('id', $gradeId)
                ->where('grading_system_id', $gradingSystemId)
                ->exists();

            if (! $valid) {
                throw ValidationException::withMessages([
                    'grade_id' => 'Selected grade does not belong to the selected grading system.',
                ]);
            }
        }

        $departmentCompetency->fill($data);
        $departmentCompetency->save();

        return back()->with('status', 'Department skill requirement updated.');
    }

    /**
     * PATCH /admin/competencies/position/{positionCompetency}
     */
    public function updatePosition(Request $request, PositionCompetency $positionCompetency): RedirectResponse
    {
        $this->assertOrgOwnership($request, (int) $positionCompetency->organization_id);

        $data = $request->validate([
            'must_have' => ['sometimes', 'boolean'],
            'grading_system_id' => ['sometimes', 'nullable', 'integer', 'exists:grading_systems,id'],
            'grade_id' => ['sometimes', 'nullable', 'integer', 'exists:grades,id'],
            'active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('grading_system_id', $data) && blank($data['grading_system_id'])) {
            $data['grading_system_id'] = null;
        }
        if (array_key_exists('grade_id', $data) && blank($data['grade_id'])) {
            $data['grade_id'] = null;
        }

        $gradingSystemId = array_key_exists('grading_system_id', $data)
            ? $data['grading_system_id']
            : $positionCompetency->grading_system_id;

        $gradeId = array_key_exists('grade_id', $data)
            ? $data['grade_id']
            : $positionCompetency->grade_id;

        if ($gradingSystemId && $gradeId) {
            $valid = DB::table('grades')
                ->where('id', $gradeId)
                ->where('grading_system_id', $gradingSystemId)
                ->exists();

            if (! $valid) {
                throw ValidationException::withMessages([
                    'grade_id' => 'Selected grade does not belong to the selected grading system.',
                ]);
            }
        }

        $positionCompetency->fill($data);
        $positionCompetency->save();

        return back()->with('status', 'Position competency updated.');
    }
}
