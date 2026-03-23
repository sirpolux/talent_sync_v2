<?php

namespace App\Http\Controllers;

use App\Models\OrganizationInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrganizationInvitationController extends Controller
{
    /**
     * GET /org/invitations/{token}/accept
     *
     * If logged in: validates email matches invite, accepts invite immediately.
     * If guest: shows a "set password" screen so the invited user can set a password,
     * be logged in, then accept.
     */
    public function accept(Request $request, string $token)
    {
        $invitation = $this->loadValidInvitation($token);

        if (Auth::check()) {
            /** @var User $user */
            $user = $request->user();

            if (mb_strtolower($user->email) !== mb_strtolower($invitation->email)) {
                abort(403, 'This invitation is not for your account.');
            }

            return $this->finalizeAcceptance($request, $invitation, $user);
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'email' => $invitation->email,
            'organization' => [
                'id' => $invitation->organization_id,
                'name' => $invitation->organization?->name,
            ],
            'expires_at' => $invitation->expires_at,
        ]);
    }

    /**
     * POST /org/invitations/{token}/accept
     *
     * Guest sets a password for the invited email, is logged in, and the invite is accepted.
     */
    public function acceptStore(Request $request, string $token)
    {
        $invitation = $this->loadValidInvitation($token);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($invitation->email)])
            ->first();

        abort_unless($user, 404, 'Invited user not found.');

        $user->password = $validated['password'];

        if (is_null($user->email_verified_at) && $this->requiresEmailVerification($invitation)) {
            $user->email_verified_at = now();
        }

        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        return $this->finalizeAcceptance($request, $invitation, $user);
    }

    private function loadValidInvitation(string $token): OrganizationInvitation
    {
        $invitation = OrganizationInvitation::query()
            ->where('token', $token)
            ->firstOrFail();

        if ($invitation->accepted_at) {
            abort(410, 'Invitation already accepted.');
        }

        if ($invitation->expires_at && now()->greaterThan($invitation->expires_at)) {
            abort(410, 'Invitation expired.');
        }

        return $invitation->loadMissing('organization');
    }

    private function finalizeAcceptance(Request $request, OrganizationInvitation $invitation, User $user)
    {
        if (is_null($user->email_verified_at) && $this->requiresEmailVerification($invitation)) {
            $user->email_verified_at = now();
            $user->save();
        }

        $invitation->accepted_at = now();
        $invitation->save();

        $orgId = (int) $invitation->organization_id;

        $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        abort_unless($membership, 404, 'Organization membership record not found.');

        $user->organizations()->updateExistingPivot($orgId, [
            'membership_status' => 'active',
            'membership_confirmed_at' => now(),
            'membership_confirmed_by_user_id' => $user->id,
        ]);

        $request->session()->put('current_organization_id', $orgId);

        return redirect()->route('dashboard');
    }

    private function requiresEmailVerification(OrganizationInvitation $invitation): bool
    {
        return in_array($invitation->meta['invite_type'] ?? null, [
            'new_user_account_setup',
            'existing_user_confirmation',
        ], true);
    }
}