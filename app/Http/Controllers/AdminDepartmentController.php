<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\PositionService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminDepartmentController extends Controller
{
    public function __construct(
        protected PositionService $positionService
    ) {}
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get([
                'id',
                'organization_id',
                'name',
                'slug',
                'department_code',
                'description',
                'roles_count',
                'staff_count',
                'created_at',
            ]);

        return Inertia::render('Admin/Departments/Index', [
            'departments' => $departments,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Departments/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department_code' => ['nullable', 'string', 'max:20'],
            'description' => ['required', 'string'],
        ]);

        $baseSlug = Str::slug($data['name']);

        $exists = Department::query()
            ->where('organization_id', $orgId)
            ->where('slug', $baseSlug)
            ->exists();

        if ($exists) {
            return back()
                ->withErrors(['name' => 'This department already exists in this organization.'])
                ->withInput();
        }

        try {
            Department::create([
                'organization_id' => $orgId,
                'added_by' => $request->user()?->id,
                'name' => $data['name'],
                'department_code' => $data['department_code'] ?? null,
                'description' => $data['description'],
                'slug' => $baseSlug,
            ]);
        } catch (QueryException $e) {
            // In case of a race condition (two requests created same slug simultaneously)
            if (str_contains((string) $e->getMessage(), 'departments_organization_id_slug_unique')) {
                return back()
                    ->withErrors(['name' => 'This department already exists in this organization.'])
                    ->withInput();
            }

            throw $e;
        }

        return redirect()->route('admin.departments.index')->with('status', 'Department created.');
    }

    public function edit(Request $request, Department $department): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($department->organization_id === $orgId, 404);

        return Inertia::render('Admin/Departments/Edit', [
            'department' => $department->only([
                'id',
                'name',
                'slug',
                'department_code',
                'description',
            ]),
            'status' => session('status'),
        ]);
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($department->organization_id === $orgId, 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department_code' => ['nullable', 'string', 'max:20'],
            'description' => ['required', 'string'],
        ]);

        $baseSlug = Str::slug($data['name']);

        $exists = Department::query()
            ->where('organization_id', $orgId)
            ->where('slug', $baseSlug)
            ->where('id', '!=', $department->id)
            ->exists();

        if ($exists) {
            return back()
                ->withErrors(['name' => 'This department already exists in this organization.'])
                ->withInput();
        }

        try {
            $department->update([
                ...$data,
                'slug' => $baseSlug,
            ]);
        } catch (QueryException $e) {
            if (str_contains((string) $e->getMessage(), 'departments_organization_id_slug_unique')) {
                return back()
                    ->withErrors(['name' => 'This department already exists in this organization.'])
                    ->withInput();
            }

            throw $e;
        }

        return redirect()->route('admin.departments.edit', $department)->with('status', 'Department updated.');
    }

    public function destroy(Request $request, Department $department): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($department->organization_id === $orgId, 404);

        $department->update([
            'is_active' => false,
            'deactivated_at' => now(),
        ]);

        return redirect()->route('admin.departments.show', $department)->with('status', 'Department deactivated.');
    }

    public function activate(Request $request, Department $department): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($department->organization_id === $orgId, 404);

        $department->update([
            'is_active' => true,
            'deactivated_at' => null,
        ]);

        return redirect()->route('admin.departments.show', $department)->with('status', 'Department activated.');
    }

    public function show(Request $request, Department $department): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($department->organization_id === $orgId, 404);

        $search = $request->input('positions_search');
        $page = (int) $request->input('positions_page', 1);
        $perPage = (int) $request->input('positions_per_page', 10);

        $positionsResult = $this->positionService->getPaginatedPositions(
            organizationId: $orgId,
            search: $search,
            page: $page,
            perPage: $perPage,
            departmentId: $department->id
        );

        return Inertia::render('Admin/Departments/Show', [
            'department' => $department->only([
                'id',
                'name',
                'slug',
                'department_code',
                'description',
                'roles_count',
                'staff_count',
                'created_at',
                'is_active',
                'deactivated_at',
            ]),
            'positions' => $positionsResult['data'],
            'positionsPagination' => $positionsResult['pagination'],
            'positionsSearch' => $search,
        ]);
    }   
}
