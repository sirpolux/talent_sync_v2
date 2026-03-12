<?php

namespace App\Http\Controllers;

use App\Models\OrganizationInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizationInvitationController extends Controller
{
    /**
     * Accept an organization invitation via token.
     *
     * Option B: org membership pivot already exists but is pending.
     * On acceptance, we mark invitation accepted and flip pivot to active.
     */
    public function accept(Request $request, string $token)
    {
        $invitation = OrganizationInvitation::query()
            ->where('token', $token)
            ->firstOrFail();

        // Basic expiration/one-time acceptance checks
        if ($invitation->accepted_at) {
            abort(410, 'Invitation already accepted.');
        }

        if ($invitation->expires_at && now()->greaterThan($invitation->expires_at)) {
            abort(410, 'Invitation expired.');
        }

        // Ensure user is logged in
        if (!Auth::check()) {
            // Store target to continue after login
            $request->session()->put('intended_url', route('org.invitations.accept', ['token' => $token]));
            return redirect()->route('login');
        }

        /** @var User $user */
        $user = $request->user();

        // Ensure the logged-in user matches the invited email (case-insensitive)
        if (mb_strtolower($user->email) !== mb_strtolower($invitation->email)) {
            abort(403, 'This invitation is not for your account.');
        }

        // Mark invitation accepted
        $invitation->accepted_at = now();
        $invitation->save();

        // Flip org membership pivot to active
        $orgId = (int) $invitation->organization_id;

        $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        abort_unless($membership, 404, 'Organization membership record not found.');

        $user->organizations()->updateExistingPivot($orgId, [
            'membership_status' => 'active',
            'membership_confirmed_at' => now(),
            'membership_confirmed_by_user_id' => $user->id, // self-confirmation
        ]);

        // Set current org after acceptance
        $request->session()->put('current_organization_id', $orgId);

        return redirect()->route('dashboard');
    }
}
