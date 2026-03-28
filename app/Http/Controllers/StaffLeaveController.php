<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\OrganizationUser;
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

        $leaveRequests = LeaveRequest::query()
            ->where('organization_id', $orgUser->organization_id)
            ->where('user_id', $request->user()?->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LeaveRequest $leaveRequest) => $this->leavePayload($leaveRequest));

        return Inertia::render('Staff/Leave/Index', [
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

        LeaveRequest::query()->create([
            'user_id' => $request->user()?->id,
            'organization_id' => $orgUser->organization_id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'status' => LeaveRequest::STATUS_PENDING,
        ]);

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
        ];
    }
}