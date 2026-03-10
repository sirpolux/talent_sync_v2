<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPromotionController extends Controller
{
    public function eligible()
    {
        return Inertia::render('Admin/Promotions/Eligible');
    }

    public function pending()
    {
        return Inertia::render('Admin/Promotions/Pending');
    }

    public function history()
    {
        return Inertia::render('Admin/Promotions/History');
    }
}
