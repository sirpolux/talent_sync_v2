<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $membership = $user?->currentOrganizationMembership();

        $roleContext = $this->resolveProfileContext($membership);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'profileContext' => $roleContext,
        ]);
    }

    /**
     * Resolve the profile experience for the user's current role.
     */
    private function resolveProfileContext($membership): array
    {
        $roleKey = 'member';
        $roleLabel = 'Member';
        $dashboardRoute = 'dashboard';
        $dashboardLabel = 'Dashboard';
        $recommendations = [
            [
                'title' => 'Review your profile information',
                'description' => 'Keep your account details up to date so your workspace stays accurate.',
            ],
            [
                'title' => 'Check your dashboard regularly',
                'description' => 'Use your dashboard for role-specific updates and next actions.',
            ],
        ];

        if ($membership) {
            if (! empty($membership->is_org_admin)) {
                $roleKey = 'admin';
                $roleLabel = 'Admin';
                $dashboardRoute = 'admin.dashboard';
                $dashboardLabel = 'Admin Dashboard';
                $recommendations = [
                    [
                        'title' => 'Review organization settings',
                        'description' => 'Keep company details, structure, and access controls in sync.',
                    ],
                    [
                        'title' => 'Monitor talent and reporting tools',
                        'description' => 'Stay close to hiring, performance, skills, and analytics workflows.',
                    ],
                    [
                        'title' => 'Manage administrator access',
                        'description' => 'Confirm that the right admins have the correct permissions.',
                    ],
                ];
            } elseif (! empty($membership->is_employee)) {
                $roleKey = 'employee';
                $roleLabel = 'Employee';
                $dashboardRoute = 'staff.dashboard';
                $dashboardLabel = 'Employee Dashboard';
                $recommendations = [
                    [
                        'title' => 'Update skills and evidence',
                        'description' => 'Keep your skills profile current to support growth and promotion readiness.',
                    ],
                    [
                        'title' => 'Track training opportunities',
                        'description' => 'Review available training sessions and submit requests where needed.',
                    ],
                    [
                        'title' => 'Monitor leave and promotion progress',
                        'description' => 'Use your dashboard to follow requests, eligibility, and career progress.',
                    ],
                ];
            } elseif (! empty($membership->is_trainer)) {
                $roleKey = 'tutor';
                $roleLabel = 'Tutor';
                $dashboardRoute = 'trainer.dashboard';
                $dashboardLabel = 'Tutor Dashboard';
                $recommendations = [
                    [
                        'title' => 'Maintain specialties and certifications',
                        'description' => 'Keep your tutoring profile and certification records current.',
                    ],
                    [
                        'title' => 'Review training sessions',
                        'description' => 'Track upcoming sessions, participants, and delivery progress.',
                    ],
                    [
                        'title' => 'Update assessment and message activity',
                        'description' => 'Stay active in session reviews, assessments, and learner communication.',
                    ],
                ];
            }
        }

        return [
            'roleKey' => $roleKey,
            'roleLabel' => $roleLabel,
            'dashboardRoute' => $dashboardRoute,
            'dashboardLabel' => $dashboardLabel,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
