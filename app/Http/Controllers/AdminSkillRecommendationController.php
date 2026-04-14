<?php

namespace App\Http\Controllers;

use App\Models\EmployeeSkillAllocation;
use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\SkillRecommendation;
use App\Models\SkillRecommendationRecipient;
use App\Models\TrainingSessionParticipant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSkillRecommendationController extends Controller
{
    public function create(Request $request, Skill $skill): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');
        abort_unless($skill->organization_id === null || (int) $skill->organization_id === $orgId, 404);

        $search = trim((string) $request->get('search', ''));
        $perPage = (int) $request->get('per_page', 20);
        $perPage = in_array($perPage, [10, 20], true) ? $perPage : 20;

        $employees = \App\Models\User::query()
            ->select([
                'organization_user.id as org_user_id',
                'users.id as user_id',
                'users.name',
                'users.email',
                'organization_user.membership_status',
                'departments.name as department_name',
                'positions.name as position_name',
            ])
            ->join('organization_user', 'organization_user.user_id', '=', 'users.id')
            ->leftJoin('departments', 'departments.id', '=', 'organization_user.department_id')
            ->leftJoin('positions', 'positions.id', '=', 'organization_user.position_id')
            ->where('organization_user.organization_id', $orgId)
            ->where('organization_user.is_employee', true)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%")
                        ->orWhere('departments.name', 'like', "%{$search}%")
                        ->orWhere('positions.name', 'like', "%{$search}%");
                });
            })
            ->orderBy('users.name')
            ->paginate($perPage)
            ->withQueryString();

        $employeeIds = collect($employees->items())
            ->pluck('org_user_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        $hasSkillIds = \App\Models\EmployeeSkillAllocation::query()
            ->where('skill_id', $skill->id)
            ->whereIn('organization_user_id', $employeeIds)
            ->pluck('organization_user_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $inTrainingIds = TrainingSessionParticipant::query()
            ->whereIn('organization_user_id', $employeeIds)
            ->whereHas('trainingSession', function ($query) use ($orgId, $skill) {
                $query->where('organization_id', $orgId)
                    ->where('skill_id', $skill->id)
                    ->where('status', 'in_progress');
            })
            ->pluck('organization_user_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $pendingRecommendationIds = SkillRecommendationRecipient::query()
            ->whereIn('organization_user_id', $employeeIds)
            ->whereHas('skillRecommendation', function ($query) use ($orgId, $skill) {
                $query->where('organization_id', $orgId)
                    ->where('skill_id', $skill->id)
                    ->where('status', 'active');
            })
            ->where('registration_status', 'pending')
            ->pluck('organization_user_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $employees->getCollection()->transform(function ($employee) use ($hasSkillIds, $inTrainingIds, $pendingRecommendationIds) {
            $orgUserId = (int) $employee->org_user_id;

            $employee->has_skill = in_array($orgUserId, $hasSkillIds, true);
            $employee->is_in_training = in_array($orgUserId, $inTrainingIds, true);
            $employee->recommendation_status = in_array($orgUserId, $pendingRecommendationIds, true) ? 'pending' : null;

            return $employee;
        });

        return Inertia::render('Admin/Skills/Recommend', [
            'skill' => [
                'id' => $skill->id,
                'name' => $skill->name,
            ],
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request, Skill $skill): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');
        abort_unless($skill->organization_id === null || (int) $skill->organization_id === $orgId, 404);

        $data = $request->validate([
            'organization_user_ids' => ['required', 'array', 'min:1'],
            'organization_user_ids.*' => [
                'integer',
                Rule::exists('organization_user', 'id')->where(function ($query) use ($orgId) {
                    $query->where('organization_id', $orgId)
                        ->where('is_employee', true);
                }),
            ],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $organizationUserIds = collect($data['organization_user_ids'])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        if ($organizationUserIds->isEmpty()) {
            return back()->withErrors([
                'organization_user_ids' => 'Please select at least one employee to recommend this skill to.',
            ]);
        }

        $alreadyRecommendedIds = SkillRecommendationRecipient::query()
            ->whereHas('skillRecommendation', function ($query) use ($orgId, $skill) {
                $query->where('organization_id', $orgId)
                    ->where('skill_id', $skill->id);
            })
            ->whereIn('organization_user_id', $organizationUserIds)
            ->pluck('organization_user_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $newRecipientIds = $organizationUserIds->diff($alreadyRecommendedIds)->values();

        if ($newRecipientIds->isEmpty()) {
            return back()->withErrors([
                'organization_user_ids' => 'All selected staff have already been recommended for this skill.',
            ]);
        }

        try {
            DB::transaction(function () use ($request, $skill, $orgId, $newRecipientIds, $data) {
                $recommendation = SkillRecommendation::create([
                    'organization_id' => $orgId,
                    'skill_id' => $skill->id,
                    'recommended_by_user_id' => $request->user()?->id,
                    'recommended_by_role' => $request->user()?->role?->name
                        ?? $request->user()?->role
                        ?? null,
                    'source_type' => 'admin',
                    'source_id' => $request->user()?->id,
                    'target_type' => 'organization_user',
                    'reason' => $data['reason'] ?? null,
                    'status' => 'active',
                    'recommended_at' => now(),
                ]);

                $now = now();

                $rows = $newRecipientIds->map(function ($organizationUserId) use ($recommendation, $now) {
                    return [
                        'skill_recommendation_id' => $recommendation->id,
                        'organization_user_id' => $organizationUserId,
                        'registration_status' => 'pending',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })->all();

                SkillRecommendationRecipient::insert($rows);
            });
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors([
                'organization_user_ids' => 'Unable to save the recommendation right now. Please try again.',
            ]);
        }

        return redirect()
            ->route('admin.skills.recommend.create', $skill)
            ->with('status', 'Skill recommendation sent successfully.');
    }
}
