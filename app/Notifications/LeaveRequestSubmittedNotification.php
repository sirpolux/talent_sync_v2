<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public LeaveRequest $leaveRequest
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return $this->payload();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Leave request submitted')
            ->line('A leave request has been submitted.')
            ->action('View leave request', route('admin.leave-requests.show', $this->leaveRequest))
            ->line('Reason: ' . $this->leaveRequest->reason);
    }

    protected function payload(): array
    {
        $this->leaveRequest->loadMissing(['user:id,name,email', 'organization:id,name']);

        return [
            'type' => 'leave_request_submitted',
            'notification_type' => 'leave_request',
            'event' => 'leave_request_submitted',
            'title' => 'Leave request submitted',
            'message' => ($this->leaveRequest->user?->name ?? 'A staff member') . ' submitted a leave request.',
            'leave_request_id' => $this->leaveRequest->id,
            'organization_id' => $this->leaveRequest->organization_id,
            'user_id' => $this->leaveRequest->user_id,
            'status' => $this->leaveRequest->status,
            'action_url' => route('admin.leave-requests.show', $this->leaveRequest),
            'read_at' => null,
            'data' => [
                'leave_request_id' => $this->leaveRequest->id,
                'organization_id' => $this->leaveRequest->organization_id,
                'user_id' => $this->leaveRequest->user_id,
                'status' => $this->leaveRequest->status,
                'reason' => $this->leaveRequest->reason,
                'start_date' => $this->leaveRequest->start_date?->toDateString(),
                'end_date' => $this->leaveRequest->end_date?->toDateString(),
                'organization' => [
                    'id' => $this->leaveRequest->organization_id,
                    'name' => $this->leaveRequest->organization?->name,
                ],
                'user' => [
                    'id' => $this->leaveRequest->user_id,
                    'name' => $this->leaveRequest->user?->name,
                    'email' => $this->leaveRequest->user?->email,
                ],
            ],
        ];
    }
}