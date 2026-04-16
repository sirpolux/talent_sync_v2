<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmittedNotification extends Notification
{

    public function __construct(
        public LeaveRequest $leaveRequest
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Check user preferences for email - use admin notification type
        if (\App\Models\NotificationPreference::userWantsEmail($notifiable->id, 'admin_leave_request_submitted')) {
            $channels[] = 'mail';
        }

        return $channels;
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
            ->subject('New Leave Request Submitted')
            ->line('A new leave request has been submitted and requires your review.')
            ->line('Employee: ' . ($this->leaveRequest->user?->name ?? 'Unknown'))
            ->line('Dates: ' . $this->leaveRequest->start_date?->format('M j, Y') . ' to ' . $this->leaveRequest->end_date?->format('M j, Y'))
            ->action('Review Leave Request', route('admin.leave-requests.show', $this->leaveRequest))
            ->line('Please review and approve or reject this request.');
    }

    protected function payload(): array
    {
        $this->leaveRequest->loadMissing(['user:id,name,email', 'organization:id,company_name']);

        return [
            'type' => 'admin_leave_request_submitted',
            'notification_type' => 'admin_leave_request',
            'event' => 'leave_request_submitted',
            'title' => 'New Leave Request',
            'message' => ($this->leaveRequest->user?->name ?? 'A staff member') . ' submitted a leave request for ' . $this->leaveRequest->start_date?->format('M j') . ' - ' . $this->leaveRequest->end_date?->format('M j, Y') . '.',
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
                    'name' => $this->leaveRequest->organization?->company_name,
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