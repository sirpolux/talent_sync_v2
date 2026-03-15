<?php

namespace App\Http\Controllers;

use App\Contracts\PositionServiceInterface;
use App\Models\Department;
use App\Models\Position;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdminPositionController extends Controller
{
    /**
     * Constructor with dependency injection
     * Follows Dependency Inversion Principle - depends on interface, not concrete implementation
     */
    public function __construct(
        protected PositionServiceInterface $positionService
    ) {}

    /**
     * Display a listing of positions
     * GET /admin/positions
     */
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        $search = $request->input('search');
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 15);

        $departmentId = $request->input('department_id');
        $departmentFilter = null;

        if ($departmentId === 'org-wide') {
            $departmentFilter = 'org-wide';
        } elseif (is_numeric($departmentId)) {
            $departmentFilter = (int) $departmentId;
        }

        $result = $this->positionService->getPaginatedPositions($orgId, $search, $page, $perPage, $departmentFilter);

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Positions/Index', [
            'positions' => $result['data'],
            'pagination' => $result['pagination'],
            'search' => $search,
            'departments' => $departments,
            'department_id' => $departmentId,
        ]);
    }

    /**
     * Show the form for creating a new position
     * GET /admin/positions/create
     */
    public function create(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_code',
            ]);

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'level',
                'department_id',
            ]);

        // Reporting rule (frontend + backend should match):
        // A position can report to:
        // - positions in the SAME department, OR
        // - positions at management levels (senior/lead/manager/director) across the org.
        $reportingRule = [
            'managementLevels' => ['senior', 'lead', 'manager', 'director'],
        ];

        $reportingPositions = $positions
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'level' => $p->level,
                'department_id' => $p->department_id,
            ])
            ->values();

        return Inertia::render('Admin/Positions/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'reportingPositions' => $reportingPositions,
            'reportingRule' => $reportingRule,
            'levels' => ['entry', 'intermediate', 'senior', 'lead', 'manager', 'director'],
            'durationTypes' => ['days', 'weeks', 'months', 'years'],
        ]);
    }

    /**
     * Store a newly created position in storage
     * POST /admin/positions
     */
    public function store(StorePositionRequest $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        
        try {
            $this->positionService->createPosition(
                organizationId: $orgId,
                data: $request->validated(),
                userId: $request->user()?->id ?? 0
            );

            return redirect()
                ->route('admin.positions.index')
                ->with('status', 'Position created successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified position
     * GET /admin/positions/{position}
     */
    public function show(Request $request, Position $position): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        // Verify position belongs to current organization
        abort_unless($position->organization_id === $orgId, 404);

        return Inertia::render('Admin/Positions/Show', [
            'position' => $position->load(['department']),
        ]);
    }

    /**
     * Show the form for editing the specified position
     * GET /admin/positions/{position}/edit
     */
    public function edit(Request $request, Position $position): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        // Verify position belongs to current organization
        abort_unless($position->organization_id === $orgId, 404);

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_code',
            ]);

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'level',
                'department_id',
            ]);

        return Inertia::render('Admin/Positions/Edit', [
            'position' => $position,
            'departments' => $departments,
            'positions' => $positions,
            'levels' => ['entry', 'intermediate', 'senior', 'lead', 'manager', 'director'],
            'durationTypes' => ['days', 'weeks', 'months', 'years'],
        ]);
    }

    /**
     * Update the specified position in storage
     * PATCH /admin/positions/{position}
     */
    public function update(UpdatePositionRequest $request, Position $position): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        // Verify position belongs to current organization
        abort_unless($position->organization_id === $orgId, 404);

        try {
            $this->positionService->updatePosition(
                organizationId: $orgId,
                positionId: $position->id,
                data: $request->validated(),
                userId: $request->user()?->id ?? 0
            );

            return redirect()
                ->route('admin.positions.index')
                ->with('status', 'Position updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified position from storage
     * DELETE /admin/positions/{position}
     */
    public function destroy(Request $request, Position $position): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        // Verify position belongs to current organization
        abort_unless($position->organization_id === $orgId, 404);

        try {
            $this->positionService->deletePosition($orgId, $position->id);

            return redirect()
                ->route('admin.positions.index')
                ->with('status', 'Position deleted successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
