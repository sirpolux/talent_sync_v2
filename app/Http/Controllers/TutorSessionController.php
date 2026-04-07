<?php

namespace App\Http\Controllers;

use App\Models\OrganizationUser;
use App\Models\Skill;
use App\Models\TrainingSession;
use App\Models\TrainingSessionParticipant;
use App\Models\TrainerProfile;
use App\Models\TrainerSpecialty;
use App\Notifications\TrainingSessionApplicationStatusNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TutorSessionController extends Controller
{
    public const ACTIVE_STATUSES = ['scheduled', 'active'];
    public const SESSION_STATUSES = ['scheduled', 'active', 'completed', 'cancelled', 'paused'];
    public const PARTICIPANT_REVIEWABLE_STATUSES = ['pending', 'waitlisted'];
    public const PARTICIPANT_MANAGEABLE_STATUSES = ['pending', 'approved', 'waitlisted'];
    public const PARTICIPANT_FINAL_STATUSES = ['approved', 'rejected', 'waitlisted', 'withdrawn', 'completed', 'cancelled', 'no_show'];

    public function index(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $summary = $this->trainerSummary($trainer);

        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'skillId' => $request->integer('skill_id') ?: null,
            'perPage' => (int) $request->integer('per_page', 10),
        ];

        $sessions = $this->sessionsQuery($request, $trainer)
            ->with([
                'skill:id,organization_id,name,description,type,category,is_active',
                'participants.organizationUser.user:id,name,email',
                'progress.participant.user:id,name,email',
                'assessmentUploads.participant.user:id,name,email',
            ])
            ->withCount([
                'participants as pending_participants_count' => fn (Builder $query) => $query->where('status', 'pending'),
                'participants as approved_participants_count' => fn (Builder $query) => $query->where('status', 'approved'),
                'participants as rejected_participants_count' => fn (Builder $query) => $query->where('status', 'rejected'),
                'participants as waitlisted_participants_count' => fn (Builder $query) => $query->where('status', 'waitlisted'),
                'participants as withdrawn_participants_count' => fn (Builder $query) => $query->where('status', 'withdrawn'),
            ])
            ->orderByDesc('start_date')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (TrainingSession $session) => $this->sessionPayload($session));

        $skills = $trainer->specialties()
            ->where('status', 'approved')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtySkillPayload($specialty, $trainer))
            ->values()
            ->all();

        return Inertia::render('Tutor/Sessions/Index', [
            'trainer' => $summary,
            'sessions' => $this->paginationPayload($sessions),
            'filters' => $filters,
            'skills' => $skills,
        ]);
    }

    public function create(Request $request): Response
    {
        $trainer = $this->resolveTrainerProfile($request);

        $skills = $trainer->specialties()
            ->where('status', 'approved')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->orderBy('name')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtySkillPayload($specialty, $trainer))
            ->values()
            ->all();

        return Inertia::render('Tutor/Sessions/Create', [
            'trainer' => $this->trainerSummary($trainer),
            'skills' => $skills,
            'session' => null,
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $this->validatedSessionData($request, $orgId);

        $skill = $this->resolveApprovedSkill($trainer, $orgId, (int) $data['skill_id']);

        if ($this->activeSessionCountForSkill($trainer, $skill->id) >= 3 && $this->isActiveStatus($data['status'])) {
            return back()
                ->withErrors(['skill_id' => 'You cannot have more than 3 scheduled or active sessions for the same skill.'])
                ->withInput();
        }

        $session = TrainingSession::query()->create($this->sessionWritePayload($trainer, $orgId, $skill->id, $data));

        return redirect()
            ->route('trainer.sessions.show', $session)
            ->with('success', 'Training session created successfully.');
    }

    public function edit(Request $request, TrainingSession $session): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSessionOwnership($trainer, $session);

        $skills = $trainer->specialties()
            ->where('status', 'approved')
            ->with('skill:id,organization_id,name,description,type,category,is_active')
            ->orderBy('name')
            ->get()
            ->map(fn (TrainerSpecialty $specialty) => $this->specialtySkillPayload($specialty, $trainer))
            ->values()
            ->all();

        return Inertia::render('Tutor/Sessions/Create', [
            'trainer' => $this->trainerSummary($trainer),
            'skills' => $skills,
            'session' => $this->editableSessionPayload($session),
            'mode' => 'edit',
        ]);
    }

    public function update(Request $request, TrainingSession $session): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $orgId = (int) $request->session()->get('current_organization_id');
        $this->assertTrainerSessionOwnership($trainer, $session);

        $data = $this->validatedSessionData($request, $orgId);
        $skill = $this->resolveApprovedSkill($trainer, $orgId, (int) $data['skill_id']);

        $activeCount = $trainer->trainingSessions()
            ->where('skill_id', $skill->id)
            ->where('id', '!=', $session->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->count();

        if ($activeCount >= 3 && $this->isActiveStatus($data['status'])) {
            return back()
                ->withErrors(['skill_id' => 'You cannot have more than 3 scheduled or active sessions for the same skill.'])
                ->withInput();
        }

        $session->update($this->sessionWritePayload($trainer, $orgId, $skill->id, $data));

        return redirect()
            ->route('trainer.sessions.show', $session)
            ->with('success', 'Training session updated successfully.');
    }

    public function cancel(Request $request, TrainingSession $session): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSessionOwnership($trainer, $session);

        abort_unless($session->status !== 'completed', 422, 'Completed sessions cannot be cancelled.');

        $session->update([
            'status' => 'cancelled',
        ]);

        TrainingSessionParticipant::query()
            ->where('training_session_id', $session->id)
            ->whereIn('status', ['pending', 'approved', 'waitlisted'])
            ->update([
                'status' => 'cancelled',
                'reviewed_by' => $request->user()?->id,
                'reviewed_at' => now(),
                'review_notes' => 'Session was cancelled by the tutor.',
            ]);

        return redirect()
            ->route('trainer.sessions.show', $session)
            ->with('success', 'Training session cancelled successfully.');
    }

    public function reviewParticipant(Request $request, TrainingSession $session, TrainingSessionParticipant $participant): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSessionOwnership($trainer, $session);
        $this->assertParticipantBelongsToSession($session, $participant);

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['approved', 'rejected', 'waitlisted'])],
            'review_notes' => ['nullable', 'string'],
        ]);

        abort_unless(in_array($participant->status, self::PARTICIPANT_REVIEWABLE_STATUSES, true), 422, 'This application is no longer reviewable.');

        if ($data['status'] === 'approved') {
            $capacity = $this->sessionCapacity($session);
            $approvedCount = $this->approvedParticipantCount($session);

            if ($capacity !== null && $approvedCount >= $capacity) {
                return back()->with('error', 'This session is already at capacity. Approve a waitlisted participant only after a slot becomes available.');
            }
        }

        $participant->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $data['review_notes'] ?? null,
        ]);

        $this->notifyParticipantStatusChange($session, $participant->fresh());

        return redirect()
            ->route('trainer.sessions.show', $session)
            ->with('success', 'Participant application reviewed successfully.');
    }

    public function markParticipantStatus(Request $request, TrainingSession $session, TrainingSessionParticipant $participant): RedirectResponse
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSessionOwnership($trainer, $session);
        $this->assertParticipantBelongsToSession($session, $participant);

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['completed', 'no_show', 'cancelled'])],
            'review_notes' => ['nullable', 'string'],
        ]);

        abort_unless(in_array($participant->status, ['approved'], true), 422, 'Only approved participants can be moved to a final attendance status.');

        $participant->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $data['review_notes'] ?? $participant->review_notes,
        ]);

        $this->notifyParticipantStatusChange($session, $participant->fresh());

        return redirect()
            ->route('trainer.sessions.show', $session)
            ->with('success', 'Participant attendance status updated successfully.');
    }

    public function show(Request $request, TrainingSession $session): Response
    {
        $trainer = $this->resolveTrainerProfile($request);
        $this->assertTrainerSessionOwnership($trainer, $session);

        $session->load([
            'skill:id,organization_id,name,description,type,category,is_active',
            'participants.organizationUser.user:id,name,email',
            'progress.participant.user:id,name,email',
            'progress.updater.user:id,name,email',
            'assessmentUploads.participant.user:id,name,email',
            'assessmentUploads.uploader.user:id,name,email',
            'assessmentUploads.reviewer.user:id,name,email',
        ]);

        $session->loadCount([
            'participants as pending_participants_count' => fn (Builder $query) => $query->where('status', 'pending'),
            'participants as approved_participants_count' => fn (Builder $query) => $query->where('status', 'approved'),
            'participants as rejected_participants_count' => fn (Builder $query) => $query->where('status', 'rejected'),
            'participants as waitlisted_participants_count' => fn (Builder $query) => $query->where('status', 'waitlisted'),
            'participants as withdrawn_participants_count' => fn (Builder $query) => $query->where('status', 'withdrawn'),
        ]);

        return Inertia::render('Tutor/Sessions/Show', [
            'trainer' => $this->trainerSummary($trainer),
            'session' => $this->sessionPayload($session),
            'participants' => $session->participants->map(fn ($participant) => [
                'id' => $participant->id,
                'training_session_id' => $participant->training_session_id,
                'organization_user_id' => $participant->organization_user_id,
                'status' => $participant->status,
                'reviewed_by' => $participant->reviewed_by,
                'reviewed_at' => $participant->reviewed_at,
                'review_notes' => $participant->review_notes,
                'organization_user' => $this->organizationUserPayload($participant->organizationUser),
            ])->values()->all(),
            'progress' => $session->progress->map(fn ($progress) => [
                'id' => $progress->id,
                'training_session_id' => $progress->training_session_id,
                'training_session_participant_id' => $progress->training_session_participant_id,
                'participant_organization_user_id' => $progress->participant_organization_user_id,
                'updater_organization_user_id' => $progress->updater_organization_user_id,
                'notes' => $progress->notes,
                'status' => $progress->status,
                'participant' => $this->organizationUserPayload($progress->participant),
                'updater' => $this->organizationUserPayload($progress->updater),
                'created_at' => $progress->created_at,
                'updated_at' => $progress->updated_at,
            ])->values()->all(),
            'assessmentUploads' => $session->assessmentUploads->map(fn ($upload) => [
                'id' => $upload->id,
                'training_session_id' => $upload->training_session_id,
                'training_session_participant_id' => $upload->training_session_participant_id,
                'uploader_organization_user_id' => $upload->uploader_organization_user_id,
                'reviewer_organization_user_id' => $upload->reviewer_organization_user_id,
                'file_path' => $upload->file_path,
                'original_name' => $upload->original_name,
                'status' => $upload->status,
                'participant' => $this->organizationUserPayload($upload->participant),
                'uploader' => $this->organizationUserPayload($upload->uploader),
                'reviewer' => $this->organizationUserPayload($upload->reviewer),
                'created_at' => $upload->created_at,
                'updated_at' => $upload->updated_at,
            ])->values()->all(),
        ]);
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

    protected function sessionsQuery(Request $request, TrainerProfile $trainer)
    {
        $query = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $skillId = $request->integer('skill_id');

        return $trainer->trainingSessions()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($search) use ($query) {
                    $search->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('location', 'like', "%{$query}%")
                        ->orWhere('mode', 'like', "%{$query}%");
                });
            })
            ->when($status !== '', fn ($builder) => $builder->where('status', $status))
            ->when($skillId, fn ($builder) => $builder->where('skill_id', $skillId));
    }

    protected function activeSessionCountForSkill(TrainerProfile $trainer, int $skillId): int
    {
        return $trainer->trainingSessions()
            ->where('skill_id', $skillId)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->count();
    }

    protected function sessionStatuses(): array
    {
        return self::SESSION_STATUSES;
    }

    protected function isActiveStatus(string $status): bool
    {
        return in_array($status, self::ACTIVE_STATUSES, true);
    }

    protected function assertTrainerSessionOwnership(TrainerProfile $trainer, TrainingSession $session): void
    {
        abort_unless(
            (int) $session->trainer_profile_id === (int) $trainer->id
            && (int) $session->organization_id === (int) $trainer->organizationUser?->organization_id,
            403
        );
    }

    protected function assertParticipantBelongsToSession(TrainingSession $session, TrainingSessionParticipant $participant): void
    {
        abort_unless(
            (int) $participant->training_session_id === (int) $session->id
            && (int) $participant->organization_id === (int) $session->organization_id,
            404
        );
    }

    protected function validatedSessionData(Request $request, int $orgId): array
    {
        return $request->validate([
            'skill_id' => [
                'required',
                'integer',
                Rule::exists('skills', 'id')->where(function ($query) use ($orgId) {
                    $query->where('is_active', true)
                        ->where(function ($scope) use ($orgId) {
                            $scope->whereNull('organization_id')
                                ->orWhere('organization_id', $orgId);
                        });
                }),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:10080'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'calendar_link' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in($this->sessionStatuses())],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'mode' => ['nullable', 'string', 'max:255'],
        ]);
    }

    protected function resolveApprovedSkill(TrainerProfile $trainer, int $orgId, int $skillId): Skill
    {
        $skill = Skill::query()
            ->whereKey($skillId)
            ->where('is_active', true)
            ->where(function ($query) use ($orgId) {
                $query->whereNull('organization_id')
                    ->orWhere('organization_id', $orgId);
            })
            ->firstOrFail();

        $trainerSkill = TrainerSpecialty::query()
            ->where('trainer_profile_id', $trainer->id)
            ->where('skill_id', $skill->id)
            ->where('status', 'approved')
            ->first();

        abort_unless($trainerSkill, 403, 'You can only create sessions for approved skills.');

        return $skill;
    }

    protected function sessionWritePayload(TrainerProfile $trainer, int $orgId, int $skillId, array $data): array
    {
        return [
            'organization_id' => $orgId,
            'organization_user_id' => $trainer->organization_user_id,
            'trainer_profile_id' => $trainer->id,
            'skill_id' => $skillId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration_minutes' => (int) $data['duration_minutes'],
            'start_date' => Carbon::parse($data['start_date']),
            'end_date' => Carbon::parse($data['end_date']),
            'calendar_link' => $data['calendar_link'] ?? null,
            'status' => $data['status'],
            'capacity' => $data['capacity'] ?? null,
            'location' => $data['location'] ?? null,
            'mode' => $data['mode'] ?? null,
        ];
    }

    protected function editableSessionPayload(TrainingSession $session): array
    {
        return [
            'id' => $session->id,
            'skill_id' => $session->skill_id,
            'title' => $session->title,
            'description' => $session->description,
            'duration_minutes' => $session->duration_minutes,
            'start_date' => optional($session->start_date)->format('Y-m-d\TH:i'),
            'end_date' => optional($session->end_date)->format('Y-m-d\TH:i'),
            'calendar_link' => $session->calendar_link,
            'status' => $session->status,
            'capacity' => $session->capacity,
            'location' => $session->location,
            'mode' => $session->mode,
        ];
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

    protected function specialtySkillPayload(TrainerSpecialty $specialty, TrainerProfile $trainer): array
    {
        $activeSessionCount = $this->activeSessionCountForSkill($trainer, $specialty->skill_id);

        return [
            'id' => $specialty->id,
            'trainer_profile_id' => $specialty->trainer_profile_id,
            'skill_id' => $specialty->skill_id,
            'name' => $specialty->name,
            'description' => $specialty->description,
            'status' => $specialty->status,
            'active_session_count' => $activeSessionCount,
            'active_sessions_count' => $activeSessionCount,
            'activeSessionCount' => $activeSessionCount,
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

    protected function sessionPayload(TrainingSession $session): array
    {
        $capacity = $this->sessionCapacity($session);
        $approvedCount = (int) ($session->approved_participants_count ?? $session->participants->where('status', 'approved')->count());
        $pendingCount = (int) ($session->pending_participants_count ?? $session->participants->where('status', 'pending')->count());
        $rejectedCount = (int) ($session->rejected_participants_count ?? $session->participants->where('status', 'rejected')->count());
        $waitlistedCount = (int) ($session->waitlisted_participants_count ?? $session->participants->where('status', 'waitlisted')->count());
        $withdrawnCount = (int) ($session->withdrawn_participants_count ?? $session->participants->where('status', 'withdrawn')->count());

        return [
            'id' => $session->id,
            'organization_id' => $session->organization_id,
            'organization_user_id' => $session->organization_user_id,
            'trainer_profile_id' => $session->trainer_profile_id,
            'skill_id' => $session->skill_id,
            'title' => $session->title,
            'description' => $session->description,
            'duration_minutes' => $session->duration_minutes,
            'start_date' => $session->start_date,
            'end_date' => $session->end_date,
            'calendar_link' => $session->calendar_link,
            'status' => $session->status,
            'capacity' => $capacity,
            'location' => $session->location,
            'mode' => $session->mode,
            'skill' => $session->relationLoaded('skill') && $session->skill ? $this->skillPayload($session->skill) : null,
            'participants_count' => $session->participants_count ?? $session->participants->count(),
            'pending_participants_count' => $pendingCount,
            'approved_participants_count' => $approvedCount,
            'rejected_participants_count' => $rejectedCount,
            'waitlisted_participants_count' => $waitlistedCount,
            'withdrawn_participants_count' => $withdrawnCount,
            'remaining_slots' => $capacity === null ? null : max($capacity - $approvedCount, 0),
            'is_full' => $capacity === null ? false : $approvedCount >= $capacity,
            'participants' => $session->relationLoaded('participants')
                ? $session->participants->map(fn ($participant) => [
                    'id' => $participant->id,
                    'organization_user_id' => $participant->organization_user_id,
                    'status' => $participant->status,
                    'reviewed_by' => $participant->reviewed_by,
                    'reviewed_at' => $participant->reviewed_at,
                    'review_notes' => $participant->review_notes,
                    'organization_user' => $this->organizationUserPayload($participant->organizationUser),
                ])->values()->all()
                : [],
            'progress_count' => $session->progress_count ?? $session->progress->count(),
            'assessment_uploads_count' => $session->assessment_uploads_count ?? $session->assessmentUploads->count(),
            'can_edit' => ! in_array($session->status, ['completed'], true),
            'can_cancel' => ! in_array($session->status, ['completed', 'cancelled'], true),
            'created_at' => $session->created_at,
            'updated_at' => $session->updated_at,
        ];
    }

    protected function organizationUserPayload(?OrganizationUser $organizationUser): ?array
    {
        if (! $organizationUser) {
            return null;
        }

        return [
            'id' => $organizationUser->id,
            'organization_id' => $organizationUser->organization_id,
            'user_id' => $organizationUser->user_id,
            'name' => $organizationUser->relationLoaded('user') && $organizationUser->user ? $organizationUser->user->name : null,
            'email' => $organizationUser->relationLoaded('user') && $organizationUser->user ? $organizationUser->user->email : null,
        ];
    }

    protected function approvedParticipantCount(TrainingSession $session): int
    {
        return TrainingSessionParticipant::query()
            ->where('training_session_id', $session->id)
            ->where('status', 'approved')
            ->count();
    }

    protected function sessionCapacity(TrainingSession $session): ?int
    {
        return $session->capacity !== null ? (int) $session->capacity : null;
    }

    protected function notifyParticipantStatusChange(TrainingSession $session, TrainingSessionParticipant $participant): void
    {
        $organizationUser = OrganizationUser::query()
            ->with('user')
            ->find($participant->organization_user_id);

        $organizationUser?->user?->notify(
            new TrainingSessionApplicationStatusNotification(
                $session,
                $participant,
                $participant->status
            )
        );
    }
}
