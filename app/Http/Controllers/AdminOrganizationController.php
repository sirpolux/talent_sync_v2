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

    public function updateCompanyData(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_type' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string'],
            'contact_number' => ['nullable', 'string', 'max:255'],
        ]);

        $organization = Organization::findOrFail($orgId);

        if ($request->filled('company_name') && filled($organization->company_name) && $request->input('company_name') !== $organization->company_name) {
            return back()->withErrors([
                'company_name' => 'Company name is already set and cannot be changed.',
            ]);
        }

        $update = [
            'company_email' => $data['company_email'] ?? null,
            'company_type' => $data['company_type'] ?? null,
            'company_description' => $data['company_description'] ?? null,
            'contact_number' => $data['contact_number'] ?? null,
        ];

        // Allow setting company_name only if empty (initial setup)
        if (blank($organization->company_name)) {
            $update['company_name'] = $data['company_name'];
        }

        $organization->update($update);

        return redirect()->route('admin.company.edit')->with('status', 'Company details updated.');
    }

    public function updateCompanyAddress(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'company_address' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'local_government' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
        ]);

        $organization = Organization::findOrFail($orgId);
        $organization->update($data);

        return redirect()->route('admin.company.edit')->with('status', 'Company address updated.');
    }

    public function updateCompanyStats(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'employee_range' => ['nullable', 'string', 'max:255'],
            'company_size' => ['nullable', 'string', 'max:255'],
        ]);

        $organization = Organization::findOrFail($orgId);
        $organization->update($data);

        return redirect()->route('admin.company.edit')->with('status', 'Company stats updated.');
    }

    public function updateCompanyAccess(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'allow_self_registration' => ['nullable', 'boolean'],
        ]);

        $organization = Organization::findOrFail($orgId);
        $organization->update([
            'allow_self_registration' => (bool) ($data['allow_self_registration'] ?? false),
        ]);

        return redirect()->route('admin.company.edit')->with('status', 'Access settings updated.');
    }

    public function updateCompanyCompliance(Request $request): RedirectResponse
    {
        $orgId = (int) $request->session()->get('current_organization_id');

        $data = $request->validate([
            'rn_number' => ['nullable', 'string', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:255'],
            'date_of_incoporation' => ['nullable', 'date'],
        ]);

        $organization = Organization::findOrFail($orgId);

        $errors = [];
        if ($request->filled('rn_number') && filled($organization->rn_number)) {
            $errors['rn_number'] = 'RN number is already set and cannot be changed.';
        }
        if ($request->filled('tax_number') && filled($organization->tax_number)) {
            $errors['tax_number'] = 'Tax number is already set and cannot be changed.';
        }
        if ($request->filled('date_of_incoporation') && filled($organization->date_of_incoporation)) {
            $errors['date_of_incoporation'] = 'Date of incorporation is already set and cannot be changed.';
        }

        if (!empty($errors)) {
            return back()->withErrors($errors);
        }

        $update = [];
        if ($request->filled('rn_number') && blank($organization->rn_number)) {
            $update['rn_number'] = $data['rn_number'];
        }
        if ($request->filled('tax_number') && blank($organization->tax_number)) {
            $update['tax_number'] = $data['tax_number'];
        }
        if ($request->filled('date_of_incoporation') && blank($organization->date_of_incoporation)) {
            $update['date_of_incoporation'] = $data['date_of_incoporation'];
        }

        if (!empty($update)) {
            $organization->update($update);
        }

        return redirect()->route('admin.company.edit')->with('status', 'Compliance details updated.');
    }
}
