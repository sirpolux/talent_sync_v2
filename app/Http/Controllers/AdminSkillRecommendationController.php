<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\Request;
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
        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 50, 100], true) ? $perPage : 10;

        $employees = User::query()
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
            ->withQueryString()
            ->through(function ($employee) {
                return [
                    'id' => $employee->org_user_id,
                    'user_id' => $employee->user_id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'membership_status' => $employee->membership_status,
                    'department_name' => $employee->department_name,
                    'position_name' => $employee->position_name,
                ];
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
}
