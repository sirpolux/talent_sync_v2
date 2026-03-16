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

        // Org Admin
        if (!empty($membership->is_org_admin)) {
            return redirect()->route('admin.dashboard');
        }

        // Trainer (tutor)
        if (!empty($membership->is_trainer)) {
            return redirect()->route('trainer.dashboard');
        }

        // Employee
        if (!empty($membership->is_employee)) {
            return redirect()->route('staff.dashboard');
        }

        // Fallback: if a user has a membership record but no role is set, return to org selection.
        return redirect()->route('org.select');
    }
}
