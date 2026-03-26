<?php

namespace App\Http\Controllers;

use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\TrainerCertification;
use App\Models\TrainerProfile;
use App\Models\TrainerSpecialty;
use App\Services\CloudinaryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
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

        $certifications = $trainer->certifications()
            ->with([
                'specialty.skill:id,organization_id,name,description,type,category,is_active',
                'attachments',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (TrainerCertification $certification) => $this->certificationPayload($certification))
            ->values()
            ->all();

        return Inertia::render('Tutor/Skills/Index', [
            'trainer' => $summary,
            'assignedSkills' => $assignedSkills,
            'pendingSkills' => $pendingSkills,
            'availableSkills' => $availableSkills,
            'certifications' => $certifications,
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
            ->with([
                'specialty.skill:id,organization_id,name,description,type,category,is_active',
                'attachments',
            ])
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

        $certifications = $trainer->certifications()
            ->with([
                'specialty.skill:id,organization_id,name,description,type,category,is_active',
                'attachments',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (TrainerCertification $certification) => $this->certificationPayload($certification))
            ->values()
            ->all();

        return Inertia::render('Tutor/Certifications/Index', [
            'trainer' => $summary,
            'certifications' => $certifications,
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
                Rule::exists('skills', 'id')->where(function ( $query) use ($orgId) {
                    $query->where('is_active', true)
                        ->where(function ( $scope) use ($orgId) {
                            $scope->whereNull('organization_id')
                                ->orWhere('organization_id', $orgId);
                        })
                        ->where(function ($typeQuery) {
                            $typeQuery->whereNull('type')
                                ->orWhere('type', '!=', 'degree');
                        });
                }),
            ],
        ]);

        $skill = Skill::query()
            ->whereKey((int) $data['skill_id'])
            ->where('is_active', true)
            ->where(function ( $query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->where(function ( $query) {
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
                'nullable',
                'integer',
                Rule::exists('trainer_specialties', 'id')->where(function ($query) use ($trainer) {
                    $query->where('trainer_profile_id', $trainer->id);
                }),
            ],
            'name' => ['required', 'string', 'max:255'],
            'issuer' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'credential_id' => ['nullable', 'string', 'max:255'],
            'issued_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'notes' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $trainerSpecialtyId = filled($data['trainer_specialty_id'] ?? null)
            ? (int) $data['trainer_specialty_id']
            : null;

        $certification = TrainerCertification::query()->create([
            'trainer_specialty_id' => $trainerSpecialtyId,
            'trainer_profile_id' => $trainer->id,
            'name' => $data['name'],
            'issuer' => $data['issuer'] ?? null,
            'reference_number' => $data['reference_number'] ?? null,
            'credential_id' => $data['credential_id'] ?? null,
            'issued_at' => $data['issued_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        $files = $request->file('attachments', []);
        $files = is_array($files) ? $files : [$files];

        if (! empty($files)) {
            $cloudinary = app(CloudinaryService::class);

            foreach ($files as $file) {
                if (! $file) {
                    continue;
                }

                $uploaded = $cloudinary->upload($file, 'trainer_certifications');

                $certification->attachments()->create([
                    'name' => $file->hashName(),
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => (string) $file->getSize(),
                    'cloudinary_public_id' => (string) Arr::get($uploaded, 'public_id'),
                    'cloudinary_url' => (string) Arr::get($uploaded, 'url'),
                    'cloudinary_secure_url' => (string) Arr::get($uploaded, 'secure_url'),
                    'metadata' => $uploaded,
                ]);
            }
        }

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

    protected function trainerSpecialtiesQuery(Request $request, TrainerProfile $trainer, ?string $status = null)
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        return $trainer->specialties()
            ->whereHas('skill', function ( $query) use ($orgId) {
                $query->where('is_active', true)
                    ->where(function ( $scope) use ($orgId) {
                        $scope->whereNull('organization_id')
                            ->orWhere('organization_id', $orgId);
                    })
                    ->where(function ( $typeQuery) {
                        $typeQuery->whereNull('type')
                            ->orWhere('type', '!=', 'degree');
                    });
            })
            ->when($status !== null, fn ( $query) => $query->where('status', $status));
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
            'trainer_profile_id' => $certification->trainer_profile_id ?? null,
            'name' => $certification->name,
            'title' => $certification->title ?? $certification->name,
            'issuer' => $certification->issuer,
            'reference_number' => $certification->reference_number,
            'credential_id' => $certification->credential_id,
            'issued_at' => $certification->issued_at,
            'expires_at' => $certification->expires_at,
            'notes' => $certification->notes,
            'specialty' => $certification->relationLoaded('specialty') && $certification->specialty ? $this->specialtyPayload($certification->specialty) : null,
            'attachments' => $certification->relationLoaded('attachments')
                ? $certification->attachments->map(fn ($attachment) => $this->attachmentPayload($attachment))->values()->all()
                : [],
            'created_at' => $certification->created_at,
            'updated_at' => $certification->updated_at,
        ];
    }

    protected function attachmentPayload($attachment): array
    {
        return [
            'id' => $attachment->id,
            'trainer_certification_id' => $attachment->trainer_certification_id,
            'name' => $attachment->name,
            'original_name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'file_size' => $attachment->file_size,
            'cloudinary_public_id' => $attachment->cloudinary_public_id,
            'cloudinary_url' => $attachment->cloudinary_url,
            'cloudinary_secure_url' => $attachment->cloudinary_secure_url,
            'metadata' => $attachment->metadata,
            'created_at' => $attachment->created_at,
            'updated_at' => $attachment->updated_at,
        ];
    }
}