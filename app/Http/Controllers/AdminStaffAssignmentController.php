<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminStaffAssignmentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/StaffAssignments/Index');
    }

    public function create()
    {
        return Inertia::render('Admin/StaffAssignments/Create');
    }

    public function store(Request $request)
    {
        // TODO: Implement store logic
    }

    public function show($id)
    {
        return Inertia::render('Admin/StaffAssignments/Show');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/StaffAssignments/Edit');
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
