<?php

namespace App\Http\Controllers;

use App\Mail\TutorAddedMail;
use App\Mail\TutorInvitationMail;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\TrainerProfile;
use App\Models\TrainerSpecialty;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminTrainerController extends Controller
{
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $assignmentType = trim((string) $request->query('assignment_type', ''));

        $trainers = TrainerProfile::query()
            ->with([
                'organizationUser.user:id,name,email',
            ])
            ->whereHas('organizationUser', function (Builder $query) use ($orgId) {
                $query->where('organization_id', $orgId);
            })
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->whereHas('organizationUser.user', function (Builder $userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                });
            })
            ->when($status !== '', function (Builder $query) use ($status) {
                $query->where('status', $status);
            })
            ->when($assignmentType === 'existing_staff', function (Builder $query) {
                $query->whereHas('organizationUser', function (Builder $membershipQuery) {
                    $membershipQuery->where('is_employee', true);
                });
            })
            ->when($assignmentType === 'new_tutor', function (Builder $query) {
                $query->whereHas('organizationUser', function (Builder $membershipQuery) {
                    $membershipQuery->where('is_employee', false);
                });
            })
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (TrainerProfile $trainer) {
                return [
                    'id' => $trainer->id,
                    'organization_id' => $trainer->organization_id,
                    'organization_user_id' => $trainer->organization_user_id,
                    'status' => $trainer->status,
                    'name' => $trainer->organizationUser?->user?->name,
                    'email' => $trainer->organizationUser?->user?->email,
                    'membership_status' => $trainer->organizationUser?->membership_status,
                    'is_employee' => (bool) ($trainer->organizationUser?->is_employee ?? false),
                    'created_at' => $trainer->created_at,
                    'updated_at' => $trainer->updated_at,
                ];
            });

        return Inertia::render('Admin/Trainers/Index', [
            'trainers' => $trainers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'assignment_type' => $assignmentType,
            ],
            'filterOptions' => [
                'statuses' => [
                    ['value' => 'active', 'label' => 'Active'],
                    ['value' => 'pending', 'label' => 'Pending'],
                    ['value' => 'inactive', 'label' => 'Inactive'],
                ],
                'assignmentTypes' => [
                    ['value' => 'existing_staff', 'label' => 'Existing staff'],
                    ['value' => 'new_tutor', 'label' => 'New tutor'],
                ],
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Trainers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $data = $request->validate([
            'type' => ['required', 'in:existing_staff,new_tutor'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);

        if ($data['type'] === 'existing_staff') {
            $request->validate([
                'user_id' => ['required', 'integer', 'exists:users,id'],
            ]);

            $membership = OrganizationUser::query()
                ->where('organization_id', $orgId)
                ->where('user_id', $data['user_id'])
                ->firstOrFail();

            if (! $membership->is_employee) {
                return back()->withErrors(['user_id' => 'Selected staff member must already be an employee.']);
            }

            $trainer = TrainerProfile::query()->firstOrCreate(
                ['organization_user_id' => $membership->id],
                [
                    'status' => 'active',
                ]
            );

            if ($membership->is_trainer !== true) {
                $membership->is_trainer = true;
                $membership->save();
            }

            Mail::to($membership->user->email)->send(
                new TutorAddedMail(
                    organization: $membership->organization,
                    user: $membership->user,
                    addedBy: $request->user()
                )
            );

            return redirect()
                ->route('admin.trainers.index')
                ->with('success', 'Staff member added as trainer successfully.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = User::query()->firstOrCreate(
            ['email' => mb_strtolower($data['email'])],
            [
                'name' => $data['name'],
                'password' => Str::password(24),
            ]
        );

        if ($user->name !== $data['name']) {
            $user->name = $data['name'];
            $user->save();
        }

        $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        $pivotData = [
            'is_employee' => (bool) ($membership?->is_employee ?? false),
            'is_trainer' => true,
            'is_org_admin' => (bool) ($membership?->is_org_admin ?? false),
            'is_sub_admin' => (bool) ($membership?->is_sub_admin ?? false),
            'can_manage_courses' => (bool) ($membership?->can_manage_courses ?? false),
            'can_manage_reporting' => (bool) ($membership?->can_manage_reporting ?? false),
            'membership_status' => 'pending',
            'membership_confirmed_at' => null,
            'membership_confirmed_by_user_id' => null,
            'onboarding_stage' => 'invited',
        ];

        if ($membership) {
            $user->organizations()->updateExistingPivot($orgId, $pivotData);
        } else {
            $user->organizations()->attach($orgId, $pivotData);
        }

        $organizationUser = OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $trainer = TrainerProfile::query()->firstOrCreate(
            ['organization_user_id' => $organizationUser->id],
            [
                'status' => 'pending',
            ]
        );

        if (! empty($data['phone'])) {
            $organizationUser->phone = $data['phone'];
            $organizationUser->save();
        }

        $existingInvitation = OrganizationInvitation::query()
            ->where('organization_id', $orgId)
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($user->email)])
            ->where('role', 'trainer')
            ->whereNull('accepted_at')
            ->latest('id')
            ->first();

        $invitation = $existingInvitation ?: OrganizationInvitation::query()->create([
            'organization_id' => $orgId,
            'invited_by_user_id' => $request->user()?->id,
            'email' => $user->email,
            'role' => 'trainer',
            'meta' => [
                'invite_type' => 'new_user_account_setup',
                'is_trainer' => true,
                'trainer_profile_id' => $trainer->id,
                'organization_user_id' => $organizationUser->id,
            ],
            'token' => (string) Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);

        $acceptUrl = route('org.invitations.accept', ['token' => $invitation->token]);

        Mail::to($user->email)->send(
            new TutorInvitationMail($invitation, $acceptUrl)
        );

        return redirect()
            ->route('admin.trainers.index')
            ->with('success', 'Tutor invited successfully.');
    }

    public function show(Request $request, TrainerProfile $trainer): Response
    {
        return Inertia::render('Admin/Trainers/Show', [
            'trainer' => $trainer,
        ]);
    }

    public function edit(Request $request, TrainerProfile $trainer): Response
    {
        return Inertia::render('Admin/Trainers/Edit', [
            'trainer' => $trainer,
        ]);
    }

    public function update(Request $request, TrainerProfile $trainer): RedirectResponse
    {
        return redirect()->route('admin.trainers.index');
    }

    public function destroy(Request $request, TrainerProfile $trainer): RedirectResponse
    {
        return redirect()->route('admin.trainers.index');
    }

    public function skills(Request $request, TrainerProfile $trainer): Response

    {

        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless((int) $trainer->organizationUser?->organization_id === $orgId, 404);

   
        $trainer->load([
            'specialties.skill:id,name,type,organization_id',
            'specialties.certifications',
            'organizationUser.user:id,name,email',
        ]);

        $assignedSkills = $trainer->specialties->map(function (TrainerSpecialty $specialty) {
            return [
                'id' => $specialty->id,
                'trainer_profile_id' => $specialty->trainer_profile_id,
                'skill_id' => $specialty->skill_id,
                'name' => $specialty->name,
                'description' => $specialty->description,
                'skill' => $specialty->skill ? [
                    'id' => $specialty->skill->id,
                    'name' => $specialty->skill->name,
                    'type' => $specialty->skill->type,
                    'organization_id' => $specialty->skill->organization_id,
                ] : null,
            ];
        })->values();

        $assignedSkillIds = $trainer->specialties->pluck('skill_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values();

        $availableSkills = Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $query) {
                $query->whereNull('type')
                    ->orWhere('type', '!=', 'degree');
            })
            ->whereNotIn('id', $assignedSkillIds)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'organization_id']);

        $excludedDegree = Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where('type', 'degree')
            ->count();

        return Inertia::render('Admin/Trainers/Skills', [
            'trainer' => [
                'id' => $trainer->id,
                'organization_id' => $trainer->organizationUser?->organization_id,
                'organization_user_id' => $trainer->organization_user_id,
                'user_id' => $trainer->organization_user_id,
                'name' => $trainer->organizationUser?->user?->name,
                'email' => $trainer->organizationUser?->user?->email,
            ],
            'assignedSkills' => $assignedSkills,
            'availableSkills' => $availableSkills,
            'excludedDegreeCount' => $excludedDegree,
        ]);
    }

    public function storeSkill(Request $request, TrainerProfile $trainer): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless((int) $trainer->organizationUser?->organization_id === $orgId, 404);

        $data = $request->validate([
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function ( $query) use ($orgId) {
                    $query->where('is_active', true)
                        ->where(function ($scope) use ($orgId) {
                            $scope->whereNull('organization_id')
                                ->orWhere('organization_id', $orgId);
                        })
                        ->where(function ($typeQuery) {
                            $typeQuery->whereNull('type')
                                ->orWhere('type', '!=', 'degree');
                        });
                }),
            ],
        ]);

        $skillId = (int) $data['skill_id'];

        $existing = TrainerSpecialty::query()
            ->where('trainer_profile_id', $trainer->id)
            ->where('skill_id', $skillId)
            ->first();

        if ($existing) {
            return back()->withErrors(['skill_id' => 'This skill is already assigned to this trainer.']);
        }

        $skill = Skill::query()
            ->whereKey($skillId)
            ->where('is_active', true)
            ->where(function (Builder $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $query) {
                $query->whereNull('type')
                    ->orWhere('type', '!=', 'degree');
            })
            ->firstOrFail();

        TrainerSpecialty::create([
            'trainer_profile_id' => $trainer->id,
            'skill_id' => $skill->id,
            'name' => $skill->name,
            'description' => $skill->description,
        ]);

        return back()->with('status', 'Trainer skill added.');
    }
}
