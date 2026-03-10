<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Organization-scoped roles depend on the currently selected org (session('current_organization_id'))
        $membership = $user?->currentOrganizationMembership();

        // If no org selected yet, force org selection first.
        if (!$membership) {
            return redirect()->route('org.select');
        }

        // Org Admin (current focus)
        if ($membership->is_org_admin) {
            return redirect()->route('admin.dashboard');
        }

        // TODO: wire these up when their dashboards/routes exist.
        // if ($membership->is_sub_admin) { ... }
        // if ($membership->is_employee) { ... }
        // if ($membership->is_trainer) { ... }

        // Fallback: for now send non-admins to org selection until their dashboards are implemented.
        return redirect()->route('org.select');
    }
}
