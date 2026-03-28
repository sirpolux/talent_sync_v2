<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\OrganizationUser;
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

        $leaveRequests = LeaveRequest::query()
            ->with(['user:id,name,email', 'reviewer:id,name,email'])
            ->where('organization_id', $orgId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LeaveRequest $leaveRequest) => $this->leavePayload($leaveRequest));

        return Inertia::render('Admin/LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
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

        $leaveRequest->load(['user:id,name,email', 'reviewer:id,name,email']);

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

        $leaveRequest->update([
            'status' => LeaveRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        return redirect()->route('admin.leave-requests.show', $leaveRequest)->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->assertOrganizationAccess($request, $leaveRequest);

        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $leaveRequest->update([
            'status' => LeaveRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        return redirect()->route('admin.leave-requests.show', $leaveRequest)->with('success', 'Leave request rejected.');
    }

    protected function assertOrganizationAccess(Request $request, LeaveRequest $leaveRequest): void
    {
        $orgId = (int) $request->session()->get('current_organization_id');
        abort_unless($orgId, 403, 'No active organization selected.');
        abort_unless((int) $leaveRequest->organization_id === $orgId, 404);
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