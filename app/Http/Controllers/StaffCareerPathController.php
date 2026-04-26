<?php

namespace App\Http\Controllers;

use App\Models\CareerPath;
use App\Models\EmployeeCareerPathSelection;
use App\Models\OrganizationUser;
use App\Services\PromotionEligibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StaffCareerPathController extends Controller
{
    public function index(Request $request): Response
    {
        $organizationId = (int) $request->session()->get('current_organization_id');
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
            ->where('organization_user_id', $organizationUser->id)
            ->where('is_active', true)
            ->first();

        $selectedCareerPath = $activeSelection?->careerPath;

        $availableCareerPaths = $selectedCareerPath
            ? $careerPaths->where('id', $selectedCareerPath->id)->values()
            : collect();

        $otherCareerPaths = $selectedCareerPath
            ? $careerPaths->reject(fn (CareerPath $careerPath) => (int) $careerPath->id === (int) $selectedCareerPath->id)->values()
            : $careerPaths->values();

        return Inertia::render('Staff/CareerPaths/Index', [
            'careerPaths' => $careerPaths,
            'availableCareerPaths' => $availableCareerPaths,
            'otherCareerPaths' => $otherCareerPaths,
            'department' => $organizationUser->department,
            'activeSelection' => $activeSelection,
            'departmentId' => $organizationUser->department_id,
            'organizationId' => $organizationId,
        ]);
    }

    public function show(Request $request, CareerPath $careerPath, PromotionEligibilityService $eligibilityService): Response
    {
        $organizationId = (int) $request->session()->get('current_organization_id');
        $user = $request->user();

        $organizationUser = OrganizationUser::query()
            ->with(['position.skills'])
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        abort_unless(
            $careerPath->organization_id === $organizationId && $careerPath->department_id === $organizationUser->department_id,
            403
        );

        $careerPath->load(['department', 'steps']);

        $positionIds = $careerPath->steps
            ->flatMap(fn ($step) => [$step->from_position_id, $step->to_position_id])
            ->unique()
            ->values();

        $positionNames = \App\Models\Position::query()
            ->where('organization_id', $organizationId)
            ->whereIn('id', $positionIds)
            ->pluck('name', 'id');

        $careerPath->setRelation(
            'steps',
            $careerPath->steps->map(function ($step) use ($positionNames) {
                $step->setAttribute('from_position_name', $positionNames[$step->from_position_id] ?? null);
                $step->setAttribute('to_position_name', $positionNames[$step->to_position_id] ?? null);

                return $step;
            })
        );

        $activeSelection = EmployeeCareerPathSelection::query()
            ->with(['careerPath.steps'])
            ->where('organization_id', $organizationId)
            ->where('organization_user_id', $organizationUser->id)
            ->where('is_active', true)
            ->first();

        $selectedCareerPath = $activeSelection?->careerPath;

        $promotionEligibility = $selectedCareerPath
            ? $eligibilityService->evaluate($organizationUser, $selectedCareerPath->loadMissing(['steps.toPosition.skills']))
            : null;

        $currentStepIndex = $selectedCareerPath && $organizationUser->position
            ? $eligibilityService->resolveCurrentStepIndex($selectedCareerPath, $organizationUser->position)
            : null;

        return Inertia::render('Staff/CareerPaths/Show', [
            'careerPath' => [
                'id' => $careerPath->id,
                'name' => $careerPath->name,
                'description' => $careerPath->description,
                'department' => $careerPath->department ? [
                    'id' => $careerPath->department->id,
                    'name' => $careerPath->department->name,
                ] : null,
                'steps' => $careerPath->steps->map(fn ($step) => [
                    'id' => $step->id,
                    'order' => $step->order,
                    'track' => $step->track,
                    'from_position_id' => $step->from_position_id,
                    'to_position_id' => $step->to_position_id,
                    'from_position_name' => $step->getAttribute('from_position_name'),
                    'to_position_name' => $step->getAttribute('to_position_name'),
                ])->values(),
            ],
            'activeSelection' => $activeSelection ? [
                'id' => $activeSelection->id,
                'career_path_id' => $activeSelection->career_path_id,
                'is_active' => (bool) $activeSelection->is_active,
                'selected_at' => $activeSelection->selected_at?->toDateTimeString(),
            ] : null,
            'currentPosition' => $organizationUser->position ? [
                'id' => $organizationUser->position->id,
                'name' => $organizationUser->position->name,
            ] : null,
            'promotionEligibility' => $promotionEligibility,
            'currentStepIndex' => $currentStepIndex,
        ]);
    }

    public function store(Request $request, CareerPath $careerPath): RedirectResponse
    {
        $organizationId = (int) $request->session()->get('current_organization_id');
        $user = $request->user();

        $organizationUser = OrganizationUser::query()
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        abort_unless(
            $careerPath->organization_id === $organizationId && $careerPath->department_id === $organizationUser->department_id,
            403
        );

        $activeSelection = EmployeeCareerPathSelection::query()
            ->where('organization_id', $organizationId)
            ->where('organization_user_id', $organizationUser->id)
            ->where('is_active', true)
            ->first();

        if ($activeSelection && (int) $activeSelection->career_path_id !== (int) $careerPath->id) {
            return redirect()
                ->route('staff.career-paths.show', $activeSelection->career_path_id)
                ->with('status', 'Your career path is already selected. Only an administrator can change it.');
        }

        DB::transaction(function () use ($organizationId, $organizationUser, $careerPath) {
            EmployeeCareerPathSelection::query()
                ->where('organization_id', $organizationId)
                ->where('organization_user_id', $organizationUser->id)
                ->update(['is_active' => false]);

            EmployeeCareerPathSelection::updateOrCreate(
                [
                    'organization_id' => $organizationId,
                    'organization_user_id' => $organizationUser->id,
                    'career_path_id' => $careerPath->id,
                ],
                [
                    'is_active' => true,
                    'selected_at' => now(),
                ]
            );
        });

        return redirect()
            ->route('staff.career-paths.show', $careerPath)
            ->with('success', 'Career path selected successfully.');
    }
}
