<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\LeaveRequestReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLeaveRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:' . implode(',', [
                LeaveRequest::STATUS_PENDING,
                LeaveRequest::STATUS_APPROVED,
                LeaveRequest::STATUS_REJECTED,
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $search = trim((string) ($validated['search'] ?? $request->query('search', '')));
        $status = $validated['status'] ?? $request->query('status');
        $perPage = (int) ($validated['per_page'] ?? $request->query('per_page', 10));

        $leaveRequests = LeaveRequest::query()
            ->with([
                'user:id,name,email',
                'reviewer:id,name,email',
            ])
            ->where('organization_id', $orgId)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    })
                    ->orWhere('reason', 'like', '%' . $search . '%')
                    ->orWhere('status', 'like', '%' . $search . '%');
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (LeaveRequest $leaveRequest) => $this->leavePayload($leaveRequest));

        return Inertia::render('Admin/LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
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

    public function show(Request $request, LeaveRequest $leaveRequest): Response
    {
        $this->assertOrganizationAccess($request, $leaveRequest);

        $leaveRequest->load([
            'user:id,name,email',
            'reviewer:id,name,email',
        ]);

        return Inertia::render('Admin/LeaveRequests/Show', [
            'leaveRequest' => $this->leavePayload($leaveRequest),
        ]);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->assertOrganizationAccess($request, $leaveRequest);

        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        abort_if($leaveRequest->status === LeaveRequest::STATUS_APPROVED, 422, 'Leave request is already approved.');
        abort_if($leaveRequest->status === LeaveRequest::STATUS_REJECTED, 422, 'Rejected leave requests cannot be approved.');

        $leaveRequest->update([
            'status' => LeaveRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        $leaveRequest->user?->notify(new LeaveRequestReviewedNotification($leaveRequest));

        return redirect()
            ->route('admin.leave-requests.show', $leaveRequest)
            ->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->assertOrganizationAccess($request, $leaveRequest);

        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        abort_if($leaveRequest->status === LeaveRequest::STATUS_REJECTED, 422, 'Leave request is already rejected.');
        abort_if($leaveRequest->status === LeaveRequest::STATUS_APPROVED, 422, 'Approved leave requests cannot be rejected.');

        $leaveRequest->update([
            'status' => LeaveRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        $leaveRequest->user?->notify(new LeaveRequestReviewedNotification($leaveRequest));

        return redirect()
            ->route('admin.leave-requests.show', $leaveRequest)
            ->with('success', 'Leave request rejected.');
    }

    protected function assertOrganizationAccess(Request $request, LeaveRequest $leaveRequest): void
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        abort_unless($orgId, 403, 'No active organization selected.');
        abort_unless((int) $leaveRequest->organization_id === $orgId, 404);

        $membership = $request->user()?->currentOrganizationMembership();
        abort_unless($membership && (bool) $membership->is_org_admin, 403);
    }

    protected function leavePayload(LeaveRequest $leaveRequest): array
    {
        return [
            'id' => $leaveRequest->id,
            'user_id' => $leaveRequest->user_id,
            'organization_id' => $leaveRequest->organization_id,
            'start_date' => $leaveRequest->start_date?->toDateString(),
            'end_date' => $leaveRequest->end_date?->toDateString(),
            'reason' => $leaveRequest->reason,
            'status' => $leaveRequest->status,
            'reviewed_by' => $leaveRequest->reviewed_by,
            'reviewed_at' => $leaveRequest->reviewed_at?->toISOString(),
            'review_notes' => $leaveRequest->review_notes,
            'created_at' => $leaveRequest->created_at?->toISOString(),
            'updated_at' => $leaveRequest->updated_at?->toISOString(),
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