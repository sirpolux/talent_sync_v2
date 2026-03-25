<?php

namespace App\Http\Controllers;

use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\TrainerCertification;
use App\Models\TrainerProfile;
use App\Models\TrainerSpecialty;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TutorSkillController extends Controller
{
    public function index(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);

        $summary = $this->trainerSummary($trainer);

        $assignedSkills = $this->trainerSpecialtiesQuery($request, $trainer, 'approved')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtyPayload($specialty))
            ->values()
            ->all();

        $pendingSkills = $this->trainerSpecialtiesQuery($request, $trainer, 'pending')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtyPayload($specialty))
            ->values()
            ->all();

        $availableSkills = $this->availableSkillsQuery($request, $trainer)
            ->orderBy('name')
            ->get(['id', 'organization_id', 'name', 'description', 'type', 'category', 'is_active'])
            ->map(fn (Skill $skill) => $this->skillPayload($skill))
            ->values()
            ->all();

        $certificationsBySpecialty = $this->trainerSpecialtiesQuery($request, $trainer)
            ->with(['skill:id,organization_id,name,description,type,category,is_active', 'certifications' => fn ($query) => $query->orderByDesc('created_at')])
            ->orderBy('name')
            ->get()
            ->map(function (TrainerSpecialty $specialty) {
                return [
                    'specialty' => $this->specialtyPayload($specialty),
                    'certifications' => $specialty->certifications
                        ->map(fn (TrainerCertification $certification) => $this->certificationPayload($certification))
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Tutor/Skills/Index', [
            'trainer' => $summary,
            'assignedSkills' => $assignedSkills,
            'pendingSkills' => $pendingSkills,
            'availableSkills' => $availableSkills,
            'certificationsBySpecialty' => $certificationsBySpecialty,
        ]);
    }

    public function create(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $summary = $this->trainerSummary($trainer);

        $availableSkills = $this->availableSkillsQuery($request, $trainer)
            ->orderBy('name')
            ->get(['id', 'organization_id', 'name', 'description', 'type', 'category', 'is_active'])
            ->map(fn (Skill $skill) => $this->skillPayload($skill))
            ->values()
            ->all();

        return Inertia::render('Tutor/Skills/Create', [
            'trainer' => $summary,
            'availableSkills' => $availableSkills,
        ]);
    }

    public function show(Request $request, TrainerSpecialty $specialty): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSpecialtyOwnership($trainer, $specialty);

        $query = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        $certifications = $specialty->certifications()
            ->when($query !== '', function (Builder $builder) use ($query) {
                $builder->where(function (Builder $search) use ($query) {
                    $search->where('title', 'like', "%{$query}%")
                        ->orWhere('issuer', 'like', "%{$query}%")
                        ->orWhere('reference_number', 'like', "%{$query}%")
                        ->orWhere('notes', 'like', "%{$query}%");
                });
            })
            ->when($status !== '', function (Builder $builder) use ($status) {
                if ($status === 'expiring') {
                    $builder->whereNotNull('expires_at')->whereDate('expires_at', '<=', now()->addMonths(3));
                } elseif ($status === 'expired') {
                    $builder->whereNotNull('expires_at')->whereDate('expires_at', '<', now());
                }
            })
            ->orderByDesc('created_at')
            ->paginate((int) $request->integer('per_page', 10))
            ->withQueryString()
            ->through(fn (TrainerCertification $certification) => $this->certificationPayload($certification));

        return Inertia::render('Tutor/Skills/Show', [
            'trainer' => $this->trainerSummary($trainer),
            'specialty' => $this->specialtyPayload($specialty->loadMissing('skill:id,organization_id,name,description,type,category,is_active')),
            'certifications' => $this->paginationPayload($certifications),
            'filters' => [
                'search' => $query,
                'status' => $status,
                'per_page' => (int) $request->integer('per_page', 10),
            ],
        ]);
    }

    public function certifications(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $summary = $this->trainerSummary($trainer);

        $specialties = $this->trainerSpecialtiesQuery($request, $trainer)
            ->with(['skill:id,organization_id,name,description,type,category,is_active', 'certifications' => fn ($query) => $query->orderByDesc('created_at')])
            ->orderBy('name')
            ->get()
            ->map(function (TrainerSpecialty $specialty) {
                return [
                    'specialty' => $this->specialtyPayload($specialty),
                    'certifications' => $specialty->certifications
                        ->map(fn (TrainerCertification $certification) => $this->certificationPayload($certification))
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Tutor/Certifications/Index', [
            'trainer' => $summary,
            'specialties' => $specialties,
        ]);
    }

    public function createCertification(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $summary = $this->trainerSummary($trainer);

        $specialties = $this->trainerSpecialtiesQuery($request, $trainer, 'approved')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->orderBy('name')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtyPayload($specialty))
            ->values()
            ->all();

        return Inertia::render('Tutor/Certifications/Create', [
            'trainer' => $summary,
            'specialties' => $specialties,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function (Builder $query) use ($orgId) {
                    $query->where('is_active', true)
                        ->where(function (Builder $scope) use ($orgId) {
                            $scope->whereNull('organization_id')
                                ->orWhere('organization_id', $orgId);
                        })
                        ->where(function (Builder $typeQuery) {
                            $typeQuery->whereNull('type')
                                ->orWhere('type', '!=', 'degree');
                        });
                }),
            ],
        ]);

        $skill = Skill::query()
            ->whereKey((int) $data['skill_id'])
            ->where('is_active', true)
            ->where(function (Builder $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $query) {
                $query->whereNull('type')
                    ->orWhere('type', '!=', 'degree');
            })
            ->firstOrFail();

        $existing = TrainerSpecialty::query()
            ->where('trainer_profile_id', $trainer->id)
            ->where('skill_id', $skill->id)
            ->first();

        if ($existing) {
            return back()->withErrors(['skill_id' => 'This skill is already requested or assigned to your profile.']);
        }

        TrainerSpecialty::query()->create([
            'trainer_profile_id' => $trainer->id,
            'skill_id' => $skill->id,
            'name' => $skill->name,
            'description' => $skill->description,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Skill request submitted successfully.');
    }

    public function storeCertification(Request $request): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);

        $data = $request->validate([
            'trainer_specialty_id' => [
                'required',
                'integer',
                Rule::exists('trainer_specialties', 'id')->where(function (Builder $query) use ($trainer) {
                    $query->where('trainer_profile_id', $trainer->id);
                }),
            ],
            'title' => ['required', 'string', 'max:255'],
            'issuer' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'issued_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'notes' => ['nullable', 'string'],
        ]);

        TrainerCertification::query()->create([
            'trainer_specialty_id' => $data['trainer_specialty_id'],
            'title' => $data['title'],
            'issuer' => $data['issuer'] ?? null,
            'reference_number' => $data['reference_number'] ?? null,
            'issued_at' => $data['issued_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'Certification added successfully.');
    }

    protected function resolveTrainerProfile(Request $request): TrainerProfile
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $membership = OrganizationUser::query()
            ->with('user:id,name,email')
            ->where('organization_id', $orgId)
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();

        $trainer = TrainerProfile::query()
            ->with('organizationUser')
            ->where('organization_user_id', $membership->id)
            ->firstOrFail();

        abort_unless((int) $trainer->organizationUser?->organization_id === $orgId, 403);

        return $trainer;
    }

    protected function trainerSpecialtiesQuery(Request $request, TrainerProfile $trainer, ?string $status = null): Builder
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        return $trainer->specialties()
            ->whereHas('skill', function (Builder $query) use ($orgId) {
                $query->where('is_active', true)
                    ->where(function (Builder $scope) use ($orgId) {
                        $scope->whereNull('organization_id')
                            ->orWhere('organization_id', $orgId);
                    })
                    ->where(function (Builder $typeQuery) {
                        $typeQuery->whereNull('type')
                            ->orWhere('type', '!=', 'degree');
                    });
            })
            ->when($status !== null, fn (Builder $query) => $query->where('status', $status));
    }

    protected function availableSkillsQuery(Request $request, TrainerProfile $trainer): Builder
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $assignedSkillIds = $trainer->specialties()
            ->pluck('skill_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values();

        return Skill::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function (Builder $query) {
                $query->whereNull('type')
                    ->orWhere('type', '!=', 'degree');
            })
            ->whereNotIn('id', $assignedSkillIds);
    }

    protected function assertTrainerSpecialtyOwnership(TrainerProfile $trainer, TrainerSpecialty $specialty): void
    {
        abort_unless((int) $specialty->trainer_profile_id === (int) $trainer->id, 403);
    }

    protected function paginationPayload($paginator): array
    {
        return [
            'data' => $paginator->items(),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }

    protected function trainerSummary(TrainerProfile $trainer): array
    {
        return [
            'id' => $trainer->id,
            'organization_id' => $trainer->organizationUser?->organization_id,
            'organization_user_id' => $trainer->organization_user_id,
            'status' => $trainer->status,
            'name' => $trainer->organizationUser?->user?->name,
            'email' => $trainer->organizationUser?->user?->email,
        ];
    }

    protected function specialtyPayload(TrainerSpecialty $specialty): array
    {
        return [
            'id' => $specialty->id,
            'trainer_profile_id' => $specialty->trainer_profile_id,
            'skill_id' => $specialty->skill_id,
            'name' => $specialty->name,
            'description' => $specialty->description,
            'status' => $specialty->status ?? 'approved',
            'skill' => $specialty->relationLoaded('skill') && $specialty->skill ? $this->skillPayload($specialty->skill) : null,
        ];
    }

    protected function skillPayload(Skill $skill): array
    {
        return [
            'id' => $skill->id,
            'organization_id' => $skill->organization_id,
            'name' => $skill->name,
            'description' => $skill->description,
            'type' => $skill->type,
            'category' => $skill->category,
            'is_active' => (bool) $skill->is_active,
        ];
    }

    protected function certificationPayload(TrainerCertification $certification): array
    {
        return [
            'id' => $certification->id,
            'trainer_specialty_id' => $certification->trainer_specialty_id,
            'title' => $certification->title,
            'issuer' => $certification->issuer,
            'reference_number' => $certification->reference_number,
            'issued_at' => $certification->issued_at,
            'expires_at' => $certification->expires_at,
            'notes' => $certification->notes,
            'created_at' => $certification->created_at,
            'updated_at' => $certification->updated_at,
        ];
    }
}