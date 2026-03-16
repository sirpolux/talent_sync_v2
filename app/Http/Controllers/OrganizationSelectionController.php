<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationSelectionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $organizations = $user
            ->organizations()
            ->select('organizations.id', 'organizations.company_name')
            ->orderBy('organizations.company_name')
            ->get();

        return Inertia::render('Org/Select', [
            'organizations' => $organizations,
        ]);
    }

    public function setCurrent(Request $request)
    {
        $request->validate([
            'organization_id' => ['required', 'integer'],
        ]);

        $user = $request->user();
        $orgId = (int) $request->input('organization_id');

        $membership = $user->organizations()->whereKey($orgId)->first()?->pivot;

        abort_unless($membership, 403);

        // Enforce org-level membership confirmation (Option B)
        abort_unless($membership->membership_status === 'active', 403);

        $request->session()->put('current_organization_id', $orgId);

        // After org is selected, redirect based on membership role.

        if ($membership && !empty($membership->is_org_admin)) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
