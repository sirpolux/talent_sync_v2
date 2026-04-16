<?php

namespace App\Notifications;

use App\Models\TrainingSession;
use App\Models\TrainingSessionParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrainingSessionApplicationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public TrainingSession $session,
        public TrainingSessionParticipant $participant,
        public string $event = 'updated'
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Check user preferences for email
        if (\App\Models\NotificationPreference::userWantsEmail($notifiable->id, 'training_session_application')) {
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
            ->subject('Training session application updated')
            ->line($this->mailLine())
            ->action('View training request', route('staff.training.sessions.show', $this->session));
    }

    protected function payload(): array
    {
        $this->session->loadMissing([
            'organization:id,name',
            'skill:id,name',
            'trainerProfile.organizationUser.user:id,name,email',
        ]);

        return [
            'type' => 'training_session_application_status_updated',
            'title' => 'Training application updated',
            'message' => $this->mailLine(),
            'training_session_id' => $this->session->id,
            'training_session_participant_id' => $this->participant->id,
            'organization_id' => $this->session->organization_id,
            'status' => $this->participant->status,
            'event' => $this->event,
            'read_at' => null,
            'data' => [
                'event' => $this->event,
                'training_session_id' => $this->session->id,
                'training_session_participant_id' => $this->participant->id,
                'organization_id' => $this->session->organization_id,
                'status' => $this->participant->status,
                'review_notes' => $this->participant->review_notes,
                'reviewed_at' => $this->participant->reviewed_at,
                'session' => [
                    'id' => $this->session->id,
                    'title' => $this->session->title,
                    'status' => $this->session->status,
                    'start_date' => $this->session->start_date,
                    'end_date' => $this->session->end_date,
                    'capacity' => $this->session->capacity,
                    'location' => $this->session->location,
                    'mode' => $this->session->mode,
                ],
                'skill' => [
                    'id' => $this->session->skill?->id,
                    'name' => $this->session->skill?->name,
                ],
                'organization' => [
                    'id' => $this->session->organization_id,
                    'name' => $this->session->organization?->name,
                ],
                'trainer' => [
                    'id' => $this->session->trainerProfile?->id,
                    'organization_user_id' => $this->session->trainerProfile?->organization_user_id,
                    'name' => $this->session->trainerProfile?->organizationUser?->user?->name,
                    'email' => $this->session->trainerProfile?->organizationUser?->user?->email,
                ],
            ],
        ];
    }

    protected function mailLine(): string
    {
        $title = $this->session->title ?: 'your training session';
        $status = $this->participant->status ?: 'updated';

        return match ($this->event) {
            'submitted' => "Your application for {$title} has been submitted and is currently {$status}.",
            'withdrawn' => "Your application for {$title} has been withdrawn.",
            'approved' => "Your application for {$title} has been approved.",
            'rejected' => "Your application for {$title} has been rejected.",
            'waitlisted' => "Your application for {$title} is on the waitlist.",
            default => "Your application for {$title} is now {$status}.",
        };
    }
}
