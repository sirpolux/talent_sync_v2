<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTrainingRequestController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('Admin/TrainingRequests/Index');
    }

    public function pending()
    {
        return Inertia::render('Admin/TrainingRequests/Pending');
    }
}
