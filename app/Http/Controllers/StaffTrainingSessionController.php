<?php

namespace App\Http\Controllers;

use App\Models\OrganizationUser;
use App\Models\TrainingSession;
use App\Models\TrainingSessionParticipant;
use App\Notifications\TrainingSessionApplicationStatusNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffTrainingSessionController extends Controller
{
    public const SESSION_STATUSES = ['scheduled', 'active', 'completed', 'cancelled', 'paused'];
    public const APPLICABLE_SESSION_STATUSES = ['scheduled'];
    public const PARTICIPANT_ACTIVE_STATUSES = ['pending', 'approved', 'waitlisted'];
    public const PARTICIPANT_HISTORY_STATUSES = ['approved', 'completed'];
    public const PARTICIPANT_ACTIONABLE_STATUSES = ['pending', 'approved', 'waitlisted'];
    public const PARTICIPANT_STATUSES = [
        'pending',
        'approved',
        'rejected',
        'waitlisted',
        'withdrawn',
        'completed',
        'cancelled',
        'no_show',
    ];

    public function index(Request $request): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);
        $filters = $this->filters($request);
        $defaultStatus = $filters['status'] ?: 'scheduled';

        $sessions = TrainingSession::query()
            ->where('organization_id', $orgUser->organization_id)
            ->with($this->sessionRelations($orgUser->id))
            ->withCount([
                'participants as approved_participants_count' => fn (Builder $query) => $query->where('status', 'approved'),
                'participants as pending_participants_count' => fn (Builder $query) => $query->where('status', 'pending'),
                'participants as waitlisted_participants_count' => fn (Builder $query) => $query->where('status', 'waitlisted'),
            ])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters) {
                $search = $filters['search'];

                $query->where(function (Builder $builder) use ($search) {
                    $builder->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('mode', 'like', "%{$search}%")
                        ->orWhereHas('skill', fn (Builder $skillQuery) => $skillQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($defaultStatus !== '', fn (Builder $query) => $query->where('status', $defaultStatus))
            ->orderBy('start_date')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (TrainingSession $session) => $this->sessionPayload($session, $orgUser->id));

        return Inertia::render('Staff/Training/Sessions/Index', [
            'sessions' => $this->paginationPayload($sessions),
            'filters' => [
                'search' => $filters['search'],
                'status' => $defaultStatus,
                'perPage' => $filters['perPage'],
            ],
            'flash' => [
                'status' => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function show(Request $request, TrainingSession $session): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);

        abort_unless((int) $session->organization_id === (int) $orgUser->organization_id, 404);

        $session->load($this->sessionRelations($orgUser->id));
        $session->loadCount([
            'participants as approved_participants_count' => fn (Builder $query) => $query->where('status', 'approved'),
            'participants as pending_participants_count' => fn (Builder $query) => $query->where('status', 'pending'),
            'participants as waitlisted_participants_count' => fn (Builder $query) => $query->where('status', 'waitlisted'),
        ]);

        $participant = $session->participants->firstWhere('organization_user_id', $orgUser->id);

        return Inertia::render('Staff/Training/Sessions/Show', [
            'session' => $this->sessionPayload($session, $orgUser->id),
            'participant' => $participant ? $this->participantPayload($participant) : null,
            'flash' => [
                'status' => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function requests(Request $request): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);
        $filters = $this->requestFilters($request);

        $participants = TrainingSessionParticipant::query()
            ->where('organization_id', $orgUser->organization_id)
            ->where('organization_user_id', $orgUser->id)
            ->with([
                'trainingSession.skill:id,name,description,type,category,is_active',
                'trainingSession.trainerProfile:id,organization_user_id,status',
                'trainingSession.trainerProfile.organizationUser:id,user_id,organization_id',
                'trainingSession.trainerProfile.organizationUser.user:id,name,email',
            ])
            ->when($filters['status'] !== '', fn (Builder $query) => $query->where('status', $filters['status']))
            ->orderByDesc('created_at')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (TrainingSessionParticipant $participant) => $this->requestPayload($participant));

        return Inertia::render('Staff/Training/Requests', [
            'requests' => $this->paginationPayload($participants),
            'filters' => $filters,
            'flash' => [
                'status' => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function trainings(Request $request): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);

        $participants = TrainingSessionParticipant::query()
            ->where('organization_id', $orgUser->organization_id)
            ->where('organization_user_id', $orgUser->id)
            ->whereIn('status', self::PARTICIPANT_HISTORY_STATUSES)
            ->with([
                'trainingSession.skill:id,name,description,type,category,is_active',
                'trainingSession.trainerProfile:id,organization_user_id,status',
                'trainingSession.trainerProfile.organizationUser:id,user_id,organization_id',
                'trainingSession.trainerProfile.organizationUser.user:id,name,email',
            ])
            ->orderByDesc('updated_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (TrainingSessionParticipant $participant) => $this->requestPayload($participant));

        return Inertia::render('Staff/Training/Index', [
            'trainings' => $this->paginationPayload($participants),
            'flash' => [
                'status' => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function available(Request $request): Response
    {
        return $this->index($request);
    }

    public function apply(Request $request, TrainingSession $session): RedirectResponse
    {
        $orgUser = $this->resolveOrganizationUser($request);

        abort_unless((int) $session->organization_id === (int) $orgUser->organization_id, 404);
        abort_unless(in_array($session->status, self::APPLICABLE_SESSION_STATUSES, true), 422, 'You can only apply to scheduled sessions.');

        $participant = TrainingSessionParticipant::query()
            ->where('training_session_id', $session->id)
            ->where('organization_user_id', $orgUser->id)
            ->first();

        if ($participant && in_array($participant->status, self::PARTICIPANT_ACTIONABLE_STATUSES, true)) {
            return back()->with('error', 'You already have an active application for this training session.');
        }

        if ($participant && in_array($participant->status, ['completed', 'cancelled', 'no_show'], true)) {
            return back()->with('error', 'This training session can no longer be applied for from your profile.');
        }

        $approvedCount = $this->approvedParticipantCount($session);
        $capacity = $this->sessionCapacity($session);

        $nextStatus = $capacity !== null && $approvedCount >= $capacity
            ? 'waitlisted'
            : 'pending';

        $participant = TrainingSessionParticipant::query()->updateOrCreate(
            [
                'training_session_id' => $session->id,
                'organization_user_id' => $orgUser->id,
            ],
            [
                'organization_id' => $orgUser->organization_id,
                'status' => $nextStatus,
                'reviewed_by' => null,
                'reviewed_at' => null,
                'review_notes' => null,
            ]
        );

        $request->user()?->notify(new TrainingSessionApplicationStatusNotification($session, $participant, 'submitted'));

        return redirect()
            ->route('staff.training.sessions.show', $session)
            ->with('success', $nextStatus === 'waitlisted'
                ? 'The session is currently full. You have been added to the waitlist.'
                : 'Your application has been submitted and is awaiting tutor approval.');
    }

    public function withdraw(Request $request, TrainingSession $session): RedirectResponse
    {
        $orgUser = $this->resolveOrganizationUser($request);

        abort_unless((int) $session->organization_id === (int) $orgUser->organization_id, 404);

        $participant = TrainingSessionParticipant::query()
            ->where('training_session_id', $session->id)
            ->where('organization_user_id', $orgUser->id)
            ->firstOrFail();

        abort_unless(in_array($participant->status, self::PARTICIPANT_ACTIONABLE_STATUSES, true), 422, 'This application can no longer be withdrawn.');

        $participant->update([
            'status' => 'withdrawn',
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => 'Withdrawn by employee.',
        ]);

        $request->user()?->notify(new TrainingSessionApplicationStatusNotification($session, $participant->fresh(), 'withdrawn'));

        return redirect()
            ->route('staff.training.requests')
            ->with('success', 'Your training application has been withdrawn.');
    }

    protected function resolveOrganizationUser(Request $request): OrganizationUser
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        return OrganizationUser::query()
            ->with('user:id,name,email')
            ->where('organization_id', $orgId)
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();
    }

    protected function filters(Request $request): array
    {
        $status = $request->string('status')->toString();

        return [
            'search' => $request->string('search')->toString(),
            'status' => in_array($status, self::SESSION_STATUSES, true) ? $status : 'scheduled',
            'perPage' => max(1, (int) $request->integer('per_page', 10)),
        ];
    }

    protected function requestFilters(Request $request): array
    {
        $status = $request->string('status')->toString();

        return [
            'status' => in_array($status, self::PARTICIPANT_STATUSES, true) ? $status : '',
            'perPage' => max(1, (int) $request->integer('per_page', 10)),
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

    protected function sessionRelations(int $organizationUserId): array
    {
        return [
            'skill:id,name,description,type,category,is_active',
            'trainerProfile:id,organization_user_id,status',
            'trainerProfile.organizationUser:id,user_id,organization_id',
            'trainerProfile.organizationUser.user:id,name,email',
            'participants' => fn (HasMany $query) => $query
                ->where('organization_user_id', $organizationUserId)
                ->select([
                    'id',
                    'organization_id',
                    'training_session_id',
                    'organization_user_id',
                    'status',
                    'reviewed_by',
                    'reviewed_at',
                    'review_notes',
                    'created_at',
                    'updated_at',
                ]),
        ];
    }

    protected function sessionPayload(TrainingSession $session, int $organizationUserId): array
    {
        $participant = $session->relationLoaded('participants')
            ? $session->participants->firstWhere('organization_user_id', $organizationUserId)
            : null;

        $approvedCount = (int) ($session->approved_participants_count ?? 0);
        $pendingCount = (int) ($session->pending_participants_count ?? 0);
        $waitlistedCount = (int) ($session->waitlisted_participants_count ?? 0);
        $capacity = $this->sessionCapacity($session);
        $isFull = $capacity !== null && $approvedCount >= $capacity;
        $participantStatus = $participant?->status;

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
            'has_applied' => (bool) $participant,
            'can_apply' => in_array($session->status, self::APPLICABLE_SESSION_STATUSES, true)
                && ! in_array($participantStatus, self::PARTICIPANT_ACTIONABLE_STATUSES, true),
            'can_withdraw' => in_array($participantStatus, self::PARTICIPANT_ACTIONABLE_STATUSES, true),
            'participant_status' => $participantStatus,
            'registration_status' => $participantStatus,
            'participant_id' => $participant?->id,
            'participant' => $participant ? $this->participantPayload($participant) : null,
            'approved_participants_count' => $approvedCount,
            'pending_participants_count' => $pendingCount,
            'waitlisted_participants_count' => $waitlistedCount,
            'remaining_slots' => $capacity === null ? null : max($capacity - $approvedCount, 0),
            'is_full' => $isFull,
            'skill' => $session->relationLoaded('skill') && $session->skill ? [
                'id' => $session->skill->id,
                'name' => $session->skill->name,
                'description' => $session->skill->description,
                'type' => $session->skill->type,
                'category' => $session->skill->category,
                'is_active' => (bool) $session->skill->is_active,
            ] : null,
            'trainer' => $this->trainerPayload($session),
            'created_at' => $session->created_at,
            'updated_at' => $session->updated_at,
        ];
    }

    protected function requestPayload(TrainingSessionParticipant $participant): array
    {
        $session = $participant->trainingSession;

        return [
            'id' => $participant->id,
            'status' => $participant->status,
            'reviewed_at' => $participant->reviewed_at,
            'review_notes' => $participant->review_notes,
            'created_at' => $participant->created_at,
            'updated_at' => $participant->updated_at,
            'session' => $session ? [
                'id' => $session->id,
                'title' => $session->title,
                'description' => $session->description,
                'status' => $session->status,
                'start_date' => $session->start_date,
                'end_date' => $session->end_date,
                'calendar_link' => $session->calendar_link,
                'capacity' => $session->capacity,
                'location' => $session->location,
                'mode' => $session->mode,
                'skill' => $session->skill ? [
                    'id' => $session->skill->id,
                    'name' => $session->skill->name,
                ] : null,
                'trainer' => $this->trainerPayload($session),
            ] : null,
        ];
    }

    protected function participantPayload(TrainingSessionParticipant $participant): array
    {
        return [
            'id' => $participant->id,
            'status' => $participant->status,
            'reviewed_by' => $participant->reviewed_by,
            'reviewed_at' => $participant->reviewed_at,
            'review_notes' => $participant->review_notes,
            'created_at' => $participant->created_at,
            'updated_at' => $participant->updated_at,
        ];
    }

    protected function trainerPayload(TrainingSession $session): ?array
    {
        if (! $session->relationLoaded('trainerProfile') || ! $session->trainerProfile) {
            return null;
        }

        return [
            'id' => $session->trainerProfile->id,
            'organization_user_id' => $session->trainerProfile->organization_user_id,
            'status' => $session->trainerProfile->status,
            'name' => $session->trainerProfile->organizationUser?->user?->name,
            'email' => $session->trainerProfile->organizationUser?->user?->email,
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
}
