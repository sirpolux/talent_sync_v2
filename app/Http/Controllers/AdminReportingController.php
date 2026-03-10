<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReportingController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Reporting/Dashboard');
    }

    public function promotions()
    {
        return Inertia::render('Admin/Reporting/Promotions');
    }

    public function skills()
    {
        return Inertia::render('Admin/Reporting/Skills');
    }

    public function staff()
    {
        return Inertia::render('Admin/Reporting/Staff');
    }

    public function exports()
    {
        return Inertia::render('Admin/Reporting/Exports');
    }
}
