<?php

namespace App\Http\Controllers;

use App\Models\DepartmentSkillRequirement;
use App\Models\EmployeeSkillAllocation;
use App\Models\EmployeeSkillEvidence;
use App\Models\Grade;
use App\Models\GradingSystem;
use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\PositionCompetency;
use App\Services\CloudinaryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminEmployeeSkillController extends Controller
{
    public function index(Request $request, OrganizationUser $employee): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);

        $allocations = EmployeeSkillAllocation::query()
            ->where('organization_user_id', $employee->id)
            ->with([
                'skill:id,name',
                'evidences' => function ($q) {
                    $q->latest();
                },
                'createdBy:id,name',
                'verifiedBy:id,name',
            ])
            ->latest()
            ->get();

        $availableSkills = Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $q) use ($orgId) {
                $q->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $gradingSystems = GradingSystem::query()
            ->where(function ($q) use ($orgId) {
                $q->whereNull('organization_id')->orWhere('organization_id', $orgId);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'organization_id']);

        $grades = Grade::query()
            ->whereIn('grading_system_id', $gradingSystems->pluck('id'))
            ->orderBy('label')
            ->get(['id', 'grading_system_id', 'label']);

        $gradesBySystem = $grades->groupBy('grading_system_id')->map(function ($items) {
            return $items->map(function ($g) {
                return ['id' => $g->id, 'name' => $g->label];
            })->values();
        });

        // Build skill rules for locking grading system (higher priority) then department.
        // Grade is NOT locked; we may provide a recommended grade.
        $skillRules = [];

        if (!empty($employee->position_id)) {
            $positionRules = PositionCompetency::query()
                ->where('organization_id', $orgId)
                ->where('position_id', $employee->position_id)
                ->where('active', true)
                ->get(['skill_id', 'grading_system_id', 'grade_id']);

            foreach ($positionRules as $r) {
                $skillRules[(int) $r->skill_id] = [
                    'source' => 'position',
                    'locked_grading_system' => true,
                    'grading_system_id' => $r->grading_system_id,
                    'recommended_grade_id' => $r->grade_id,
                ];
            }
        }

        if (!empty($employee->department_id)) {
            $deptRules = DepartmentSkillRequirement::query()
                ->where('organization_id', $orgId)
                ->where('department_id', $employee->department_id)
                ->where('active', true)
                ->get(['skill_id', 'grading_system_id', 'grade_id']);

            foreach ($deptRules as $r) {
                // only set if position rule wasn't set
                if (!array_key_exists((int) $r->skill_id, $skillRules)) {
                    $skillRules[(int) $r->skill_id] = [
                        'source' => 'department',
                        'locked_grading_system' => true,
                        'grading_system_id' => $r->grading_system_id,
                        'recommended_grade_id' => $r->grade_id,
                    ];
                }
            }
        }

        return Inertia::render('Admin/Employees/Skills/Index', [
            'employee' => [
                'id' => $employee->id,
                'user_id' => $employee->user_id,
                'name' => $employee->user?->name,
                'email' => $employee->user?->email,
                'department_id' => $employee->department_id,
                'department_name' => $employee->department?->name,
                'position_id' => $employee->position_id,
                'position_name' => $employee->position?->name,
            ],
            'allocations' => $allocations,
            'availableSkills' => $availableSkills,
            'gradingSystems' => $gradingSystems,
            'gradesBySystem' => $gradesBySystem,
            'skillRules' => $skillRules,
        ]);
    }

    public function show(Request $request, OrganizationUser $employee, EmployeeSkillAllocation $allocation): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);
        abort_unless((int) $allocation->organization_user_id === (int) $employee->id, 404);

        $allocation->load([
            'skill:id,name',
            'createdBy:id,name',
            'verifiedBy:id,name',
            'evidences' => function ($q) {
                $q->latest();
            },
        ]);

        return Inertia::render('Admin/Employees/Skills/Show', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->user?->name,
                'email' => $employee->user?->email,
            ],
            'allocation' => $allocation,
        ]);
    }

    public function store(Request $request, OrganizationUser $employee): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);

        $data = $request->validate([
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function ($q) use ($orgId) {
                    $q->where('is_active', true)
                        ->where(function ($ownedQ) use ($orgId) {
                            $ownedQ->whereNull('organization_id')
                                ->orWhere('organization_id', $orgId);
                        });
                }),
            ],
            'grading_system_id' => ['nullable', 'integer', 'exists:grading_systems,id'],
            'grade_id' => ['nullable', 'integer', 'exists:grades,id'],
        ]);

        $skillId = (int) $data['skill_id'];

        // Determine mapping rule: position overrides department.
        // When mapped, lock grading_system_id, but allow admin to select grade_id.
        $lockedRule = null;

        if (!empty($employee->position_id)) {
            $lockedRule = PositionCompetency::query()
                ->where('organization_id', $orgId)
                ->where('position_id', $employee->position_id)
                ->where('skill_id', $skillId)
                ->where('active', true)
                ->first(['grading_system_id', 'grade_id']);
            if ($lockedRule) {
                $data['grading_system_id'] = $lockedRule->grading_system_id;
            }
        }

        if (!$lockedRule && !empty($employee->department_id)) {
            $lockedRule = DepartmentSkillRequirement::query()
                ->where('organization_id', $orgId)
                ->where('department_id', $employee->department_id)
                ->where('skill_id', $skillId)
                ->where('active', true)
                ->first(['grading_system_id', 'grade_id']);

            if ($lockedRule) {
                $data['grading_system_id'] = $lockedRule->grading_system_id;
            }
        }

        // Validate grading system scope if manual
        if (!$lockedRule) {
            // grading system must be global or org-scoped
            if (!empty($data['grading_system_id'])) {
                $gsOk = GradingSystem::query()
                    ->whereKey((int) $data['grading_system_id'])
                    ->where(function ($q) use ($orgId) {
                        $q->whereNull('organization_id')->orWhere('organization_id', $orgId);
                    })
                    ->exists();

                if (!$gsOk) {
                    return back()->withErrors(['grading_system_id' => 'Invalid grading system for this organization.']);
                }
            }

            // grade must belong to grading system
            if (!empty($data['grade_id']) && !empty($data['grading_system_id'])) {
                $gradeOk = Grade::query()
                    ->whereKey((int) $data['grade_id'])
                    ->where('grading_system_id', (int) $data['grading_system_id'])
                    ->exists();

                if (!$gradeOk) {
                    return back()->withErrors(['grade_id' => 'Selected grade does not belong to the selected grading system.']);
                }
            }
        } else {
            // If mapped, admin can choose grade, but it must belong to the locked grading system.
            if (!empty($data['grade_id']) && !empty($data['grading_system_id'])) {
                $gradeOk = Grade::query()
                    ->whereKey((int) $data['grade_id'])
                    ->where('grading_system_id', (int) $data['grading_system_id'])
                    ->exists();

                if (!$gradeOk) {
                    return back()->withErrors(['grade_id' => 'Selected grade does not belong to the required grading system.']);
                }
            }
        }

        $allocation = EmployeeSkillAllocation::firstOrCreate(
            [
                'organization_user_id' => $employee->id,
                'skill_id' => $skillId,
            ],
            [
                'added_via' => 'admin',
                'created_by' => $request->user()?->id,
                'grading_system_id' => $data['grading_system_id'] ?? null,
                'grade_id' => $data['grade_id'] ?? null,
                // keep pending until evidence exists
                'status' => 'pending',
            ]
        );

        return redirect()
            ->route('admin.employees.skills.show', [$employee->id, $allocation->id])
            ->with('status', 'Skill added to employee.');
    }

    public function uploadEvidence(
        CloudinaryService $cloudinary,
        Request $request,
        OrganizationUser $employee,
        EmployeeSkillAllocation $allocation
    ): RedirectResponse {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);
        abort_unless((int) $allocation->organization_user_id === (int) $employee->id, 404);

        $data = $request->validate([
            'document' => ['required', 'file', 'max:5120'],
        ]);

        try {
            $uploaded = $cloudinary->upload($data['document'], 'talent_sync/skills');

            EmployeeSkillEvidence::create([
                'employee_skill_allocation_id' => $allocation->id,
                'document_url' => $uploaded['secure_url'] ?? $uploaded['url'] ?? null,
                'uploaded_by' => $request->user()?->id,
                'uploaded_at' => now(),
                'verification_status' => 'verified',
                'verified_by' => $request->user()?->id,
                'verified_at' => now(),
            ]);

            // If admin uploaded evidence, mark allocation verified
            $allocation->status = 'verified';
            $allocation->verified_by = $request->user()?->id;
            $allocation->verified_at = now();
            $allocation->save();
        } catch (\Exception $e) {
            logger()->error('Cloudinary upload failed: '.$e->getMessage());
            return back()->withErrors('Failed to upload document. Please try again.');
        }

        return back()->with('status', 'Evidence uploaded and verified.');
    }

    public function verifyEvidence(
        Request $request,
        OrganizationUser $employee,
        EmployeeSkillEvidence $evidence
    ): RedirectResponse {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);

        $allocation = EmployeeSkillAllocation::query()
            ->where('id', $evidence->employee_skill_allocation_id)
            ->firstOrFail();

        abort_unless((int) $allocation->organization_user_id === (int) $employee->id, 404);

        $evidence->verification_status = 'verified';
        $evidence->verified_by = $request->user()?->id;
        $evidence->verified_at = now();
        $evidence->save();

        $allocation->status = 'verified';
        $allocation->verified_by = $request->user()?->id;
        $allocation->verified_at = now();
        $allocation->save();

        return back()->with('status', 'Evidence verified.');
    }

    public function rejectEvidence(
        Request $request,
        OrganizationUser $employee,
        EmployeeSkillEvidence $evidence
    ): RedirectResponse {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $employee->organization_id === $orgId, 404);

        $allocation = EmployeeSkillAllocation::query()
            ->where('id', $evidence->employee_skill_allocation_id)
            ->firstOrFail();

        abort_unless((int) $allocation->organization_user_id === (int) $employee->id, 404);

        $data = $request->validate([
            'verification_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $evidence->verification_status = 'rejected';
        $evidence->verified_by = $request->user()?->id;
        $evidence->verified_at = now();
        $evidence->verification_note = $data['verification_note'] ?? null;
        $evidence->save();

        $allocation->status = 'pending';
        $allocation->save();

        return back()->with('status', 'Evidence rejected.');
    }
}
