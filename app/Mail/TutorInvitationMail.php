<?php

namespace App\Mail;

use App\Models\OrganizationInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TutorInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public OrganizationInvitation $invitation,
        public string $acceptUrl
    ) {
    }

    public function envelope(): Envelope
    {
        $orgName = $this->invitation->organization?->name ?? 'an organization';

        return new Envelope(
            subject: "You're invited to join {$orgName} as a Tutor"
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tutor-invitation',
            with: [
                'invitation' => $this->invitation,
                'acceptUrl' => $this->acceptUrl,
            ]
        );
    }
}
