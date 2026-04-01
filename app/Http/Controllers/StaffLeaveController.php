<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\OrganizationUser;
use App\Notifications\LeaveRequestSubmittedNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffLeaveController extends Controller
{
    public function index(Request $request): Response
    {
        $orgUser = $this->resolveOrganizationUser($request);

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:' . implode(',', [
                LeaveRequest::STATUS_PENDING,
                LeaveRequest::STATUS_APPROVED,
                LeaveRequest::STATUS_REJECTED,
            ])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $leaveRequests = LeaveRequest::query()
            ->with(['user:id,name,email', 'reviewer:id,name,email'])
            ->where('organization_id', $orgUser->organization_id)
            ->where('user_id', $request->user()?->id)
            ->when($validated['search'] ?? null, function (Builder $query, string $search) {
                $search = trim($search);

                $query->where(function (Builder $searchQuery) use ($search) {
                    $searchQuery->where('reason', 'like', '%' . $search . '%')
                        ->orWhere('status', 'like', '%' . $search . '%')
                        ->orWhereDate('start_date', $search)
                        ->orWhereDate('end_date', $search);
                });
            })
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['from'] ?? null, fn (Builder $query, string $from) => $query->whereDate('start_date', '>=', $from))
            ->when($validated['to'] ?? null, fn (Builder $query, string $to) => $query->whereDate('end_date', '<=', $to))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 10)
            ->withQueryString();

        return Inertia::render('Staff/Leave/Index', [
            'leaveRequests' => [
                'data' => $leaveRequests->getCollection()->map(fn (LeaveRequest $leaveRequest) => $this->leavePayload($leaveRequest))->values(),
                'links' => $leaveRequests->linkCollection()->map(fn ($link) => [
                    'url' => $link['url'],
                    'label' => $link['label'],
                    'active' => $link['active'],
                ])->values(),
                'meta' => [
                    'current_page' => $leaveRequests->currentPage(),
                    'from' => $leaveRequests->firstItem(),
                    'last_page' => $leaveRequests->lastPage(),
                    'links' => $leaveRequests->linkCollection()->map(fn ($link) => [
                        'url' => $link['url'],
                        'label' => $link['label'],
                        'active' => $link['active'],
                    ])->values(),
                    'path' => $leaveRequests->path(),
                    'per_page' => $leaveRequests->perPage(),
                    'to' => $leaveRequests->lastItem(),
                    'total' => $leaveRequests->total(),
                ],
            ],
            'filters' => [
                'search' => $validated['search'] ?? $request->query('search', ''),
                'status' => $validated['status'] ?? $request->query('status', ''),
                'from' => $validated['from'] ?? $request->query('from', ''),
                'to' => $validated['to'] ?? $request->query('to', ''),
                'per_page' => (int) ($validated['per_page'] ?? $request->query('per_page', 10)),
            ],
            'statusOptions' => [
                LeaveRequest::STATUS_PENDING,
                LeaveRequest::STATUS_APPROVED,
                LeaveRequest::STATUS_REJECTED,
            ],
            'flash' => [
                'status' => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Staff/Leave/Create', [
            'statusOptions' => [
                LeaveRequest::STATUS_PENDING,
                LeaveRequest::STATUS_APPROVED,
                LeaveRequest::STATUS_REJECTED,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $orgUser = $this->resolveOrganizationUser($request);

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $leaveRequest = LeaveRequest::query()->create([
            'user_id' => $request->user()?->id,
            'organization_id' => $orgUser->organization_id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'status' => LeaveRequest::STATUS_PENDING,
        ]);

        $request->user()?->notify(new LeaveRequestSubmittedNotification($leaveRequest));

        return redirect()->route('staff.leave.index')->with('success', 'Leave request submitted successfully.');
    }

    protected function resolveOrganizationUser(Request $request): OrganizationUser
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        return OrganizationUser::query()
            ->where('organization_id', $orgId)
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();
    }

    protected function leavePayload(LeaveRequest $leaveRequest): array
    {
        return [
            'id' => $leaveRequest->id,
            'user_id' => $leaveRequest->user_id,
            'organization_id' => $leaveRequest->organization_id,
            'start_date' => $leaveRequest->start_date,
            'end_date' => $leaveRequest->end_date,
            'reason' => $leaveRequest->reason,
            'status' => $leaveRequest->status,
            'reviewed_by' => $leaveRequest->reviewed_by,
            'reviewed_at' => $leaveRequest->reviewed_at,
            'review_notes' => $leaveRequest->review_notes,
            'created_at' => $leaveRequest->created_at,
            'updated_at' => $leaveRequest->updated_at,
            'user' => $leaveRequest->relationLoaded('user') && $leaveRequest->user ? [
                'id' => $leaveRequest->user->id,
                'name' => $leaveRequest->user->name,
                'email' => $leaveRequest->user->email,
            ] : null,
            'reviewer' => $leaveRequest->relationLoaded('reviewer') && $leaveRequest->reviewer ? [
                'id' => $leaveRequest->reviewer->id,
                'name' => $leaveRequest->reviewer->name,
                'email' => $leaveRequest->reviewer->email,
            ] : null,
        ];
    }
}