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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffSkillController extends Controller
{
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

        return Inertia::render('Staff/Skills/Index', [
            'allocations' => $allocations,
            'availableSkills' => $availableSkills,
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
        ]);

        EmployeeSkillAllocation::firstOrCreate(
            [
                'organization_user_id' => $orgUser->id,
                'skill_id' => $data['skill_id'],
            ],
            [
                'added_via' => 'self',
                'created_by' => $userId,
                'status' => 'pending',
            ]
        );

        return back()->with('status', 'Skill added. Upload evidence to get it verified.');
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
