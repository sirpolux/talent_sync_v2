<?php

namespace App\Http\Controllers;

use App\Models\GradingSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminGradingSystemController extends Controller
{
    public function index(Request $request)
    {
        $query = GradingSystem::with(['organization', 'grades'])
            ->withCount('positions');

        // Filter by type (system-wide vs organization-specific)
        if ($request->filled('type')) {
            if ($request->type === 'system') {
                $query->whereNull('organization_id');
            } elseif ($request->type === 'organization') {
                $query->whereNotNull('organization_id');
            }
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $gradingSystems = $query->paginate(15)->through(function ($system) {
            return [
                'id' => $system->id,
                'name' => $system->name,
                'description' => $system->description,
                'is_default' => $system->is_default,
                'is_system_wide' => $system->organization_id === null,
                'organization' => $system->organization ? [
                    'id' => $system->organization->id,
                    'name' => $system->organization->name,
                ] : null,
                'grades_count' => $system->grades->count(),
                'positions_count' => $system->positions_count,
                'created_at' => $system->created_at,
            ];
        });

        return Inertia::render('Admin/GradingSystems/Index', [
            'gradingSystems' => $gradingSystems,
            'filters' => $request->only(['type', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/GradingSystems/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_default' => 'boolean',
            'grades' => 'required|array|min:1',
            'grades.*.label' => 'required|string|max:50',
            'grades.*.min_value' => 'required|numeric|min:0|max:100',
            'grades.*.max_value' => 'required|numeric|min:0|max:100|gte:grades.*.min_value',
            'grades.*.description' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            $gradingSystem = GradingSystem::create([
                'organization_id' => auth()->user()->currentOrganization->id ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'],
                'is_default' => $validated['is_default'] ?? false,
            ]);

            // Sort grades by min_value descending (highest first)
            $grades = collect($validated['grades'])->sortByDesc('min_value')->values();

            foreach ($grades as $index => $gradeData) {
                $gradingSystem->grades()->create([
                    'label' => $gradeData['label'],
                    'min_value' => $gradeData['min_value'],
                    'max_value' => $gradeData['max_value'],
                    'description' => $gradeData['description'],
                    'order' => $index + 1,
                ]);
            }
        });

        return redirect()->route('admin.grading.index')
            ->with('success', 'Grading system created successfully.');
    }

    public function show($id)
    {
        $gradingSystem = GradingSystem::with(['organization', 'grades' => function ($query) {
            $query->orderBy('order');
        }, 'positions'])
            ->findOrFail($id);

        return Inertia::render('Admin/GradingSystems/Show', [
            'gradingSystem' => [
                'id' => $gradingSystem->id,
                'name' => $gradingSystem->name,
                'description' => $gradingSystem->description,
                'is_default' => $gradingSystem->is_default,
                'is_system_wide' => $gradingSystem->organization_id === null,
                'organization' => $gradingSystem->organization ? [
                    'id' => $gradingSystem->organization->id,
                    'name' => $gradingSystem->organization->name,
                ] : null,
                'grades' => $gradingSystem->grades->map(function ($grade) {
                    return [
                        'id' => $grade->id,
                        'label' => $grade->label,
                        'min_value' => $grade->min_value,
                        'max_value' => $grade->max_value,
                        'description' => $grade->description,
                        'order' => $grade->order,
                    ];
                }),
                'positions' => $gradingSystem->positions->map(function ($position) {
                    return [
                        'id' => $position->id,
                        'title' => $position->title,
                        'department' => $position->department ? [
                            'id' => $position->department->id,
                            'name' => $position->department->name,
                        ] : null,
                    ];
                }),
                'created_at' => $gradingSystem->created_at,
                'updated_at' => $gradingSystem->updated_at,
            ],
        ]);
    }

    public function edit($id)
    {
        $gradingSystem = GradingSystem::with(['grades' => function ($query) {
            $query->orderBy('order');
        }])->findOrFail($id);

        return Inertia::render('Admin/GradingSystems/Edit', [
            'gradingSystem' => [
                'id' => $gradingSystem->id,
                'name' => $gradingSystem->name,
                'description' => $gradingSystem->description,
                'is_default' => $gradingSystem->is_default,
                'grades' => $gradingSystem->grades->map(function ($grade) {
                    return [
                        'id' => $grade->id,
                        'label' => $grade->label,
                        'min_value' => $grade->min_value,
                        'max_value' => $grade->max_value,
                        'description' => $grade->description,
                    ];
                }),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $gradingSystem = GradingSystem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_default' => 'boolean',
            'grades' => 'required|array|min:1',
            'grades.*.label' => 'required|string|max:50',
            'grades.*.min_value' => 'required|numeric|min:0|max:100',
            'grades.*.max_value' => 'required|numeric|min:0|max:100|gte:grades.*.min_value',
            'grades.*.description' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($gradingSystem, $validated) {
            $gradingSystem->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'is_default' => $validated['is_default'] ?? false,
            ]);

            // Delete existing grades
            $gradingSystem->grades()->delete();

            // Sort grades by min_value descending (highest first)
            $grades = collect($validated['grades'])->sortByDesc('min_value')->values();

            foreach ($grades as $index => $gradeData) {
                $gradingSystem->grades()->create([
                    'label' => $gradeData['label'],
                    'min_value' => $gradeData['min_value'],
                    'max_value' => $gradeData['max_value'],
                    'description' => $gradeData['description'],
                    'order' => $index + 1,
                ]);
            }
        });

        return redirect()->route('admin.grading.show', $gradingSystem)
            ->with('success', 'Grading system updated successfully.');
    }

    public function destroy($id)
    {
        $gradingSystem = GradingSystem::findOrFail($id);

        // Check if grading system is being used by positions
        if ($gradingSystem->positions()->count() > 0) {
            return back()->withErrors([
                'grading_system' => 'Cannot delete grading system that is being used by positions.',
            ]);
        }

        $gradingSystem->delete();

        return redirect()->route('admin.grading.index')
            ->with('success', 'Grading system deleted successfully.');
    }
}
