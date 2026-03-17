<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffAccountController extends Controller
{
    public function profile(Request $request)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');

        /** @var User $user */
        $user = $request->user();

        abort_unless($user, 403);

        $membership = $user->currentOrganizationMembership();

        abort_unless($membership && !empty($membership->is_employee), 403);

        $employee = User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',

                'organization_user.employee_code',
                'organization_user.phone',
                'organization_user.employment_type',
                'organization_user.work_mode',
                'organization_user.employment_date',
                'organization_user.gender',
                'organization_user.nationality',
                'organization_user.state',

                'organization_user.department_id',
                'organization_user.position_id',
                'organization_user.manager_user_id',
                'organization_user.date_started_current_position',

                'organization_user.membership_status',
                'departments.name as department_name',
                'positions.name as position_name',
                'managers.name as manager_name',
                'managers.email as manager_email',
            ])
            ->join('organization_user', 'organization_user.user_id', '=', 'users.id')
            ->leftJoin('departments', 'departments.id', '=', 'organization_user.department_id')
            ->leftJoin('positions', 'positions.id', '=', 'organization_user.position_id')
            ->leftJoin('users as managers', 'managers.id', '=', 'organization_user.manager_user_id')
            ->where('organization_user.organization_id', $orgId)
            ->where('users.id', $user->id)
            ->first();

        abort_unless($employee, 404);

        return Inertia::render('Staff/Account/Profile', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,

                'employee_code' => $employee->employee_code,
                'phone' => $employee->phone,
                'employment_type' => $employee->employment_type,
                'work_mode' => $employee->work_mode,
                'employment_date' => $employee->employment_date,
                'gender' => $employee->gender,
                'nationality' => $employee->nationality,
                'state' => $employee->state,

                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
                'manager_user_id' => $employee->manager_user_id,
                'date_started_current_position' => $employee->date_started_current_position,

                'membership_status' => $employee->membership_status,
                'department_name' => $employee->department_name,
                'position_name' => $employee->position_name,
                'manager_name' => $employee->manager_name,
                'manager_email' => $employee->manager_email,
            ],
        ]);
    }
}
