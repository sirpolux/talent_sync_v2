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

    public function store(StoreCareerPathRequest $request): RedirectResponse
    {
        $orgId = (int) session('current_organization_id');
        $data = $request->validated();

        /** @var CareerPath $path */
        $path = CareerPath::make();

        DB::transaction(function () use ($orgId, $data, &$path) {
            $path = CareerPath::create([
                'organization_id' => $orgId,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            ]);

            $steps = $data['steps'] ?? [];
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
            ->with(['steps.fromPosition:id,name', 'steps.toPosition:id,name'])
            ->findOrFail($id);

        $steps = $path->steps
            ->sortBy(fn (CareerPathStep $s) => $s->order ?? PHP_INT_MAX)
            ->values()
            ->map(fn (CareerPathStep $s) => [
                'id' => $s->id,
                'from_position_id' => $s->from_position_id,
                'from_position_name' => $s->fromPosition?->name,
                'to_position_id' => $s->to_position_id,
                'to_position_name' => $s->toPosition?->name,
                'track' => $s->track,
                'order' => $s->order,
            ]);

        return Inertia::render('Admin/CareerPaths/Show', [
            'path' => [
                'id' => $path->id,
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

        $positions = Position::query()
            ->where('organization_id', $orgId)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Position $p) => ['id' => $p->id, 'name' => $p->name])
            ->values();

        return Inertia::render('Admin/CareerPaths/Edit', [
            'path' => [
                'id' => $path->id,
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

        DB::transaction(function () use ($orgId, $data, $path) {
            $path->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $path->is_active,
            ]);

            if (array_key_exists('steps', $data)) {
                CareerPathStep::query()
                    ->where('organization_id', $orgId)
                    ->where('career_path_id', $path->id)
                    ->delete();

                $steps = $data['steps'] ?? [];
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
