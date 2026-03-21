<?php

namespace App\Mail;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TutorAddedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Organization $organization,
        public User $user,
        public ?User $addedBy = null
    ) {
    }

    public function envelope(): Envelope
    {
        $orgName = $this->organization->name ?? 'your organization';

        return new Envelope(
            subject: "You’ve been added as a Tutor at {$orgName}"
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tutor-added',
            with: [
                'organization' => $this->organization,
                'user' => $this->user,
                'addedBy' => $this->addedBy,
            ]
        );
    }
}
