<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TutorDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Tutor/Dashboard/Index');
    }

    public function skills()
    {
        return Inertia::render('Tutor/Skills/Index');
    }

    public function requests()
    {
        return Inertia::render('Tutor/Requests/Index');
    }

    public function sessions()
    {
        return Inertia::render('Tutor/Sessions/Index');
    }

    public function progress()
    {
        return Inertia::render('Tutor/Progress/Index');
    }

    public function assessments()
    {
        return Inertia::render('Tutor/Assessments/Index');
    }

    public function messages()
    {
        return Inertia::render('Tutor/Messages/Index');
    }

    public function notifications()
    {
        return Inertia::render('Tutor/Notifications/Index');
    }
}
