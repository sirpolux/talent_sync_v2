<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCareerPathRequest;
use App\Http\Requests\UpdateCareerPathRequest;
use App\Models\CareerPath;
use App\Models\CareerPathStep;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminCareerPathController extends Controller
{
    public function index(): Response
    {
        $orgId = (int) session('current_organization_id');

        $paths = CareerPath::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get()
            ->map(fn (CareerPath $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'is_active' => (bool) $p->is_active,
                'steps_count' => $p->steps()->count(),
            ])
            ->values();

        return Inertia::render('Admin/CareerPaths/Index', [
            'paths' => $paths,
        ]);
    }

    public function create(): Response
    {
        $orgId = (int) session('current_organization_id');

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get(['id', 'name', 'department_id'])
            ->map(fn (Position $p) => ['id' => $p->id, 'name' => $p->name, 'department_id' => $p->department_id])
            ->values();

        return Inertia::render('Admin/CareerPaths/Create', [
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }

    private function assertStepsMatchDepartmentScope(int $orgId, ?int $departmentId, array $steps): void
    {
        if ($departmentId === null || count($steps) === 0) {
            return;
        }

        $positionIds = collect($steps)
            ->flatMap(fn ($s) => [(int) $s['from_position_id'], (int) $s['to_position_id']])
            ->unique()
            ->values();

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->whereIn('id', $positionIds)
            ->get(['id', 'department_id'])
            ->keyBy('id');

        foreach ($positionIds as $pid) {
            if (! $positions->has($pid)) {
                throw ValidationException::withMessages([
                    'steps' => ['One or more positions are invalid.'],
                ]);
            }

            if ((int) $positions[$pid]->department_id !== $departmentId) {
                throw ValidationException::withMessages([
                    'steps' => ['All steps must use positions within the selected department.'],
                ]);
            }
        }
    }

    public function store(StoreCareerPathRequest $request): RedirectResponse
    {
        $orgId = (int) session('current_organization_id');
        $data = $request->validated();
       // dd($request->all());

        /** @var CareerPath $path */
        $path = CareerPath::make();

        $steps = $data['steps'] ?? [];
        $this->assertStepsMatchDepartmentScope($orgId, $data['department_id'] ?? null, $steps);

        DB::transaction(function () use ($orgId, $data, &$path, $steps) {
            $path = CareerPath::create([
                'organization_id' => $orgId,
                'department_id' => $data['department_id'] ?? null,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            ]);

            foreach ($steps as $step) {
                CareerPathStep::create([
                    'organization_id' => $orgId,
                    'career_path_id' => $path->id,
                    'from_position_id' => (int) $step['from_position_id'],
                    'to_position_id' => (int) $step['to_position_id'],
                    'track' => $step['track'] ?? null,
                    'order' => array_key_exists('order', $step) ? $step['order'] : null,
                ]);
            }
        });

        return redirect()
            ->route('admin.career-paths.show', $path->id)
            ->with('status', 'Career path created.');
    }

    public function show(string $id): Response
    {
        $orgId = (int) session('current_organization_id');

        $path = CareerPath::query()
            ->where('organization_id', $orgId)
            ->with(['department:id,name', 'steps'])
            ->findOrFail($id);

        $positionIds = $path->steps
            ->flatMap(fn (CareerPathStep $step) => [$step->from_position_id, $step->to_position_id])
            ->unique()
            ->values();

        $positionNames = Position::query()
            ->where('organization_id', $orgId)
            ->whereIn('id', $positionIds)
            ->pluck('name', 'id');

        $steps = $path->steps
            ->sortBy(fn (CareerPathStep $s) => $s->order ?? PHP_INT_MAX)
            ->values()
            ->map(fn (CareerPathStep $s) => [
                'id' => $s->id,
                'from_position_id' => $s->from_position_id,
                'from_position_name' => $positionNames[$s->from_position_id] ?? null,
                'to_position_id' => $s->to_position_id,
                'to_position_name' => $positionNames[$s->to_position_id] ?? null,
                'track' => $s->track,
                'order' => $s->order,
            ]);

        return Inertia::render('Admin/CareerPaths/Show', [
            'path' => [
                'id' => $path->id,
                'department_id' => $path->department_id,
                'department_name' => $path->department?->name,
                'name' => $path->name,
                'description' => $path->description,
                'is_active' => (bool) $path->is_active,
            ],
            'steps' => $steps,
        ]);
    }

    public function edit(string $id): Response
    {
        $orgId = (int) session('current_organization_id');

        $path = CareerPath::query()
            ->where('organization_id', $orgId)
            ->with('steps')
            ->findOrFail($id);

        $departments = Department::query()
            ->where('organization_id', $orgId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get(['id', 'name', 'department_id'])
            ->map(fn (Position $p) => ['id' => $p->id, 'name' => $p->name, 'department_id' => $p->department_id])
            ->values();

        return Inertia::render('Admin/CareerPaths/Edit', [
            'path' => [
                'id' => $path->id,
                'department_id' => $path->department_id,
                'name' => $path->name,
                'description' => $path->description,
                'is_active' => (bool) $path->is_active,
            ],
            'steps' => $path->steps
                ->sortBy(fn (CareerPathStep $s) => $s->order ?? PHP_INT_MAX)
                ->values()
                ->map(fn (CareerPathStep $s) => [
                    'id' => $s->id,
                    'from_position_id' => $s->from_position_id,
                    'to_position_id' => $s->to_position_id,
                    'track' => $s->track,
                    'order' => $s->order,
                ]),
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }

    public function update(UpdateCareerPathRequest $request, string $id): RedirectResponse
    {
        $orgId = (int) session('current_organization_id');
        $data = $request->validated();

        /** @var CareerPath $path */
        $path = CareerPath::query()
            ->where('organization_id', $orgId)
            ->findOrFail($id);

        $steps = $data['steps'] ?? [];
        $this->assertStepsMatchDepartmentScope($orgId, $data['department_id'] ?? null, $steps);

        DB::transaction(function () use ($orgId, $data, $path, $steps) {
            $path->update([
                'department_id' => $data['department_id'] ?? null,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $path->is_active,
            ]);

            if (array_key_exists('steps', $data)) {
                CareerPathStep::query()
                    ->where('organization_id', $orgId)
                    ->where('career_path_id', $path->id)
                    ->delete();

                foreach ($steps as $step) {
                    CareerPathStep::create([
                        'organization_id' => $orgId,
                        'career_path_id' => $path->id,
                        'from_position_id' => (int) $step['from_position_id'],
                        'to_position_id' => (int) $step['to_position_id'],
                        'track' => $step['track'] ?? null,
                        'order' => array_key_exists('order', $step) ? $step['order'] : null,
                    ]);
                }
            }
        });

        return redirect()
            ->route('admin.career-paths.show', $path->id)
            ->with('status', 'Career path updated.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $orgId = (int) session('current_organization_id');

        $path = CareerPath::query()
            ->where('organization_id', $orgId)
            ->findOrFail($id);

        $path->delete();

        return redirect()
            ->route('admin.career-paths.index')
            ->with('status', 'Career path deleted.');
    }
}
