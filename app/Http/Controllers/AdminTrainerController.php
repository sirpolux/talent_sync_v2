<?php

namespace App\Http\Controllers;

use App\Mail\TutorAddedMail;
use App\Mail\TutorInvitationMail;
use App\Models\Department;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationUser;
use App\Models\Position;
use App\Models\TrainerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminTrainerController extends Controller
{
    public function index(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        $q = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', 'all');
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $trainers = User::query()
            ->select([
                'organization_user.id as org_user_id',
                'users.name',
                'users.email',
                'organization_user.membership_status',
                'departments.name as department_name',
                'positions.name as position_name',
                'trainer_profiles.headline as trainer_headline',
                'trainer_profiles.status as trainer_status',
            ])
            ->join('organization_user', 'organization_user.user_id', '=', 'users.id')
            ->leftJoin('departments', 'departments.id', '=', 'organization_user.department_id')
            ->leftJoin('positions', 'positions.id', '=', 'organization_user.position_id')
            ->leftJoin('trainer_profiles', 'trainer_profiles.organization_user_id', '=', 'organization_user.id')
            ->where('organization_user.organization_id', $orgId)
            ->where('organization_user.is_trainer', true)
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('users.name', 'like', "%{$q}%")
                        ->orWhere('users.email', 'like', "%{$q}%");
                });
            })
            ->when(in_array($status, ['active', 'pending'], true), function ($query) use ($status) {
                $query->where('organization_user.membership_status', $status);
            })
            ->orderBy('users.name')
            ->paginate($perPage)
            ->through(function ($u) {
                return [
                    'id' => $u->org_user_id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'membership_status' => $u->membership_status,
                    'department_name' => $u->department_name,
                    'position_name' => $u->position_name,
                    'headline' => $u->trainer_headline,
                    'trainer_status' => $u->trainer_status,
                ];
            })
            ->withQueryString();

        return Inertia::render('Admin/Trainers/Index', [
            'trainers' => $trainers,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->select(['id', 'name', 'department_id'])
            ->orderBy('name')
            ->get();

        // used by the "existing staff" selector (filter/search client-side for MVP)
        $staff = User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'organization_user.employee_code',
                'organization_user.department_id',
                'organization_user.position_id',
                'departments.name as department_name',
                'positions.name as position_name',
            ])
            ->join('organization_user', 'organization_user.user_id', '=', 'users.id')
            ->leftJoin('departments', 'departments.id', '=', 'organization_user.department_id')
            ->leftJoin('positions', 'positions.id', '=', 'organization_user.position_id')
            ->where('organization_user.organization_id', $orgId)
            ->where('organization_user.is_employee', true)
            ->orderBy('users.name')
            ->get();

        return Inertia::render('Admin/Trainers/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'staff' => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $validated = $request->validate([
            'type' => ['required', 'in:existing_staff,existing_user,new_tutor'],

            // existing staff flow
            'user_id' => ['required_if:type,existing_staff,existing_user', 'integer', 'exists:users,id'],

            // new tutor flow
            'name' => ['required_if:type,new_tutor', 'string', 'max:255'],
            'email' => ['required_if:type,new_tutor', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var Organization $organization */
        $organization = Organization::query()->findOrFail($orgId);

        if ($validated['type'] === 'existing_staff') {
            return $this->promoteExistingStaffToTutor($request, $organization, (int) $validated['user_id']);
        }

        if ($validated['type'] === 'existing_user') {
            return $this->inviteExistingUserToTutor($request, $organization, (int) $validated['user_id']);
        }

        return $this->inviteNewTutor($request, $organization, $validated);
    }

    protected function promoteExistingStaffToTutor(Request $request, Organization $organization, int $userId)
    {
        $orgId = (int) $organization->id;

        $user = User::query()->findOrFail($userId);
        $membership = $this->organizationMembership($orgId, $user->id);

        abort_unless($membership, 404, 'Organization membership record not found.');

        $membership->update([
            'is_trainer' => true,
        ]);

        TrainerProfile::query()->firstOrCreate([
            'organization_user_id' => $membership->id,
        ]);

        Mail::to($user->email)->send(new TutorAddedMail(
            organization: $organization,
            user: $user,
            addedBy: $request->user()
        ));

        return redirect()->route('admin.trainers.index')
            ->with('success', 'Trainer added. Notification email sent.');
    }

    protected function inviteExistingUserToTutor(Request $request, Organization $organization, int $userId)
    {
        $orgId = (int) $organization->id;

        $user = User::query()->findOrFail($userId);
        $membership = $this->organizationMembership($orgId, $user->id);

        if ($membership && !empty($membership->is_trainer) && $membership->membership_status === 'active') {
            return back()->with('error', 'User is already an active trainer in this organization.');
        }

        $pivotData = array_merge($this->baseTrainerPivotData(), [
            'membership_status' => 'pending',
            'onboarding_stage' => 'invited',
            'membership_confirmed_at' => null,
            'membership_confirmed_by_user_id' => null,
        ]);

        if ($membership) {
            $membership->update($pivotData);
        } else {
            $user->organizations()->attach($orgId, $pivotData);
        }

        $membershipModel = $this->organizationMembership($orgId, $user->id);

        abort_unless($membershipModel, 500, 'Organization membership record not found after attach/update.');

        TrainerProfile::query()->firstOrCreate([
            'organization_user_id' => $membershipModel->id,
        ], [
            'status' => 'pending',
        ]);

        $invitation = $this->createOrRefreshInvitation(
            organization: $organization,
            user: $user,
            inviteType: 'existing_user_confirmation',
            invitedByUserId: $request->user()?->id
        );

        $acceptUrl = route('org.invitations.accept', ['token' => $invitation->token]);

        Mail::to($user->email)->send(new TutorInvitationMail($invitation->load('organization'), $acceptUrl));

        return redirect()->route('admin.trainers.index')->with('success', 'Tutor invitation sent.');
    }

    protected function inviteNewTutor(Request $request, Organization $organization, array $validated)
    {
        $orgId = (int) $organization->id;
        $email = mb_strtolower($validated['email']);

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $validated['name'],
                'password' => Str::password(24),
            ]
        );

        if ($user->name !== $validated['name']) {
            $user->name = $validated['name'];
            $user->save();
        }

        $membership = $this->organizationMembership($orgId, $user->id);

        if ($membership && $membership->membership_status === 'active' && !empty($membership->is_trainer)) {
            return back()->with('error', 'User is already an active trainer in this organization.');
        }

        $pivotData = array_merge($this->baseTrainerPivotData(), [
            'membership_status' => 'pending',
            'onboarding_stage' => 'invited',
            'phone' => $validated['phone'] ?? null,
            'membership_confirmed_at' => null,
            'membership_confirmed_by_user_id' => null,
        ]);

        if ($membership) {
            $membership->update($pivotData);
        } else {
            $user->organizations()->attach($orgId, $pivotData);
        }

        $membershipModel = $this->organizationMembership($orgId, $user->id);

        abort_unless($membershipModel, 500, 'Organization membership record not found after attach/update.');

        TrainerProfile::query()->firstOrCreate([
            'organization_user_id' => $membershipModel->id,
        ], [
            'status' => 'pending',
        ]);

        $invitation = $this->createOrRefreshInvitation(
            organization: $organization,
            user: $user,
            inviteType: $user->wasRecentlyCreated ? 'new_user_account_setup' : 'existing_user_confirmation',
            invitedByUserId: $request->user()?->id
        );

        $acceptUrl = route('org.invitations.accept', ['token' => $invitation->token]);

        Mail::to($user->email)->send(new TutorInvitationMail($invitation->load('organization'), $acceptUrl));

        return redirect()->route('admin.trainers.index')->with('success', 'Tutor invited as pending. Invitation sent.');
    }

    protected function organizationMembership(int $orgId, int $userId): ?OrganizationUser
    {
        return OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $userId)
            ->first();
    }

    protected function baseTrainerPivotData(): array
    {
        return [
            'is_employee' => false,
            'is_trainer' => true,
            'is_org_admin' => false,
            'is_sub_admin' => false,
            'can_manage_courses' => false,
            'can_manage_reporting' => false,
        ];
    }

    protected function createOrRefreshInvitation(Organization $organization, User $user, string $inviteType, ?int $invitedByUserId): OrganizationInvitation
    {
        $token = Str::random(64);

        return OrganizationInvitation::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => $user->email,
                'role' => 'tutor',
            ],
            [
                'invited_by_user_id' => $invitedByUserId,
                'token' => $token,
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
                'meta' => [
                    'invite_type' => $inviteType,
                ],
            ]
        );
    }

    public function show(Request $request, $id)
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $trainer = OrganizationUser::query()
            ->with([
                'user',
                'department',
                'position',
            ])
            ->where('organization_id', $orgId)
            ->where('is_trainer', true)
            ->whereKey($id)
            ->firstOrFail();

        $profile = TrainerProfile::query()
            ->with([
                'specialties.certifications',
            ])
            ->where('organization_user_id', $trainer->id)
            ->first();

        return Inertia::render('Admin/Trainers/Show', [
            'trainer' => [
                'id' => $trainer->id,
                'name' => $trainer->user?->name,
                'email' => $trainer->user?->email,
                'department_name' => $trainer->department?->name,
                'position_name' => $trainer->position?->name,
                'membership_status' => $trainer->membership_status,
                'profile' => $profile ? [
                    'id' => $profile->id,
                    'status' => $profile->status ?? 'active',
                    'headline' => $profile->headline,
                    'specialties' => $profile->specialties->map(fn ($specialty) => [
                        'id' => $specialty->id,
                        'name' => $specialty->name,
                        'description' => $specialty->description,
                        'certifications' => $specialty->certifications->map(fn ($certification) => [
                            'id' => $certification->id,
                            'name' => $certification->name,
                            'issuer' => $certification->issuer,
                            'credential_id' => $certification->credential_id,
                            'credential_url' => $certification->credential_url,
                        ]),
                    ]),
                ] : null,
            ],
        ]);
    }

    public function skills(Request $request, $id)
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $trainer = OrganizationUser::query()
            ->with(['user'])
            ->where('organization_id', $orgId)
            ->where('is_trainer', true)
            ->whereKey($id)
            ->firstOrFail();

        $skills = collect();

        return Inertia::render('Admin/Trainers/Skills', [
            'trainer' => [
                'id' => $trainer->id,
                'name' => $trainer->user?->name,
            ],
            'skills' => $skills,
        ]);
    }

    public function edit($id)
    {
        return redirect()->route('admin.trainers.show', $id);
    }

    public function update(Request $request, $id)
    {
        return back()->with('error', 'Update not implemented yet.');
    }

    public function destroy($id)
    {
        return back()->with('error', 'Delete not implemented yet.');
    }
}
