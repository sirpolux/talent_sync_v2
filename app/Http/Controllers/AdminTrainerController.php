<?php

namespace App\Http\Controllers;

use App\Mail\TutorAddedMail;
use App\Mail\TutorInvitationMail;
use App\Models\Department;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
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
            ->orderBy('users.name')
            ->get()
            ->map(function ($u) {
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
            });

        return Inertia::render('Admin/Trainers/Index', [
            'trainers' => $trainers,
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
            'type' => ['required', 'in:existing_staff,new_tutor'],

            // existing staff flow
            'user_id' => ['required_if:type,existing_staff', 'integer', 'exists:users,id'],

            // new tutor flow
            'name' => ['required_if:type,new_tutor', 'string', 'max:255'],
            'email' => ['required_if:type,new_tutor', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var Organization $organization */
        $organization = Organization::query()->findOrFail($orgId);

        // -------------------------------------------------
        // Existing staff -> promote to tutor (no confirmation)
        // -------------------------------------------------
        if ($validated['type'] === 'existing_staff') {
            $userId = (int) $validated['user_id'];

            $user = User::query()->findOrFail($userId);

            $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;

            abort_unless($membership, 404, 'Organization membership record not found.');

            $user->organizations()->updateExistingPivot($orgId, [
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

        // -------------------------------------------------
        // New tutor -> invite + confirmation required
        // -------------------------------------------------
        $email = mb_strtolower($validated['email']);

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $validated['name'],
                'password' => Str::password(24), // hashed by cast
            ]
        );

        if ($user->name !== $validated['name']) {
            $user->name = $validated['name'];
            $user->save();
        }

        $existingMembership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        if ($existingMembership && $existingMembership->membership_status === 'active' && !empty($existingMembership->is_trainer)) {
            return back()->with('error', 'User is already an active trainer in this organization.');
        }

        $pivotData = [
            'is_employee' => false,
            'is_trainer' => true,

            'is_org_admin' => (bool) ($existingMembership?->is_org_admin ?? false),
            'is_sub_admin' => (bool) ($existingMembership?->is_sub_admin ?? false),
            'can_manage_courses' => (bool) ($existingMembership?->can_manage_courses ?? false),
            'can_manage_reporting' => (bool) ($existingMembership?->can_manage_reporting ?? false),

            'membership_status' => 'pending',
            'membership_confirmed_at' => null,
            'membership_confirmed_by_user_id' => null,
            'onboarding_stage' => 'invited',

            'phone' => $validated['phone'] ?? null,
        ];

        if ($existingMembership) {
            $user->organizations()->updateExistingPivot($orgId, $pivotData);
        } else {
            $user->organizations()->attach($orgId, $pivotData);
        }

        // reload membership pivot for its ID (org_user_id)
        $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;
        abort_unless($membership, 500, 'Organization membership record not found after attach/update.');

        TrainerProfile::query()->firstOrCreate([
            'organization_user_id' => $membership->id,
        ], [
            'status' => 'pending',
        ]);

        $token = Str::random(64);

        $invitation = OrganizationInvitation::query()->updateOrCreate(
            [
                'organization_id' => $orgId,
                'email' => $user->email,
                'role' => 'tutor',
            ],
            [
                'invited_by_user_id' => $request->user()?->id,
                'token' => $token,
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
                'meta' => ['invite_type' => 'tutor'],
            ]
        );

        $acceptUrl = route('org.invitations.accept', ['token' => $invitation->token]);

        Mail::to($user->email)->send(new TutorInvitationMail($invitation->load('organization'), $acceptUrl));

        return redirect()->route('admin.trainers.index')->with('success', 'Tutor invited as pending. Invitation sent.');
    }

    public function show($id)
    {
        return Inertia::render('Admin/Trainers/Show');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Trainers/Edit');
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
