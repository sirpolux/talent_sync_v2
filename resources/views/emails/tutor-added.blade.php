<x-mail::message>
# You’ve been added as a Tutor

Hello {{ $user->name }},

You have been added as a **Tutor** for **{{ $organization->name ?? 'your organization' }}**.

@if(!empty($addedBy?->name))
This change was made by {{ $addedBy->name }}.
@endif

You can sign in to access the tutor dashboard and begin managing training activities.

<x-mail::button :url="route('login')">
Sign in
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
