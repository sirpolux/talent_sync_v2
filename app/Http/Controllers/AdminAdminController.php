<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Admins/Index');
    }

    public function create()
    {
        return Inertia::render('Admin/Admins/Create');
    }

    public function store(Request $request)
    {
        // TODO: Implement store logic
    }

    public function show($id)
    {
        return Inertia::render('Admin/Admins/Show');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Admins/Edit');
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update logic
    }

    public function destroy($id)
    {
        // TODO: Implement destroy logic
    }
}
