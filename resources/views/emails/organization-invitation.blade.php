@component('mail::message')
# Invitation to join an organization

You have been invited to join **{{ $invitation->organization?->name ?? 'an organization' }}** as **{{ $invitation->role }}**.

@component('mail::button', ['url' => $acceptUrl])
Accept Invitation
@endcomponent

If you did not expect this invitation, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
