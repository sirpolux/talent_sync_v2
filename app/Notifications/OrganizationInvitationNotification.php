<?php

namespace App\Notifications;

use App\Models\OrganizationInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganizationInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public OrganizationInvitation $invitation
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Check user preferences for email
        if (\App\Models\NotificationPreference::userWantsEmail($notifiable->id, 'organization_invitation')) {
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
            ->subject('Organization invitation')
            ->line('You have been invited to join an organization.')
            ->action('Accept invitation', route('org.invitations.accept', $this->invitation->token));
    }

    protected function payload(): array
    {
        $this->invitation->loadMissing(['organization:id,name', 'invitedBy:id,name,email']);

        return [
            'type' => 'organization_invitation',
            'title' => 'Organization invitation',
            'message' => 'You have been invited to join ' . ($this->invitation->organization?->name ?? 'an organization') . '.',
            'organization_invitation_id' => $this->invitation->id,
            'organization_id' => $this->invitation->organization_id,
            'read_at' => null,
            'data' => [
                'organization_invitation_id' => $this->invitation->id,
                'organization_id' => $this->invitation->organization_id,
                'email' => $this->invitation->email,
                'token' => $this->invitation->token,
                'expires_at' => $this->invitation->expires_at?->toDateTimeString(),
                'organization' => [
                    'id' => $this->invitation->organization_id,
                    'name' => $this->invitation->organization?->name,
                ],
                'invited_by' => [
                    'id' => $this->invitation->invited_by_user_id,
                    'name' => $this->invitation->invitedBy?->name,
                    'email' => $this->invitation->invitedBy?->email,
                ],
            ],
        ];
    }
}