<?php

namespace App\Http\Controllers;

use App\Models\EmployeeSkillAllocation;
use App\Models\EmployeeSkillEvidence;
use App\Models\OrganizationUser;
use App\Models\Skill;
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

        return Inertia::render('Admin/Employees/Skills/Index', [
            'employee' => [
                'id' => $employee->id,
                'user_id' => $employee->user_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
            ],
            'allocations' => $allocations,
            'availableSkills' => $availableSkills,
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
        ]);

        EmployeeSkillAllocation::firstOrCreate(
            [
                'organization_user_id' => $employee->id,
                'skill_id' => $data['skill_id'],
            ],
            [
                'added_via' => 'admin',
                'created_by' => $request->user()?->id,
                'status' => 'verified', // admin-added skill can be considered verified once evidence is added
                'verified_by' => $request->user()?->id,
                'verified_at' => now(),
            ]
        );

        return back()->with('status', 'Skill added to employee.');
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
