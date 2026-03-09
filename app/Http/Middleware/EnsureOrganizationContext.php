<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationContext
{
    /**
     * Our app is multi-tenant and a user can belong to multiple organizations.
     * We store the active org in the session: `current_organization_id`.
     *
     * If it’s missing, redirect to the org picker (route: `org.select`).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow org selection endpoints even when org context isn't set yet
        if ($request->routeIs('org.select', 'org.set-current')) {
            return $next($request);
        }

        $orgId = $request->session()->get('current_organization_id');

        if (!$orgId) {
            return redirect()->route('org.select');
        }

        return $next($request);
    }
}
