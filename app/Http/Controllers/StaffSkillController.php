<?php

namespace App\Http\Controllers;

use App\Models\DepartmentSkillRequirement;
use App\Models\EmployeeSkillAllocation;
use App\Models\EmployeeSkillEvidence;
use App\Models\Grade;
use App\Models\GradingSystem;
use App\Models\OrganizationUser;
use App\Models\PositionCompetency;
use App\Models\Skill;
use App\Services\CloudinaryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffSkillController extends Controller
{
    public function show(Request $request, EmployeeSkillAllocation $allocation): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $userId = (int) $request->user()->id;

        $orgUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->firstOrFail();

        abort_unless((int) $allocation->organization_user_id === (int) $orgUser->id, 404);

        $allocation->load([
            'skill:id,name',
            'evidences' => function ($q) {
                $q->latest();
            },
        ]);

        return Inertia::render('Staff/Skills/Show', [
            'employee' => [
                'id' => $orgUser->id,
                'name' => $request->user()?->name,
                'email' => $request->user()?->email,
            ],
            'allocation' => $allocation,
        ]);
    }

    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $userId = (int) $request->user()->id;

        $orgUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $allocations = EmployeeSkillAllocation::query()
            ->where('organization_user_id', $orgUser->id)
            ->with([
                'skill:id,name',
                'evidences' => function ($q) {
                    $q->latest();
                },
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

        if (!empty($orgUser->position_id)) {
            $positionRules = PositionCompetency::query()
                ->where('organization_id', $orgId)
                ->where('position_id', $orgUser->position_id)
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

        if (!empty($orgUser->department_id)) {
            $deptRules = DepartmentSkillRequirement::query()
                ->where('organization_id', $orgId)
                ->where('department_id', $orgUser->department_id)
                ->where('active', true)
                ->get(['skill_id', 'grading_system_id', 'grade_id']);

            foreach ($deptRules as $r) {
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

        return Inertia::render('Staff/Skills/Index', [
            'allocations' => $allocations,
            'availableSkills' => $availableSkills,
            'gradingSystems' => $gradingSystems,
            'gradesBySystem' => $gradesBySystem,
            'skillRules' => $skillRules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $userId = (int) $request->user()->id;

        $orgUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->firstOrFail();

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
        // When mapped, lock grading_system_id, but allow staff to select grade_id.
        $lockedRule = null;

        if (!empty($orgUser->position_id)) {
            $lockedRule = PositionCompetency::query()
                ->where('organization_id', $orgId)
                ->where('position_id', $orgUser->position_id)
                ->where('skill_id', $skillId)
                ->where('active', true)
                ->first(['grading_system_id', 'grade_id']);

            if ($lockedRule) {
                $data['grading_system_id'] = $lockedRule->grading_system_id;
            }
        }

        if (!$lockedRule && !empty($orgUser->department_id)) {
            $lockedRule = DepartmentSkillRequirement::query()
                ->where('organization_id', $orgId)
                ->where('department_id', $orgUser->department_id)
                ->where('skill_id', $skillId)
                ->where('active', true)
                ->first(['grading_system_id', 'grade_id']);

            if ($lockedRule) {
                $data['grading_system_id'] = $lockedRule->grading_system_id;
            }
        }

        // Validate grading system scope if manual
        if (!$lockedRule) {
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
                'organization_user_id' => $orgUser->id,
                'skill_id' => $skillId,
            ],
            [
                'added_via' => 'self',
                'created_by' => $userId,
                'grading_system_id' => $data['grading_system_id'] ?? null,
                'grade_id' => $data['grade_id'] ?? null,
                'status' => 'pending',
            ]
        );

        return redirect()
            ->route('staff.skills.show', [$allocation->id])
            ->with('status', 'Skill added. Upload evidence to get it verified.');
    }

    public function uploadEvidence(
        CloudinaryService $cloudinary,
        Request $request,
        EmployeeSkillAllocation $allocation
    ): RedirectResponse {
        $orgId = (int) $request->session()->get('current_organization_id');
        $userId = (int) $request->user()->id;

        $orgUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->firstOrFail();

        abort_unless((int) $allocation->organization_user_id === (int) $orgUser->id, 404);

        $data = $request->validate([
            'document' => ['required', 'file', 'max:5120'], // 5MB
        ]);

        DB::beginTransaction();

        try {
            $uploaded = $cloudinary->upload($data['document'], 'talent_sync/skills');

            EmployeeSkillEvidence::create([
                'employee_skill_allocation_id' => $allocation->id,
                'document_url' => $uploaded['secure_url'] ?? $uploaded['url'] ?? null,
                'uploaded_by' => $userId,
                'uploaded_at' => now(),
                'verification_status' => 'pending',
            ]);

            // keep allocation pending until admin verifies
            $allocation->status = 'pending';
            $allocation->save();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            logger()->error('Cloudinary upload failed: '.$e->getMessage());

            return back()->withErrors('Failed to upload document. Please try again.');
        }

        return back()->with('status', 'Evidence uploaded. Awaiting verification.');
    }

    /**
     * Staff can mark evidence as "verified" ONLY if the uploader was admin.
     * This is a convenience endpoint (optional) - can be removed if you prefer strictly admin verification.
     */
    public function markEvidenceVerified(Request $request, EmployeeSkillEvidence $evidence): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $userId = (int) $request->user()->id;

        $allocation = EmployeeSkillAllocation::query()
            ->where('id', $evidence->employee_skill_allocation_id)
            ->firstOrFail();

        $orgUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->firstOrFail();

        abort_unless((int) $allocation->organization_user_id === (int) $orgUser->id, 404);

        // Only allow if evidence was uploaded by someone else (admin) and already verified in system terms
        abort_unless($evidence->verification_status === 'verified', 403);

        return back();
    }
}
