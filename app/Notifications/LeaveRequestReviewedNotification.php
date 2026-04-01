<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestReviewedNotification extends Notification implements ShouldQueue
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
        $subject = $this->leaveRequest->status === LeaveRequest::STATUS_APPROVED
            ? 'Leave request approved'
            : 'Leave request rejected';

        $mail = (new MailMessage())
            ->subject($subject)
            ->line('Your leave request has been reviewed.')
            ->action('View leave request', route('staff.leave.index'));

        if ($this->leaveRequest->review_notes) {
            $mail->line('Reviewer notes: ' . $this->leaveRequest->review_notes);
        }

        return $mail;
    }

    protected function payload(): array
    {
        $this->leaveRequest->loadMissing(['user:id,name,email', 'reviewer:id,name,email']);

        return [
            'type' => $this->leaveRequest->status === LeaveRequest::STATUS_APPROVED
                ? 'leave_request_approved'
                : 'leave_request_rejected',
            'notification_type' => 'leave_request',
            'event' => $this->leaveRequest->status === LeaveRequest::STATUS_APPROVED
                ? 'leave_request_approved'
                : 'leave_request_rejected',
            'title' => $this->leaveRequest->status === LeaveRequest::STATUS_APPROVED
                ? 'Leave request approved'
                : 'Leave request rejected',
            'message' => $this->leaveRequest->status === LeaveRequest::STATUS_APPROVED
                ? 'Your leave request was approved.'
                : 'Your leave request was rejected.',
            'leave_request_id' => $this->leaveRequest->id,
            'organization_id' => $this->leaveRequest->organization_id,
            'user_id' => $this->leaveRequest->user_id,
            'status' => $this->leaveRequest->status,
            'action_url' => route('staff.leave.index'),
            'read_at' => null,
            'data' => [
                'leave_request_id' => $this->leaveRequest->id,
                'organization_id' => $this->leaveRequest->organization_id,
                'user_id' => $this->leaveRequest->user_id,
                'status' => $this->leaveRequest->status,
                'reviewed_by' => $this->leaveRequest->reviewed_by,
                'reviewed_at' => $this->leaveRequest->reviewed_at?->toDateTimeString(),
                'review_notes' => $this->leaveRequest->review_notes,
                'organization' => [
                    'id' => $this->leaveRequest->organization_id,
                    'name' => $this->leaveRequest->organization?->company_name,
                ],
                'user' => [
                    'id' => $this->leaveRequest->user_id,
                    'name' => $this->leaveRequest->user?->name,
                    'email' => $this->leaveRequest->user?->email,
                ],
                'reviewer' => [
                    'id' => $this->leaveRequest->reviewer?->id,
                    'name' => $this->leaveRequest->reviewer?->name,
                    'email' => $this->leaveRequest->reviewer?->email,
                ],
            ],
        ];
    }
}