<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrgAdmin
{
    /**
     * Ensures the authenticated user is an Org Admin in the CURRENT organization.
     *
     * Current org is resolved from session('current_organization_id') by EnsureOrganizationContext middleware.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        $membership = $user->currentOrganizationMembership();

        if (!$membership) {
            // Org context missing or user not a member of current org
            abort(403);
        }

        if (empty($membership->is_org_admin)) {
            abort(403);
        }

        return $next($request);
    }
}
