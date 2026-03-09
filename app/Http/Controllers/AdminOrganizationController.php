<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrganizationController extends Controller
{
    public function show(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $organization = Organization::query()
            ->select([
                'id',
                'company_name',
                'slug',
                'company_type',
                'company_address',
                'company_email',
                'company_description',
                'date_of_incoporation',
                'rn_number',
                'tax_number',
                'employee_range',
                'company_size',
                'country',
                'state',
                'local_government',
                'province',
                'logo_url',
                'contact_number',
                'onboarding_stage',
                'onboarding_complete',
                'allow_self_registration',
            ])
            ->findOrFail($orgId);

        return Inertia::render('Admin/Company/Show', [
            'organization' => $organization,
        ]);
    }

    public function edit(Request $request): Response
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $organization = Organization::query()
            ->select([
                'id',
                'company_name',
                'slug',
                'company_type',
                'company_address',
                'company_email',
                'company_description',
                'date_of_incoporation',
                'rn_number',
                'tax_number',
                'employee_range',
                'company_size',
                'country',
                'state',
                'local_government',
                'province',
                'logo_url',
                'contact_number',
                'onboarding_stage',
                'onboarding_complete',
                'allow_self_registration',
            ])
            ->findOrFail($orgId);

        return Inertia::render('Admin/Company/Edit', [
            'organization' => $organization,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_type' => ['nullable', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string'],
            'contact_number' => ['nullable', 'string', 'max:255'],
            'allow_self_registration' => ['nullable', 'boolean'],
        ]);

        $organization = Organization::findOrFail($orgId);
        $organization->update([
            ...$data,
            'allow_self_registration' => (bool) ($data['allow_self_registration'] ?? false),
        ]);

        return redirect()->route('admin.company.edit')->with('status', 'Company profile updated.');
    }
}
