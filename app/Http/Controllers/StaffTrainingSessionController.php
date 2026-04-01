<?php

namespace App\Http\Controllers;

use App\Models\OrganizationUser;
use App\Models\TrainingSession;
use App\Models\TrainingSessionParticipant;
use App\Notifications\TrainingRequestStatusUpdatedNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffTrainingSessionController extends Controller
{
    public const SESSION_STATUSES = ['scheduled', 'active', 'completed', 'cancelled', 'paused'];

    public function index(Request $request): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);
        $filters = $this->filters($request);
        $defaultStatus = $filters['status'] ?: 'scheduled';

        $sessions = TrainingSession::query()
            ->where('organization_id', $orgUser->organization_id)
            ->with([
                'skill:id,name,description,type,category,is_active',
                'trainerProfile:id,organization_user_id,status',
                'trainerProfile.organizationUser:id,user_id,organization_id',
                'trainerProfile.organizationUser.user:id,name,email',
                'participants' => fn (HasMany $query) => $query
                    ->where('organization_user_id', $orgUser->id)
                    ->select(['id', 'organization_id', 'training_session_id', 'organization_user_id', 'status', 'created_at', 'updated_at']),
            ])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters) {
                $search = $filters['search'];

                $query->where(function (Builder $builder) use ($search) {
                    $builder->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('mode', 'like', "%{$search}%");
                });
            })
            ->when($defaultStatus !== '', fn (Builder $query) => $query->where('status', $defaultStatus))
            ->orderByDesc('start_date')
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

    public function apply(Request $request, TrainingSession $session): RedirectResponse
    {
        $orgUser = $this->resolveOrganizationUser($request);

        abort_unless((int) $session->organization_id === (int) $orgUser->organization_id, 404);
        abort_unless($session->status === 'scheduled', 422, 'You can only apply to scheduled sessions.');

        $participant = TrainingSessionParticipant::query()
            ->where('training_session_id', $session->id)
            ->where('organization_user_id', $orgUser->id)
            ->first();

        if ($participant) {
            return back()->with('error', 'You have already applied to this training session.');
        }

        TrainingSessionParticipant::query()->create([
            'organization_id' => $orgUser->organization_id,
            'training_session_id' => $session->id,
            'organization_user_id' => $orgUser->id,
            'status' => 'applied',
        ]);

        $request->user()?->notify(new TrainingRequestStatusUpdatedNotification($session->trainingRequest ?? new \App\Models\TrainingRequest()));

        return back()->with('success', 'Your application has been submitted.');
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

    protected function sessionPayload(TrainingSession $session, int $organizationUserId): array
    {
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
            'capacity' => $session->capacity,
            'location' => $session->location,
            'mode' => $session->mode,
            'has_applied' => $session->relationLoaded('participants')
                ? $session->participants->contains('organization_user_id', $organizationUserId)
                : false,
            'participant_status' => $session->relationLoaded('participants')
                ? $session->participants->firstWhere('organization_user_id', $organizationUserId)?->status
                : null,
            'registration_status' => $session->relationLoaded('participants')
                ? $session->participants->firstWhere('organization_user_id', $organizationUserId)?->status
                : null,
            'participant_id' => $session->relationLoaded('participants')
                ? $session->participants->firstWhere('organization_user_id', $organizationUserId)?->id
                : null,
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
}