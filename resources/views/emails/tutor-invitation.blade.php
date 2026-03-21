<x-mail::message>
# Invitation to join {{ $invitation->organization?->name ?? 'an organization' }} as a Tutor

You have been invited to join **{{ $invitation->organization?->name ?? 'an organization' }}** as a **Tutor**.

This will give you access to the tutor dashboard and training tools for that organization.

<x-mail::button :url="$acceptUrl">
Accept Tutor Invitation
</x-mail::button>

If you did not expect this invitation, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
