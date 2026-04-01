<?php

namespace App\Notifications;

use App\Models\TrainingRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrainingRequestStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public TrainingRequest $trainingRequest
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
            ->subject('Training request status updated')
            ->line('Your training request status has been updated.')
            ->action('View training requests', route('staff.training.requests'));
    }

    protected function payload(): array
    {
        $this->trainingRequest->loadMissing([
            'organization:id,name',
            'requester.user:id,name,email',
            'assignedTutor.user:id,name,email',
            'skill:id,name',
        ]);

        return [
            'type' => 'training_request_status_updated',
            'title' => 'Training request updated',
            'message' => 'Your training request status has been updated to ' . ($this->trainingRequest->status ?? 'unknown') . '.',
            'training_request_id' => $this->trainingRequest->id,
            'organization_id' => $this->trainingRequest->organization_id,
            'status' => $this->trainingRequest->status,
            'read_at' => null,
            'data' => [
                'training_request_id' => $this->trainingRequest->id,
                'organization_id' => $this->trainingRequest->organization_id,
                'status' => $this->trainingRequest->status,
                'title' => $this->trainingRequest->title ?? null,
                'skill' => [
                    'id' => $this->trainingRequest->skill?->id,
                    'name' => $this->trainingRequest->skill?->name,
                ],
                'organization' => [
                    'id' => $this->trainingRequest->organization_id,
                    'name' => $this->trainingRequest->organization?->name,
                ],
                'requester' => [
                    'id' => $this->trainingRequest->requester?->id,
                    'user_id' => $this->trainingRequest->requester?->user_id,
                    'name' => $this->trainingRequest->requester?->user?->name,
                    'email' => $this->trainingRequest->requester?->user?->email,
                ],
                'assigned_tutor' => [
                    'id' => $this->trainingRequest->assignedTutor?->id,
                    'user_id' => $this->trainingRequest->assigned_tutor_organization_user_id,
                    'name' => $this->trainingRequest->assignedTutor?->user?->name,
                    'email' => $this->trainingRequest->assignedTutor?->user?->email,
                ],
            ],
        ];
    }
}