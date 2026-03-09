<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        /**
         * Why transaction:
         * Registration must be atomic: user + organization + membership.
         * If any part fails, we don't want partially created records.
         */
        [$user, $organization] = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Slug needs to be unique; Str::slug is readable and URL-safe.
            $baseSlug = Str::slug($request->company_name);
            $slug = $baseSlug;

            $i = 1;
            while (Organization::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$i;
                $i++;
            }

            $organization = Organization::create([
                'company_name' => $request->company_name,
                'slug' => $slug,

                // Minimal required field from your org schema
                'created_by' => (string) $user->id,
            ]);

            // Link user to org as org admin (and also an employee by default).
            $user->organizations()->attach($organization->id, [
                'is_org_admin' => true,
                'is_employee' => true,
                'is_trainer' => false,
            ]);

            return [$user, $organization];
        });

        event(new Registered($user));

        Auth::login($user);

        // Set org context immediately (so the user doesn't have to pick after signup)
        session(['current_organization_id' => $organization->id]);

        return redirect(route('dashboard', absolute: false));
    }
}
