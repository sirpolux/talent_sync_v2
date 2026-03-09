<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /**
         * Multi-organization redirect:
         * - If current org is not set:
         *    - If user belongs to exactly 1 org: auto-set it in session and redirect by role.
         *    - Otherwise: send them to org selection UI.
         * - If current org is set: redirect by role for that org.
         */
        $user = $request->user();

        if (!$request->session()->has('current_organization_id')) {
            $orgIds = $user->organizations()->pluck('organizations.id');

            if ($orgIds->count() === 1) {
                $request->session()->put('current_organization_id', (int) $orgIds->first());
            } else {
                return redirect()->intended(route('org.select', absolute: false));
            }
        }

        if ($user?->currentOrganizationMembership()?->is_org_admin) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
