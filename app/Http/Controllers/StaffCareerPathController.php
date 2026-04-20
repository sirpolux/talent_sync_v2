<?php

namespace App\Http\Controllers;

use App\Models\CareerPath;
use App\Models\EmployeeCareerPathSelection;
use App\Models\OrganizationUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StaffCareerPathController extends Controller
{
    public function index(Request $request): Response
    {
        $organizationId = $request->session()->get('current_organization_id');
        $user = $request->user();

        $organizationUser = OrganizationUser::query()
            ->with(['department'])
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $careerPaths = CareerPath::query()
            ->with(['department', 'steps'])
            ->where('organization_id', $organizationId)
            ->where('department_id', $organizationUser->department_id)
            ->orderBy('name')
            ->get();

        $activeSelection = EmployeeCareerPathSelection::query()
            ->with(['careerPath.steps'])
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return Inertia::render('Staff/CareerPaths/Index', [
            'careerPaths' => $careerPaths,
            'department' => $organizationUser->department,
            'activeSelection' => $activeSelection,
        ]);
    }

    public function show(Request $request, CareerPath $careerPath): Response
    {
        $organizationId = $request->session()->get('current_organization_id');
        $user = $request->user();

        $organizationUser = OrganizationUser::query()
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        abort_unless(
            $careerPath->organization_id === $organizationId && $careerPath->department_id === $organizationUser->department_id,
            403
        );

        $careerPath->load(['department', 'steps']);

        $activeSelection = EmployeeCareerPathSelection::query()
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return Inertia::render('Staff/CareerPaths/Show', [
            'careerPath' => $careerPath,
            'activeSelection' => $activeSelection,
        ]);
    }

    public function store(Request $request, CareerPath $careerPath): RedirectResponse
    {
        $organizationId = $request->session()->get('current_organization_id');
        $user = $request->user();

        $organizationUser = OrganizationUser::query()
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        abort_unless(
            $careerPath->organization_id === $organizationId && $careerPath->department_id === $organizationUser->department_id,
            403
        );

        DB::transaction(function () use ($organizationId, $user, $careerPath) {
            EmployeeCareerPathSelection::query()
                ->where('organization_id', $organizationId)
                ->where('user_id', $user->id)
                ->update(['is_active' => false]);

            EmployeeCareerPathSelection::create([
                'organization_id' => $organizationId,
                'user_id' => $user->id,
                'career_path_id' => $careerPath->id,
                'is_active' => true,
            ]);
        });

        return redirect()
            ->route('staff.career-paths.show', $careerPath)
            ->with('success', 'Career path selected successfully.');
    }
}