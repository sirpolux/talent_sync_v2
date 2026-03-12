<?php

namespace App\Http\Controllers;

use App\Mail\OrganizationInvitationMail;
use App\Models\Department;
use App\Models\OrganizationInvitation;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminEmployeeController extends Controller
{
    public function index(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        $employees = User::query()
            ->select([
                'users.id',
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
            ->orderBy('users.name')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'membership_status' => $u->membership_status,
                    'department_name' => $u->department_name,
                    'position_name' => $u->position_name,
                ];
            });

        return Inertia::render('Admin/Employees/Index', [
            'employees' => $employees,
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

        $managers = User::query()
            ->select(['users.id', 'users.name', 'users.email'])
            ->join('organization_user', 'organization_user.user_id', '=', 'users.id')
            ->where('organization_user.organization_id', $orgId)
            ->where('organization_user.membership_status', 'active')
            ->orderBy('users.name')
            ->get();

        return Inertia::render('Admin/Employees/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'managers' => $managers,
        ]);
    }

    public function store(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],

            // org-scoped profile/job fields
            'employee_code' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:255'],
            'work_mode' => ['nullable', 'string', 'max:255'],
            'employment_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:10'],
            'nationality' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:50'],

            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'date_started_current_position' => ['nullable', 'date'],
            'manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // Create or fetch user by email
        $user = User::query()->firstOrCreate(
            ['email' => mb_strtolower($validated['email'])],
            [
                'name' => $validated['name'],
                'password' => Str::password(24), // User model casts password => hashed
            ]
        );

        // Ensure name is updated if user exists but admin provided a different name
        if ($user->name !== $validated['name']) {
            $user->name = $validated['name'];
            $user->save();
        }

        // If membership exists and already active employee, block
        $existingMembership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        if ($existingMembership && $existingMembership->membership_status === 'active' && !empty($existingMembership->is_employee)) {
            return back()->with('error', 'User is already an active employee in this organization.');
        }

        // Create or update the org membership (Option B: pivot exists immediately but pending)
        $pivotData = array_merge(
            [
                'is_employee' => true,
                'is_trainer' => (bool) ($existingMembership?->is_trainer ?? false),
                'is_org_admin' => (bool) ($existingMembership?->is_org_admin ?? false),
                'is_sub_admin' => (bool) ($existingMembership?->is_sub_admin ?? false),
                'can_manage_courses' => (bool) ($existingMembership?->can_manage_courses ?? false),
                'can_manage_reporting' => (bool) ($existingMembership?->can_manage_reporting ?? false),

                'membership_status' => 'pending',
                'membership_confirmed_at' => null,
                'membership_confirmed_by_user_id' => null,
                'onboarding_stage' => 'invited',
            ],
            collect($validated)->only([
                'employee_code',
                'phone',
                'employment_type',
                'work_mode',
                'employment_date',
                'gender',
                'nationality',
                'state',
                'department_id',
                'position_id',
                'date_started_current_position',
                'manager_user_id',
            ])->toArray()
        );

        if ($existingMembership) {
            $user->organizations()->updateExistingPivot($orgId, $pivotData);
        } else {
            $user->organizations()->attach($orgId, $pivotData);
        }

        // Create/refresh invitation token
        $token = Str::random(64);

        $invitation = OrganizationInvitation::query()->updateOrCreate(
            [
                'organization_id' => $orgId,
                'email' => $user->email,
                'role' => 'employee',
            ],
            [
                'invited_by_user_id' => $request->user()?->id,
                'token' => $token,
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
                'meta' => null,
            ]
        );

        $acceptUrl = route('org.invitations.accept', ['token' => $invitation->token]);

        Mail::to($user->email)->send(new OrganizationInvitationMail($invitation->load('organization'), $acceptUrl));

        return redirect()->route('admin.employees.index')->with('success', 'Employee created as pending. Invitation sent.');
    }

    public function show($id)
    {
        return Inertia::render('Admin/Employees/Show');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Employees/Edit');
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
