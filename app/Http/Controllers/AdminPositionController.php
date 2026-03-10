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

        $positions = $this->positionService->getPositionsWithRelations($orgId, $search);

        return Inertia::render('Admin/Positions/Index', [
            'positions' => $positions,
            'search' => $search,
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

        return Inertia::render('Admin/Positions/Create', [
            'departments' => $departments,
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

        // TODO: Load related data (department, role, reporting position, users assigned, etc.)
        return Inertia::render('Admin/Positions/Show', [
            'position' => $position->load(['department', 'organization']),
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

        return Inertia::render('Admin/Positions/Edit', [
            'position' => $position,
            'departments' => $departments,
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
